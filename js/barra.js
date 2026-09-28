/**
 * Barra do site: links das secções na inicial vs outras páginas (como Cafe-Preguica).
 */
(function () {
  function initBarra() {
    const cfg = window.CAFE_CONFIG;
    if (!cfg) return;

    const isHome = document.body.dataset.page === "home";

    document.querySelectorAll(".pg-indice__seccao").forEach((link) => {
      const hash = link.getAttribute("data-section-hash");
      if (!hash) return;
      link.href = isHome ? hash : `index.html${hash}`;
    });

    const marca = document.querySelector(".pg-barra__marca");
    if (marca) {
      marca.href = isHome ? "#main" : "index.html";
    }

    document.querySelectorAll("[data-phone-display]").forEach((el) => {
      el.textContent = cfg.phoneDisplay;
    });

    const tel = document.querySelector(".pg-acao[data-tel-link]");
    if (tel) tel.href = `tel:${cfg.phone.replace(/\s/g, "")}`;
  }

  window.CafeBarra = { init: initBarra };
})();
