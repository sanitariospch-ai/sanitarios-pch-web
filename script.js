// =====================================================
// SANITARIOS PCH - CONFIGURACIÓN
// Editá solamente esta parte para cargar tus productos.
// =====================================================

const CONFIG = {
  tiendaMercadoLibre: "https://www.mercadolibre.com.ar/pagina/sanitariosparquechacabuco",
  whatsapp: "5491126910527", // Cambiar por tu número. Ej: 5491123456789

  // Descuento para lo que se compra armando el carrito en la web (en vez de
  // por Mercado Libre). 0.10 = 10%. Se aplica solo a los precios del carrito
  // y al total que se manda por WhatsApp; no toca el precio mostrado en la
  // ficha del producto ni el de Mercado Libre.
  descuentoWeb: 0.10,

  // Link CSV publicado de tu Google Sheets (Archivo > Compartir > Publicar en la web > CSV).
  // Si cambiás de planilla o de pestaña, solo hay que reemplazar este link.
  sheetCSV: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqPz2dRYCP0aDigNWC5IPKEz7bJFozEqVjuYsiq-8XdS91sv3CWP8IlTcq2WHtuBuzyS_YeCHOmYLk/pub?gid=1356223853&single=true&output=csv",

  // Videos para la sección "Videos" del Home (tipo Clips de Mercado Libre).
  // Mientras esta lista esté vacía, la sección queda oculta automáticamente.
  // Para agregar un video, sumá un objeto acá. Dos formas:
  //  1) Video propio: poner "video" con el link directo a un .mp4 (por ejemplo
  //     subido a tu Google Drive/Github) y "poster" con una imagen de portada.
  //  2) Solo un link (por ejemplo a la publicación/clip en Mercado Libre): poner
  //     "poster" (imagen) y "link" — el video grande lleva a ese link en vez de
  //     reproducirse acá.
  // Campos: hook (pregunta o frase corta arriba del título, opcional),
  // titulo, texto, categoria (agrupa los videos en pestañas; si la dejás
  // vacía todos caen en una única pestaña "Videos"), poster (imagen), video
  // (opcional, .mp4), link (opcional).
  clips: [
    { hook: "¿SE TE ROMPIÓ EL FLEXIBLE DE AGUA?", titulo: "Flexibles de agua Tecnoform",
      texto: "Conexión de 1/2\" y 3/4\" en distintos largos, en acero inoxidable premium. Para canillas, inodoros y artefactos de baño y cocina.",
      categoria: "Flexibles de Agua", poster: "videos/posters/flexibles-de-agua.jpg", video: "videos/flexibles-de-agua.mp4" },
    { hook: "CONEXIÓN DE GAS SEGURA Y APROBADA", titulo: "Flexibles de gas Tecnoform",
      texto: "Aprobados para gas natural o envasado. Medida fija o extensible, elegí el largo que necesitás.",
      categoria: "Flexibles de Gas", poster: "videos/posters/flexibles-de-gas.jpg", video: "videos/flexibles-de-gas.mp4" },
    { hook: "SOPAPA DE BACHA CON CESTILLO", titulo: "Sopapa de desagüe para bacha",
      texto: "Sopapa de desagüe de 9cm para bacha, fácil de instalar.",
      categoria: "Sopapa Bacha", poster: "videos/posters/desagua-sopapa-bacha.jpg", video: "videos/desagua-sopapa-bacha.mp4" },
    { hook: "¿SE TE ROMPIÓ EL FLOTANTE DEL TANQUE?", titulo: "Flotantes para tanque de agua",
      texto: "Disponibles en 1/2\", 3/4\" y 1\" para regular el nivel de agua del tanque.",
      categoria: "Flotantes", poster: "videos/posters/flotantes.jpg", video: "videos/flotantes.mp4" },
    { hook: "INSTALÁ TU INODORO SIN VUELTAS", titulo: "Fuelles conectores Gon-Ren",
      texto: "Conectores para inodoro con tuerca en 3 modelos: descarga de pared, mochila de colgar flexible y mochila de colgar codo rígido. Instalación en 3 pasos.",
      categoria: "Fuelles", poster: "videos/posters/fuelles-inodoro.jpg", video: "videos/fuelles-inodoro.mp4" },
    { hook: "SUJECIÓN FIRME PARA TUS CAÑOS", titulo: "Grampas Magari",
      texto: "Abrazaderas para fijar cañerías de forma segura y prolija.",
      categoria: "Grampas", poster: "videos/posters/grampas-magari.jpg", video: "videos/grampas-magari.mp4" },
    { hook: "SIFÓN CON TRIPLE ACCESO", titulo: "Sifones frontales Gon-Ren",
      texto: "Sifón doble o simple, de triple acceso. Instalación a bacha, a pared o para lavarropas. Industria argentina.",
      categoria: "Sifones", poster: "videos/posters/sifones-gon-ren.jpg", video: "videos/sifones-gon-ren.mp4" },
  ],
};

