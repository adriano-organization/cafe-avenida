/**
 * Ementa: carrega menu.json, tabs de categorias e tags.
 */
(function () {
  const cfg = window.CAFE_CONFIG;
  const i18n = window.CafeI18n;
  let menuData = null;

  function localized(obj) {
    return obj?.[i18n.getLang()] ?? obj?.pt ?? "";
  }

  function formatPrice(value) {
    return new Intl.NumberFormat(i18n.getLang() === "pt" ? "pt-PT" : "en-GB", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  function tagLabel(tag) {
    const map = {
      vegetarian: "menuPage.tags.vegetarian",
      glutenFree: "menuPage.tags.glutenFree",
    };
    return i18n.t(map[tag] || tag);
  }

  function renderTags(item) {
    const tags = item.tags || [];
    const parts = tags.map(
      (t) => `<span class="menu-tag menu-tag--${t}">${tagLabel(t)}</span>`
    );
    if (item.allergens) {
      const label = i18n.t("menuPage.tags.allergens");
      parts.push(
        `<span class="menu-tag menu-tag--allergens" title="${localized(item.allergens)}">${label}</span>`
      );
    }
    return parts.length ? `<div class="menu-item__tags">${parts.join("")}</div>` : "";
  }

  function renderPrice(item) {
    if (!item.prices?.length) {
      return `<span class="menu-item__price">${formatPrice(item.price)}</span>`;
    }
    const sizes = item.prices
      .map(
        (p) =>
          `<span class="menu-item__size"><abbr class="menu-item__size-label" title="${i18n.t(`menuPage.sizes.${p.size}`)}">${i18n.t(`menuPage.sizesShort.${p.size}`)}</abbr> ${formatPrice(p.value)}</span>`
      )
      .join("");
    return `<span class="menu-item__price menu-item__price--sizes">${sizes}</span>`;
  }

  function renderItems(category) {
    if (!category.items?.length) {
      return `<p class="menu-empty">${i18n.t("menuPage.empty")}</p>`;
    }
    return category.items
      .map((item) => {
        const desc = localized(item.description);
        return `
      <article class="menu-item" id="item-${item.id}">
        <div class="menu-item__head">
          <h3 class="menu-item__name">${localized(item.name)}</h3>
          <span class="menu-item__leader" aria-hidden="true"></span>
          ${renderPrice(item)}
        </div>
        ${desc ? `<p class="menu-item__desc">${desc}</p>` : ""}
        ${renderTags(item)}
      </article>`;
      })
      .join("");
  }

  function renderFigures(category) {
    if (!category.figures?.length) return "";
    const figs = category.figures
      .map(
        (src) =>
          `<span class="menu-figura"><span class="menu-figura__foto"><img src="${src}" alt="" loading="lazy" decoding="async" /></span></span>`
      )
      .join("");
    return `<div class="menu-section__figuras" aria-hidden="true">${figs}</div>`;
  }

  function renderMenu() {
    const nav = document.querySelector("[data-menu-nav]");
    const sections = document.querySelector("[data-menu-sections]");
    if (!nav || !sections || !menuData) return;

    nav.innerHTML = "";
    sections.innerHTML = "";

    menuData.categories.forEach((cat, index) => {
      const id = `cat-${cat.id}`;
      const btn = document.createElement("a");
      btn.href = `#${id}`;
      btn.className = "menu-nav__link";
      btn.textContent = localized(cat.name);
      btn.setAttribute("data-category", cat.id);
      if (index === 0) btn.classList.add("is-active");
      nav.appendChild(btn);

      const section = document.createElement("section");
      section.className = "menu-section";
      section.id = id;
      const figCount = Math.min(cat.figures?.length || 0, 2);
      if (figCount) section.classList.add(`menu-section--figs-${figCount}`);
      if ((cat.items?.length || 0) > 4) section.classList.add("menu-section--cols");
      const note = localized(cat.note);
      const bodyId = `${id}-body`;
      section.innerHTML = `
        ${renderFigures(cat)}
        <button type="button" class="menu-section__head" aria-expanded="true" aria-controls="${bodyId}" data-menu-toggle>
          <span class="menu-section__head-text">
            <span class="menu-section__num" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <h2 class="menu-section__title">${localized(cat.name)}</h2>
          </span>
          <span class="menu-section__chevron" aria-hidden="true"></span>
        </button>
        <div class="menu-section__body" id="${bodyId}">
          <div class="menu-section__body-inner">
            ${note ? `<p class="menu-section__note">${note}</p>` : ""}
            <div class="menu-section__items">${renderItems(cat)}</div>
          </div>
        </div>`;
      sections.appendChild(section);
    });

    bindCategoryNav();
    bindCollapse();
  }

  function setCollapsed(section, collapsed, instant) {
    if (!section) return;
    const head = section.querySelector("[data-menu-toggle]");
    const body = section.querySelector(".menu-section__body");
    if (!head || !body) return;

    const reduce = instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (collapsed) {
      if (reduce) {
        section.classList.add("is-collapsed");
        body.style.height = "0px";
      } else {
        const start = body.getBoundingClientRect().height || body.scrollHeight;
        body.style.height = `${start}px`;
        body.getBoundingClientRect();
        section.classList.add("is-collapsed");
        body.style.height = "0px";
      }
    } else {
      section.classList.remove("is-collapsed");
      if (reduce) {
        body.style.height = "";
      } else {
        body.style.height = "0px";
        const target = body.scrollHeight;
        body.getBoundingClientRect();
        body.style.height = `${target}px`;
        const clear = (e) => {
          if (e.propertyName !== "height") return;
          if (!section.classList.contains("is-collapsed")) body.style.height = "";
          body.removeEventListener("transitionend", clear);
        };
        body.addEventListener("transitionend", clear);
      }
    }

    head.setAttribute("aria-expanded", collapsed ? "false" : "true");
    head.setAttribute("aria-label", collapsed ? i18n.t("menuPage.expand") : i18n.t("menuPage.collapse"));
  }

  function bindCollapse() {
    document.querySelectorAll("[data-menu-toggle]").forEach((btn) => {
      const section = btn.closest(".menu-section");
      setCollapsed(section, false, true);
      btn.addEventListener("click", () => {
        setCollapsed(section, !section.classList.contains("is-collapsed"));
      });
    });
  }

  let navCleanup = null;

  function bindCategoryNav() {
    navCleanup?.();

    const nav = document.querySelector("[data-menu-nav]");
    const links = [...document.querySelectorAll("[data-menu-nav] .menu-nav__link")];
    const sections = [...document.querySelectorAll(".menu-section")];
    if (!nav || !links.length) return;

    let currentId = links[0]?.getAttribute("href")?.slice(1) ?? "";

    const setActive = (id) => {
      if (!id || id === currentId) return;
      currentId = id;
      let active = null;
      links.forEach((l) => {
        const on = l.getAttribute("href") === `#${id}`;
        l.classList.toggle("is-active", on);
        if (on) active = l;
      });
      if (!active) return;
      const left = active.offsetLeft;
      const right = left + active.offsetWidth;
      const viewLeft = nav.scrollLeft;
      const viewRight = viewLeft + nav.clientWidth;
      if (left < viewLeft + 12 || right > viewRight - 12) {
        active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.15, 0.4] }
    );
    sections.forEach((s) => observer.observe(s));

    const atBottom = () => {
      const last = sections[sections.length - 1];
      if (!last) return;
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
        setActive(last.id);
      }
    };
    window.addEventListener("scroll", atBottom, { passive: true });

    const onNavClick = (e) => {
      const link = e.target.closest(".menu-nav__link");
      if (!link) return;
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      if (section?.classList.contains("is-collapsed")) {
        setCollapsed(section, false);
      }
    };
    nav.addEventListener("click", onNavClick);

    navCleanup = () => {
      observer.disconnect();
      window.removeEventListener("scroll", atBottom);
      nav.removeEventListener("click", onNavClick);
    };
  }

  async function loadMenu() {
    const res = await fetch("menu.json", { cache: "no-cache" });
    menuData = await res.json();
    renderMenu();
  }

  function applyTheme() {
    const root = document.documentElement;
    Object.entries(cfg.colors || {}).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value);
    });
  }

  function init() {
    applyTheme();
    i18n.init();
    window.CafeBranding?.apply(cfg);
    document.querySelectorAll("[data-config='phone']").forEach((el) => {
      el.textContent = cfg.phoneDisplay;
    });
    document.querySelectorAll("[data-tel-link]").forEach((el) => {
      el.href = `tel:${cfg.phone.replace(/\s/g, "")}`;
    });
    window.CafeBarra?.init();
    window.CafeSeo.applyPageMeta(cfg, i18n, "menu");
    loadMenu();

    window.addEventListener("cafe:langchange", () => {
      renderMenu();
      window.CafeSeo.applyPageMeta(cfg, i18n, "menu");
      window.CafeBarra?.init();
      window.CafeBranding?.apply(cfg);
      document.querySelectorAll("[data-config='phone']").forEach((el) => {
        el.textContent = cfg.phoneDisplay;
      });
      document.querySelectorAll("[data-tel-link]").forEach((el) => {
        el.href = `tel:${cfg.phone.replace(/\s/g, "")}`;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
