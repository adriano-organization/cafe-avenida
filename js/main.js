/**
 * Página principal: conteúdo dinâmico a partir de config.js.
 */
(function () {
  const cfg = window.CAFE_CONFIG;
  const i18n = window.CafeI18n;

  function applyTheme() {
    const root = document.documentElement;
    Object.entries(cfg.colors || {}).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value);
    });
  }

  function localized(obj) {
    return obj?.[i18n.getLang()] ?? obj?.pt ?? "";
  }

  function fillConfigText() {
    window.CafeBranding?.apply(cfg);
    document.querySelectorAll("[data-config]").forEach((el) => {
      const key = el.getAttribute("data-config");
      if (key === "name") el.textContent = cfg.name;
      if (key === "tagline") el.textContent = localized(cfg.tagline);
      if (key === "about") el.textContent = localized(cfg.about);
      if (key === "address") el.textContent = cfg.address.full;
      if (key === "phone") el.textContent = cfg.phoneDisplay;
      if (key === "email") el.textContent = cfg.email;
    });

    const tel = document.querySelector("[data-tel-link]");
    if (tel) tel.href = `tel:${cfg.phone.replace(/\s/g, "")}`;

    const mail = document.querySelector("[data-mail-link]");
    if (mail) mail.href = `mailto:${cfg.email}`;

    const directions = document.querySelector("[data-directions-link]");
    if (directions) {
      const q = encodeURIComponent(cfg.address.full);
      directions.href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    }

    const mapFrame = document.querySelector("[data-map-frame]");
    if (mapFrame) {
      const { lat, lng } = cfg.coordinates;
      mapFrame.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1spt-PT!2spt!4v1&q=${encodeURIComponent(cfg.address.full)}`;
    }

    document.querySelectorAll("[data-social]").forEach((a) => {
      const network = a.getAttribute("data-social");
      const url = cfg.social?.[network];
      if (url) a.href = url;
    });
  }

  function buildHero() {
    const hero = cfg.media?.hero;
    if (!hero) return;
    const img = document.querySelector("[data-hero-img]");
    if (img) {
      img.src = hero.image;
      img.alt = localized(hero.alt);
      img.loading = "eager";
      img.fetchPriority = "high";
    }
  }

  function buildGallery() {
    const grid = document.querySelector("[data-gallery]");
    if (!grid) return;
    grid.innerHTML = "";
    (cfg.media?.gallery || []).forEach((item, index) => {
      const figure = document.createElement("figure");
      figure.className = "gallery__item";

      if (item.type === "video") {
        const video = document.createElement("video");
        video.controls = true;
        video.preload = "metadata";
        video.playsInline = true;
        video.poster = item.poster || "";
        video.setAttribute("aria-label", localized(item.alt));
        const source = document.createElement("source");
        source.src = item.src;
        source.type = "video/mp4";
        video.appendChild(source);
        figure.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = localized(item.alt);
        img.loading = index < 2 ? "eager" : "lazy";
        img.decoding = "async";
        img.width = 800;
        img.height = 600;
        figure.appendChild(img);
      }
      grid.appendChild(figure);
    });
  }

  function refreshHours() {
    window.CafeHours.renderHoursTable(
      document.querySelector("[data-hours]"),
      cfg.openingHours,
      i18n
    );
  }

  function init() {
    applyTheme();
    i18n.init();
    fillConfigText();
    buildHero();
    buildGallery();
    window.CafeBarra?.init();
    refreshHours();
    window.CafeSeo.applyPageMeta(cfg, i18n, "home");

    window.addEventListener("cafe:langchange", () => {
      fillConfigText();
      buildHero();
      buildGallery();
      window.CafeBarra?.init();
      refreshHours();
      window.CafeSeo.applyPageMeta(cfg, i18n, "home");
    });

    setInterval(refreshHours, 60_000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
