// =====================================================
// SANITARIOS PCH - CONFIGURACIÓN
// Editá solamente esta parte para cargar tus productos.
// =====================================================
 
const CONFIG = {
  tiendaMercadoLibre: "https://www.mercadolibre.com.ar/pagina/sanitariosparquechacabuco",
  whatsapp: "5491126910527", // Cambiar por tu número. Ej: 5491123456789
 
  // Link CSV publicado de tu Google Sheets (Archivo > Compartir > Publicar en la web > CSV).
  // Si cambiás de planilla o de pestaña, solo hay que reemplazar este link.
  sheetCSV: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqPz2dRYCP0aDigNWC5IPKEz7bJFozEqVjuYsiq-8XdS91sv3CWP8IlTcq2WHtuBuzyS_YeCHOmYLk/pub?gid=1356223853&single=true&output=csv",
};
 
// Los productos se cargan automáticamente desde CONFIG.sheetCSV (ver cargarProductos()).
// Columnas esperadas en la planilla: Codigo, Nombre Publicacion, Precio Web, Categoria, Foto, Foto 2, Foto 3, Foto 4, Descripcion, Link Mercado Libre, Mostrar
const WHATSAPP_ICON_SVG = '<svg width="18" height="18" fill="currentColor" aria-hidden="true"><use href="#icon-whatsapp"></use></svg>';
let PRODUCTOS = [];
let categoriaActual = "Todos";
 
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
 
// Interpreta la columna "Mostrar" como sí/no. Si está vacía, se muestra igual.
function debeMostrarse(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === "") return true;
  const v = String(valor).trim().toLowerCase();
  return ["si", "sí", "yes", "true", "1", "x"].includes(v);
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
      .filter(fila => debeMostrarse(fila["Mostrar"]) && (fila["Nombre Publicacion"] || "").trim())
      .map(fila => {
        const principal = (fila["Foto"] || "").trim();
        const extras = [fila["Foto 2"], fila["Foto 3"], fila["Foto 4"]]
          .map(f => (f || "").trim())
          .filter(Boolean);
        const fotos = [principal, ...extras].filter(Boolean);
        if (fotos.length === 0) fotos.push("https://placehold.co/700x700/e9efec/183b3f?text=Sin+foto");
 
        return {
          nombre: (fila["Nombre Publicacion"] || "").trim(),
          precio: parsePrecio(fila["Precio Web"]),
          categoria: (fila["Categoria"] || "Otros").trim(),
          descripcion: (fila["Descripcion"] || "").trim(),
          fotos,
          imagen: fotos[0],
          link: (fila["Link Mercado Libre"] || CONFIG.tiendaMercadoLibre).trim(),
        };
      });
 
    renderCategories();
    renderProducts();
  } catch (err) {
    console.error("Error cargando productos desde Google Sheets:", err);
    grid.innerHTML = `<p class="loading-msg">No pudimos cargar los productos en este momento. Probá de nuevo más tarde.</p>`;
    document.getElementById("empty").hidden = true;
  }
}
 
function whatsappLink(producto) {
  const text = encodeURIComponent(
    `Hola Sanitarios PCH, quiero consultar por: ${producto.nombre}`
  );
  return `https://wa.me/${CONFIG.whatsapp}?text=${text}`;
}
 
function renderCategories() {
  const categories = ["Todos", ...new Set(PRODUCTOS.map(p => p.categoria))];
  document.getElementById("categories").innerHTML = categories.map(cat => `
    <button class="category ${cat === categoriaActual ? "active" : ""}" data-category="${cat}">
      ${cat}
    </button>
  `).join("");
 
  document.querySelectorAll(".category").forEach(btn => {
    btn.addEventListener("click", () => {
      categoriaActual = btn.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}
 
function renderProducts() {
  const query = document.getElementById("search").value.toLowerCase().trim();
 
  const productos = PRODUCTOS.filter(p => {
    const coincideCategoria =
      categoriaActual === "Todos" || p.categoria === categoriaActual;
    const coincideBusqueda =
      !query ||
      p.nombre.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query);
    return coincideCategoria && coincideBusqueda;
  });
 
  productosVisibles = productos;
 
  document.getElementById("productGrid").innerHTML = productos.map((p, i) => `
    <article class="product" data-index="${i}">
      <img class="product-img" src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="product-body">
        <div class="product-category">${p.categoria}</div>
        <h3>${p.nombre}</h3>
        <div class="price">${money.format(p.precio)}</div>
        <div class="product-actions">
          <a class="buy" href="${p.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Comprar</a>
          <a class="consult" href="${whatsappLink(p)}" target="_blank" rel="noopener" title="Consultar por WhatsApp" onclick="event.stopPropagation()">${WHATSAPP_ICON_SVG}</a>
        </div>
      </div>
    </article>
  `).join("");
 
  document.getElementById("empty").hidden = productos.length !== 0;
 
  document.querySelectorAll(".product").forEach(card => {
    card.addEventListener("click", () => abrirFicha(productosVisibles[Number(card.dataset.index)]));
  });
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
  document.getElementById("modalComprar").href = p.link;
  document.getElementById("modalConsultar").href = whatsappLink(p);
 
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
 
document.getElementById("search").addEventListener("input", renderProducts);
 
document.getElementById("storeLink").href = CONFIG.tiendaMercadoLibre;
document.getElementById("footerStore").href = CONFIG.tiendaMercadoLibre;
document.getElementById("whatsapp").href = `https://wa.me/${CONFIG.whatsapp}`;
document.getElementById("footerWhatsapp").href = `https://wa.me/${CONFIG.whatsapp}`;
 
document.getElementById("heroStoreLink").href = CONFIG.tiendaMercadoLibre;
document.getElementById("heroWhatsappQuote").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Sanitarios PCH, quiero pedir un presupuesto.")}`;
document.getElementById("heroWhatsappListing").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Sanitarios PCH, quiero pedirte que me ayudes a armar una publicación en Mercado Libre.")}`;
 
cargarProductos();
