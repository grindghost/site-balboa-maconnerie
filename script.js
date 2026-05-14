(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* Année copyright */
  var yearEl = qs("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Navigation mobile */
  var navToggle = qs("[data-nav-toggle]");
  var siteNav = qs("[data-site-nav]");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    qsa("a", siteNav).forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Ancres : focus visible après saut */
  qsa('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      if (!reduceMotion) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setTimeout(function () {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 400);
    });
  });

  /* Galerie lightbox */
  var lightbox = qs("[data-lightbox]");
  var lightboxImg = qs("[data-lightbox-img]");
  var lightboxCaption = qs("[data-lightbox-caption]");
  var lastFocused = null;

  function openLightbox(img, caption) {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    lastFocused = document.activeElement;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    lightboxCaption.textContent = caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = qs("[data-lightbox-close].lightbox__close", lightbox);
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  qsa("[data-gallery-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = qs("img", btn);
      var cap = qs("figcaption", btn);
      openLightbox(img, cap ? cap.textContent : "");
    });
  });

  if (lightbox) {
    qsa("[data-lightbox-close]", lightbox).forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox && !lightbox.hidden) {
        closeLightbox();
      }
    });
  }

  /* Formulaire — FormSubmit (https://formsubmit.co) */
  var form = qs("[data-contact-form]");
  var statusEl = qs("[data-form-status]");

  var LIMIT = {
    name: 120,
    phone: 40,
    email: 120,
    address: 200,
    description: 1000,
  };

  function setStatus(message, state) {
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    if (state) statusEl.setAttribute("data-state", state);
    else statusEl.removeAttribute("data-state");
  }

  /** Retire caractères de contrôle, BOM / zero-width, normalise fins de ligne. */
  function sanitizeText(s, maxLen) {
    if (s == null) return "";
    var t = typeof s === "string" ? s : String(s);
    t = t.replace(/\r\n/g, "\n");
    t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFEFF\u200B-\u200D\u2060]/g, "");
    t = t.trim();
    if (t.length > maxLen) t = t.slice(0, maxLen);
    return t;
  }

  function sanitizeSingleLine(s, maxLen) {
    if (s == null) return "";
    var t = typeof s === "string" ? s : String(s);
    return sanitizeText(t.replace(/\n/g, " ").replace(/\r/g, ""), maxLen);
  }

  function sanitizePhone(s) {
    if (typeof s !== "string") {
      if (s == null) return "";
      s = String(s);
    }
    var t = s.replace(/[^\d+().\s-]/g, "").trim();
    if (t.length > LIMIT.phone) t = t.slice(0, LIMIT.phone);
    return t;
  }

  function sanitizeEmail(s) {
    if (s == null) return "";
    return sanitizeSingleLine(s, LIMIT.email).toLowerCase();
  }

  function digitCount(phone) {
    return (String(phone).match(/\d/g) || []).length;
  }

  function validateClient(data) {
    if (!data.name || data.name.length < 2) return "Indiquez votre nom complet (au moins 2 caractères).";
    if (data.name.length > LIMIT.name) return "Le nom est trop long.";
    if (!data.phone || data.phone.length < 7) return "Indiquez un numéro de téléphone valide.";
    if (digitCount(data.phone) < 7) return "Le numéro de téléphone doit contenir au moins 7 chiffres.";
    if (!/^[+0-9().\s-]+$/.test(data.phone)) return "Le téléphone contient des caractères non autorisés.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "")) return "Indiquez une adresse courriel valide.";
    if (data.email.length > LIMIT.email) return "Le courriel est trop long.";
    if (!data.projectAddress || data.projectAddress.length < 5) return "Indiquez l’adresse du projet.";
    if (data.projectAddress.length > LIMIT.address) return "L’adresse du projet est trop longue.";
    if (!data.description || data.description.length < 10) return "Décrivez les travaux (au moins 10 caractères).";
    if (data.description.length > LIMIT.description) return "La description ne doit pas dépasser 1000 caractères.";
    return "";
  }

  if (form) {
    var nextInput = qs("[data-formsubmit-next]", form);
    if (nextInput) {
      try {
        var u = new URL(window.location.href);
        u.searchParams.set("merci", "1");
        u.hash = "#soumission";
        nextInput.value = u.toString();
      } catch (err) {
        nextInput.value = "";
      }
    }

    try {
      if (new URLSearchParams(window.location.search).get("merci") === "1") {
        setStatus("Merci! Nous vous contacterons bientôt.", "ok");
        var clean = window.location.pathname + "#soumission";
        window.history.replaceState({}, document.title, clean);
      }
    } catch (e2) {
      /* ignore */
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", null);

      var honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        setStatus("Envoi refusé.", "err");
        return;
      }

      var nameEl = qs("#contact-name", form);
      var phoneEl = qs("#contact-phone", form);
      var emailEl = qs("#contact-email", form);
      var addrEl = qs("#contact-address", form);
      var descEl = qs("#contact-description", form);

      var payload = {
        name: sanitizeSingleLine((nameEl || {}).value, LIMIT.name),
        phone: sanitizePhone((phoneEl || {}).value),
        email: sanitizeEmail((emailEl || {}).value),
        projectAddress: sanitizeSingleLine((addrEl || {}).value, LIMIT.address),
        description: sanitizeText((descEl || {}).value, LIMIT.description),
      };

      var err = validateClient(payload);
      if (err) {
        setStatus(err, "err");
        return;
      }

      if (nameEl) nameEl.value = payload.name;
      if (phoneEl) phoneEl.value = payload.phone;
      if (emailEl) emailEl.value = payload.email;
      if (addrEl) addrEl.value = payload.projectAddress;
      if (descEl) descEl.value = payload.description;

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      HTMLFormElement.prototype.submit.call(form);
    });
  }
})();
