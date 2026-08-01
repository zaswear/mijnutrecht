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

  /* ── Año en el footer ── */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
