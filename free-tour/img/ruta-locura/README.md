# Fotos de la Ruta 2 · Canal, Cerveza y Locura

Carpeta para fotos propias de cada parada. Ahora mismo la ruta reutiliza las imágenes
optimizadas de `../../fotos/optim/`; las paradas sin foto propia muestran un bloque
de color con el número de parada (ver `.stop-card__placeholder` en `css/free-tour.css`).

Para añadir una foto:

1. Genera un WebP optimizado (máx. ~800px de ancho, calidad 78):

   ```bash
   python3 -c "
   from PIL import Image
   im = Image.open('origen.jpg').convert('RGB')
   w = 800; h = round(im.size[1]*w/im.size[0])
   im.resize((w,h), Image.LANCZOS).save('free-tour/img/ruta-locura/02-oudaen.webp','WEBP',quality=78,method=6)"
   ```

2. Apunta el campo `foto` de esa parada en `../../data/ruta-locura.json` a
   `img/ruta-locura/02-oudaen.webp` y rellena `foto_alt` con una descripción real.

3. Añade la ruta del archivo a la lista `CORE` de `../../sw.js` para que también
   esté disponible sin conexión.

Nombres sugeridos: `01-domtoren`, `02-oudaen`, `03-lapjesmarkt`, `04-twijnstraat`,
`05-graffiti`, `06-borrel`.
