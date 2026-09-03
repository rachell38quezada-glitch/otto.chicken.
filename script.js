/* ===========================================================
   OTTO CHICKEN — script.js
   ---------------------------------------------------------
   CONFIG: edita estos valores con la información oficial
   de OTTO CHICKEN en cuanto esté disponible.
=========================================================== */
const CONFIG = {
  // Número de WhatsApp en formato internacional sin signos, ej: "18095551234"
  WHATSAPP_NUMBER: "18094669139",
  WHATSAPP_MESSAGE: "Hola OTTO, quiero hacer un pedido 🐔",
  INSTAGRAM_URL: "https://instagram.com/otto.chicken",

  // Horario DE EJEMPLO usado solo para demostrar el estado OPEN NOW / CLOSED.
  // Reemplazar con el horario real de OTTO CHICKEN.
  // Formato 24h. index: 0=Domingo,1=Lunes,2=Martes,3=Miércoles,4=Jueves,5=Viernes,6=Sábado
  EXAMPLE_HOURS: {
    0: { open: 12, close: 21 },
    1: { open: 11, close: 22 },
    2: { open: 11, close: 22 },
    3: { open: 11, close: 22 },
    4: { open: 11, close: 22 },
    5: { open: 11, close: 23 },
    6: { open: 11, close: 23 },
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileNav();
  initWhatsappLinks();
  initOrderModal();
  initLegalModal();
  initMenuFilters();
  initShuffle();
  initHours();
  initContactForm();
  initReveal();
  initFooterYear();
});

/* ---------- HEADER SCROLL STATE ---------- */
function initHeader(){
  const header = document.getElementById("site-header");
  if(!header) return;
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive:true });
}

/* ---------- MOBILE NAV ---------- */
function initMobileNav(){
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if(!toggle || !nav) return;

  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeNav();
  });
}

/* ---------- WHATSAPP LINKS ---------- */
function initWhatsappLinks(){
  const links = document.querySelectorAll("[data-whatsapp-link]");
  const configured = Boolean(CONFIG.WHATSAPP_NUMBER);
  const url = configured
    ? `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(CONFIG.WHATSAPP_MESSAGE)}`
    : "#";

  links.forEach(link => {
    link.setAttribute("href", url);
    if(!configured){
      link.addEventListener("click", (e) => {
        e.preventDefault();
        console.warn("OTTO CHICKEN: configura CONFIG.WHATSAPP_NUMBER en script.js para activar este enlace.");
        alert("Este botón de WhatsApp todavía no tiene número configurado.\nAgrega CONFIG.WHATSAPP_NUMBER en script.js.");
      });
    }
  });
}

/* ---------- ORDER MODAL ---------- */
function initOrderModal(){
  const modal = document.getElementById("order-modal");
  const closeBtn = document.getElementById("order-modal-close");
  const openers = document.querySelectorAll("[data-open-modal]");
  if(!modal) return;

  let lastFocused = null;

  const open = (e) => {
    if(e) e.preventDefault();
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    if(lastFocused) lastFocused.focus();
  };

  openers.forEach(btn => btn.addEventListener("click", open));
  closeBtn.addEventListener("click", close);

  modal.addEventListener("click", (e) => {
    if(e.target === modal) close();
  });

  modal.querySelectorAll("[data-modal-scroll]").forEach(link => {
    link.addEventListener("click", () => close());
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !modal.hidden) close();
  });
}

/* ---------- LEGAL MODAL (placeholder) ---------- */
function initLegalModal(){
  const modal = document.getElementById("legal-modal");
  const closeBtn = document.getElementById("legal-modal-close");
  const title = document.getElementById("legal-modal-title");
  const body = document.getElementById("legal-modal-body");
  const openers = document.querySelectorAll("[data-open-legal]");
  if(!modal) return;

  const content = {
    privacy: {
      title: "Política de privacidad",
      body: "Contenido de ejemplo. Sustituye este texto con la política de privacidad oficial de OTTO CHICKEN, incluyendo qué datos se recopilan (por ejemplo en el formulario de contacto) y cómo se utilizan."
    },
    terms: {
      title: "Términos y condiciones",
      body: "Contenido de ejemplo. Sustituye este texto con los términos y condiciones oficiales de OTTO CHICKEN para el uso del sitio y del servicio de pedidos."
    }
  };

  let lastFocused = null;

  openers.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-open-legal");
      const data = content[key] || content.privacy;
      title.textContent = data.title;
      body.textContent = data.body;
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    });
  });

  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    if(lastFocused) lastFocused.focus();
  };

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => { if(e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if(e.key === "Escape" && !modal.hidden) close(); });
}

