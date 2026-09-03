# Sanitarios PCH - Catálogo web

Esta es una primera versión de una web catálogo para mostrar productos y enviar al cliente a Mercado Libre.

## Archivos

- index.html: estructura de la página
- style.css: diseño
- script.js: productos, precios, imágenes, links y WhatsApp

## Cómo cargar tus productos

Los productos ya NO se cargan a mano en el código: se traen automáticamente desde tu Google Sheets publicado como CSV (ver `CONFIG.sheetCSV` en `script.js`).

Columnas de la planilla:

- Codigo (opcional, pero recomendado — identifica al producto de forma única
  para el carrito; si lo dejás vacío se usa el nombre)
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

## Barra de promos (arriba de todo)

La franja que se mueve horizontalmente arriba del header ("SANITARIOS PCH",
"ARMÁ TU CARRITO · 10% OFF", etc.) es texto fijo en `index.html`, dentro de
`<div class="ticker">`. Para cambiar los textos, editá los `<span
class="ticker-item">` — hay que repetir la misma lista dos veces seguidas
(así el loop no se corta) y las dos copias tienen que decir lo mismo.

## Carrito (3er canal de venta) y 10% OFF

Además de comprar por Mercado Libre o consultar por WhatsApp, cada producto
tiene un botón de carrito (🛒) para armar un pedido en la web. El botón
"Comprá mediante la web" de la franja de arriba del Home lleva al catálogo
para empezar. El carrito:

- Aplica automáticamente un **10% OFF** sobre el precio cargado (el mismo
  precio de Mercado Libre) — se ve en el carrito con el precio de lista
  tachado y el precio final al lado. El porcentaje se controla desde
  `CONFIG.descuentoWeb` en `script.js` (0.10 = 10%); no toca el precio
  mostrado en la ficha del producto ni el de Mercado Libre, solo el del
  carrito.
- Se guarda en el navegador de cada visitante (localStorage), así que si
  cierran la página y vuelven más tarde lo siguen teniendo.
- No se ofrece para productos "Sin Stock" (no tendría sentido armar un
  pedido de algo que no hay).
- Antes de mandar el pedido, pide los datos del cliente: **Nombre y
  apellido/Empresa, Provincia, Localidad, Dirección y Teléfono**. Al
  confirmar, arma un mensaje con esos datos + el detalle del pedido
  (productos, cantidades y total con el 10% OFF ya aplicado) y lo manda a
  tu WhatsApp para que coordines la entrega y el pago. El navegador
  recuerda los datos para la próxima vez que ese mismo visitante compre.

No hay nada más que configurar para que funcione — ya usa `CONFIG.whatsapp`
y los datos de cada producto de la planilla.

## Cómo cargar videos en el Home (sección "Videos")

La sección "Videos" del Home queda oculta hasta que cargues al menos un
video en `CONFIG.clips`, en `script.js`. Se muestra como un video grande
con pestañas de categoría arriba y, si hay más de un video en esa
categoría, una tira de miniaturas abajo para elegir otro. Para cada video
agregá un objeto a la lista con estos campos:

- `titulo` y `texto`: el texto que se ve al lado del video grande.
- `categoria` (opcional): agrupa los videos en pestañas (por ejemplo
  "Aspiradoras", "Mochilas"). Si la dejás vacía, todos los videos caen en
  una única pestaña "Videos" (no se muestran pestañas con un solo grupo).
- `poster`: una imagen de portada (obligatoria si no ponés `video`; se usa
  también como miniatura en la tira de abajo).
- `video` (opcional): link directo a un archivo .mp4. Si lo completás, el
  video grande se reproduce con controles. Si lo dejás vacío, se muestra
  la imagen de `poster` y al hacer clic lleva al link de `link`.
- `link` (opcional): a dónde lleva el botón "Ver más" (por ejemplo, la
  publicación en Mercado Libre). Si lo dejás vacío, usa
  `CONFIG.tiendaMercadoLibre`.

Ejemplo con dos categorías:

```js
clips: [
  { titulo: "Aspiradora SWIFT", texto: "Limpiá la casa o el auto en minutos.",
    categoria: "Aspiradoras", poster: "https://.../portada.jpg", video: "https://.../clip.mp4", link: "" },
  { titulo: "Mochila Táctica", texto: "Resistente al agua.",
    categoria: "Mochilas", poster: "https://.../portada2.jpg", video: "", link: "https://..." },
],
```

### Cómo mandarme los videos

Subilos acá mismo en el chat (los archivos .mp4) y los agrego. Si pesan
mucho (más de ~20-25 MB cada uno) avisame, porque conviene comprimirlos o
subirlos a un hosting de video aparte para no inflar el repositorio y que
la página cargue rápido.
