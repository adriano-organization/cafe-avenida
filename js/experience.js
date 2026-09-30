/** Navegação por secção, regresso ao topo e detalhes de movimento. */
(function () {
  function init() {
    const header = document.querySelector('.pg-barra');
    const hero = document.querySelector('.hero');
    const topButton = document.querySelector('[data-back-top]');
    const footer = document.querySelector('.site-footer');
    if (!header || !hero || !topButton) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const links = [...document.querySelectorAll('[data-section-hash]')];
    const sections = links.map(link => ({ link, section: document.querySelector(link.dataset.sectionHash) })).filter(item => item.section);
    let queued = false;
    function update() {
      queued = false;
      const edge = header.getBoundingClientRect().bottom;
      const passedHero = hero.getBoundingClientRect().bottom <= edge;
      let current = null;
      if (passedHero) {
        const marker = edge + Math.min(120, innerHeight * .18);
        for (const item of sections) {
          if (item.section.getBoundingClientRect().top <= marker) current = item;
        }
        if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
      }
      for (const item of sections) {
        if (item === current) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      }
      topButton.hidden = !passedHero;
      // Compensar a parte visível do rodapé, conservando a margem do botão.
      const footerOverlap = footer ? Math.max(0, innerHeight - footer.getBoundingClientRect().top) : 0;
      topButton.style.setProperty('--footer-offset', `${footerOverlap}px`);
    }
    function schedule() {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }
    topButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' });
      const brand = header.querySelector('.pg-barra__marca');
      brand?.focus({ preventScroll: true });
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const layoutObserver = new ResizeObserver(schedule);
    layoutObserver.observe(document.querySelector('main'));
    if (footer) layoutObserver.observe(footer);
    let observer;
    function revealPhotos() {
      observer?.disconnect();
      if (motion.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-photo-revealed');
          observer.unobserve(entry.target);
        });
      }, { threshold: .12 });
      document.querySelectorAll('.gallery__item, .suggestion-card').forEach((card, i) => {
        card.style.setProperty('--reveal-delay', `${(i % 3) * 65}ms`);
        observer.observe(card);
      });
    }
    window.addEventListener('cafe:langchange', () => { revealPhotos(); schedule(); });
    motion.addEventListener('change', revealPhotos);
    revealPhotos();
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
