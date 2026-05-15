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
  var PLACEHOLDER_IMG =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

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
    lightboxImg.src = PLACEHOLDER_IMG;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  var VALID_SIZES = { normal: true, wide: true, tall: true, large: true };
  var REALISATIONS_URL = "/data/realisations.json";
  var GALLERY_COLS = 12;
  var COL_SPAN = { normal: 3, wide: 6, tall: 3, large: 6 };

  function hasThumbnail(item) {
    return item && typeof item.thumbnail === "string" && item.thumbnail.trim() !== "";
  }

  function gallerySizeClass(size) {
    var key = typeof size === "string" ? size.trim().toLowerCase() : "normal";
    return VALID_SIZES[key] ? key : "normal";
  }

  function colSpanForItem(item) {
    if (typeof item.colSpan === "number" && item.colSpan > 0) {
      return Math.min(GALLERY_COLS, Math.round(item.colSpan));
    }
    var size = gallerySizeClass(item.size);
    return COL_SPAN[size] || COL_SPAN.normal;
  }

  /** Répartit les tuiles sur exactement 2 rangées (12 colonnes chacune). */
  function packTwoRows(items) {
    var used = [0, 0];
    return items.map(function (item) {
      var span = colSpanForItem(item);
      var row = 0;

      if (item.row === 1 || item.row === 2) {
        row = item.row - 1;
      } else {
        row = used[0] <= used[1] ? 0 : 1;
      }

      if (used[row] + span > GALLERY_COLS) {
        var other = row === 0 ? 1 : 0;
        if (used[other] + span <= GALLERY_COLS) {
          row = other;
        } else {
          span = Math.max(1, GALLERY_COLS - used[row]);
        }
      }

      used[row] += span;
      return { row: row + 1, colSpan: span };
    });
  }

  function applyDesktopPlacement(figure, placement) {
    if (!placement) return;
    figure.style.setProperty("--gallery-row", String(placement.row));
    figure.style.setProperty("--gallery-col-span", String(placement.colSpan));
  }

  function bindGalleryLightbox(root) {
    if (!root) return;
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-gallery-open]");
      if (!btn || !root.contains(btn)) return;
      var img = qs("img", btn);
      var fullSrc = btn.getAttribute("data-full-src");
      if (fullSrc && img) {
        img = { src: fullSrc, alt: img.alt || "" };
      }
      var cap = qs(".gallery-masonry__caption", btn);
      openLightbox(img, cap ? cap.textContent : "");
    });
  }

  function renderGallery(items) {
    var root = qs("[data-gallery]");
    if (!root) return;

    var visible = items.filter(hasThumbnail);
    if (!visible.length) {
      root.hidden = true;
      return;
    }

    var placements = packTwoRows(visible);
    var frag = document.createDocumentFragment();
    visible.forEach(function (item, index) {
      var size = gallerySizeClass(item.size);
      var figure = document.createElement("figure");
      figure.className = "gallery-masonry__item gallery-masonry__item--" + size;
      if (item.id) figure.id = "realisation-" + item.id;
      applyDesktopPlacement(figure, placements[index]);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-masonry__trigger";
      btn.setAttribute("data-gallery-open", "");
      btn.setAttribute("aria-haspopup", "dialog");
      btn.setAttribute("aria-controls", "lightbox-dialog");
      var fullSrc = (item.image && String(item.image).trim()) || item.thumbnail.trim();
      btn.setAttribute("data-full-src", fullSrc);

      var media = document.createElement("div");
      media.className = "gallery-masonry__media";
      var img = document.createElement("img");
      img.src = item.thumbnail.trim();
      img.alt = item.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      media.appendChild(img);

      if (item.caption) {
        var cap = document.createElement("span");
        cap.className = "gallery-masonry__caption";
        cap.textContent = item.caption;
        media.appendChild(cap);
      }

      btn.appendChild(media);
      figure.appendChild(btn);
      frag.appendChild(figure);
    });

    root.appendChild(frag);
    bindGalleryLightbox(root);
  }

  fetch(REALISATIONS_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("realisations fetch failed");
      return res.json();
    })
    .then(function (data) {
      var list = data && Array.isArray(data.realisations) ? data.realisations : [];
      renderGallery(list);
    })
    .catch(function () {
      /* Galerie vide si le JSON est indisponible */
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

  /* Formulaire — Web3Forms (https://web3forms.com) */
  var form = qs("[data-contact-form]");
  var statusEl = qs("[data-form-status]");
  var WEB3FORMS_URL = "https://api.web3forms.com/submit";

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
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", null);

      var botcheck = form.querySelector('input[name="botcheck"]');
      if (botcheck && botcheck.checked) {
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
      var originalBtnText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours…";
      }

      var formData = new FormData(form);

      fetch(WEB3FORMS_URL, {
        method: "POST",
        body: formData,
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { res: res, data: data };
          });
        })
        .then(function (out) {
          if (out.res.ok && out.data && out.data.success) {
            window.location.href = "/merci.html";
            return;
          } else {
            var msg =
              (out.data && (out.data.message || out.data.error)) ||
              "Une erreur s’est produite. Réessayez plus tard.";
            setStatus(msg, "err");
          }
        })
        .catch(function () {
          setStatus("Impossible d’envoyer le formulaire. Vérifiez votre connexion et réessayez.", "err");
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
    });
  }
})();
