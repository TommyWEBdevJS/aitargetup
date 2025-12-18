// Page helpers
const __isFormAudit = document.body && document.body.classList.contains('page-form-audit');

// Small DOM helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// =============================
// Carrousel Témoignages
// =============================
document.addEventListener("DOMContentLoaded", function () {
  const track = document.querySelector(".temoignages-track");
  const slides = document.querySelectorAll(".temoignage-slide");
  const prevBtn = document.querySelector(".carousel-arrow-prev");
  const nextBtn = document.querySelector(".carousel-arrow-next");
  const dots = document.querySelectorAll(".carousel-dot");

  if (!track || slides.length === 0) return;

  let currentIndex = 0;

  function updateCarousel(index) {
    const clamped = (index + slides.length) % slides.length;
    currentIndex = clamped;
    const offset = -clamped * 100;
    track.style.transform = `translateX(${offset}%)`;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === clamped);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === clamped);
    });
  }

  function goNext() {
    updateCarousel(currentIndex + 1);
  }

  function goPrev() {
    updateCarousel(currentIndex - 1);
  }

  if (nextBtn) nextBtn.addEventListener("click", goNext);
  if (prevBtn) prevBtn.addEventListener("click", goPrev);

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.getAttribute("data-index"), 10);
      if (!Number.isNaN(idx)) updateCarousel(idx);
    });
  });

  // Auto-rotation toutes les 10s
  let autoTimer = setInterval(goNext, 10000);

  // Pause au survol
  const carousel = document.querySelector(".temoignages-carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", () => clearInterval(autoTimer));
    carousel.addEventListener("mouseleave", () => {
      autoTimer = setInterval(goNext, 10000);
    });
  }

  updateCarousel(0);
});

/* =============================
   TOGGLES (Voir plus / FAQ)
   - Smooth: no max-height / scrollHeight work
   - Uses GPU-friendly CSS (opacity/transform)
============================= */
(function () {
  function setExpanded(btn, expanded) {
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function showPanel(panel) {
    panel.setAttribute("aria-hidden", "false");
    panel.removeAttribute("hidden");
  }

  function hidePanel(panel) {
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("hidden", "");
    panel.classList.remove("is-open");
  }

  const ANIM_MS = 260; // must match CSS transition duration
  function hidePanelAfter(panel) {
    window.setTimeout(() => hidePanel(panel), ANIM_MS);
  }

  // ---------------------------
  // VOIR PLUS / VOIR MOINS
  // ---------------------------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".confiance-toggle-btn");
    if (!btn) return;

    e.preventDefault();

    const scope =
      btn.closest(".mega-card, .confiance-bigcard, .longterm-bigcard, .process-bigcard") ||
      document;

    let panel = scope.querySelector(".confiance-bigcard-details");

    // fallback : parfois le panneau est juste après le bouton
    if (!panel) {
      const next = btn.nextElementSibling;
      if (next && next.classList.contains("confiance-bigcard-details")) panel = next;
    }

    if (!panel) return;

    const expanded = btn.getAttribute("aria-expanded") === "true";
    const open = !expanded;

    setExpanded(btn, open);
    btn.textContent = open ? "Voir moins" : "Voir plus";

    if (open) {
      showPanel(panel);
      requestAnimationFrame(() => panel.classList.add("is-open"));
    } else {
      panel.classList.remove("is-open");
      hidePanelAfter(panel);
    }
  });

  // Init : ferme les panels "Voir +" (si pas déjà explicitement ouverts)
  $$(".confiance-toggle-btn").forEach((btn) => {
    const scope =
      btn.closest(".mega-card, .confiance-bigcard, .longterm-bigcard, .process-bigcard") ||
      document;

    const panel = scope.querySelector(".confiance-bigcard-details") || btn.nextElementSibling;
    if (!panel) return;

    if (!btn.hasAttribute("aria-expanded")) setExpanded(btn, false);
    const expanded = btn.getAttribute("aria-expanded") === "true";

    if (expanded) {
      showPanel(panel);
      panel.classList.add("is-open");
    } else {
      panel.classList.remove("is-open");
      hidePanel(panel);
    }

    btn.textContent = expanded ? "Voir moins" : "Voir plus";
  });

  // ---------------------------
  // FAQ (accordéon)
  // Supporte .faq-question-btn + .faq-answer (structure actuelle)
  // + fallback data-attrs si besoin
  // ---------------------------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(
      ".faq-question-btn, [data-faq-toggle], .faq-toggle, .faq-question, .faq-item__question"
    );
    if (!btn) return;

    const item = btn.closest(".faq-item, [data-faq-item]");
    if (!item) return;

    const answer =
      item.querySelector(".faq-answer") ||
      item.querySelector(".faq-content") ||
      item.querySelector("[data-faq-content]");
    if (!answer) return;

    e.preventDefault();

    const expanded = btn.getAttribute("aria-expanded") === "true";
    const open = !expanded;

    // Accordéon: ferme les autres items du même wrapper
    const wrapper = item.parentElement;
    if (wrapper) {
      wrapper.querySelectorAll(".faq-item, [data-faq-item]").forEach((it) => {
        if (it === item) return;
        const b =
          it.querySelector(".faq-question-btn") ||
          it.querySelector("[data-faq-toggle]") ||
          it.querySelector(".faq-toggle") ||
          it.querySelector(".faq-question") ||
          it.querySelector(".faq-item__question");
        const a =
          it.querySelector(".faq-answer") ||
          it.querySelector(".faq-content") ||
          it.querySelector("[data-faq-content]");
        const i = it.querySelector(".faq-question-icon, .faq-icon, .faq-plusminus, [data-faq-icon]");

        if (b) setExpanded(b, false);
        if (a) {
          a.classList.remove("is-open");
          hidePanelAfter(a);
        }
        if (i && i.textContent && i.textContent.trim().length <= 2) i.textContent = "+";
        it.classList.remove("is-open");
      });
    }

    // Toggle item courant
    setExpanded(btn, open);
    item.classList.toggle("is-open", open);

    if (open) {
      showPanel(answer);
      requestAnimationFrame(() => answer.classList.add("is-open"));
    } else {
      answer.classList.remove("is-open");
      hidePanelAfter(answer);
    }

    const icon =
      btn.querySelector(".faq-question-icon") ||
      btn.querySelector(".faq-icon") ||
      btn.querySelector(".faq-plusminus") ||
      btn.querySelector("[data-faq-icon]");
    if (icon && icon.textContent && icon.textContent.trim().length <= 2) {
      icon.textContent = open ? "−" : "+";
    }
  });

  // Init : FAQ fermée par défaut (mais respecte aria-expanded="true" si présent)
  $$(".faq-item, [data-faq-item]").forEach((item) => {
    const btn =
      item.querySelector(".faq-question-btn") ||
      item.querySelector("[data-faq-toggle]") ||
      item.querySelector(".faq-toggle") ||
      item.querySelector(".faq-question") ||
      item.querySelector(".faq-item__question");

    const ans =
      item.querySelector(".faq-answer") ||
      item.querySelector(".faq-content") ||
      item.querySelector("[data-faq-content]");

    if (!btn || !ans) return;

    if (!btn.hasAttribute("aria-expanded")) setExpanded(btn, false);
    const expanded = btn.getAttribute("aria-expanded") === "true";

    item.classList.toggle("is-open", expanded);

    if (expanded) {
      showPanel(ans);
      ans.classList.add("is-open");
    } else {
      ans.classList.remove("is-open");
      hidePanel(ans);
    }

    const icon =
      btn.querySelector(".faq-question-icon") ||
      btn.querySelector(".faq-icon") ||
      btn.querySelector(".faq-plusminus") ||
      btn.querySelector("[data-faq-icon]");
    if (icon && icon.textContent && icon.textContent.trim().length <= 2) {
      icon.textContent = expanded ? "−" : "+";
    }
  });
})();

