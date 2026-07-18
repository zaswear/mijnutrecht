#!/usr/bin/env node
/**
 * Scrapes Eet.nu for Utrecht restaurants and outputs entries
 * ready to paste into maps/puntos.json.
 *
 * Usage:
 *   node scripts/scrape-restaurants.js
 *   node scripts/scrape-restaurants.js --pages 5
 *   node scripts/scrape-restaurants.js --output ./maps/scraped.json
 *
 * Requirements:
 *   npm install -g agent-browser   (already installed)
 *   agent-browser install          (Chrome already downloaded)
 */

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");

// ── Config ────────────────────────────────────────────────────────────────────
const PAGES  = parseInt(process.argv.find(a => a.startsWith("--pages="))?.split("=")[1]  ?? "3");
const OUTPUT = process.argv.find(a => a.startsWith("--output="))?.split("=")[1] ?? "./scripts/scraped-puntos.json";
const BASE   = "https://www.eet.nu/utrecht/restaurants";
const GEO    = "https://nominatim.openstreetmap.org/search";

// ── Helpers ───────────────────────────────────────────────────────────────────
function ab(args) {
  const r = spawnSync("agent-browser", args.split(" "), { encoding: "utf-8", timeout: 15000 });
  return (r.stdout || "").trim();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function geocode(address) {
  try {
    const q  = encodeURIComponent(`${address}, Utrecht, Netherlands`);
    const ua = "mijnutrecht-scraper/1.0 (zaswear@gmail.com)";
    const raw = execSync(
      `curl -s "${GEO}?q=${q}&format=json&limit=1&countrycodes=nl" -H "User-Agent: ${ua}"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    const data = JSON.parse(raw);
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log("Cerrando sesiones anteriores...");
  ab("close --all");
  await sleep(500);

  console.log(`Abriendo ${BASE} ...`);
  ab(`open ${BASE}`);
  await sleep(3000);

  const results = [];

  for (let page = 1; page <= PAGES; page++) {
    console.log(`\nPágina ${page} / ${PAGES}...`);

    const raw = ab(`eval --stdin`); // fallback: usar eval inline
    const evalScript = `
      JSON.stringify(
        [...document.querySelectorAll(
          '.venue-list-item, .restaurant-list-item, article[data-venue-id], [data-testid="venue-card"]'
        )].map(el => {
          const name    = el.querySelector('h2, h3, [data-testid="venue-name"], .venue-name')?.textContent?.trim();
          const address = el.querySelector('[data-testid="venue-address"], .venue-address, .address, address')?.textContent?.trim();
          const rawRating = el.querySelector('[data-testid="score"], .score, .rating-score, .cijfer')?.textContent?.trim();
          const rating  = rawRating ? parseFloat(rawRating.replace(',', '.')) : null;
          const cuisine = el.querySelector('.cuisine-type, .category-label, .cuisine')?.textContent?.trim();
          const href    = el.querySelector('a[href*="/utrecht/"]')?.getAttribute('href');
          return { name, address, rating, cuisine, href };
        }).filter(r => r.name)
      )
    `;

    const evalResult = spawnSync("agent-browser", ["eval", evalScript], {
      encoding: "utf-8",
      timeout: 15000,
    });
    const stdout = (evalResult.stdout || "").trim();

    let venues = [];
    try {
      // agent-browser eval may return the result inside JSON wrapper
      const parsed = JSON.parse(stdout);
      venues = Array.isArray(parsed) ? parsed : (parsed.result ? JSON.parse(parsed.result) : []);
    } catch {
      console.warn("  No se pudo parsear la respuesta:", stdout.slice(0, 200));
    }

    if (venues.length === 0) {
      console.log("  ⚠️ No se encontraron restaurantes (¿cambió el HTML?). Activando fallback visual con Gemini...");
      try {
        const pageUrl = page === 1 ? BASE : `${BASE}?page=${page}`;
        const fallbackRes = await fetch("http://localhost:5000/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url: pageUrl, 
            prompt: "Devuelve un array JSON estricto extrayendo los restaurantes listados en la imagen. Cada objeto debe tener: 'name' (nombre), 'address' (dirección si la hay, o null), 'rating' (nota numérica ej. 8.5, o null), 'cuisine' (tipo de comida o null), 'href' (la ruta url relativa si la deduces, o null). Responde SOLO con el JSON."
          }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          let cleanJson = fallbackData.result.replace(/```json/g, "").replace(/```/g, "").trim();
          venues = JSON.parse(cleanJson);
          console.log(`  🤖 Fallback exitoso: Gemini extrajo ${venues.length} restaurantes mirando la web.`);
        } else {
          console.error(`  ❌ Error HTTP del fallback: ${fallbackRes.status}`);
        }
      } catch (e) {
        console.error("  ❌ Falló el fallback visual:", e.message);
      }
    }

    console.log(`  → ${venues.length} lugares encontrados`);

    for (const v of venues) {
      if (!v.name) continue;

      const coords = v.address ? await geocode(v.address) : null;
      await sleep(1100); // respetar rate limit de Nominatim (1 req/s)

      const isGood = v.rating !== null && v.rating >= 7.5;
      const nota   = [
        v.rating ? `⭐ ${v.rating}/10` : null,
        v.address || "Utrecht",
      ].filter(Boolean).join(" · ");

      results.push({
        nombre: v.name,
        tipo:   v.rating !== null ? "Reseña" : "Recomendado",
        descripcion: v.cuisine || null,
        coordenadas: coords ?? [52.0906, 5.1213],
        nota,
        color: isGood ? "green" : v.rating !== null && v.rating < 6 ? "red" : "orange",
        google_maps_url: `https://www.google.com/maps/search/${encodeURIComponent(v.name + " Utrecht")}`,
        reseña_propia: false,
        _fuente: v.href ? `https://www.eet.nu${v.href}` : null,
        _geocoded: coords !== null,
      });
    }

    // Siguiente página
    if (page < PAGES) {
      const next = spawnSync("agent-browser", ["click", '[rel="next"], .pagination__next, [aria-label="Volgende pagina"]'], {
        encoding: "utf-8",
        timeout: 8000,
      });
      if ((next.stdout || "").includes("error") || next.status !== 0) {
        console.log("  No hay más páginas.");
        break;
      }
      await sleep(2500);
    }
  }

  ab("close");

  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`\n✓ ${results.length} lugares guardados en ${OUTPUT}`);
  console.log("\nRevisa el archivo y pega las entradas válidas en maps/puntos.json.");
  console.log("Recuerda borrar el campo _fuente y _geocoded antes de hacer push.");
})();
