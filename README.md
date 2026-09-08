# 🚲 Mijn Utrecht

> *Una bitácora visual y técnica de mi vida en Utrecht, Países Bajos.*

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?style=flat-square&logo=github)](https://zaswear.github.io/mijnutrecht)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## ¿Qué es esto?

**Mijn Utrecht** ("Mi Utrecht" en neerlandés) es una guía en español de Utrecht escrita por alguien que vive allí. Tiene dos caminos de entrada:

- 🧳 **Voy de visita** (`index.html`) — itinerarios de 1, 2 o 3 días, las 7 experiencias que solo pasan aquí, gastronomía, 10 rutas a pie, mapa y guía práctica
- 🏠 **Me mudo a vivir** (`expat.html`) — BSN, DigiD, seguro de salud, piso, coste de vida real, la biblia de la bici e integración social
- 📚 **El Alma** (`historia.html`) — historia, canales a dos niveles, urbanismo interactivo, barrios, glosario, agenda y flora
- 🚶 **Free Tour Digital** (`free-tour/`) — dos rutas guiadas a pie para seguir con el móvil: narración, datos históricos, leyendas, retos de foto, acertijos, mapa, geolocalización y modo offline

Y además: 📸 galería de fotos, 🗺️ mapa interactivo con reseñas propias y 🚵 rutas GPX en bici.

---

## 🗂️ Estructura del Proyecto

```
mijnutrecht/
├── index.html          ← Landing modo turista
├── historia.html       ← "El Alma": historia y ciudad
├── expat.html          ← Modo expat: mudarse a vivir
├── free-tour/          ← Free Tour Digital (sección propia)
│   ├── index.html      ← Listado de rutas
│   ├── ruta.html       ← Reproductor: ?ruta=oculto | ?ruta=locura
│   ├── sw.js           ← Service Worker (offline)
│   ├── css/ js/ data/ img/
├── assets/
│   ├── css/            ← main · components · sections · responsive
│   ├── js/             ← main · tabs · accordion · animations · landing
│   │                     map · gallery · weather · alma
│   └── data/           ← itinerarios.json · experiencias.json · glosario.js
│                         comparativa.js · walking-routes.js
├── fotos/
│   ├── optim/          ← Derivados WebP (los que usa la web)
│   └── gallery.json    ← Fallback de galería si Cloudinary falla
├── maps/puntos.json    ← Base de datos del mapa interactivo
├── rutas/              ← index.json + archivos .gpx
├── agenda/eventos.json ← Agenda anual de eventos
├── flora/plantas.json  ← Flora local por temporada
└── scripts/            ← Herramientas locales (no se despliegan)
```

---

## 🚀 Cómo colaborar o hacer el tuyo

Este proyecto usa solo tecnologías estáticas: **HTML5 + CSS y JS vanilla + Leaflet.js**. No hay backend ni build step: todo corre tal cual en GitHub Pages.

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

Las fotos de la galería se sirven desde Cloudinary (cloud `dkn49zkfr`); `fotos/gallery.json`
es el fallback. Para imágenes fijas de la web, genera un WebP optimizado en `fotos/optim/`:

```bash
python3 -c "
from PIL import Image
im = Image.open('fotos/origen.jpg').convert('RGB')
w = 1200; h = round(im.size[1]*w/im.size[0])
im.resize((w,h), Image.LANCZOS).save('fotos/optim/nombre-1200.webp','WEBP',quality=78,method=6)"
```

### Añadir una parada a un free tour

Edita `free-tour/data/ruta-oculto.json` (o `ruta-locura.json`) y añade un objeto al array
`paradas_lista`: `numero`, `titulo`, `subtitulo`, `lat`, `lng`, `tiempo_estimado`,
`distancia_siguiente`, `foto`, `guia`, `dato_historico`, `misterio`, `reto_foto` y un
`acertijo` opcional. Si añades archivos nuevos, actualiza también la lista `CORE` y la
versión de `CACHE_NAME` en `free-tour/sw.js`.

### Añadir una parada a un itinerario

Edita `assets/data/itinerarios.json` y añade un objeto al array `paradas` del día
correspondiente (`hora`, `emoji`, `titulo`, `texto`, `hop` y, opcionalmente, `img` + `alt`).

---

## 🗺️ El Mapa Interactivo

Basado en **Leaflet.js** + **OpenStreetMap**. Los marcadores usan colores por categoría:

| Color | Categoría |
|-------|-----------|
| 🟢 Verde | Gastronomía recomendada (*Lekker!*) |
| 🔴 Rojo | Sitios que no recomiendo |
| 🔵 Azul | Parques y canales |
| 🟠 Naranja | Imprescindibles y monumentos |

---

## ⚙️ Stack Técnico

- **HTML5 + CSS y JS vanilla** — sin frameworks, sin build step
- **Leaflet.js** — mapas interactivos con OpenStreetMap
- **Open-Meteo** — clima en tiempo real, sin API key
- **Cloudinary** — galería de fotos optimizada
- **Google Fonts** — Playfair Display + Inter + Caveat
- **GitHub Pages** — hosting gratuito

---

## 📜 Licencia

MIT — úsalo, fórkalo, adáptalo. Si haces algo chulo con esto, cuéntamelo.

---

*Hecho con ☕ en Utrecht.*

## Planes personales y tours sin conexión

En **[Mi itinerario](mi-plan.html)** puedes elegir planes con lluvia, con niños o
con información de acceso contrastada en las webs oficiales de los museos
(6 de septiembre de 2026). La comprobación es documental: no certifica el trayecto
por la calle. Los tiempos son orientativos.

Guarda las propuestas o los itinerarios de 1/2/3 días, quita paradas y cambia su orden.
La selección se conserva en este navegador, sin cuenta ni sincronización entre equipos.
Cada parada permite abrir su lugar en un mapa y consultar sus tiempos y detalles.

Para un **Free Tour sin cobertura**, abre la ruta, despliega «Preparar el paseo» y
pulsa «Guardar ruta sin conexión». El inventario distingue archivos descargados y
paradas sin foto. Textos, controles, fotos disponibles y esquema de paradas se guardan;
el callejero y las indicaciones externas requieren conexión. La lectura en voz alta
depende del dispositivo. Comprueba la descarga antes de salir: el navegador puede
liberar espacio. Avanzar de pantalla no marca una parada como visitada.

Pruebas reproducibles con Python y `agent-browser` instalados (arrancan un servidor
aislado y lo apagan durante el recorrido para comprobar la caché sin acceso a la red):

```bash
node scripts/test-planner-tour.mjs --isolated-server
```

Las cinco paradas antes sin foto tienen ahora imágenes de Wikimedia Commons con
atribución visible y [créditos y licencias](fotos/creditos-tour.md). Domstraat se
ilustra con una fotografía histórica de 1888, identificada como tal. Las dos paradas
sin localización verificable (baño medieval y callejón de grafitis) se sustituyeron
por Domstraat y el entorno de Vaartsche Rijn. Esto no es una auditoría histórica
completa del resto del guion heredado.