// Los productos se cargan automáticamente desde CONFIG.sheetCSV (ver cargarProductos()).
// Columnas esperadas en la planilla: Codigo, Nombre Publicacion, Precio Web, Categoria, Foto, Foto 2, Foto 3, Foto 4, Descripcion, Link Mercado Libre, Mostrar
// La columna "Mostrar" acepta 3 valores: Si (se ve normal), No (no aparece en la web) y Sin Stock
// (aparece igual pero con la etiqueta "Sin stock" y el WhatsApp pregunta por el reingreso).

// Cuántos productos se muestran antes de que aparezca "Ver más productos".
// Subí o bajá este número si querés que se vean más o menos de entrada.
const PRODUCTOS_POR_TANDA = 5;

let PRODUCTOS = [];
let categoriaActual = "Todos";
let productosVisiblesCount = PRODUCTOS_POR_TANDA;

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

// Convierte un texto de precio tipo "49.999" o "$49999" o "49999" en un número.
function parsePrecio(texto) {
  const limpio = String(texto || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // saca puntos usados como separador de miles
    .replace(",", ".");
  const num = parseFloat(limpio);
  return isNaN(num) ? 0 : num;
}

// Interpreta cualquier columna simple de sí/no de la planilla (por ejemplo
// "Destacado"). Vacío o cualquier otra cosa que no sea un "sí" cuenta como no.
function esSiVerdadero(valor) {
  const v = String(valor || "").trim().toLowerCase();
  return ["si", "sí", "yes", "true", "1", "x"].includes(v);
}

// Interpreta la columna "Mostrar": "si" (o vacío) muestra normal, "no" la oculta
// por completo y "sin stock" la muestra marcada como sin stock.
function estadoPublicacion(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === "") return "si";
  const v = String(valor).trim().toLowerCase();
  if (["sin stock", "sin-stock", "sinstock"].includes(v)) return "sin_stock";
  if (["si", "sí", "yes", "true", "1", "x"].includes(v)) return "si";
  return "no";
}

// Descarga el CSV publicado de Google Sheets y lo transforma en la lista de productos.
async function cargarProductos() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = `<p class="loading-msg">Cargando productos...</p>`;

  try {
    const res = await fetch(CONFIG.sheetCSV, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo acceder a la planilla");
    const texto = await res.text();

    const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });

    PRODUCTOS = parsed.data
      .filter(fila => estadoPublicacion(fila["Mostrar"]) !== "no" && (fila["Nombre Publicacion"] || "").trim())
      .map(fila => {
        const principal = (fila["Foto"] || "").trim();
        const extras = [fila["Foto 2"], fila["Foto 3"], fila["Foto 4"]]
          .map(f => (f || "").trim())
          .filter(Boolean);
        const fotos = [principal, ...extras].filter(Boolean);
        if (fotos.length === 0) fotos.push("https://placehold.co/700x700/e9efec/183b3f?text=Sin+foto");

        return {
          codigo: (fila["Codigo"] || "").trim(),
          nombre: (fila["Nombre Publicacion"] || "").trim(),
          precio: parsePrecio(fila["Precio Web"]),
          categoria: (fila["Categoria"] || "Otros").trim(),
          descripcion: (fila["Descripcion"] || "").trim(),
          fotos,
          imagen: fotos[0],
          link: (fila["Link Mercado Libre"] || CONFIG.tiendaMercadoLibre).trim(),
          sinStock: estadoPublicacion(fila["Mostrar"]) === "sin_stock",
          destacado: esSiVerdadero(fila["Destacado"]),
        };
      });

    renderCategories();
    renderProducts();
    renderDestacados();
    actualizarDatosEstructurados();
  } catch (err) {
    console.error("Error cargando productos desde Google Sheets:", err);
    grid.innerHTML = `<p class="loading-msg">No pudimos cargar los productos en este momento. Probá de nuevo más tarde.</p>`;
    document.getElementById("empty").hidden = true;
  }
}

