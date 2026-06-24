/* =============================================================
   LogiMarket · Catálogo digital
   JavaScript Vanilla — sin librerías, sin backend
============================================================= */

/* -------------------------------------------------------------
   1) DATOS · Array de productos (fácil de editar)
   Para agregar/editar un producto, modificá este array.
   - "promo": true  ->  muestra el badge de promoción.
------------------------------------------------------------- */
const PRODUCTOS = [
  {
    codigo: "14408",
    descripcion: "TRAVIATA 3X108 G",
    division: "HARINAS",
    segmento: "CRACKERS SANDWICH",
    precioUnidad: 1847,
    precioBulto: 29541,
    imagen: "imagenes/Traviata X3.png",
    promo: false
  },
  {
    codigo: "14772",
    descripcion: "SURTIDO BAGLEY X400 G",
    division: "HARINAS",
    segmento: "SURTIDAS",
    precioUnidad: 2966,
    precioBulto: 62257,
    imagen: "imagenes/Surtidos Bagley.png",
    promo: false
  },
  {
    codigo: "14323",
    descripcion: "CHOCOLINAS X250 G",
    division: "HARINAS",
    segmento: "GALLETAS DULCES SECAS",
    precioUnidad: 2083,
    precioBulto: 52081,
    imagen: "imagenes/Chocolinas 250g.png",
    promo: false
  },
  {
    codigo: "14336",
    descripcion: "SURTIDO DIVERSION X400 G",
    division: "HARINAS",
    segmento: "SURTIDAS",
    precioUnidad: 2405,
    precioBulto: 50478,
    imagen: "imagenes/Diversion.png",
    promo: false
  }
];

/* -------------------------------------------------------------
   2) Referencias al DOM
------------------------------------------------------------- */
const $buscador      = document.getElementById("buscador");
const $filtroDiv     = document.getElementById("filtroDivision");
const $filtroSeg     = document.getElementById("filtroSegmento");
const $limpiar       = document.getElementById("limpiarFiltros");
const $contador      = document.getElementById("contador");
const $products      = document.getElementById("products");
const $emptyState    = document.getElementById("emptyState");

/* -------------------------------------------------------------
   3) Utilidades
------------------------------------------------------------- */

// Formatea un número como precio en pesos argentinos: 29541 -> "$29.541"
function formatearPrecio(valor) {
  return "$" + valor.toLocaleString("es-AR");
}

// Devuelve valores únicos de una propiedad del array de productos
function valoresUnicos(propiedad) {
  const set = new Set(PRODUCTOS.map((p) => p[propiedad]));
  return [...set].sort();
}

/* -------------------------------------------------------------
   4) Poblar selects de filtros dinámicamente
------------------------------------------------------------- */
function poblarSelect(select, valores) {
  valores.forEach((valor) => {
    const opt = document.createElement("option");
    opt.value = valor;
    opt.textContent = valor;
    select.appendChild(opt);
  });
}

poblarSelect($filtroDiv, valoresUnicos("division"));
poblarSelect($filtroSeg, valoresUnicos("segmento"));

/* -------------------------------------------------------------
   5) Render de una tarjeta de producto
------------------------------------------------------------- */
// Modificador de tarjeta por producto (para ajustar el zoom de cada PNG)
const CLASE_POR_CODIGO = {
  "14408": "product-card--traviata",
  "14772": "product-card--bagley",
  "14323": "product-card--chocolinas",
  "14336": "product-card--diversion"
};

function crearTarjeta(producto) {
  const card = document.createElement("article");
  const modificador = CLASE_POR_CODIGO[producto.codigo] || "";
  card.className = `product-card fade-up ${modificador}`.trim();

  const badge = producto.promo
    ? `<span class="product-card__badge">Promo</span>`
    : "";

  // Encodeamos la ruta para soportar espacios y mayúsculas de forma segura
  // (p. ej. "imagenes/Traviata X3.png" -> "imagenes/Traviata%20X3.png")
  const src = encodeURI(producto.imagen);

  card.innerHTML = `
    <div class="product-card__media">
      ${badge}
      <img
        class="product-card__img"
        src="${src}"
        alt="${producto.descripcion}"
        loading="lazy"
      />
    </div>
    <div class="product-card__body">
      <span class="product-card__code">Código ${producto.codigo}</span>
      <h3 class="product-card__title">${producto.descripcion}</h3>
      <div class="product-card__tags">
        <span class="tag tag--division">${producto.division}</span>
        <span class="tag tag--segmento">${producto.segmento}</span>
      </div>
      <div class="product-card__prices">
        <div class="price-box price-box--unidad">
          <span class="price-box__top">
            <svg class="price-box__icon" viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 7.5v9M9.5 9.2a2.5 2 0 015 0c0 1.6-2.5 1.8-2.5 3.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <span class="price-box__label">Precio unidad</span>
          </span>
          <span class="price-box__value">${formatearPrecio(producto.precioUnidad)} <small class="price-box__unit">c/u</small></span>
        </div>
        <div class="price-box price-box--bulto">
          <span class="price-box__top">
            <svg class="price-box__icon" viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M3 7.5L12 12l9-4.5M12 12v9" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
            <span class="price-box__label">Precio bulto</span>
          </span>
          <span class="price-box__value">${formatearPrecio(producto.precioBulto)} <small class="price-box__unit">por bulto</small></span>
        </div>
      </div>
    </div>
  `;
  return card;
}

