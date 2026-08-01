/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · alma.js
   Módulos interactivos de la página "El Alma": comparadores
   antes/después, anatomía de una calle, baldosas, tarjetas
   flip, quiz, barras comparativas, glosario, flora y agenda.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  function refresh() { document.dispatchEvent(new CustomEvent('mu:content-loaded')); }

  /* ── Comparadores deslizantes (genérico) ── */
  document.querySelectorAll('[data-compare]').forEach(function (root) {
    var range = root.querySelector('.compare__range');
    var old = root.querySelector('.compare__old');
    var handle = root.querySelector('.compare__handle');
    if (!range || !old || !handle) return;
    var sync = function () {
      var v = range.value;
      old.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
      handle.style.left = v + '%';
    };
    range.addEventListener('input', sync);
    sync();
  });

  /* ── Selector de localización del comparador de fotos ── */
  var compFoto = document.getElementById('compare-fotos');
  if (compFoto && typeof COMPARACIONES !== 'undefined') {
    var titleEl = document.getElementById('compare-title');
    var descEl = document.getElementById('compare-desc');
    var capEl = document.getElementById('compare-caption');
    var oldImg = compFoto.querySelector('.compare__old');
    var newImg = compFoto.querySelector('.compare__new');
    var range = compFoto.querySelector('.compare__range');
    var handle = compFoto.querySelector('.compare__handle');

    // Versiones WebP optimizadas de las fotos del comparador
    var OPTIM = {
      'fotos/oudegracht_old.jpg': 'fotos/optim/oudegracht-old-1200.webp',
      'fotos/oudegracht_modern.jpg': 'fotos/optim/oudegracht-modern-1200.webp',
      'fotos/domplein_old.jpg': 'fotos/optim/domplein-old-1200.webp',
      'fotos/domplein_modern.jpg': 'fotos/optim/domplein-modern-1200.webp',
      'fotos/vredenburg_old.jpg': 'fotos/optim/vredenburg-old-1200.webp',
      'fotos/vredenburg_modern.jpg': 'fotos/optim/vredenburg-modern-1200.webp'
    };
    var opt = function (p) { return OPTIM[p] || p; };

    window.changeComparison = function (key, btn) {
      var d = COMPARACIONES[key];
      if (!d) return;
      titleEl.textContent = d.titulo;
      descEl.textContent = d.desc;
      capEl.textContent = d.caption;
      newImg.src = opt(d.imgModern); newImg.alt = d.altModern;
      oldImg.src = opt(d.imgOld); oldImg.alt = d.altOld;
      range.value = 50;
      oldImg.style.clipPath = 'inset(0 50% 0 0)';
      handle.style.left = '50%';
      document.querySelectorAll('[data-compare-btn]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
    };

    document.querySelectorAll('[data-compare-btn]').forEach(function (b) {
      b.addEventListener('click', function () { window.changeComparison(b.dataset.compareBtn, b); });
    });
  }

  /* ── Anatomía de una calle: hotspots ── */
  var info = document.getElementById('anat-info');
  var hotspots = document.querySelectorAll('.hotspot');
  hotspots.forEach(function (h) {
    h.addEventListener('click', function () {
      hotspots.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      h.classList.add('is-active');
      h.setAttribute('aria-pressed', 'true');
      if (info) {
        info.innerHTML = '<p class="anat-info__title">' + esc(h.dataset.title) + '</p>' +
                         '<p class="anat-info__text">' + esc(h.dataset.text) + '</p>';
      }
    });
  });

  /* ── Baldosa → jardín ── */
  var tiles = document.getElementById('tiles');
  var tilesBtn = document.getElementById('tiles-btn');
  if (tiles && tilesBtn) {
    tilesBtn.addEventListener('click', function () {
      var green = tiles.classList.toggle('is-green');
      tilesBtn.textContent = green ? '🧱 Volver a poner las baldosas' : '🌱 Levantar las baldosas';
      tilesBtn.setAttribute('aria-pressed', String(green));
    });
  }

  /* ── Tarjetas flip ── */
  document.querySelectorAll('.flip').forEach(function (card) {
    card.addEventListener('click', function () { card.classList.toggle('is-flipped'); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flipped'); }
    });
  });

  /* ── Quiz ── */
  document.querySelectorAll('[data-quiz] .quiz__item').forEach(function (q) {
    var opts = q.querySelectorAll('.quiz__opt');
    var exp = q.querySelector('.quiz__exp');
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (q.dataset.done) return;
        q.dataset.done = '1';
        var correct = q.querySelector('.quiz__opt[data-correct]');
        if (opt.hasAttribute('data-correct')) opt.classList.add('is-correct');
        else { opt.classList.add('is-wrong'); if (correct) correct.classList.add('is-correct'); }
        if (exp) exp.hidden = false;
        opts.forEach(function (o) { o.disabled = true; });
      });
    });
  });

  /* ── Barras: dos modelos de ciudad ── */
  var barsWrap = document.getElementById('vs-bars');
  if (barsWrap && typeof UV_VS !== 'undefined') {
    window.setVs = function (state, btn) {
      var d = UV_VS[state] || UV_VS.utr;
      barsWrap.innerHTML = d.rows.map(function (r) {
        return '<div class="bar">' +
          '<div class="bar__head"><span class="bar__key">' + esc(r.k) + '</span><span class="bar__val">' + esc(r.v) + '</span></div>' +
          '<div class="bar__track"><div class="bar__fill" style="width:' + r.w + '%;background:' + r.c + '"></div></div>' +
        '</div>';
      }).join('');
      document.querySelectorAll('[data-vs]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
    };
    document.querySelectorAll('[data-vs]').forEach(function (b) {
      b.addEventListener('click', function () { window.setVs(b.dataset.vs, b); });
    });
    window.setVs('utr', document.querySelector('[data-vs="utr"]'));
  }

  /* ── Glosario ── */
  var glosGrid = document.getElementById('glosario-grid');
  if (glosGrid && typeof GLOSARIO !== 'undefined') {
    var renderGlosario = function (filtro) {
      var q = (filtro || '').toLowerCase();
      var list = GLOSARIO.filter(function (i) {
        return i.palabra.toLowerCase().indexOf(q) > -1 ||
               i.trad.toLowerCase().indexOf(q) > -1 ||
               i.desc.toLowerCase().indexOf(q) > -1;
      });
      if (!list.length) {
        glosGrid.innerHTML = '<p class="muted small">Sin resultados para «' + esc(filtro) + '».</p>';
        return;
      }
      glosGrid.innerHTML = list.map(function (i) {
        return '<article class="glosario-card">' +
          '<div class="glosario-card__head">' +
            '<div><p class="glosario-card__word">' + esc(i.palabra) + '</p>' +
            '<p class="glosario-card__pron">' + esc(i.pron) + '</p></div>' +
            '<span class="badge badge--neutro">' + esc(i.tipo) + '</span>' +
          '</div>' +
          '<p class="glosario-card__trad">' + esc(i.trad) + '</p>' +
          '<p class="glosario-card__desc">' + esc(i.desc) + '</p>' +
        '</article>';
      }).join('');
    };
    renderGlosario('');
    var search = document.getElementById('glosario-search');
    if (search) search.addEventListener('input', function (e) { renderGlosario(e.target.value); });
  }

  /* ── Agenda de eventos ── */
  var agendaGrid = document.getElementById('agenda-grid');
  if (agendaGrid) {
    var eventos = [];
    var renderAgenda = function (list) {
      if (!list.length) {
        agendaGrid.innerHTML = '<p class="muted small">Sin eventos en esta categoría.</p>';
        return;
      }
      agendaGrid.innerHTML = list.map(function (e) {
        return '<article class="card card--lift evento-card reveal">' +
          '<span class="card__icon" aria-hidden="true">' + esc(e.emoji) + '</span>' +
          '<h3 class="card__title">' + esc(e.nombre) + '</h3>' +
          '<p class="evento-card__cuando">' + esc(e.cuando) + '</p>' +
          '<p class="card__text">' + esc(e.descripcion) + '</p>' +
          '<div class="evento-card__foot"><span>🕐 ' + esc(e.horario) + '</span><span>📍 ' + esc(e.lugar) + '</span></div>' +
        '</article>';
      }).join('');
      refresh();
    };

    fetch('./agenda/eventos.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        eventos = data;
        renderAgenda(eventos);
        document.querySelectorAll('[data-agenda-filter] .chip').forEach(function (btn) {
          btn.addEventListener('click', function () {
            btn.closest('[data-agenda-filter]').querySelectorAll('.chip').forEach(function (b) {
              b.setAttribute('aria-pressed', String(b === btn));
            });
            var tipo = btn.dataset.tipo;
            renderAgenda(tipo === 'todos' ? eventos : eventos.filter(function (e) { return e.tipo === tipo; }));
          });
        });
      })
      .catch(function () {
        agendaGrid.innerHTML = '<p class="muted small">No se ha podido cargar la agenda.</p>';
      });
  }

  /* ── Flora local ── */
  var floraGrid = document.getElementById('flora-grid');
  if (floraGrid) {
    var plantas = [];
    var renderFlora = function (list) {
      if (!list.length) {
        floraGrid.innerHTML = '<p class="muted small">Sin plantas en esta temporada.</p>';
        return;
      }
      floraGrid.innerHTML = list.map(function (p) {
        return '<article class="flora-card reveal">' +
          '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy" decoding="async" onerror="this.remove()" />' +
          '<div class="flora-card__body">' +
            '<h3 class="card__title">' + esc(p.emoji) + ' ' + esc(p.nombre) + '</h3>' +
            '<p class="flora-card__sci">' + esc(p.nombre_cientifico) + '</p>' +
            '<p class="flora-card__meses">' + esc(p.meses) + '</p>' +
            '<p class="flora-card__text">' + esc(p.descripcion) + '</p>' +
            '<p class="flora-card__donde">📍 ' + esc(p.donde_ver) + '</p>' +
          '</div>' +
        '</article>';
      }).join('');
      refresh();
    };

    fetch('./flora/plantas.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        plantas = data;
        renderFlora(plantas);
        document.querySelectorAll('[data-flora-filter] .chip').forEach(function (btn) {
          btn.addEventListener('click', function () {
            btn.closest('[data-flora-filter]').querySelectorAll('.chip').forEach(function (b) {
              b.setAttribute('aria-pressed', String(b === btn));
            });
            var t = btn.dataset.temporada;
            renderFlora(t === 'todas' ? plantas : plantas.filter(function (p) { return p.temporada === t; }));
          });
        });
      })
      .catch(function () {
        floraGrid.innerHTML = '<p class="muted small">No se ha podido cargar la flora.</p>';
      });
  }
})();
