// =====================================================
// SANITARIOS PCH - CONFIGURACIÓN
// Editá solamente esta parte para cargar tus productos.
// =====================================================

const CONFIG = {
  tiendaMercadoLibre: "https://www.mercadolibre.com.ar/pagina/sanitariosparquechacabuco",
  whatsapp: "5491100000000", // Cambiar por tu número. Ej: 5491123456789

  // Link CSV publicado de tu Google Sheets (Archivo > Compartir > Publicar en la web > CSV).
  // Si cambiás de planilla o de pestaña, solo hay que reemplazar este link.
  sheetCSV: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqPz2dRYCP0aDigNWC5IPKEz7bJFozEqVjuYsiq-8XdS91sv3CWP8IlTcq2WHtuBuzyS_YeCHOmYLk/pub?gid=1356223853&single=true&output=csv",
};

// Los productos se cargan automáticamente desde CONFIG.sheetCSV (ver cargarProductos()).
// Columnas esperadas en la planilla: Codigo, Nombre Publicacion, Precio Web, Categoria, Foto, Link Mercado Libre, Mostrar
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
      .map(fila => ({
        nombre: (fila["Nombre Publicacion"] || "").trim(),
        precio: parsePrecio(fila["Precio Web"]),
        categoria: (fila["Categoria"] || "Otros").trim(),
        imagen: (fila["Foto"] || "https://placehold.co/700x700/e9efec/183b3f?text=Sin+foto").trim(),
        link: (fila["Link Mercado Libre"] || CONFIG.tiendaMercadoLibre).trim(),
      }));

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

  document.getElementById("productGrid").innerHTML = productos.map(p => `
    <article class="product">
      <img class="product-img" src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <div class="product-body">
        <div class="product-category">${p.categoria}</div>
        <h3>${p.nombre}</h3>
        <div class="price">${money.format(p.precio)}</div>
        <div class="product-actions">
          <a class="buy" href="${p.link}" target="_blank" rel="noopener">Comprar</a>
          <a class="consult" href="${whatsappLink(p)}" target="_blank" rel="noopener" title="Consultar por WhatsApp">💬</a>
        </div>
      </div>
    </article>
  `).join("");

  document.getElementById("empty").hidden = productos.length !== 0;
}

document.getElementById("search").addEventListener("input", renderProducts);

document.getElementById("storeLink").href = CONFIG.tiendaMercadoLibre;
document.getElementById("footerStore").href = CONFIG.tiendaMercadoLibre;
document.getElementById("whatsapp").href = `https://wa.me/${CONFIG.whatsapp}`;
document.getElementById("footerWhatsapp").href = `https://wa.me/${CONFIG.whatsapp}`;

cargarProductos();
