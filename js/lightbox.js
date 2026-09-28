/**
 * Visualizador de fotos em ecrã inteiro.
 * CafeLightbox.open(items, index): items = [{ src, alt }]; com 1 item não há setas.
 */
(function () {
  const i18n = window.CafeI18n;
  let root, img, caption, counter, prevBtn, nextBtn, closeBtn;
  let items = [];
  let index = 0;
  let lastFocus = null;
  let touchX = null;

  function t(key, fallback) {
    const value = i18n?.t(key);
    return value && value !== key ? value : fallback;
  }

  function arrowIcon(direction) {
    const d = direction === "prev" ? "M11 4 6 9l5 5" : "M7 4l5 5-5 5";
    return `<svg width="22" height="22" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function build() {
    root = document.createElement("div");
    root.className = "lightbox";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.innerHTML = `
      <div class="lightbox__backdrop" data-lightbox-close></div>
      <figure class="lightbox__figure">
        <img class="lightbox__img" alt="" />
        <figcaption class="lightbox__caption">
          <span class="lightbox__text"></span>
          <span class="lightbox__counter"></span>
        </figcaption>
      </figure>
      <button type="button" class="lightbox__btn lightbox__btn--prev">${arrowIcon("prev")}</button>
      <button type="button" class="lightbox__btn lightbox__btn--next">${arrowIcon("next")}</button>
      <button type="button" class="lightbox__btn lightbox__btn--close" data-lightbox-close>
        <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4.5 4.5l9 9M13.5 4.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    `;
    img = root.querySelector(".lightbox__img");
    caption = root.querySelector(".lightbox__text");
    counter = root.querySelector(".lightbox__counter");
    prevBtn = root.querySelector(".lightbox__btn--prev");
    nextBtn = root.querySelector(".lightbox__btn--next");
    closeBtn = root.querySelector(".lightbox__btn--close");

    prevBtn.addEventListener("click", () => go(-1));
    nextBtn.addEventListener("click", () => go(1));
    root.querySelectorAll("[data-lightbox-close]").forEach((el) => el.addEventListener("click", close));

    root.addEventListener("touchstart", (e) => {
      touchX = e.touches.length === 1 ? e.touches[0].clientX : null;
    }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (touchX === null || items.length < 2) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    });

    document.addEventListener("keydown", onKey);
    document.body.appendChild(root);
  }

  function labels() {
    prevBtn.setAttribute("aria-label", t("lightbox.prev", "Foto anterior"));
    nextBtn.setAttribute("aria-label", t("lightbox.next", "Foto seguinte"));
    closeBtn.setAttribute("aria-label", t("lightbox.close", "Fechar"));
  }

  function render() {
    const item = items[index];
    root.classList.remove("is-ready");
    img.onload = () => root.classList.add("is-ready");
    img.src = item.src;
    img.alt = item.alt || "";
    if (img.complete) root.classList.add("is-ready");
    caption.textContent = item.alt || "";
    root.setAttribute("aria-label", item.alt || "");
    const multiple = items.length > 1;
    counter.textContent = multiple ? `${index + 1} / ${items.length}` : "";
    const hadFocus = document.activeElement;
    prevBtn.hidden = !multiple || index === 0;
    nextBtn.hidden = !multiple || index === items.length - 1;
    if (hadFocus?.hidden) {
      const visible = [prevBtn, nextBtn].find((btn) => !btn.hidden);
      (visible || closeBtn).focus();
    }
    [items[index + 1], items[index - 1]].forEach((n) => {
      if (n) new Image().src = n.src;
    });
  }

  function go(step) {
    const next = index + step;
    if (next < 0 || next >= items.length) return;
    index = next;
    render();
  }

  function onKey(e) {
    if (!root || root.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "Tab") {
      const focusable = [...root.querySelectorAll("button:not([hidden])")];
      const i = focusable.indexOf(document.activeElement);
      e.preventDefault();
      focusable[(i + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
    }
  }

  function open(list, start = 0) {
    if (!list?.length) return;
    if (!root) build();
    items = list;
    index = start;
    lastFocus = document.activeElement;
    labels();
    render();
    root.hidden = false;
    document.documentElement.classList.add("lightbox-open");
    requestAnimationFrame(() => root.classList.add("is-open"));
    closeBtn.focus();
  }

  function close() {
    if (!root || root.hidden) return;
    root.classList.remove("is-open");
    document.documentElement.classList.remove("lightbox-open");
    root.hidden = true;
    lastFocus?.focus?.();
  }

  function bind(el, onOpen, name) {
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    const action = t("lightbox.open", "Ampliar foto");
    el.setAttribute("aria-label", name ? `${action}: ${name}` : action);
    el.addEventListener("click", onOpen);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen();
      }
    });
  }

  window.CafeLightbox = { open, close, bind };
})();
