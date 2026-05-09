# Mijn Utrecht — Contexto del Proyecto para Claude Code

## Qué es esto
Web personal estática publicada en GitHub Pages que documenta mi vida en Utrecht, Países Bajos. Bitácora visual con fotos, mapa interactivo, rutas ciclistas y reseñas gastronómicas.

**URL pública:** https://zaswear.github.io/mijnutrecht  
**Repo:** https://github.com/zaswear/mijnutrecht

---

## Stack Técnico
- **HTML5** — sin frameworks, todo en un único `index.html`
- **Tailwind CSS** (CDN) — utilidades de estilo
- **Leaflet.js** — mapa interactivo con OpenStreetMap
- **Leaflet-GPX plugin** — para dibujar rutas ciclistas desde archivos .gpx
- **Cloudinary** — almacenamiento y optimización de fotos (cloud: `dkn49zkfr`)
- **GitHub Pages** — hosting gratuito desde rama `main`

---

## Estructura de Archivos

```
mijnutrecht/
├── index.html              ← Toda la web en un solo archivo
├── fotos/
│   ├── avatar.png          ← Foto de perfil (usada en el hero, NO en galería)
│   └── gallery.json        ← Lista de fotos con URLs de Cloudinary
├── maps/
│   └── puntos.json         ← Lugares del mapa interactivo
├── rutas/
│   ├── index.json          ← Metadatos de rutas ciclistas
│   ├── kasteel-de-haar.gpx
│   ├── utrecht-30km.gpx
│   ├── vecht-norte.gpx
│   ├── vechtstreek-8.gpx
│   └── waterlinie-sur.gpx
└── CLAUDE.md               ← Este archivo
```

---

## Archivos Clave — Estructura y Reglas

### `maps/puntos.json`
Base de datos del mapa. Cada punto tiene esta estructura:

```json
{
  "nombre": "Nombre del lugar",
  "tipo": "Imprescindible",         // string o array ["Tipo1", "Tipo2"]
  "descripcion": "Texto opcional",  // aparece en cursiva en el popup
  "coordenadas": [52.0906, 5.1213], // [lat, lon]
  "nota": "⭐ 5/5 · Dirección",     // línea principal del popup
  "color": "orange",                // orange | green | red | blue
  "google_maps_url": "https://...", // opcional
  "reseña_propia": true             // opcional, marca como reseña personal
}
```

**Colores del mapa:**
- `orange` → Imprescindible / monumentos / lugares a visitar
- `green` → Recomendado (reseñas propias positivas)
- `red` → Evitar (reseñas negativas)
- `blue` → Parques y canales

**Tipos usados actualmente:** `Imprescindible`, `Recomendado`, `Parque`, `Reseña`

### `rutas/index.json`
Metadatos de rutas ciclistas. El campo `"archivo"` debe coincidir exactamente con el nombre del .gpx en `/rutas/`:

```json
{
  "nombre": "Nombre de la ruta",
  "archivo": "nombre-archivo.gpx",  // vacío si no hay GPX aún
  "emoji": "🚴",
  "distancia": "30 km circular",
  "duracion": "~2h",
  "dificultad": "Fácil | Moderada",
  "momento": "Cuándo hacerla",
  "descripcion": "Descripción de la ruta",
  "destino_coords": [52.09, 5.11],
  "fuente": "https://www.routeyou.com"
}
```

### `fotos/gallery.json`
Lista de fotos servidas desde Cloudinary. **NUNCA incluir avatar.png aquí.**

```json
{
  "public_id": "nombre_cloudinary",
  "titulo": "Utrecht · Enero 2023",
  "fecha": "2023-01-01",
  "url": "https://res.cloudinary.com/dkn49zkfr/image/upload/f_auto,q_auto/nombre.jpg"
}
```

---

## Comportamiento del index.html

### Galería
- Muestra **8 fotos aleatorias** al cargar (shuffle en cada visita)
- Botón "Ver todas" carga el resto sin recargar
- Lightbox al hacer click: navega con flechas o teclado (←→ Esc)
- Lee desde `./fotos/gallery.json`
- Filtra automáticamente entradas con `avatar` en el public_id

### Mapa
- Filtros por color: Todos / Recomendados / Evitar / Fotos·Canales / Rutas bici
- Popup muestra: nombre → descripcion (cursiva) → nota → link Google Maps → tipo (pie)
- `tipo` puede ser string o array — el código lo maneja con `Array.isArray()`

### Rutas
- Botón "Ver en mapa" dibuja el GPX como línea de color sobre Leaflet
- Si no hay GPX, abre la URL `fuente` en nueva pestaña (Komoot/RouteYou)
- Cada ruta tiene un color distinto (naranja, azul, verde, morado, rojo)

---

## Cloudinary
- **Cloud name:** `dkn49zkfr`
- **URL optimizada:** `https://res.cloudinary.com/dkn49zkfr/image/upload/f_auto,q_auto/PUBLIC_ID.jpg`
- **Miniaturas (galería):** `w_600` añadido a la URL
- **Lightbox (full):** `w_1800` añadido a la URL
- Las API keys NO están en el código — gestionar desde Cloudinary dashboard

---

## GitHub Pages
- Se publica automáticamente desde rama `main`, carpeta raíz `/`
- No hay build step — todo es HTML/JS/JSON estático
- El workflow `.github/workflows/gallery.yml` está **desactivado** (no se usa)

---

## Convenciones
- No usar frameworks JS pesados — todo vanilla JS en el `index.html`
- No añadir carpetas nuevas sin actualizar este CLAUDE.md
- Los JSON deben ser válidos — validar antes de hacer push
- Las coordenadas siempre en formato `[latitud, longitud]`
- Nunca subir API keys al repo