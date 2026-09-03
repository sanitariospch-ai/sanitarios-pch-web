# Sanitarios PCH - Catálogo web

Esta es una primera versión de una web catálogo para mostrar productos y enviar al cliente a Mercado Libre.

## Archivos

- index.html: estructura de la página
- style.css: diseño
- script.js: productos, precios, imágenes, links y WhatsApp

## Cómo cargar tus productos

Los productos ya NO se cargan a mano en el código: se traen automáticamente desde tu Google Sheets publicado como CSV (ver `CONFIG.sheetCSV` en `script.js`).

Columnas de la planilla:

- Nombre Publicacion
- Precio Web
- Categoria
- Foto (foto principal)
- Foto 2, Foto 3, Foto 4 (opcionales — para la galería de fotos del producto)
- Descripcion (opcional — texto que se ve al abrir la ficha del producto)
- Link Mercado Libre
- Mostrar (Si / No / Sin Stock — Si lo muestra normal, No lo oculta sin borrarlo,
  Sin Stock lo muestra igual con la etiqueta "Sin stock" y cambia el mensaje de
  WhatsApp para que el cliente consulte cuándo va a haber nuevo stock)

Al hacer clic en un producto se abre una ficha con todas sus fotos (se navega con flechas o puntitos) y la descripción.

También cambiá en `script.js`:

- `CONFIG.tiendaMercadoLibre` por el link de tu tienda.
- `CONFIG.whatsapp` por tu número de WhatsApp en formato internacional sin + ni espacios.

## Menú lateral

El botón ☰ (arriba a la izquierda) abre un menú con Home, Categorías (se arma
solo con las categorías que uses en la columna "Categoria" de tu planilla —
no hay que tocar nada), Contacto y Mayoristas (los dos últimos abren WhatsApp
con un mensaje distinto cada uno, editable en `script.js`).

## Cómo cargar videos en el Home (sección "Videos")

La sección "Videos" del Home queda oculta hasta que cargues al menos un
video en `CONFIG.clips`, en `script.js`. Para cada video agregá un objeto
a la lista con estos campos:

- `titulo` y `texto`: el texto que se ve debajo del video.
- `poster`: una imagen de portada (obligatoria si no ponés `video`).
- `video` (opcional): link directo a un archivo .mp4. Si lo completás, el
  video se reproduce en la tarjeta (se pausa/reproduce solo al pasar el
  mouse). Si lo dejás vacío, la tarjeta muestra la imagen de `poster` y
  al hacer clic lleva al link de `link`.
- `link` (opcional): a dónde lleva la tarjeta al hacer clic (por ejemplo,
  la publicación en Mercado Libre). Si lo dejás vacío, usa
  `CONFIG.tiendaMercadoLibre`.

Ejemplo:

```js
clips: [
  { titulo: "Aspiradora SWIFT", texto: "Limpiá la casa o el auto en minutos.",
    poster: "https://.../portada.jpg", video: "https://.../clip.mp4", link: "" },
],
```
