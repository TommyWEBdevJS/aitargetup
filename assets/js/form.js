// assets/js/form.js
// ===================================================
// AiTargetUp — Form Audit (step 1 / step 2)
// Runs ONLY on form-audit.html (body.page-form-audit)
// Robust version: DOMContentLoaded + event delegation
// ===================================================

(() => {
  const isFormPage = document.body && document.body.classList.contains("page-form-audit");
  if (!isFormPage) return; // sécurité: ne casse jamais index.html

  function init() {
    const form = document.querySelector("#audit-form");
    const steps = Array.from(document.querySelectorAll(".form-step"));
    const btnClose = document.querySelector("[data-audit-close]");

    if (!form) {
      console.warn("[form.js] #audit-form introuvable");
      return;
    }
    if (steps.length === 0) {
      console.warn("[form.js] .form-step introuvable");
      return;
    }

    function showStep(stepNumber) {
      steps.forEach((stepEl) => {
        const n = parseInt(stepEl.getAttribute("data-step"), 10);
        const isActive = n === stepNumber;

        if (isActive) {
          stepEl.removeAttribute("hidden");
          stepEl.setAttribute("aria-hidden", "false");
        } else {
          stepEl.setAttribute("hidden", "");
          stepEl.setAttribute("aria-hidden", "true");
        }
      });
    }

    function getCurrentStep() {
      const visible = steps.find((s) => !s.hasAttribute("hidden"));
      if (!visible) return 1;
      const n = parseInt(visible.getAttribute("data-step"), 10);
      return Number.isFinite(n) ? n : 1;
    }

    function validateStep(stepNumber) {
      const stepEl = steps.find((s) => parseInt(s.getAttribute("data-step"), 10) === stepNumber);
      if (!stepEl) return true;

      const requiredFields = Array.from(
        stepEl.querySelectorAll("input[required], textarea[required], select[required]")
      );

      let ok = true;

      requiredFields.forEach((field) => {
        const isValid = field.checkValidity();
        field.classList.toggle("is-invalid", !isValid);
        if (!isValid) ok = false;
      });

      if (!ok) {
        const firstInvalid = requiredFields.find((f) => !f.checkValidity());
        if (firstInvalid) firstInvalid.reportValidity();
      }

      return ok;
    }

    function closeForm() {
      if (window.history.length > 1) window.history.back();
      else window.location.href = "index.html";
    }

    // Force init state: show step 1, hide others
    showStep(1);

    // Event delegation: works even if buttons are re-rendered
    form.addEventListener("click", (e) => {
      const nextBtn = e.target.closest("[data-step-next]");
      if (nextBtn) {
        e.preventDefault();
        const step = getCurrentStep();
        if (!validateStep(step)) return;
        showStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const prevBtn = e.target.closest("[data-step-prev]");
      if (prevBtn) {
        e.preventDefault();
        showStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    });

    if (btnClose) {
      btnClose.addEventListener("click", (e) => {
        e.preventDefault();
        closeForm();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeForm();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Valide l’étape 2 avant de “simuler” l’envoi
      if (!validateStep(2)) return;

      alert("✅ Demande envoyée (mode démo). On branche l’email juste après.");
      closeForm();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();