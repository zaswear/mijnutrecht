/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · animations.js
   Revelado al scroll (.reveal) y contadores animados (.js-count).
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    var target = parseFloat(el.dataset.target) || 0;
    var suffix = el.dataset.suffix || '';
    if (reduced) {
      el.textContent = target.toLocaleString('es-ES') + suffix;
      return;
    }
    var dur = 1400;
    var start = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var val = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = val.toLocaleString('es-ES') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    document.querySelectorAll('.js-count').forEach(countUp);
    return;
  }

  var revealObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  var countObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countUp(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.4 });

  function observeAll() {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) { revealObs.observe(el); });
    document.querySelectorAll('.js-count').forEach(function (el) { countObs.observe(el); });
  }

  observeAll();
  // Contenido inyectado por fetch: se vuelve a observar cuando avisa
  document.addEventListener('mu:content-loaded', observeAll);
})();
