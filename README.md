# 🚲 Mijn Utrecht

> *Una bitácora visual y técnica de mi vida en Utrecht, Países Bajos.*

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?style=flat-square&logo=github)](https://zaswear.github.io/mijnutrecht)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## ¿Qué es esto?

**Mijn Utrecht** ("Mi Utrecht" en neerlandés) es un proyecto personal para documentar mi vida en una de las ciudades más ciclistas y hermosas de Europa. Aquí encontrarás:

- 📸 **Galería de fotos** — momentos honestos de la ciudad, sin filtro turístico
- 🗺️ **Mapa interactivo** — mis puntos favoritos, rutas de bici y lugares con opinión propia
- 🍺 **Reseñas gastronómicas** — lo que vale la pena y lo que no (con criterio local)
- 🚵 **Rutas GPX** — los trayectos en bici que hago cada semana

---

## 🗂️ Estructura del Proyecto

```
mijnutrecht/
├── index.html          ← Página principal (galería + mapa)
├── fotos/              ← Tus imágenes originales
│   └── README.md       ← Instrucciones para añadir fotos
├── rutas/              ← Archivos .gpx de tus rutas en bici
│   └── README.md
├── reviews/            ← Reseñas en formato Markdown
│   └── README.md
├── maps/
│   └── puntos.json     ← Base de datos del mapa interactivo
└── .github/
    └── workflows/
        └── gallery.yml ← Auto-genera galería al subir fotos
```

---

## 🚀 Cómo colaborar o hacer el tuyo

Este proyecto usa solo tecnologías estáticas: **HTML5 + Tailwind CSS + Leaflet.js**. No hay backend, todo corre en GitHub Pages.

### Clonar y arrancar en local

```bash
git clone https://github.com/zaswear/mijnutrecht.git
cd mijnutrecht

# Opción 1: VS Code con extensión Live Server (recomendado)
# Instala la extensión "Live Server" y haz click en "Go Live"

# Opción 2: Python
python3 -m http.server 8000
```

### Añadir un punto al mapa

Edita `maps/puntos.json` y añade un objeto nuevo:

```json
{
  "nombre": "Tu lugar",
  "tipo": "Canal | Restaurante | Monumento | Ruta | Bici",
  "coordenadas": [52.0907, 5.1214],
  "nota": "Tu opinión honesta aquí.",
  "color": "blue | green | red | orange"
}
```

### Añadir una foto

Sube tu imagen a `/fotos/` — el workflow de GitHub Actions actualizará la galería automáticamente al hacer push.

### Añadir una reseña

Crea un archivo `.md` en `/reviews/` con esta estructura:

```markdown
---
titulo: Nombre del sitio
tipo: restaurante
rating: 4
fecha: 2025-06-15
---

Tu reseña aquí en texto libre.
```

---

## 🗺️ El Mapa Interactivo

Basado en **Leaflet.js** + **OpenStreetMap**. Los marcadores usan colores por categoría:

| Color | Categoría |
|-------|-----------|
| 🟢 Verde | Restaurantes recomendados (*Lekker!*) |
| 🔴 Rojo | Sitios que no recomiendo |
| 🔵 Azul | Canales y spots fotográficos |
| 🟠 Naranja | Rutas de bici seguras |

---

## ⚙️ Stack Técnico

- **HTML5** — sin frameworks pesados
- **Tailwind CSS** (CDN) — estilos utilitarios
- **Leaflet.js** — mapas interactivos con OpenStreetMap
- **GitHub Actions** — automatización de galería
- **GitHub Pages** — hosting gratuito

---

## 📜 Licencia

MIT — úsalo, fórkalo, adáptalo. Si haces algo chulo con esto, cuéntamelo.

---

*Hecho con ☕ en Utrecht.*