/* ---------- MENU: FILTER + SEARCH ---------- */
function initMenuFilters(){
  const grid = document.getElementById("menu-grid");
  const chips = document.querySelectorAll("#menu-filters .chip");
  const searchInput = document.getElementById("menu-search-input");
  const emptyState = document.getElementById("menu-empty");
  if(!grid) return;

  const items = Array.from(grid.querySelectorAll(".menu-item"));
  let currentFilter = "todos";
  let currentSearch = "";

  function applyFilters(){
    let visibleCount = 0;
    items.forEach(item => {
      const matchesCategory = currentFilter === "todos" || item.dataset.category === currentFilter;
      const haystack = (item.dataset.search || "") + " " + item.querySelector("h3").textContent.toLowerCase();
      const matchesSearch = currentSearch === "" || haystack.toLowerCase().includes(currentSearch);
      const visible = matchesCategory && matchesSearch;
      item.hidden = !visible;
      if(visible) visibleCount++;
    });
    emptyState.hidden = visibleCount !== 0;
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => { c.classList.remove("is-active"); c.setAttribute("aria-selected", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      currentFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  if(searchInput){
    searchInput.addEventListener("input", () => {
      currentSearch = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Nav "Combos" shortcut
  document.querySelectorAll("[data-filter-link]").forEach(link => {
    link.addEventListener("click", () => {
      const target = link.dataset.filterLink;
      const chip = document.querySelector(`#menu-filters .chip[data-filter="${target}"]`);
      if(chip) chip.click();
    });
  });
}

/* ---------- SORPRÉNDEME (SHUFFLE) ---------- */
function initShuffle(){
  const btn = document.getElementById("shuffle-btn");
  const result = document.getElementById("shuffle-result");
  if(!btn || !result) return;

  const items = Array.from(document.querySelectorAll("#menu-grid .menu-item"));
  const emojis = ["🔥", "🐔", "✦", "😋", "⚡"];

  btn.addEventListener("click", () => {
    if(items.length === 0) return;
    result.classList.add("is-shuffling");
    btn.disabled = true;

    let ticks = 0;
    const maxTicks = 12;
    const interval = setInterval(() => {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const name = randomItem.querySelector("h3").textContent;
      result.textContent = name;
      ticks++;
      if(ticks >= maxTicks){
        clearInterval(interval);
        const finalItem = items[Math.floor(Math.random() * items.length)];
        const finalName = finalItem.querySelector("h3").textContent;
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        result.textContent = `HOY TE TOCA: ${finalName} ${emoji}`;
        result.classList.remove("is-shuffling");
        btn.disabled = false;
      }
    }, 90);
  });
}

/* ---------- HOURS: OPEN NOW / CLOSED ---------- */
function initHours(){
  const badge = document.getElementById("status-badge");
  if(!badge) return;

  function updateStatus(){
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const today = CONFIG.EXAMPLE_HOURS[day];
    const isOpen = today && hour >= today.open && hour < today.close;
    badge.textContent = isOpen ? "OPEN NOW" : "CLOSED";
    badge.classList.toggle("is-open", isOpen);
  }

  updateStatus();
  setInterval(updateStatus, 60000);
}

/* ---------- CONTACT FORM ---------- */
function initContactForm(){
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if(!form) return;

  const validators = {
    "c-name": (v) => v.trim().length >= 2 || "Escribe tu nombre completo.",
    "c-email": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Escribe un email válido.",
    "c-phone": () => true,
    "c-subject": (v) => v.trim().length >= 3 || "Cuéntanos el asunto.",
    "c-message": (v) => v.trim().length >= 10 || "Tu mensaje debe tener al menos 10 caracteres.",
  };

  function showError(id, message){
    const input = document.getElementById(id);
    const errorEl = form.querySelector(`[data-error-for="${id}"]`);
    const row = input.closest(".form-row");
    if(message === true){
      row.classList.remove("has-error");
      if(errorEl) errorEl.textContent = "";
      return true;
    }
    row.classList.add("has-error");
    if(errorEl) errorEl.textContent = message;
    return false;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    Object.keys(validators).forEach(id => {
      const input = document.getElementById(id);
      const result = validators[id](input.value);
      const ok = showError(id, result);
      if(!ok) valid = false;
    });

    if(!valid){
      status.textContent = "Revisa los campos marcados en rojo.";
      status.className = "form-status error";
      return;
    }

    // No hay backend conectado todavía: esta es una confirmación simulada.
    // Conecta este formulario a tu servicio de email o CRM real.
    status.textContent = "¡Mensaje enviado! Te responderemos pronto.";
    status.className = "form-status success";
    form.reset();
  });
}

/* ---------- SCROLL REVEAL ---------- */
function initReveal(){
  const items = document.querySelectorAll(".reveal");
  if(!items.length) return;

  if(!("IntersectionObserver" in window)){
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
}

/* ---------- FOOTER YEAR ---------- */
function initFooterYear(){
  const el = document.getElementById("copyright-year");
  if(el) el.textContent = new Date().getFullYear();
}
