/* AiTargetUp – form.js (audit form) */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("audit-form");
  if (!form) return;

  const steps = Array.from(document.querySelectorAll("[data-form-step]"));
  const indicators = Array.from(document.querySelectorAll("[data-step-indicator]"));
  const nextBtn = document.querySelector("[data-step-next]");
  const prevBtn = document.querySelector("[data-step-prev]");

  const errorBox = document.getElementById("form-error");
  const successModal = document.getElementById("form-success");
  const successClose = document.querySelector("[data-success-close]");

  const showError = (msg, focusEl) => {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.hidden = false;
    if (focusEl && typeof focusEl.focus === "function") focusEl.focus();
  };

  const clearError = () => {
    if (!errorBox) return;
    errorBox.textContent = "";
    errorBox.hidden = true;
  };

  const setStep = (n) => {
    steps.forEach((el) => {
      const isCurrent = String(el.getAttribute("data-step")) === String(n);
      el.hidden = !isCurrent;
    });
    indicators.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === Number(n) - 1);
    });
  };

  const goHome = () => {
    const url = "index.html";
    // If this form page is rendered inside an iframe (popup), redirect the TOP window.
    if (window.top && window.top !== window) {
      window.top.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  const openModal = () => {
    if (!successModal) return;
    successModal.hidden = false;
    successModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (successClose) successClose.focus();
  };

  const closeModal = (redirect = false) => {
    if (!successModal) return;
    successModal.hidden = true;
    successModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (redirect) goHome();
  };

  // Step 1 -> Step 2
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      clearError();
      const step1 = document.querySelector('[data-form-step][data-step="1"]');
      const required = step1
        ? Array.from(step1.querySelectorAll("input[required], textarea[required], select[required]"))
        : [];
      for (const field of required) {
        if (!field.checkValidity()) {
          showError("Veuillez compléter les champs obligatoires avant de continuer.", field);
          return;
        }
      }
      setStep(2);
      const firstField = document.querySelector(
        '[data-form-step][data-step="2"] textarea, [data-form-step][data-step="2"] input'
      );
      if (firstField) firstField.focus();
    });
  }

  // Step 2 -> Step 1
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      clearError();
      setStep(1);
    });
  }

  // Close modal
  if (successClose) successClose.addEventListener("click", () => closeModal(true));

  // Backdrop click
  if (successModal) {
    successModal.addEventListener("click", (e) => {
      if (e.target && e.target.classList && e.target.classList.contains("form-success-backdrop")) {
        closeModal(true);
      }
    });
  }

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && successModal && !successModal.hidden) closeModal(true);
  });

  // Submit (AJAX)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const step2 = document.querySelector('[data-form-step][data-step="2"]');
    const required2 = step2
      ? Array.from(step2.querySelectorAll("input[required], textarea[required], select[required]"))
      : [];
    for (const field of required2) {
      if (!field.checkValidity()) {
        showError("Veuillez compléter les champs obligatoires avant d'envoyer.", field);
        return;
      }
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        let msg = "Une erreur est survenue. Réessayez dans quelques instants.";
        try {
          const data = await res.json();
          if (data?.errors?.length) msg = data.errors.map((x) => x.message).join(" ");
        } catch {}
        showError(msg);
        return;
      }

      form.reset();
      setStep(1);
      openModal();
    } catch {
      showError("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    }
  });

  setStep(1);
});