/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · main.js
   Navbar, menú móvil, selector turista/expat, share y footer.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Navbar: fondo sólido al pasar 100px ── */
  var nav = document.querySelector('.nav');
  if (nav && !nav.classList.contains('nav--solid')) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 100);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Menú móvil ── */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Selector de modo (turista / expat) ──
     Guarda la preferencia y, si el visitante ya eligió "expat" antes,
     lo avisa con un enlace destacado en lugar de redirigirlo a la fuerza. */
  var MODE_KEY = 'mijnutrecht:modo';
  function readMode() {
    try { return localStorage.getItem(MODE_KEY); } catch (e) { return null; }
  }
  function saveMode(v) {
    try { localStorage.setItem(MODE_KEY, v); } catch (e) { /* modo privado */ }
  }

  document.querySelectorAll('[data-modo]').forEach(function (el) {
    el.addEventListener('click', function () { saveMode(el.dataset.modo); });
  });

  var pageMode = document.body.dataset.modo;
  if (pageMode) {
    document.querySelectorAll('[data-modo="' + pageMode + '"]').forEach(function (el) {
      el.classList.add('is-current');
    });
  }

  var recuerdo = document.getElementById('modo-recordado');
  if (recuerdo && pageMode === 'turista' && readMode() === 'expat') {
    recuerdo.hidden = false;
  }

  /* ── Botón compartir (Web Share API con fallback a copiar) ── */
  document.querySelectorAll('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var payload = {
        title: document.title,
        text: btn.dataset.shareText || 'Mijn Utrecht — guía en español de Utrecht',
        url: location.href
      };
      var original = btn.textContent;
      try {
        if (navigator.share) {
          await navigator.share(payload);
          return;
        }
        await navigator.clipboard.writeText(location.href);
        btn.textContent = '✅ Enlace copiado';
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        btn.textContent = '⚠️ Copia el enlace de la barra';
      }
      setTimeout(function () { btn.textContent = original; }, 2600);
    });
  });

  /* ── Newsletter: sin backend todavía, guarda el email en local ── */
  var form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('newsletter-status');
      var email = form.querySelector('input[type="email"]').value.trim();
      if (!email) return;
      try { localStorage.setItem('mijnutrecht:newsletter', email); } catch (err) { /* noop */ }
      if (status) {
        status.textContent = 'Apuntado. Todavía no hay servidor detrás: el aviso llegará cuando la lista esté en marcha.';
      }
      form.reset();
    });
  }

  /* ── Imprimir / guardar como PDF ── */
  document.querySelectorAll('[data-print]').forEach(function (btn) {
    btn.addEventListener('click', function () { window.print(); });
  });

  /* ── Volver arriba: estas páginas miden 15.000-21.000 px ── */
  if (document.body.scrollHeight > 4000) {
    var top = document.createElement('button');
    top.type = 'button';
    top.className = 'back-to-top';
    top.setAttribute('aria-label', 'Volver arriba');
    top.innerHTML = '↑';
    document.body.appendChild(top);

    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      var first = document.querySelector('.nav__brand');
      if (first) first.focus();
    });

    var toggleTop = function () {
      top.classList.toggle('is-visible', window.scrollY > 900);
    };
    toggleTop();
    window.addEventListener('scroll', toggleTop, { passive: true });
  }

  /* ── Scrollspy: marca en el nav la sección que se está leyendo ── */
  var spyLinks = Array.prototype.slice
    .call(document.querySelectorAll('.nav__link[href^="#"]'))
    .map(function (a) {
      return { link: a, section: document.getElementById(a.getAttribute('href').slice(1)) };
    })
    .filter(function (x) { return x.section; });

  if (spyLinks.length && 'IntersectionObserver' in window) {
    var marcar = function (activa) {
      spyLinks.forEach(function (x) {
        if (x.section === activa) x.link.setAttribute('aria-current', 'true');
        else x.link.removeAttribute('aria-current');
      });
    };

    var visiblesSpy = new Set();
    var spyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visiblesSpy.add(e.target);
        else visiblesSpy.delete(e.target);
      });
      // La primera del documento que esté en pantalla
      var actual = spyLinks
        .map(function (x) { return x.section; })
        .filter(function (s) { return visiblesSpy.has(s); })[0];
      marcar(actual);
    }, { rootMargin: '-30% 0px -55% 0px' });

    spyLinks.forEach(function (x) { spyObs.observe(x.section); });
  }

  /* ── Año en el footer ── */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