// Datos estructurados (schema.org) para que Google entienda qué productos
// hay en la página, con su precio y si tienen stock. Se arma una sola vez
// con todos los productos cargados (no solo los que están visibles antes
// de tocar "Ver más productos"), apuntando el link de compra a la
// publicación real de Mercado Libre de cada uno.
function actualizarDatosEstructurados() {
  const urlPagina = document.querySelector('link[rel="canonical"]').href;
  const datos = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: PRODUCTOS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.nombre,
        image: p.imagen,
        ...(p.descripcion ? { description: p.descripcion } : {}),
        category: p.categoria,
        ...(p.codigo ? { sku: p.codigo } : {}),
        url: urlPagina,
        offers: {
          "@type": "Offer",
          url: p.link,
          priceCurrency: "ARS",
          price: p.precio,
          availability: p.sinStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        },
      },
    })),
  };
  document.getElementById("productsSchema").textContent = JSON.stringify(datos);
}

// Identificador único de un producto para el carrito: el Código de la
// planilla si está cargado, si no el nombre (alcanza para no duplicar).
function idProducto(p) {
  return p.codigo || p.nombre;
}

function whatsappLink(producto) {
  const mensaje = producto.sinStock
    ? `Hola Sanitarios PCH, quiero consultar cuándo van a tener nuevo stock de: ${producto.nombre}`
    : `Hola Sanitarios PCH, quiero consultar por: ${producto.nombre}`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

// El filtro por categoría vive únicamente en el submenú "Categorías" del
// menú lateral (no hay barra de categorías en el Home).
function renderCategories() {
  const categories = ["Todos", ...new Set(PRODUCTOS.map(p => p.categoria))];
  renderDrawerCategories(categories);
}

// Filtra por categoría y hace scroll al catálogo. La usa el submenú
// "Categorías" del menú lateral.
function irACategoria(categoria) {
  categoriaActual = categoria;
  productosVisiblesCount = PRODUCTOS_POR_TANDA;
  renderCategories();
  renderProducts();
  cerrarDrawer();
  document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
}

// Arma el submenú "Categorías" del menú lateral con las categorías reales
// de la planilla (se actualiza solo, no hace falta tocar nada acá).
function renderDrawerCategories(categories) {
  document.getElementById("drawerCategoriesSubmenu").innerHTML = categories.map(cat => `
    <button class="drawer-sublink ${cat === categoriaActual ? "active" : ""}" data-category="${cat}">${cat}</button>
  `).join("");

  document.querySelectorAll(".drawer-sublink").forEach(btn => {
    btn.addEventListener("click", () => irACategoria(btn.dataset.category));
  });
}

// Tarjeta de producto: la usan tanto la grilla del catálogo como la de
// "Destacados". `index` es la posición dentro del array que después se usa
// para resolver los clics (ver conectarTarjetas).
function productCardHTML(p, index) {
  return `
    <article class="product ${p.sinStock ? "sin-stock" : ""}" data-index="${index}">
      <div class="product-thumb">
        ${p.sinStock ? `<span class="stock-badge">Sin stock</span>` : ""}
        <img class="product-img" src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      </div>
      <div class="product-body">
        <div class="product-category">${p.categoria}</div>
        <h3>${p.nombre}</h3>
        <div class="price">${money.format(p.precio)}</div>
        <div class="product-actions">
          ${p.sinStock
            ? `<a class="buy" href="${p.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Comprar</a>`
            : `<button class="cart-add" data-id="${idProducto(p)}" onclick="event.stopPropagation()"><svg width="16" height="16" aria-hidden="true"><use href="#icon-cart"></use></svg>Agregar al carrito</button>
               <a class="buy-ml" href="${p.link}" target="_blank" rel="noopener" title="Comprar en Mercado Libre" onclick="event.stopPropagation()"><img class="ml-logo" src="mercadolibre-logo.png" width="20" height="20" alt="Mercado Libre"></a>`}
        </div>
      </div>
    </article>
  `;
}

// Conecta los clics de una grilla de tarjetas ya renderizada (abrir ficha,
// agregar al carrito) contra la lista de productos que la llenó.
function conectarTarjetas(contenedor, listaProductos) {
  contenedor.querySelectorAll(".product").forEach(card => {
    card.addEventListener("click", () => abrirFicha(listaProductos[Number(card.dataset.index)]));
  });
  contenedor.querySelectorAll(".cart-add").forEach(btn => {
    btn.addEventListener("click", () => {
      const producto = listaProductos.find(p => idProducto(p) === btn.dataset.id);
      if (producto) agregarAlCarrito(producto);
    });
  });
}

function renderProducts() {
  const query = document.getElementById("search").value.toLowerCase().trim();

  const productosFiltrados = PRODUCTOS.filter(p => {
    const coincideCategoria =
      categoriaActual === "Todos" || p.categoria === categoriaActual;
    const coincideBusqueda =
      !query ||
      p.nombre.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query);
    return coincideCategoria && coincideBusqueda;
  });

  productosVisibles = productosFiltrados;

  const productosAMostrar = productosFiltrados.slice(0, productosVisiblesCount);

  const grid = document.getElementById("productGrid");
  grid.innerHTML = productosAMostrar.map((p, i) => productCardHTML(p, i)).join("");

  document.getElementById("empty").hidden = productosFiltrados.length !== 0;
  document.getElementById("loadMoreWrap").hidden = productosFiltrados.length <= productosVisiblesCount;

  conectarTarjetas(grid, productosVisibles);
}

// ---------- Destacados (franja de productos elegidos arriba de "Videos") ----------
// Se arma sola con los productos que tengan "Si" en la columna "Destacado"
// de la planilla; si no hay ninguno, la sección queda oculta.
let productosDestacados = [];

function renderDestacados() {
  const section = document.getElementById("destacados");
  productosDestacados = PRODUCTOS.filter(p => p.destacado);

  if (productosDestacados.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;

  const grid = document.getElementById("destacadosGrid");
  grid.innerHTML = productosDestacados.map((p, i) => productCardHTML(p, i)).join("");
  conectarTarjetas(grid, productosDestacados);
}

// ---------- Ficha de producto (modal con varias fotos) ----------
let productosVisibles = [];
let fichaFotos = [];
let fichaIndice = 0;

function abrirFicha(p) {
  fichaFotos = p.fotos;
  fichaIndice = 0;

  document.getElementById("modalCategoria").textContent = p.categoria;
  document.getElementById("modalNombre").textContent = p.nombre;
  document.getElementById("modalPrecio").textContent = money.format(p.precio);
  document.getElementById("modalDescripcion").textContent = p.descripcion || "";
  document.getElementById("modalDescripcion").hidden = !p.descripcion;
  const modalComprarBtn = document.getElementById("modalComprar");
  modalComprarBtn.href = p.link;
  document.getElementById("modalConsultar").href = whatsappLink(p);
  document.getElementById("modalStockBadge").hidden = !p.sinStock;
  const modalCartBtn = document.getElementById("modalCartAdd");
  modalCartBtn.hidden = p.sinStock;
  modalCartBtn.onclick = () => agregarAlCarrito(p);
  // Sin carrito disponible (sin stock), "Comprar en Mercado Libre" pasa a ser
  // el botón grande; si no, queda como ícono chico junto al de agregar al carrito.
  if (p.sinStock) {
    modalComprarBtn.className = "buy";
    modalComprarBtn.title = "";
    modalComprarBtn.innerHTML = "Comprar en Mercado Libre";
  } else {
    modalComprarBtn.className = "buy-ml";
    modalComprarBtn.title = "Comprar en Mercado Libre";
    modalComprarBtn.innerHTML = '<img class="ml-logo" src="mercadolibre-logo.png" width="20" height="20" alt="Mercado Libre">';
  }

  renderFichaFoto();
  document.getElementById("modalDots").innerHTML = fichaFotos.map((_, i) =>
    `<button class="dot ${i === fichaIndice ? "active" : ""}" data-i="${i}" aria-label="Foto ${i + 1}"></button>`
  ).join("");
  document.getElementById("modalDots").hidden = fichaFotos.length <= 1;
  document.querySelector(".modal-arrows").hidden = fichaFotos.length <= 1;

  document.querySelectorAll("#modalDots .dot").forEach(dot => {
    dot.addEventListener("click", () => { fichaIndice = Number(dot.dataset.i); renderFichaFoto(); });
  });

  document.getElementById("productModal").hidden = false;
  document.body.style.overflow = "hidden";
}

function renderFichaFoto() {
  document.getElementById("modalImg").src = fichaFotos[fichaIndice];
  document.querySelectorAll("#modalDots .dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === fichaIndice);
  });
}

function fichaSiguiente() {
  fichaIndice = (fichaIndice + 1) % fichaFotos.length;
  renderFichaFoto();
}

function fichaAnterior() {
  fichaIndice = (fichaIndice - 1 + fichaFotos.length) % fichaFotos.length;
  renderFichaFoto();
}

function cerrarFicha() {
  document.getElementById("productModal").hidden = true;
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", cerrarFicha);
document.getElementById("modalOverlay").addEventListener("click", cerrarFicha);
document.getElementById("modalNext").addEventListener("click", fichaSiguiente);
document.getElementById("modalPrev").addEventListener("click", fichaAnterior);
document.addEventListener("keydown", (e) => {
  if (document.getElementById("productModal").hidden) return;
  if (e.key === "Escape") cerrarFicha();
  if (e.key === "ArrowRight") fichaSiguiente();
  if (e.key === "ArrowLeft") fichaAnterior();
});

// ---------- Menú lateral (drawer) ----------
function abrirDrawer() {
  document.getElementById("drawer").hidden = false;
  document.getElementById("drawerOverlay").hidden = false;
  document.body.style.overflow = "hidden";
}

function cerrarDrawer() {
  document.getElementById("drawer").hidden = true;
  document.getElementById("drawerOverlay").hidden = true;
  document.body.style.overflow = "";
}

document.getElementById("drawerOpen").addEventListener("click", abrirDrawer);
document.getElementById("drawerClose").addEventListener("click", cerrarDrawer);
document.getElementById("drawerOverlay").addEventListener("click", cerrarDrawer);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.getElementById("drawer").hidden) cerrarDrawer();
});

document.getElementById("drawerHome").addEventListener("click", (e) => {
  e.preventDefault();
  cerrarDrawer();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("drawerCategoriesToggle").addEventListener("click", function () {
  const submenu = document.getElementById("drawerCategoriesSubmenu");
  const abierto = submenu.hidden;
  submenu.hidden = !abierto;
  this.setAttribute("aria-expanded", String(abierto));
  this.classList.toggle("is-open", abierto);
});

// ---------- Carrito (3er canal de venta: se arma en la web, se cierra por WhatsApp) ----------
const CARRITO_STORAGE_KEY = "sanitariosPchCarrito";

function cargarCarritoGuardado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CARRITO_STORAGE_KEY));
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

let CARRITO = cargarCarritoGuardado();

function guardarCarrito() {
  try {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(CARRITO));
  } catch {
    // Si el navegador bloquea localStorage (modo privado, etc.) el carrito
    // simplemente no persiste entre visitas; no rompe el resto de la página.
  }
}

function agregarAlCarrito(producto) {
  const id = idProducto(producto);
  const existente = CARRITO.find(item => item.id === id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    CARRITO.push({
      id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1,
    });
  }
  guardarCarrito();
  renderCarrito();
  abrirCarrito();
}

function cambiarCantidad(id, delta) {
  const item = CARRITO.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) CARRITO = CARRITO.filter(i => i.id !== id);
  guardarCarrito();
  renderCarrito();
}

function quitarDelCarrito(id) {
  CARRITO = CARRITO.filter(i => i.id !== id);
  guardarCarrito();
  renderCarrito();
}

function vaciarCarrito() {
  CARRITO = [];
  guardarCarrito();
  renderCarrito();
}

// Precio con el 10% OFF de comprar por la web (ver CONFIG.descuentoWeb).
// Solo se usa acá adentro, en el carrito; no toca el precio de la ficha
// del producto ni el de Mercado Libre.
function precioConDescuentoWeb(precio) {
  return precio * (1 - CONFIG.descuentoWeb);
}

function totalCarrito() {
  return CARRITO.reduce((acc, item) => acc + precioConDescuentoWeb(item.precio) * item.cantidad, 0);
}

function mensajeCheckoutCarrito(datos) {
  const lineas = CARRITO.map(item =>
    `- ${item.cantidad} x ${item.nombre} (${money.format(precioConDescuentoWeb(item.precio))} c/u con 10% OFF)`
  );
  const esEnvio = datos.entrega === "Envío a domicilio";
  return [
    "Hola Sanitarios PCH, quiero hacer este pedido:",
    ...lineas,
    `Total con 10% OFF: ${money.format(totalCarrito())}`,
    "",
    "Mis datos:",
    `Nombre y apellido/Empresa: ${datos.nombre}`,
    `Entrega: ${datos.entrega}`,
    ...(esEnvio ? [
      `Provincia: ${datos.provincia}`,
      `Localidad: ${datos.localidad}`,
      `Dirección: ${datos.direccion}`,
    ] : []),
    `Teléfono: ${datos.telefono}`,
    `Facturación: ${datos.factura}`,
  ].join("\n");
}

function renderCarrito() {
  const cantidadTotal = CARRITO.reduce((acc, item) => acc + item.cantidad, 0);
  const countEl = document.getElementById("cartCount");
  countEl.textContent = String(cantidadTotal);
  countEl.hidden = cantidadTotal === 0;

  document.getElementById("cartEmpty").hidden = CARRITO.length > 0;
  document.getElementById("cartFooter").hidden = CARRITO.length === 0;

  document.getElementById("cartItems").innerHTML = CARRITO.map(item => `
    <div class="cart-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="cart-item-body">
        <span class="cart-item-name">${item.nombre}</span>
        <span class="cart-item-price">
          <span class="cart-item-price-old">${money.format(item.precio)}</span>
          <span class="cart-item-price-new">${money.format(precioConDescuentoWeb(item.precio))}</span>
        </span>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="menos" data-id="${item.id}" aria-label="Restar uno"><svg width="12" height="12" aria-hidden="true"><use href="#icon-minus"></use></svg></button>
          <span>${item.cantidad}</span>
          <button class="qty-btn" data-action="mas" data-id="${item.id}" aria-label="Sumar uno"><svg width="12" height="12" aria-hidden="true"><use href="#icon-plus"></use></svg></button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Quitar del carrito">✕</button>
    </div>
  `).join("");

  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => cambiarCantidad(btn.dataset.id, btn.dataset.action === "mas" ? 1 : -1));
  });
  document.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => quitarDelCarrito(btn.dataset.id));
  });

  document.getElementById("cartTotal").textContent = money.format(totalCarrito());
}

function abrirCarrito() {
  document.getElementById("cartDrawer").hidden = false;
  document.getElementById("cartOverlay").hidden = false;
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  document.getElementById("cartDrawer").hidden = true;
  document.getElementById("cartOverlay").hidden = true;
  document.body.style.overflow = "";
  volverAlCarrito();
}

document.getElementById("cartOpen").addEventListener("click", abrirCarrito);
document.getElementById("cartClose").addEventListener("click", cerrarCarrito);
document.getElementById("cartOverlay").addEventListener("click", cerrarCarrito);
document.getElementById("cartEmptyLink").addEventListener("click", cerrarCarrito);
document.getElementById("cartClear").addEventListener("click", vaciarCarrito);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.getElementById("cartDrawer").hidden) cerrarCarrito();
});

// ---------- Datos del cliente antes de mandar el pedido por WhatsApp ----------
const CHECKOUT_STORAGE_KEY = "sanitariosPchCheckoutDatos";

function cargarDatosGuardados() {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function guardarDatosCheckout(datos) {
  try {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(datos));
  } catch {
    // Si el navegador bloquea localStorage, simplemente no se recuerdan los
    // datos para la próxima compra; el resto sigue funcionando igual.
  }
}

// Muestra u oculta Provincia/Localidad/Dirección según si el pedido es para
// retirar por el local (no hace falta dirección) o para enviar a domicilio.
function actualizarCamposDireccion() {
  const entrega = document.querySelector('input[name="checkoutEntrega"]:checked');
  const esEnvio = entrega ? entrega.value === "Envío a domicilio" : true;
  const campos = document.getElementById("checkoutDireccionFields");
  campos.hidden = !esEnvio;
  document.getElementById("checkoutProvincia").required = esEnvio;
  document.getElementById("checkoutLocalidad").required = esEnvio;
  document.getElementById("checkoutDireccion").required = esEnvio;
}

document.getElementById("checkoutEntregaGroup").addEventListener("change", actualizarCamposDireccion);

// Cambia el panel del carrito al formulario de datos, precargando lo que
// el cliente haya cargado en una compra anterior (si el navegador lo guardó).
function abrirFormularioCheckout() {
  const datos = cargarDatosGuardados();
  document.getElementById("checkoutNombre").value = datos.nombre || "";
  document.getElementById("checkoutProvincia").value = datos.provincia || "";
  document.getElementById("checkoutLocalidad").value = datos.localidad || "";
  document.getElementById("checkoutDireccion").value = datos.direccion || "";
  document.getElementById("checkoutTelefono").value = datos.telefono || "";
  document.querySelectorAll('input[name="checkoutEntrega"]').forEach(input => {
    input.checked = input.value === datos.entrega;
  });
  document.querySelectorAll('input[name="checkoutFactura"]').forEach(input => {
    input.checked = input.value === datos.factura;
  });
  actualizarCamposDireccion();

  const cantidadTotal = CARRITO.reduce((acc, item) => acc + item.cantidad, 0);
  document.getElementById("cartFormSummary").innerHTML = `
    <span>${cantidadTotal} producto${cantidadTotal === 1 ? "" : "s"}</span>
    <strong>${money.format(totalCarrito())}</strong>
  `;

  document.getElementById("cartItems").hidden = true;
  document.getElementById("cartFooter").hidden = true;
  document.getElementById("cartCheckoutForm").hidden = false;
  document.getElementById("cartDrawerTitle").textContent = "Tus datos";
}

function volverAlCarrito() {
  document.getElementById("cartCheckoutForm").hidden = true;
  document.getElementById("cartItems").hidden = false;
  document.getElementById("cartFooter").hidden = CARRITO.length === 0;
  document.getElementById("cartDrawerTitle").textContent = "Tu carrito";
}

document.getElementById("cartCheckout").addEventListener("click", abrirFormularioCheckout);
document.getElementById("cartFormBack").addEventListener("click", volverAlCarrito);

document.getElementById("cartCheckoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const entrega = document.querySelector('input[name="checkoutEntrega"]:checked');
  const factura = document.querySelector('input[name="checkoutFactura"]:checked');
  const datos = {
    nombre: document.getElementById("checkoutNombre").value.trim(),
    entrega: entrega ? entrega.value : "",
    provincia: document.getElementById("checkoutProvincia").value,
    localidad: document.getElementById("checkoutLocalidad").value.trim(),
    direccion: document.getElementById("checkoutDireccion").value.trim(),
    telefono: document.getElementById("checkoutTelefono").value.trim(),
    factura: factura ? factura.value : "",
  };
  guardarDatosCheckout(datos);
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensajeCheckoutCarrito(datos))}`;
  window.open(url, "_blank", "noopener");
  vaciarCarrito();
  cerrarCarrito();
});

