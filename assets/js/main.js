// Page helpers
const __isFormAudit = document.body && document.body.classList.contains('page-form-audit');
// ===== Carrousel Témoignages =====
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
      if (!Number.isNaN(idx)) {
        updateCarousel(idx);
      }
    });
  });

  // Auto-rotation toutes les 10s (tu peux changer la durée)
  let autoTimer = setInterval(goNext, 10000);

  // Pause au survol
  const carousel = document.querySelector(".temoignages-carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", () => clearInterval(autoTimer));
    carousel.addEventListener("mouseleave", () => {
      autoTimer = setInterval(goNext, 10000);
    });
  }

  // Init
  updateCarousel(0);
});
/* =============================
   FIX TOGGLES (Voir plus / FAQ)
   - Ouvre/ferme vraiment le contenu
   - Gère aria-hidden + hidden + animation max-height
============================= */
(function () {
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setExpanded(btn, expanded) {
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function showPanel(panel) {
    panel.setAttribute("aria-hidden", "false");
    panel.removeAttribute("hidden");
    panel.classList.add("is-open");
  }

  function hidePanel(panel) {
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("hidden", "");
    panel.classList.remove("is-open");
  }

  function animate(panel, open) {
    if (!panel) return;

    panel.style.overflow = "hidden";

    if (open) {
      panel.style.maxHeight = "0px";
      panel.offsetHeight; // reflow
      panel.style.maxHeight = panel.scrollHeight + "px";
      window.setTimeout(() => {
        panel.style.maxHeight = "none";
        panel.style.overflow = "";
      }, 350);
    } else {
      if (getComputedStyle(panel).maxHeight === "none") {
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.offsetHeight;
      }
      panel.style.maxHeight = "0px";
      window.setTimeout(() => {
        panel.style.overflow = "";
      }, 350);
    }
  }

  // ---------------------------
  // VOIR PLUS / VOIR MOINS (Confiance + Long-terme)
  // ---------------------------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".confiance-toggle-btn");
    if (!btn) return;

    e.preventDefault();

    // On cherche le panneau dans la même "mega card"
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
      animate(panel, true);
    } else {
      // animate close first, then truly hide
      animate(panel, false);
      window.setTimeout(() => hidePanel(panel), 350);
    }
  });

  // Init : ferme les panels "Voir +"
  qsa(".confiance-toggle-btn").forEach((btn) => {
    const scope =
      btn.closest(".mega-card, .confiance-bigcard, .longterm-bigcard, .process-bigcard") ||
      document;

    const panel = scope.querySelector(".confiance-bigcard-details") || btn.nextElementSibling;
    if (!panel) return;

    if (!btn.hasAttribute("aria-expanded")) setExpanded(btn, false);
    const expanded = btn.getAttribute("aria-expanded") === "true";

    if (expanded) {
      showPanel(panel);
      panel.style.maxHeight = "none";
    } else {
      hidePanel(panel);
      panel.style.maxHeight = "0px";
    }

    btn.textContent = expanded ? "Voir moins" : "Voir plus";
  });

  // ---------------------------
  // FAQ (accordéon)
  // ---------------------------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-question-btn");
    if (!btn) return;

    e.preventDefault();

    const item = btn.closest(".faq-item");
    if (!item) return;

    const answer = item.querySelector(".faq-answer");
    if (!answer) return;

    const expanded = btn.getAttribute("aria-expanded") === "true";
    const open = !expanded;

    // Accordéon: ferme les autres items du même wrapper
    const wrapper = item.parentElement;
    if (wrapper) {
      wrapper.querySelectorAll('.faq-item').forEach((it) => {
        if (it === item) return;
        const b = it.querySelector('.faq-question-btn');
        const a = it.querySelector('.faq-answer');
        const i = it.querySelector('.faq-question-icon');
        if (b) setExpanded(b, false);
        if (a) {
          // animate close then hide
          animate(a, false);
          window.setTimeout(() => hidePanel(a), 350);
          a.style.maxHeight = '0px';
        }
        if (i) i.textContent = '+';
      });
    }

    setExpanded(btn, open);
    if (open) {
      showPanel(answer);
      animate(answer, true);
    } else {
      animate(answer, false);
      window.setTimeout(() => hidePanel(answer), 350);
    }

    const icon = btn.querySelector(".faq-question-icon");
    if (icon) icon.textContent = open ? "−" : "+";
  });

  // Init : FAQ fermée par défaut
  qsa(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-question-btn");
    const ans = item.querySelector(".faq-answer");
    if (!btn || !ans) return;

    if (!btn.hasAttribute("aria-expanded")) setExpanded(btn, false);
    const expanded = btn.getAttribute("aria-expanded") === "true";

    if (expanded) {
      showPanel(ans);
      ans.style.maxHeight = "none";
    } else {
      hidePanel(ans);
      ans.style.maxHeight = "0px";
    }

    const icon = btn.querySelector(".faq-question-icon");
    if (icon) icon.textContent = expanded ? "−" : "+";
  });
})();

// =============================
// Index-only: fond immersif (scroll vars) + modal audit
// =============================
(function () {
  // Ne pas exécuter sur la page formulaire
  if (__isFormAudit) return;

  // ---- Scroll vars (fond immersif) ----
  let ticking = false;
  const root = document.documentElement;

  const updateScrollVars = () => {
    const scroll = window.scrollY || window.pageYOffset || 0;
    const offset = scroll * 0.12;

    const max = 1500;
    const ratio = Math.min(scroll / max, 1);

    // On utilise root pour que les variables soient dispo partout
    root.style.setProperty("--scroll-offset", `${offset}px`);
    root.style.setProperty("--scroll-ratio", String(ratio));

    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollVars);
  };

  // Init + listener passive
  window.requestAnimationFrame(updateScrollVars);
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- Modal audit (ouvre le formulaire en popup) ----
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

    // Clic sur l’overlay (si tu utilises un backdrop)
    if (e.target === auditModal) {
      closeAudit();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAudit();
  });
})();

// =============================
// Form-only logic placeholder
// =============================
// IMPORTANT: if you later add multi-step form JS, put it behind this guard
// so it can never break index.html toggles.
if (__isFormAudit) {
  // form-specific code goes here
}