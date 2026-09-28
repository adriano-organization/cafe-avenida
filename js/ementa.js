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

  function renderItems(category) {
    if (!category.items?.length) {
      return `<p class="menu-empty">${i18n.t("menuPage.empty")}</p>`;
    }
    return category.items
      .map(
        (item) => `
      <article class="menu-item" id="item-${item.id}">
        <div class="menu-item__head">
          <h3 class="menu-item__name">${localized(item.name)}</h3>
          <span class="menu-item__price">${formatPrice(item.price)}</span>
        </div>
        <p class="menu-item__desc">${localized(item.description)}</p>
        ${renderTags(item)}
      </article>`
      )
      .join("");
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
      section.innerHTML = `
        <h2 class="menu-section__title">${localized(cat.name)}</h2>
        <div class="menu-section__items">${renderItems(cat)}</div>`;
      sections.appendChild(section);
    });

    bindCategoryNav();
  }

  function bindCategoryNav() {
    const links = document.querySelectorAll("[data-menu-nav] .menu-nav__link");
    const sections = [...document.querySelectorAll(".menu-section")];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
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
    window.CafeBarra?.init();
    window.CafeSeo.applyPageMeta(cfg, i18n, "menu");
    loadMenu();

    window.addEventListener("cafe:langchange", () => {
      renderMenu();
      window.CafeSeo.applyPageMeta(cfg, i18n, "menu");
      window.CafeBarra?.init();
      window.CafeBranding?.apply(cfg);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
