/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · landing.js
   Render de itinerarios (1/2/3 días), las 7 experiencias y el
   modal de las 10 rutas a pie.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function done() {
    document.dispatchEvent(new CustomEvent('mu:content-loaded'));
  }

  /* ── Itinerarios por días ── */
  var itinRoot = document.getElementById('itinerarios');
  if (itinRoot) {
    fetch('./assets/data/itinerarios.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        Object.keys(data).forEach(function (key) {
          var panel = document.getElementById('itinerario-' + key);
          if (!panel) return;
          var plan = data[key];

          var html = '<h3 class="itinerario__titulo">' + esc(plan.titulo) + '</h3>';
          html += '<div class="itinerario__resumen">' +
            plan.resumen.map(function (r) { return '<span>' + esc(r) + '</span>'; }).join('') +
            '</div>';

          plan.dias.forEach(function (dia, di) {
            if (plan.dias.length > 1 || di > 0) {
              html += '<h4 class="itinerario__dia-title">' + esc(dia.nombre) + '</h4>';
            }
            html += '<ol class="timeline">';
            dia.paradas.forEach(function (p) {
              html += '<li class="timeline__item">' +
                '<div>' +
                  '<span class="timeline__marker" aria-hidden="true">' + esc(p.emoji) + '</span>' +
                  '<span class="timeline__hora">' + esc(p.hora) + '</span>' +
                '</div>' +
                '<div class="timeline__body">' +
                  '<h5 class="timeline__title">' + esc(p.titulo) + '</h5>' +
                  '<p class="timeline__text">' + esc(p.texto) + '</p>' +
                  (p.hop ? '<span class="timeline__hop">↳ ' + esc(p.hop) + '</span>' : '') +
                  (p.img ? '<img class="timeline__thumb" src="' + esc(p.img) + '" alt="' + esc(p.alt || '') + '" loading="lazy" decoding="async" width="220" height="165" />' : '') +
                '</div>' +
              '</li>';
            });
            html += '</ol>';
          });

          html += '<div class="plan-controls"><button type="button" class="btn btn-primary" data-save-days="' + key + '">Guardar este itinerario</button><a class="btn btn-ghost" href="mi-plan.html">Abrir mi itinerario →</a></div><p role="status" data-save-status></p>';
          panel.innerHTML = html;
          panel.querySelector('[data-save-days]').addEventListener('click', function () {
            var items = [];
            plan.dias.forEach(function (dia, di) {
              dia.paradas.forEach(function (p, pi) {
                items.push({id: 'dias-' + key + '-' + di + '-' + pi, title: p.titulo,
                  time: dia.nombre + ' · ' + p.hora + (p.hop ? ' · ' + p.hop : ''),
                  text: p.texto, map: p.titulo + ' Utrecht'});
              });
            });
            var ok = window.MUPlan && MUPlan.add(items);
            panel.querySelector('[data-save-status]').textContent = ok ? 'Guardado en este navegador. Abre Mi itinerario para organizar las paradas.' : 'No se pudo guardar. Comprueba el almacenamiento del navegador.';
          });
        });
        done();
      })
      .catch(function () {
        itinRoot.insertAdjacentHTML('beforeend',
          '<p class="muted small">No se han podido cargar los itinerarios. Recarga la página o consulta el mapa.</p>');
      });
  }

  /* ── Las 7 experiencias (acordeón de paneles) ──
     Colapsado se ve el número y el título; al abrir uno se expande y muestra
     el texto. Horizontal en escritorio, vertical en móvil (lo decide el CSS,
     el JS es el mismo). Siempre hay exactamente un panel abierto: así nunca
     se queda la sección sin texto visible. */
  var expGrid = document.getElementById('experiencias-grid');
  if (expGrid) {
    fetch('./assets/data/experiencias.json')
      .then(function (r) { return r.json(); })
      .then(function (items) {
        expGrid.innerHTML = items.map(function (e, i) {
          var abierto = i === 0;
          var id = 'exp-panel-' + i;
          var bg = e.img
            ? '<img class="exp-card__bg" src="' + esc(e.img) + '" alt="' + esc(e.alt || '') + '" loading="lazy" decoding="async" width="800" height="600" />'
            : '';
          return '<article class="exp-card exp-card--' + esc(e.tono || 'tinta') + ' reveal" data-exp-panel' +
            (abierto ? ' data-abierto' : '') + '>' +
            bg +
            '<button type="button" class="exp-card__trigger" aria-expanded="' + (abierto ? 'true' : 'false') +
              '" aria-controls="' + id + '">' +
              '<span class="exp-card__num" aria-hidden="true">' + esc(e.num) + '</span>' +
              '<span class="exp-card__title">' + esc(e.titulo) + '</span>' +
            '</button>' +
            '<div class="exp-card__body" id="' + id + '">' +
              '<p class="exp-card__text">' + esc(e.texto) + '</p>' +
              '<span class="exp-card__where">' + esc(e.donde) + '</span>' +
            '</div>' +
          '</article>';
        }).join('');
        initExpAccordion(expGrid);
        done();
      })
      .catch(function () {
        expGrid.innerHTML = '<p class="muted small">No se han podido cargar las experiencias.</p>';
      });
  }

  function initExpAccordion(root) {
    var paneles = [].slice.call(root.querySelectorAll('[data-exp-panel]'));
    if (!paneles.length) return;

    function abrir(panel) {
      paneles.forEach(function (p) {
        var activo = p === panel;
        p.toggleAttribute('data-abierto', activo);
        p.querySelector('.exp-card__trigger').setAttribute('aria-expanded', activo ? 'true' : 'false');
      });
    }

    root.addEventListener('click', function (ev) {
      var trigger = ev.target.closest('.exp-card__trigger');
      if (trigger && root.contains(trigger)) abrir(trigger.closest('[data-exp-panel]'));
    });

    /* Al tabular, el panel enfocado se abre solo: si no, el foco entraría en
       un panel colapsado y el texto seguiría invisible. */
    root.addEventListener('focusin', function (ev) {
      var trigger = ev.target.closest('.exp-card__trigger');
      if (trigger && root.contains(trigger)) abrir(trigger.closest('[data-exp-panel]'));
    });

    /* Flechas para moverse entre paneles, como en un tablist. */
    root.addEventListener('keydown', function (ev) {
      var trigger = ev.target.closest('.exp-card__trigger');
      if (!trigger || !root.contains(trigger)) return;
      var paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
      if (!paso) return;
      ev.preventDefault();
      var i = paneles.indexOf(trigger.closest('[data-exp-panel]'));
      var siguiente = paneles[(i + paso + paneles.length) % paneles.length];
      siguiente.querySelector('.exp-card__trigger').focus();
    });
  }

  /* ── Modal de rutas a pie ── */
  var modal = document.getElementById('route-modal');
  if (modal && typeof routeData !== 'undefined') {
    var panel = modal.querySelector('.modal__panel');
    var lastFocus = null;

    var close = function () {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    var open = function (id, trigger) {
      var d = routeData[id];
      if (!d) return;
      lastFocus = trigger || null;
      modal.querySelector('#rm-tags').innerHTML = (d.tags || [])
        .map(function (t) { return '<span class="badge">' + esc(t) + '</span>'; }).join('');
      modal.querySelector('#rm-title').textContent = d.title;
      modal.querySelector('#rm-dist').textContent = '📏 ' + d.dist;
      modal.querySelector('#rm-time').textContent = '⏱️ ' + d.time;
      modal.querySelector('#rm-start').textContent = '📍 ' + d.start;
      modal.querySelector('#rm-desc').innerHTML = d.desc;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      panel.focus();
    };

    document.querySelectorAll('[data-route-id]').forEach(function (card) {
      card.addEventListener('click', function () { open(card.dataset.routeId, card); });
    });

    modal.querySelectorAll('[data-close-modal]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }
})();