/* -------------------------------------------------------------
   6) Aplicar filtros + búsqueda y renderizar
------------------------------------------------------------- */
function aplicarFiltros() {
  const termino   = $buscador.value.trim().toLowerCase();
  const division  = $filtroDiv.value;
  const segmento  = $filtroSeg.value;

  const filtrados = PRODUCTOS.filter((p) => {
    // Búsqueda por nombre, código o descripción
    const coincideTexto =
      !termino ||
      p.descripcion.toLowerCase().includes(termino) ||
      p.codigo.toLowerCase().includes(termino) ||
      p.division.toLowerCase().includes(termino) ||
      p.segmento.toLowerCase().includes(termino);

    const coincideDivision = !division || p.division === division;
    const coincideSegmento = !segmento || p.segmento === segmento;

    return coincideTexto && coincideDivision && coincideSegmento;
  });

  renderizar(filtrados);
}

function renderizar(lista) {
  // Limpiar grilla
  $products.innerHTML = "";

  // Estado vacío
  $emptyState.hidden = lista.length !== 0;

  // Pintar tarjetas
  const fragmento = document.createDocumentFragment();
  lista.forEach((producto) => fragmento.appendChild(crearTarjeta(producto)));
  $products.appendChild(fragmento);

  // Contador dinámico
  const n = lista.length;
  $contador.innerHTML =
    n === 1
      ? `<strong>1</strong> producto encontrado`
      : `<strong>${n}</strong> productos encontrados`;

  // Reactivar animación de aparición en las nuevas tarjetas
  observarFadeIn();
}

/* -------------------------------------------------------------
   7) Limpiar filtros
------------------------------------------------------------- */
function limpiarFiltros() {
  $buscador.value  = "";
  $filtroDiv.value = "";
  $filtroSeg.value = "";
  aplicarFiltros();
  $buscador.focus();
}

/* -------------------------------------------------------------
   8) Eventos de filtros
------------------------------------------------------------- */
$buscador.addEventListener("input", aplicarFiltros);
$filtroDiv.addEventListener("change", aplicarFiltros);
$filtroSeg.addEventListener("change", aplicarFiltros);
$limpiar.addEventListener("click", limpiarFiltros);

/* -------------------------------------------------------------
   9) Menú hamburguesa (mobile)
------------------------------------------------------------- */
const $hamburger = document.getElementById("hamburger");
const $nav       = document.getElementById("nav");

$hamburger.addEventListener("click", () => {
  const abierto = $nav.classList.toggle("is-open");
  $hamburger.classList.toggle("is-open", abierto);
  $hamburger.setAttribute("aria-expanded", String(abierto));
  $hamburger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

// Cerrar el menú al hacer click en un enlace (mobile)
$nav.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => {
    $nav.classList.remove("is-open");
    $hamburger.classList.remove("is-open");
    $hamburger.setAttribute("aria-expanded", "false");
    $hamburger.setAttribute("aria-label", "Abrir menú");
  });
});

/* -------------------------------------------------------------
   10) Scroll suave al catálogo desde el botón del hero
   (smooth nativo via CSS; este handler asegura compatibilidad)
------------------------------------------------------------- */
const $verCatalogo = document.getElementById("verCatalogo");
$verCatalogo.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
});

/* -------------------------------------------------------------
   11) Botón WhatsApp · movimiento sutil según scroll
   - scroll hacia abajo -> clase .scroll-down
   - scroll hacia arriba -> clase .scroll-up
   - vuelve a posición estable tras unos milisegundos
------------------------------------------------------------- */
const $fab = document.getElementById("whatsappFab");
let ultimoScroll = window.scrollY;
let resetTimer   = null;

window.addEventListener(
  "scroll",
  () => {
    const actual = window.scrollY;
    const delta  = actual - ultimoScroll;

    // Ignorar micro-movimientos para evitar saltos bruscos
    if (Math.abs(delta) > 4) {
      if (delta > 0) {
        $fab.classList.add("scroll-down");
        $fab.classList.remove("scroll-up");
      } else {
        $fab.classList.add("scroll-up");
        $fab.classList.remove("scroll-down");
      }

      // Volver a posición estable después de 400ms sin scrollear
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        $fab.classList.remove("scroll-down", "scroll-up");
      }, 400);
    }

    ultimoScroll = actual;
  },
  { passive: true }
);

/* -------------------------------------------------------------
   12) Animación fade-in con IntersectionObserver
------------------------------------------------------------- */
let observer;
function observarFadeIn() {
  // Animamos tanto los bloques (fade-in) como las tarjetas (fade-up)
  const selector = ".fade-in, .fade-up";

  if (!("IntersectionObserver" in window)) {
    // Fallback: mostrar todo directamente
    document.querySelectorAll(selector).forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
  }

  document
    .querySelectorAll(".fade-in:not(.is-visible), .fade-up:not(.is-visible)")
    .forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------
   13) Año dinámico en el footer
------------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* -------------------------------------------------------------
   14) Inicialización
------------------------------------------------------------- */
aplicarFiltros();   // render inicial + contador
observarFadeIn();   // animaciones de entrada
