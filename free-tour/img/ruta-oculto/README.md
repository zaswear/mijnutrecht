# Fotos de la Ruta 1 · Utrecht Oculto

Carpeta para fotos propias de cada parada. La ruta reutiliza imágenes optimizadas del proyecto y fotografías de Wikimedia
Commons con créditos en `../../../fotos/creditos-tour.md`. Para sustituir una foto
por un original propio, actualiza también su atribución; no mantengas el autor anterior.

Para añadir una foto:

1. Genera un WebP optimizado (máx. ~800px de ancho, calidad 78):

   ```bash
   python3 -c "
   from PIL import Image
   im = Image.open('origen.jpg').convert('RGB')
   w = 800; h = round(im.size[1]*w/im.size[0])
   im.resize((w,h), Image.LANCZOS).save('free-tour/img/ruta-oculto/02-banio.webp','WEBP',quality=78,method=6)"
   ```

2. Apunta el campo `foto` de esa parada en `../../data/ruta-oculto.json` a
   `img/ruta-oculto/02-banio.webp` y rellena `foto_alt` con una descripción real.

3. La descarga obtiene las fotos del JSON automáticamente. Sube `CACHE_NAME` en
   `../../sw.js` y comprueba el inventario de la ruta y la foto sin conexión.

Nombres sugeridos: `01-domplein`, `02-banio`, `03-oudegracht`, `04-casa`,
`05-miffy`, `06-olivier`, `07-catharijne`.
