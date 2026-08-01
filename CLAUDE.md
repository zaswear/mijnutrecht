# Mijn Utrecht — Contexto del Proyecto para Claude Code

## Qué es esto
Web personal estática publicada en GitHub Pages que documenta mi vida en Utrecht, Países Bajos. Guía en español pensada para convencer al viajero indeciso ("¿Utrecht o Ámsterdam?") y para ayudar a quien se muda a vivir aquí.

**URL pública:** https://zaswear.github.io/mijnutrecht
**Repo:** https://github.com/zaswear/mijnutrecht

---

## Stack Técnico
- **HTML5 + CSS + JS vanilla** — sin frameworks, sin build step, sin Tailwind
- **Leaflet.js** — mapa interactivo con OpenStreetMap (tiles CartoDB Voyager / Dark)
- **Leaflet-GPX plugin** — para dibujar rutas ciclistas desde archivos .gpx
- **Open-Meteo** — clima en tiempo real, sin API key
- **Cloudinary** — almacenamiento y optimización de fotos de galería (cloud: `dkn49zkfr`)
- **Google Fonts** — Playfair Display (display) + Inter (cuerpo) + Caveat (notas)
- **GitHub Pages** — hosting gratuito desde rama `main`

> Rediseño completo (2026-08). Antes era un SPA de pestañas con Tailwind CDN en un
> único `index.html`. Ahora son tres páginas con CSS y JS propios.

---

## Estructura de Archivos

```
mijnutrecht/
├── index.html              ← Landing modo TURISTA (hero, vs Ámsterdam, itinerarios,
│                             7 experiencias, gastronomía, rutas a pie, mapa,
│                             guía práctica, galería)
├── historia.html           ← "El Alma": historia, canales, línea del tiempo, ayer y hoy,
│                             urbanismo interactivo, barrios, costumbres, glosario,
│                             agenda y flora
├── expat.html              ← Modo EXPAT: BSN/DigiD, seguro, piso, trabajo,
│                             coste de vida, bici, integración, calendario
├── free-tour/              ← Free Tour Digital (sección propia, ver más abajo)
│   ├── index.html          ← Listado de rutas
│   ├── ruta.html           ← Reproductor de ruta (?ruta=oculto | ?ruta=locura)
│   ├── sw.js               ← Service Worker (scope /free-tour/)
│   ├── css/free-tour.css
│   ├── js/                 ← free-tour · geolocation · map · speech
│   ├── data/               ← ruta-oculto.json · ruta-locura.json
│   └── img/                ← Fotos propias por parada (vacío; ver READMEs)
├── assets/
│   ├── css/
│   │   ├── main.css        ← Variables, reset, tipografía, layout, navbar, footer
│   │   ├── components.css  ← Botones, tarjetas, tabs, acordeones, modal, lightbox, mapa
│   │   ├── sections.css    ← Estilos propios de cada sección
│   │   └── responsive.css  ← Media queries (colapsos ≤1024px y ≤760px)
│   ├── js/
│   │   ├── main.js         ← Navbar, menú móvil, selector de modo, share, newsletter
│   │   ├── tabs.js         ← Tabs accesibles genéricas ([data-tabs])
│   │   ├── accordion.js    ← Acordeones FAQ ([data-accordion])
│   │   ├── animations.js   ← IntersectionObserver: .reveal y contadores .js-count
│   │   ├── landing.js      ← Itinerarios, 7 experiencias y modal de rutas a pie
│   │   ├── map.js          ← Leaflet: puntos, filtros, modo noche, rutas GPX
│   │   ├── gallery.js      ← Galería Cloudinary + lightbox
│   │   ├── weather.js      ← Widget de clima Open-Meteo
│   │   └── alma.js         ← Módulos de historia.html (comparadores, quiz, glosario,
│   │                          flora, agenda, barras, hotspots, flip, baldosas)
│   └── data/
│       ├── itinerarios.json    ← Planes de 1 / 2 / 3 días (timeline)
│       ├── experiencias.json   ← Las 7 experiencias
│       ├── glosario.js         ← const GLOSARIO (neerlandés de supervivencia)
│       ├── comparativa.js      ← const COMPARACIONES + const UV_VS
│       └── walking-routes.js   ← const routeData: las 10 rutas a pie (modal)
├── fotos/
│   ├── optim/              ← Derivados WebP optimizados (los que usa la web)
│   ├── avatar.png          ← Foto de perfil (NO va en galería)
│   ├── *_old.jpg / *_modern.jpg  ← Originales del comparador ayer/hoy
│   └── gallery.json        ← Fallback de la galería si Cloudinary falla
├── maps/puntos.json        ← Lugares del mapa interactivo
├── rutas/
│   ├── index.json          ← Metadatos de rutas ciclistas
│   └── *.gpx
├── agenda/eventos.json     ← Agenda de eventos anuales
├── flora/
│   ├── plantas.json        ← Flora local por temporada
│   └── fotos/
├── scripts/                ← Scripts de automatización (no se publican)
└── CLAUDE.md               ← Este archivo
```

