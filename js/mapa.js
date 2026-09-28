/**
 * Mapa estático SVG + alfinete com logótipo.
 */
(function () {
  function initMap(cfg) {
    const img = document.querySelector("[data-map-img]");
    if (img && cfg?.map?.image) {
      img.src = cfg.map.image;
      const lang = window.CafeI18n?.getLang() ?? "pt";
      img.alt = cfg.map.alt?.[lang] ?? `Mapa — ${cfg.name}`;
    }

    const pinImg = document.querySelector("[data-map-pin-logo]");
    if (pinImg && cfg?.logo?.src) {
      pinImg.src = new URL(cfg.logo.src, window.location.href).href;
    }

    const pin = document.querySelector("[data-map-pin]");
    const pos = cfg.map?.pinPosition ?? { x: "64%", y: "50%" };
    if (pin) {
      pin.style.left = pos.x;
      pin.style.top = pos.y;
    }
  }

  window.CafeMapa = { init: initMap };
})();