// =============================
// Index-only: nav mobile + (optionnel) fond immersif + modal audit
// =============================
(function () {
  if (__isFormAudit) return;

  // ---- Mobile burger nav ----
  const burger = $(".burger");
  const headerNav = $(".header-nav");

  // Ensure nav has an id for aria-controls
  if (headerNav && !headerNav.id) headerNav.id = "siteNav";

  const openNav = () => {
    if (!headerNav) return;
    headerNav.classList.add("is-open");
    burger?.classList.add("is-open");
    burger?.setAttribute("aria-expanded", "true");
  };

  const closeNav = () => {
    if (!headerNav) return;
    headerNav.classList.remove("is-open");
    burger?.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
  };

  if (burger && headerNav) {
    // a11y
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", headerNav.id);

    burger.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = headerNav.classList.contains("is-open");
      if (isOpen) closeNav();
      else openNav();
    });

    // Close when clicking a nav link
    headerNav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link) closeNav();
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (e.target.closest(".main-header") || e.target.closest("header")) {
        // click inside header, ignore
        return;
      }
      closeNav();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    // Close when switching to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeNav();
    });
  }

  // ---- Scroll vars (fond immersif) ----
  // On le laisse desktop-only (mobile: fond statique via CSS)
  if (window.matchMedia("(min-width: 769px)").matches) {
    let ticking = false;
    const root = document.documentElement;

    const updateScrollVars = () => {
      const scroll = window.scrollY || window.pageYOffset || 0;
      const offset = scroll * 0.12;

      const max = 1500;
      const ratio = Math.min(scroll / max, 1);

      root.style.setProperty("--scroll-offset", `${offset}px`);
      root.style.setProperty("--scroll-ratio", String(ratio));

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollVars);
    };

    window.requestAnimationFrame(updateScrollVars);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- Modal audit ----
  const auditModal = document.getElementById("auditModal");
  if (!auditModal) return;

  const openAudit = () => {
    auditModal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("is-audit-open");
    document.body.classList.add("is-audit-open");
  };

  const closeAudit = () => {
    auditModal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("is-audit-open");
    document.body.classList.remove("is-audit-open");
  };

  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-open-audit]");
    if (openBtn) {
      e.preventDefault();
      openAudit();
      return;
    }

    const closeBtn = e.target.closest("[data-close-audit]");
    if (closeBtn) {
      e.preventDefault();
      closeAudit();
      return;
    }

    if (e.target === auditModal) closeAudit();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAudit();
  });
})();