Restos del diseño anterior (SPA con Tailwind), **ya no se cargan desde ninguna página** y se
pueden borrar cuando el rediseño esté asentado: `index.html.bak`, `assets/js/app.js` y
`assets/css/style.css`.

---

## Sistema de diseño

Variables en `assets/css/main.css` (`:root`). **No hardcodear colores nuevos**, usar estos:

```css
--color-ladrillo: #B85C3F;   /* acentos, CTA, links */
--color-canal:    #3A6B7C;   /* fondos de sección, headers */
--color-piedra:   #F5F0E8;   /* fondo principal */
--color-naranja:  #E86A33;   /* badges, destacados */
--color-verde:    #5A8F6E;   /* naturaleza, rutas verdes */
--color-texto:    #2C2420;
--color-texto-suave: #6B5E55;
--color-borde:    #E2D9CB;
```

Tipografía: `--font-display` (Playfair Display) para titulares, `--font-body` (Inter)
para cuerpo y UI, `--font-accent` (Caveat) solo para la nota del autor (`.nota-autor`).

Ritmo: `--gap-section` 6rem (8rem en ≥1280px), radios 12px (`--radius`) y 20px
(`--radius-lg`), sombra de tarjeta `--shadow-card`.

---

## Convenciones de markup

- **Secciones**: `<section class="section">` + `<div class="wrap">`. Variantes de fondo:
  `section--paper` (blanco), `section--canal` (azul), `section--dark`, `section--tight`.
- **Rejillas**: usar `.grid grid-2|grid-3|grid-4` o `.layout-aside` (contenido + columna
  lateral). **Nunca poner `grid-template-columns` en un `style=` inline**: las media
  queries de `responsive.css` no lo pueden colapsar en móvil.
- **Revelado al scroll**: añadir la clase `.reveal` al elemento. Si el contenido se
  inyecta por JS, disparar `document.dispatchEvent(new CustomEvent('mu:content-loaded'))`
  para que `animations.js` vuelva a observar.
- **Tabs**: contenedor `[data-tabs]` con `role="tablist"`, botones `role="tab"` +
  `aria-controls`, paneles `.tab-panel` con `hidden`.
- **Acordeones**: contenedor `[data-accordion]` (`data-accordion="single"` para que solo
  quede uno abierto), trigger `.accordion__trigger` con `aria-expanded` + `aria-controls`.
- **Filtros**: `.chip` con `aria-pressed`; los contenedores llevan `data-map-filter`,
  `data-agenda-filter` o `data-flora-filter`.
- **Modo turista/expat**: `<body data-modo="turista|expat">` y enlaces con `data-modo`;
  `main.js` guarda la preferencia en `localStorage` (`mijnutrecht:modo`).

---