renderCarrito();

// ---------- Videos (sección "Videos" del Home) ----------
// Rectángulo grande con el video activo + pestañas de categoría + tira de
// miniaturas para elegir otro video de esa misma categoría.
let clipCategoriaActual = null;
let clipActivoId = null;

function renderClips() {
  const section = document.getElementById("clips");
  if (!CONFIG.clips || CONFIG.clips.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;

  const clips = CONFIG.clips.map((c, i) => ({ ...c, id: c.id ?? String(i), categoria: c.categoria || "Videos" }));
  const categorias = [...new Set(clips.map(c => c.categoria))];
  if (!clipCategoriaActual || !categorias.includes(clipCategoriaActual)) {
    clipCategoriaActual = categorias[0];
  }

  document.getElementById("clipsTabs").innerHTML = categorias.length <= 1 ? "" : categorias.map(cat => `
    <button class="clips-tab ${cat === clipCategoriaActual ? "active" : ""}" data-cat="${cat}">${cat}</button>
  `).join("");

  document.querySelectorAll(".clips-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      clipCategoriaActual = btn.dataset.cat;
      clipActivoId = null;
      renderClips();
    });
  });

  const clipsCategoria = clips.filter(c => c.categoria === clipCategoriaActual);
  const activo = clipsCategoria.find(c => c.id === clipActivoId) || clipsCategoria[0];
  clipActivoId = activo.id;

  document.getElementById("clipsFeature").innerHTML = `
    <div class="clips-feature-media">
      ${activo.video
        ? `<video src="${activo.video}" poster="${activo.poster || ""}" autoplay muted loop playsinline controls></video>`
        : `<a href="${activo.link || CONFIG.tiendaMercadoLibre}" target="_blank" rel="noopener"><img src="${activo.poster || ""}" alt="${activo.titulo || ""}"></a>`}
    </div>
    <div class="clips-feature-body">
      ${activo.hook ? `<span class="clips-feature-hook">${activo.hook}</span>` : ""}
      <h3>${activo.titulo || ""}</h3>
      <p>${activo.texto || ""}</p>
      <a class="secondary-btn" href="${activo.link || CONFIG.tiendaMercadoLibre}" target="_blank" rel="noopener">Ver más</a>
    </div>
  `;

  document.getElementById("clipsRail").innerHTML = clipsCategoria.length <= 1 ? "" : clipsCategoria.map(c => `
    <button class="clips-thumb ${c.id === activo.id ? "active" : ""}" data-id="${c.id}">
      <img src="${c.poster || ""}" alt="${c.titulo || ""}">
      <span>${c.titulo || ""}</span>
    </button>
  `).join("");

  document.querySelectorAll(".clips-thumb").forEach(btn => {
    btn.addEventListener("click", () => { clipActivoId = btn.dataset.id; renderClips(); });
  });
}
renderClips();

