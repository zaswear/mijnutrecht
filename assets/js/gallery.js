/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · gallery.js
   Galería de fotos (Cloudinary) con lightbox y navegación.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var grid = document.getElementById('galeria');
  if (!grid) return;

  var CLOUD = 'dkn49zkfr';
  var PREVIEW = 8;
  var MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  var items = [];
  var index = 0;

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // Inserta/sustituye el ancho en una URL de Cloudinary
  function atWidth(url, w) {
    if (!/res\.cloudinary\.com/.test(url)) return url;
    if (/\/w_\d+/.test(url)) return url.replace(/\/w_\d+/, '/w_' + w);
    return url.replace('/upload/', '/upload/w_' + w + ',');
  }

  fetch('https://res.cloudinary.com/' + CLOUD + '/image/list/gallery.json')
    .then(function (r) {
      if (!r.ok) throw new Error('Cloudinary list: ' + r.status);
      return r.json();
    })
    .then(function (data) {
      return (data.resources || []).map(function (r) {
        return {
          id: r.public_id,
          fecha: r.created_at,
          url: 'https://res.cloudinary.com/' + CLOUD + '/image/upload/f_auto,q_auto,w_600/' + r.public_id + '.' + r.format
        };
      });
    })
    .catch(function () {
      return fetch('./fotos/gallery.json')
        .then(function (r) { return r.json(); })
        .then(function (fotos) {
          return fotos.map(function (f) {
            return {
              id: f.public_id || f.archivo || '',
              fecha: f.fecha ? f.fecha + 'T00:00:00Z' : null,
              url: atWidth(f.url, 600)
            };
          });
        });
    })
    .then(mostrar)
    .catch(function () {
      grid.innerHTML = '<p class="muted small">No se han podido cargar las fotos.</p>';
    });

  function mostrar(fotos) {
    var all = fotos.filter(function (f) {
      var id = (f.id || '').toLowerCase();
      return id.indexOf('avatar') === -1 && id.indexOf('samples/') !== 0;
    });

    var n = document.getElementById('n-fotos');
    if (n) n.textContent = String(all.length);

    var shuffled = all.slice().sort(function () { return Math.random() - 0.5; });
    render(shuffled.slice(0, PREVIEW), false);

    var rest = shuffled.slice(PREVIEW);
    var btn = document.getElementById('btn-ver-todas');
    if (btn && rest.length) {
      btn.hidden = false;
      btn.textContent = 'Ver las ' + all.length + ' fotos →';
      btn.addEventListener('click', function onExpand() {
        btn.removeEventListener('click', onExpand);   // una sola vez: si no, duplicaría la galería
        render(rest, true);
        btn.hidden = true;
      });
    }
  }

  function render(fotos, append) {
    if (!append) { grid.innerHTML = ''; items = []; }
    var frag = document.createDocumentFragment();

    fotos.forEach(function (f) {
      var d = f.fecha ? new Date(f.fecha) : null;
      var titulo = d && !isNaN(d) ? 'Utrecht · ' + MESES[d.getMonth() + 1] + ' ' + d.getFullYear() : 'Utrecht';
      var i = items.length;
      items.push({ src: atWidth(f.url, 1800), titulo: titulo });

      var fig = document.createElement('figure');
      fig.className = 'gallery-item reveal';
      fig.innerHTML = '<img src="' + esc(f.url) + '" alt="' + esc(titulo) + '" loading="lazy" decoding="async" />' +
                      '<figcaption>' + esc(titulo) + '</figcaption>';
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'Ampliar foto: ' + titulo);
      fig.addEventListener('click', function () { open(i); });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
      frag.appendChild(fig);
    });

    grid.appendChild(frag);
    document.dispatchEvent(new CustomEvent('mu:content-loaded'));
  }

  /* ── Lightbox ── */
  var box = document.getElementById('lightbox');
  var img = document.getElementById('lightbox-img');
  var caption = document.getElementById('lightbox-caption');
  var lastFocus = null;

  function open(i) {
    if (!box) return;
    lastFocus = document.activeElement;
    index = i;
    paint();
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lightbox-close').focus();
  }
  function close() {
    box.classList.remove('is-open');
    img.src = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  function move(dir) {
    index = (index + dir + items.length) % items.length;
    paint();
  }
  function paint() {
    img.src = items[index].src;
    img.alt = items[index].titulo;
    caption.textContent = items[index].titulo + '  ·  ' + (index + 1) + '/' + items.length;
  }

  if (box) {
    document.getElementById('lightbox-close').addEventListener('click', close);
    document.getElementById('lightbox-prev').addEventListener('click', function () { move(-1); });
    document.getElementById('lightbox-next').addEventListener('click', function () { move(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    });
  }
})();