## Free Tour Digital (`/free-tour/`)

Sección autónoma, pensada para usarse **con el móvil en la mano mientras se camina**.
No comparte JS con el resto del sitio; sí reutiliza `../assets/css/main.css` (variables,
reset y tipografía) y las fotos de `../fotos/optim/`.

- **`index.html`** lista las rutas. **`ruta.html?ruta=<id>`** es el reproductor: lee el
  parámetro, carga `data/ruta-<id>.json` y pinta las paradas una a una.
- **Módulos JS** (scripts clásicos, cada uno expone un objeto global):
  `FTGeo` (geolocation.js, Haversine + `watchPosition`), `FTMap` (map.js, Leaflet),
  `FTSpeech` (speech.js, Web Speech API) y `free-tour.js` con la lógica y el render.
- **Progreso** en `localStorage`, clave `mijnutrecht-tour-progress`, con **un objeto por
  ruta**: `{ oculto: {...}, locura: {...} }`. Al volver se ofrece continuar o empezar de
  cero; al terminar se marca `completedAt` y la siguiente visita arranca limpia.
- **Service Worker en `free-tour/sw.js`, no en `js/`**: un SW solo controla su propio
  directorio hacia abajo y GitHub Pages no deja mandar `Service-Worker-Allowed`. Si se
  moviera a `js/` dejaría de cachear `ruta.html`. Al añadir archivos nuevos a la sección,
  añádelos a la lista `CORE` y **sube la versión de `CACHE_NAME`** para invalidar el caché.
- **Fotos**: cada parada usa `foto` (ruta relativa desde `/free-tour/`). Si está vacío se
  pinta un bloque de color con el número de parada. Instrucciones para añadir fotos
  propias en `img/ruta-*/README.md`.
- **Coordenadas**: varias paradas llevan coordenadas aproximadas heredadas del guion
  original (la polilínea zigzaguea un poco). Si se afinan, hay que tocar `lat`/`lng` en el
  JSON de la ruta; no hay nada más que actualizar.
- Añadir una ruta nueva = crear `data/ruta-<id>.json` con el mismo esquema, una card en
  `index.html`, el id en la validación de `free-tour.js` y el JSON en `CORE` de `sw.js`.

### Esquema de `data/ruta-*.json`
```json
{
  "id": "oculto", "titulo": "…", "subtitulo": "…", "icono": "🏛️",
  "duracion": "2 horas", "distancia": "3,5 km", "dificultad": "Baja", "paradas": 7,
  "punto_encuentro": { "nombre": "…", "lat": 52.09, "lng": 5.12 },
  "paradas_lista": [{
    "numero": 1, "titulo": "…", "subtitulo": "…",
    "lat": 52.0908, "lng": 5.1213,
    "tiempo_estimado": "8 minutos", "distancia_siguiente": "3 min caminando",
    "foto": "../fotos/optim/dom-800.webp", "foto_alt": "…",
    "guia": "…", "dato_historico": "…", "misterio": "…", "reto_foto": "…",
    "acertijo": { "pregunta": "…", "opciones": ["…"], "correcta": 1, "explicacion": "…" }
  }]
}
```
`acertijo` puede ser `null`. `distancia_siguiente` es `null` en la última parada.

---

## Archivos de datos — estructura y reglas

### `maps/puntos.json`
```json
{
  "nombre": "Nombre del lugar",
  "tipo": "Imprescindible",         // string o array ["Tipo1", "Tipo2"]
  "descripcion": "Texto opcional",  // en cursiva en el popup
  "coordenadas": [52.0906, 5.1213], // [lat, lon]
  "nota": "⭐ 5/5 · Dirección",
  "color": "orange",                // orange | green | red | blue
  "google_maps_url": "https://...",
  "reseña_propia": true
}
```
Colores → filtros del mapa: `orange` Imprescindibles · `green` Gastronomía ·
`blue` Parques y canales · `red` Evitar.

