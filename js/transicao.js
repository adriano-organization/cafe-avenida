/**
 * Transições Avenida:
 * - Início / refresh → portas de vidro + logo
 * - Ir à ementa → panfleto abre na página actual e dissolve-se na ementa
 * - Voltar ao início → panfleto fecha e desaparece, sem as portas
 */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAV_KEY = "ca-nav-transition";

  let navigating = false;
  let activeTimer = null;
  let activeRunId = 0;

  function pageName(pathname) {
    const clean = pathname.replace(/\/$/, "");
    const last = clean.split("/").pop();
    if (!last || !last.includes(".")) return "index.html";
    return last;
  }

  function isHistoryNavigation() {
    const nav = performance.getEntriesByType("navigation")[0];
    return nav?.type === "back_forward";
  }

  function readNavFlag() {
    try {
      const value = sessionStorage.getItem(NAV_KEY);
      sessionStorage.removeItem(NAV_KEY);
      return value;
    } catch { return null; }
  }

  function revealPage() {
    document.documentElement.classList.remove("ca-loading");
    document.documentElement.classList.add("ca-page-ready");
    document.documentElement.style.overflow = "";
  }

  function clearActiveTimer() {
    if (activeTimer !== null) {
      window.clearTimeout(activeTimer);
      activeTimer = null;
    }
  }

  function finishOverlay(overlay) {
    navigating = false;
    clearActiveTimer();
    activeRunId += 1;
    if (overlay) {
      overlay.classList.add("is-done");
      overlay.dataset.saltar = "";
      overlay.style.opacity = "";
      overlay.style.visibility = "";
    }
    revealPage();
  }

  function loadLogo(overlay) {
    const logo = overlay?.querySelector(".ca-tr__logo");
    if (logo?.dataset.src && !logo.getAttribute("src")) {
      logo.src = logo.dataset.src;
    }
  }

  function resetOverlay(overlay) {
    overlay.classList.remove(
      "is-done",
      "ca-tr--anim",
      "ca-tr--portas",
      "ca-tr--panfleto",
      "ca-tr--abre",
      "ca-tr--fecha",
      "ca-tr--revela",
      "ca-tr--saida",
      "ca-tr--cobre"
    );
    overlay.removeAttribute("data-saltar");
    overlay.style.opacity = "";
    overlay.style.visibility = "";
  }

  function setScene(overlay, scene, variant) {
    resetOverlay(overlay);
    if (scene === "portas") {
      overlay.classList.add("ca-tr--portas");
    } else {
      overlay.classList.add("ca-tr--panfleto");
      if (variant === "fecha") overlay.classList.add("ca-tr--fecha");
      else if (variant === "revela") overlay.classList.add("ca-tr--revela");
      else if (variant === "saida") overlay.classList.add("ca-tr--abre", "ca-tr--saida");
      else overlay.classList.add("ca-tr--abre");
    }
  }

  function runTimed(overlay, ms, onDone) {
    const runId = ++activeRunId;
    clearActiveTimer();

    let finished = false;
    const done = () => {
      if (finished || runId !== activeRunId) return;
      finished = true;
      clearActiveTimer();
      stopListen();
      onDone();
    };

    const saltar = (event) => { if (event.key === "Escape") done(); };
    const events = ["keydown"];
    const stopListen = () => events.forEach((ev) => window.removeEventListener(ev, saltar));
    events.forEach((ev) => window.addEventListener(ev, saltar, { passive: true }));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (runId !== activeRunId) return;
        overlay.classList.add("ca-tr--anim");
        activeTimer = window.setTimeout(done, ms);
      });
    });

  }

  function initEntry() {
    const overlay = document.getElementById("ca-transicao");
    const page = document.body.dataset.page;
    const nav = readNavFlag();

    if (!overlay || reduced) {
      finishOverlay(overlay);
      return;
    }

    if (isHistoryNavigation()) {
      finishOverlay(overlay);
      return;
    }

    loadLogo(overlay);

    const uncover = () => {
      document.documentElement.classList.remove("ca-loading");
      document.documentElement.classList.add("ca-page-ready");
      document.documentElement.style.overflow = "hidden";
      overlay.style.visibility = "visible";
      overlay.style.opacity = "1";
      if (window.location.hash) {
        requestAnimationFrame(() => {
          const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
          target?.scrollIntoView({ behavior: "instant", block: "start" });
        });
      }
    };

    if (page === "home") {
      if (nav === "from-ementa") {
        setScene(overlay, "panfleto", "saida");
        uncover();
        runTimed(overlay, 400, () => finishOverlay(overlay));
        return;
      }
      setScene(overlay, "portas");
      runTimed(overlay, 1650, () => finishOverlay(overlay));
      return;
    }

    if (page === "ementa") {
      if (nav === "to-ementa-played") {
        setScene(overlay, "panfleto", "revela");
        uncover();
        runTimed(overlay, 400, () => finishOverlay(overlay));
        return;
      }
      setScene(overlay, "panfleto", "abre");
      runTimed(overlay, 780, () => finishOverlay(overlay));
    }
  }

  function navigateWithTransition(href, { scene, variant, flag, duration }) {
    const overlay = document.getElementById("ca-transicao");
    if (!overlay || reduced) {
      window.location.href = href;
      return;
    }

    if (navigating) return;
    navigating = true;
    try { sessionStorage.setItem(NAV_KEY, flag); } catch { /* Navegação continua sem armazenamento. */ }
    loadLogo(overlay);

    setScene(overlay, scene, variant);
    overlay.classList.add("ca-tr--cobre");
    overlay.style.opacity = "";
    overlay.style.visibility = "visible";

    runTimed(overlay, duration, () => {
      window.location.href = href;
    });
  }

  function bindCrossPageLinks() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const from = pageName(window.location.pathname);
      const to = pageName(url.pathname);
      if (from === to) return;

      const allowed = new Set(["index.html", "ementa.html"]);
      if (!allowed.has(from) || !allowed.has(to)) return;

      event.preventDefault();

      if (from === "index.html" && to === "ementa.html") {
        navigateWithTransition(link.href, {
          scene: "panfleto",
          variant: "abre",
          flag: "to-ementa-played",
          duration: 780,
        });
        return;
      }

      if (from === "ementa.html" && to === "index.html") {
        navigateWithTransition(link.href, {
          scene: "panfleto",
          variant: "fecha",
          flag: "from-ementa",
          duration: 720,
        });
      }
    });
  }

  /** Evita página em cache com overlay a meio da animação (voltar no browser). */
  function snapshotCleanStateForCache() {
    const overlay = document.getElementById("ca-transicao");
    navigating = false;
    clearActiveTimer();
    activeRunId += 1;
    if (overlay) {
      overlay.classList.add("is-done");
      overlay.dataset.saltar = "";
    }
    revealPage();
  }

  function boot() {
    if (window.__caTransicaoBooted) return;
    window.__caTransicaoBooted = true;

    initEntry();
    bindCrossPageLinks();

    window.addEventListener("pagehide", (event) => {
      if (event.persisted) snapshotCleanStateForCache();
    });
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      finishOverlay(document.getElementById("ca-transicao"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