document.getElementById("search").addEventListener("input", () => {
  productosVisiblesCount = PRODUCTOS_POR_TANDA;
  renderProducts();
});

document.getElementById("loadMoreBtn").addEventListener("click", () => {
  productosVisiblesCount += PRODUCTOS_POR_TANDA;
  renderProducts();
});

document.getElementById("storeLink").href = CONFIG.tiendaMercadoLibre;
document.getElementById("footerStore").href = CONFIG.tiendaMercadoLibre;
document.getElementById("whatsapp").href = `https://wa.me/${CONFIG.whatsapp}`;
document.getElementById("footerWhatsapp").href = `https://wa.me/${CONFIG.whatsapp}`;

document.getElementById("heroStoreLink").href = CONFIG.tiendaMercadoLibre;
document.getElementById("heroWhatsappQuote").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Sanitarios PCH, quiero pedir un presupuesto.")}`;
document.getElementById("infoWhatsapp").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Sanitarios PCH, tengo una consulta.")}`;

document.getElementById("drawerContacto").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Sanitarios PCH, tengo una consulta.")}`;
document.getElementById("drawerMayoristas").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Sanitarios PCH, soy una empresa y quiero consultar por compra mayorista.")}`;

document.getElementById("headerSearchBtn").addEventListener("click", () => {
  cerrarDrawer();
  document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
  document.getElementById("search").focus();
});

cargarProductos();