### `rutas/index.json`
`archivo` debe coincidir exactamente con el .gpx de `/rutas/`; si está vacío se
enlaza a `fuente` (Komoot/RouteYou).

### `assets/data/itinerarios.json`
```json
{ "1": { "label": "1 día", "titulo": "…", "resumen": ["…"],
         "dias": [ { "nombre": "Día 1", "paradas": [
           { "hora": "09:30", "emoji": "🗼", "titulo": "…", "texto": "…",
             "hop": "5 min andando", "img": "fotos/optim/dom-800.webp", "alt": "…" } ] } ] } }
```

### `assets/data/experiencias.json`
`num`, `titulo`, `texto`, `donde`, `img` (vacío = tarjeta con degradado), `alt`,
`tono` (`tinta` | `ladrillo` | `verde` | `naranja`).

### `fotos/gallery.json`
Fallback si falla el listado de Cloudinary. **Nunca incluir avatar.png.**

---

## Imágenes

Las páginas usan **solo** los WebP de `fotos/optim/`. Los originales JPG/PNG se conservan
como fuente pero pesan megas y no deben referenciarse desde el HTML.

Para regenerar derivados tras añadir una foto grande:

```bash
python3 - <<'PY'
from PIL import Image
im = Image.open('fotos/origen.jpg').convert('RGB')
w = 1200; h = round(im.size[1]*w/im.size[0])
im.resize((w,h), Image.LANCZOS).save('fotos/optim/nombre-1200.webp','WEBP',quality=78,method=6)
PY
```

Reglas: `loading="lazy"` + `decoding="async"` + `width`/`height` en toda imagen que no
sea el hero. El hero lleva `fetchpriority="high"`, `srcset` y su `<link rel="preload">`.

---

## Cloudinary
- **Cloud name:** `dkn49zkfr`
- Miniaturas `w_600`, lightbox `w_1800` (`gallery.js` inyecta el ancho en la URL).
- Las API keys NO están en el código — se gestionan desde el dashboard.

---

## GitHub Pages
- Se publica automáticamente desde rama `main`, carpeta raíz `/`.
- No hay build step — todo es HTML/CSS/JS/JSON estático.
- El workflow `.github/workflows/gallery.yml` está **desactivado** (no se usa).

---

## Scripts de automatización (`scripts/`)

Requieren `agent-browser` instalado globalmente (`npm install -g agent-browser`).

### `scrape-restaurants.js`
Scrapea Eet.nu Utrecht y genera entradas listas para `maps/puntos.json`. Geocodifica
vía Nominatim (sin API key).

```bash
node scripts/scrape-restaurants.js              # 3 páginas por defecto
node scripts/scrape-restaurants.js --pages=5
```
El archivo de salida incluye `_fuente` y `_geocoded` de diagnóstico — bórralos antes de push.

### `screenshot-test.sh`
Test visual de regresión con `agent-browser diff screenshot`
(`baseline` | `compare` | `live` | `auto`). Salida en `scripts/.screenshots/` (gitignored).

> **Gotcha al automatizar clicks:** `html { scroll-behavior: smooth }` hace que los
> clicks de agent-browser lleguen con coordenadas obsoletas y no disparen el handler.
> Antes de hacer click:
> `agent-browser eval "document.querySelector('…').scrollIntoView({behavior:'instant'})"`.

---

## Convenciones
- No usar frameworks JS ni CSS: todo vanilla, sin build step.
- No añadir carpetas nuevas sin actualizar este CLAUDE.md.
- Los JSON deben ser válidos — validar antes de hacer push.
- Coordenadas siempre en formato `[latitud, longitud]`.
- Nunca subir API keys al repo.
- Los archivos en `scripts/` son herramientas locales, no se despliegan.
- Accesibilidad: botones reales (`<button>`), `alt` en imágenes, foco visible,
  objetivos táctiles de 44px y respeto a `prefers-reduced-motion`.
