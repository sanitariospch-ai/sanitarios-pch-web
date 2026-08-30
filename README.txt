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
- Mostrar (si / no — para ocultar un producto sin borrarlo)

Al hacer clic en un producto se abre una ficha con todas sus fotos (se navega con flechas o puntitos) y la descripción.

También cambiá en `script.js`:

- `CONFIG.tiendaMercadoLibre` por el link de tu tienda.
- `CONFIG.whatsapp` por tu número de WhatsApp en formato internacional sin + ni espacios.
