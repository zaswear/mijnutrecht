/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · free-tour/js/free-tour.js
   Lógica del tour: carga de la ruta, render de paradas,
   navegación, progreso, acertijos, geolocalización y final.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORE_KEY = 'mijnutrecht-tour-progress';
  var NEAR_M = 50;      // "¡Cerca!"
  var FAR_M = 500;      // sugerir "Cómo llegar"

  var route = null;
  var stops = [];
  var index = 0;
  var answers = {};        // { indiceParada: opcionElegida }
  var completed = [];      // índices de paradas marcadas como visitadas
  var finished = false;
  var userPos = null;
  var mapReady = false;

  /* ───────── utilidades ───────── */
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  /* ───────── persistencia ───────── */
  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveProgress() {
    if (!route) return;
    try {
      var all = readStore();
      all[route.id] = {
        routeId: route.id,
        routeRevision: route.revision || 1,
        currentStop: index,
        completedStops: completed,
        answers: answers,
        completedAt: finished && completed.length === stops.length ? new Date().toISOString() : null
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(all));
    } catch (e) { /* modo privado o sin espacio */ }
  }

  function loadProgress() {
    var all = readStore();
    var saved = all[route.id];
    return saved && (saved.routeRevision || 1) === (route.revision || 1) ? saved : null;
  }

  function resetProgress() {
    index = 0;
    answers = {};
    completed = [];
    finished = false;
    saveProgress();
  }

  /* ───────── render ───────── */
  function updateProgress() {
    var pct = Math.round((completed.length / stops.length) * 100);
    var fill = $('progress-fill');
    if (fill) {
      fill.style.transform = 'scaleX(' + pct / 100 + ')';
      fill.parentElement.setAttribute('aria-valuetext', completed.length + ' de ' + stops.length + ' paradas visitadas');
      fill.parentElement.setAttribute('aria-valuenow', String(pct));
    }
    var count = $('tour-count');
    if (count) count.textContent = finished ? completed.length + '/' + stops.length + ' visitadas' : (index + 1) + '/' + stops.length;
    document.querySelectorAll('[data-stop-index]').forEach(function (button) {
      if (Number(button.dataset.stopIndex) === index && !finished) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });

    var dots = $('nav-dots');
    if (dots) {
      dots.innerHTML = stops.map(function (s, i) {
        var cls = 'tour-nav__dot';
        if (i === index && !finished) cls += ' is-current';
        else if (completed.indexOf(i) > -1) cls += ' is-done';
        return '<span class="' + cls + '"></span>';
      }).join('');
    }
  }

  function mediaBlock(stop) {
    if (stop.foto) {
      var credit = stop.foto_credito;
      return '<figure class="stop-photo"><img class="stop-card__image' + (credit ? ' stop-card__image--credited' : '') + '" src="' + esc(stop.foto) + '" alt="' + esc(stop.foto_alt || stop.titulo) +
        '" loading="lazy" decoding="async" width="' + (stop.foto_width || 800) + '" height="' + (stop.foto_height || 600) + '" />' +
        (credit ? '<figcaption>' + esc(credit.nota) + ' <a href="' + esc(credit.fuente) + '">Foto: ' + esc(credit.autor) + '</a> · <a href="' + esc(credit.url) + '">' + esc(credit.licencia) + '</a>. Redimensionada y convertida a WebP; misma licencia.</figcaption>' : '') + '</figure>';
    }
    var alt = stop.numero % 2 === 0 ? ' stop-card__placeholder--alt' : '';
    return '<div class="stop-card__placeholder' + alt + '" aria-hidden="true">' + stop.numero + '</div>';
  }

  function metaBlock(stop) {
    var bits = [];
    bits.push('<span>⏱️ <strong>' + esc(stop.tiempo_estimado) + '</strong> aquí</span>');
    if (stop.distancia_siguiente) bits.push('<span>🚶 ' + esc(stop.distancia_siguiente) + ' a la siguiente</span>');
    bits.push('<span id="stop-distance">📏 Calculando distancia…</span>');
    return '<div class="stop-card__meta">' + bits.join('') + '</div>';
  }

  function quizBlock(stop, i) {
    if (!stop.acertijo) return '';
    var q = stop.acertijo;
    var answered = answers[i] !== undefined;
    var opts = q.opciones.map(function (o, oi) {
      var cls = 'quiz-option';
      if (answered) {
        if (oi === q.correcta) cls += ' quiz-option--correct';
        else if (oi === answers[i]) cls += ' quiz-option--wrong';
      }
      return '<button type="button" class="' + cls + '" data-quiz-option="' + oi + '"' +
             (answered ? ' disabled' : '') + '>' + esc(o) + '</button>';
    }).join('');

    var feedback = '';
    if (answered) {
      var ok = answers[i] === q.correcta;
      feedback = '<p class="quiz-feedback">' + (ok ? '✅ <strong>¡Correcto!</strong> ' : '❌ <strong>Casi.</strong> ') +
                 esc(q.explicacion) + '</p>';
    }

    return '<section class="stop-card__section stop-card__section--acertijo">' +
      '<h3>🧩 ¿Sabías que…?</h3>' +
      '<p class="quiz-question">' + esc(q.pregunta) + '</p>' +
      '<div id="quiz-options">' + opts + '</div>' +
      '<div id="quiz-feedback">' + feedback + '</div>' +
    '</section>';
  }

  /* Punto de encuentro: solo en la primera parada, que es donde importa */
  function encuentroBlock() {
    var pe = route && route.punto_encuentro;
    if (!pe || index !== 0) return '';
    return '<aside class="encuentro">' +
      '<p class="encuentro__label">📍 Empieza aquí</p>' +
      '<p class="encuentro__nombre">' + esc(pe.nombre) + '</p>' +
      (pe.detalle ? '<p class="encuentro__detalle">' + esc(pe.detalle) + '</p>' : '') +
      '<button type="button" class="btn-soft" id="btn-encuentro" ' +
      'aria-label="Abrir el punto de encuentro en Google Maps">🧭 Cómo llegar al punto de encuentro</button>' +
    '</aside>';
  }

  function renderStop(i) {
    finished = false;
    index = Math.max(0, Math.min(i, stops.length - 1));
    var stop = stops[index];
    var root = $('stop-root');
    if (!root) return;

    var last = index === stops.length - 1;

    root.innerHTML =
      '<article class="stop-card">' +
        '<span class="stop-card__eyebrow">Parada ' + (index + 1) + ' de ' + stops.length + '</span>' +
        encuentroBlock() +
        mediaBlock(stop) +
        '<h1 class="stop-card__title">' + esc(stop.titulo) + '</h1>' +
        '<p class="stop-card__subtitle">' + esc(stop.subtitulo) + '</p>' +
        metaBlock(stop) +

        '<section class="stop-card__section stop-card__section--guia">' +
          '<h3>🎙️ El guía</h3>' +
          '<p id="guia-text">' + esc(stop.guia) + '</p>' +
          (window.FTSpeech && FTSpeech.supported()
            ? '<div class="btn-row" style="margin-top:1rem">' +
                '<button type="button" class="btn-soft" id="btn-speak" aria-pressed="false" ' +
                'aria-label="Escuchar el texto del guía">🔊 Escuchar</button>' +
                '<button type="button" class="btn-soft" id="btn-share" aria-label="Compartir esta parada">↗ Compartir</button>' +
              '</div>'
            : '<div class="btn-row" style="margin-top:1rem">' +
                '<button type="button" class="btn-soft" id="btn-share" aria-label="Compartir esta parada">↗ Compartir</button>' +
              '</div>') +
        '</section>' +

        '<section class="stop-card__section stop-card__section--historia">' +
          '<h3>📜 Dato histórico</h3>' +
          '<p>' + esc(stop.dato_historico) + '</p>' +
          (stop.fuente ? '<p><a href="' + esc(stop.fuente) + '">Consultar la fuente →</a></p>' : '') +
        '</section>' +

        '<section class="stop-card__section stop-card__section--misterio">' +
          '<h3>' + esc(stop.misterio_titulo || '🎭 El misterio') + '</h3>' +
          '<p>' + esc(stop.misterio) + '</p>' +
        '</section>' +

        '<section class="stop-card__section stop-card__section--reto">' +
          '<h3>📸 Reto de foto</h3>' +
          '<p>' + esc(stop.reto_foto) + '</p>' +
          '<div class="btn-row" style="justify-content:center;margin-top:1rem">' +
            '<button type="button" class="btn-soft" id="btn-insta" aria-label="Compartir el reto de foto">📷 Compartir el reto</button>' +
          '</div>' +
        '</section>' +

        quizBlock(stop, index) +

        '<button type="button" class="btn-cta" id="btn-arrived" aria-label="' +
          (last ? 'Terminar el tour' : 'He llegado, ir a la siguiente parada') + '">' +
          (last ? '🏁 He llegado · Terminar' : '✅ He llegado · Siguiente parada') +
        '</button>' +

        (stop.distancia_siguiente || !last
          ? ''
          : '<p class="ft-status" style="padding:1.5rem 0 0">Última parada del recorrido.</p>') +
      '</article>';

    var url = new URL(location.href);
    url.searchParams.set('parada', String(index + 1));
    history.replaceState(null, '', url);
    root.querySelector('h1').tabIndex = -1;
    root.querySelector('h1').focus({preventScroll: true});
    var photo = root.querySelector('.stop-card__image');
    if (photo) photo.addEventListener('error', function () {
      var note = document.createElement('p');
      note.className = 'ft-status'; note.textContent = 'Foto no disponible. Puedes seguir leyendo la parada.';
      photo.replaceWith(note);
    });
    bindStopEvents(stop);
    updateProgress();
    updateNavButtons();
    updateDistance();

    if (mapReady) {
      FTMap.highlightStop(index, completed);
      FTMap.panTo(stop.lat, stop.lng);
    }

    if (window.FTSpeech) FTSpeech.stopSpeaking();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindStopEvents(stop) {
    var arrived = $('btn-arrived');
    if (arrived) {
      arrived.addEventListener('click', function () {
        if (completed.indexOf(index) === -1) completed.push(index);
        if (index === stops.length - 1) renderFinish();
        else nextStop();
      });
    }

    var speak = $('btn-speak');
    if (speak) {
      speak.addEventListener('click', function () {
        if (FTSpeech.isSpeaking()) {
          FTSpeech.stopSpeaking();
          speak.textContent = '🔊 Escuchar';
          speak.setAttribute('aria-pressed', 'false');
          return;
        }
        FTSpeech.speakText(stop.guia);
        speak.textContent = '⏹ Detener';
        speak.setAttribute('aria-pressed', 'true');
        FTSpeech.onEnd(function () {
          speak.textContent = '🔊 Escuchar';
          speak.setAttribute('aria-pressed', 'false');
        });
      });
    }

    var enc = $('btn-encuentro');
    if (enc && route.punto_encuentro) {
      enc.addEventListener('click', function () {
        FTGeo.openDirections(route.punto_encuentro.lat, route.punto_encuentro.lng, route.punto_encuentro.nombre);
      });
    }

    var share = $('btn-share');
    if (share) share.addEventListener('click', function () { shareStop(stop, share); });

    var insta = $('btn-insta');
    if (insta) insta.addEventListener('click', function () { shareReto(stop, insta); });

    document.querySelectorAll('[data-quiz-option]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleAnswer(index, parseInt(btn.dataset.quizOption, 10));
      });
    });
  }

  function handleAnswer(stopIndex, option) {
    if (answers[stopIndex] !== undefined) return;
    answers[stopIndex] = option;
    saveProgress();

    var q = stops[stopIndex].acertijo;
    document.querySelectorAll('[data-quiz-option]').forEach(function (btn) {
      var oi = parseInt(btn.dataset.quizOption, 10);
      btn.disabled = true;
      if (oi === q.correcta) btn.classList.add('quiz-option--correct');
      else if (oi === option) btn.classList.add('quiz-option--wrong');
    });

    var fb = $('quiz-feedback');
    if (fb) {
      var ok = option === q.correcta;
      fb.innerHTML = '<p class="quiz-feedback">' + (ok ? '✅ <strong>¡Correcto!</strong> ' : '❌ <strong>Casi.</strong> ') +
                     esc(q.explicacion) + '</p>';
    }
  }

  /* ───────── navegación ───────── */
  function nextStop() {
    if (index >= stops.length - 1) { renderFinish(); return; }
    renderStop(index + 1);
    saveProgress();
  }

  function prevStop() {
    if (finished) { renderStop(stops.length - 1); return; }
    if (index === 0) return;
    renderStop(index - 1);
    saveProgress();
  }

  function updateNavButtons() {
    var prev = $('nav-prev');
    var next = $('nav-next');
    if (prev) prev.disabled = index === 0 && !finished;
    if (next) {
      next.disabled = finished;
      next.innerHTML = index === stops.length - 1 ? 'Terminar 🏁' : 'Siguiente ▶';
    }
  }

  /* ───────── geolocalización ───────── */
  function updateDistance() {
    var el = $('stop-distance');
    if (!el) return;
    var stop = stops[index];

    if (!window.FTGeo || !FTGeo.supported()) {
      el.textContent = '📏 Distancia no disponible';
      return;
    }
    if (!userPos) {
      el.textContent = '📏 Buscando tu posición…';
      return;
    }

    var d = FTGeo.calculateDistance(userPos.lat, userPos.lng, stop.lat, stop.lng);
    if (d < NEAR_M) {
      el.innerHTML = '<span class="badge-cerca">📍 ¡Cerca! ' + FTGeo.formatDistance(d) + '</span>';
    } else if (d > FAR_M) {
      el.innerHTML = '<span class="badge-lejos">📏 Estás a ' + FTGeo.formatDistance(d) + '</span>';
    } else {
      el.textContent = '📏 Estás a ' + FTGeo.formatDistance(d);
    }
  }

  function startGeolocation() {
    if (!window.FTGeo || !FTGeo.supported()) return;
    FTGeo.watchPosition(function (pos) {
      userPos = pos;
      updateDistance();
      if (mapReady) FTMap.addUserMarker(pos.lat, pos.lng);
    }, function () {
      var el = $('stop-distance');
      if (el) el.textContent = '📏 Activa la ubicación para ver la distancia';
    });
  }

  /* ───────── mapa ───────── */
  function setupMap() {
    var toggle = $('map-toggle');
    var panel = $('map-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (!open) return;

      if (!mapReady && window.FTMap && FTMap.available()) {
        FTMap.initMap('tour-map', [stops[index].lat, stops[index].lng], 15);
        FTMap.addRoutePolyline(stops.map(function (s) { return [s.lat, s.lng]; }));
        stops.forEach(function (s, i) { FTMap.addStopMarker(s.lat, s.lng, i + 1, s.titulo); });
        FTMap.fitBoundsToRoute();
        if (userPos) FTMap.addUserMarker(userPos.lat, userPos.lng);
        mapReady = true;
      }
      if (mapReady) {
        FTMap.invalidate();
        FTMap.highlightStop(index, completed);
      }
    });

    var dir = $('btn-directions');
    if (dir) {
      dir.addEventListener('click', function () {
        var s = stops[index];
        FTGeo.openDirections(s.lat, s.lng, s.titulo);
      });
    }
  }

  function setupOutline() {
    $('route-summary').textContent = route.titulo + ' · ' + route.distancia + ' · ' + route.duracion + ' (estimación con paradas)';
    var lats = stops.map(function (s) { return s.lat; });
    var lngs = stops.map(function (s) { return s.lng; });
    var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
    var minLng = Math.min.apply(null, lngs), maxLng = Math.max.apply(null, lngs);
    var points = stops.map(function (s) {
      return [30 + (s.lng - minLng) / (maxLng - minLng || 1) * 420,
        190 - (s.lat - minLat) / (maxLat - minLat || 1) * 160];
    });
    $('route-outline').innerHTML = '<figure class="ft-schematic"><svg viewBox="0 0 480 220" role="img" aria-label="Esquema de las paradas, norte arriba. No es un mapa de calles.">' +
      '<polyline points="' + points.map(function (p) { return p.join(','); }).join(' ') + '" />' +
      points.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" /><text x="' + p[0] + '" y="' + (p[1] + 5) + '">' + (i + 1) + '</text>'; }).join('') +
      '</svg><figcaption>Esquema sin conexión · norte arriba · línea entre paradas, no recorrido por calles.</figcaption></figure>' +
      '<ol class="ft-stop-list">' + stops.map(function (stop, i) {
        return '<li><button class="btn-soft" type="button" data-stop-index="' + i + '">' + (i + 1) + '. ' + esc(stop.titulo) + '</button><p>' + esc(stop.tiempo_estimado) + ' aquí' + (stop.distancia_siguiente ? ' · ' + esc(stop.distancia_siguiente) + ' a la siguiente' : ' · Fin') + '</p></li>';
      }).join('') + '</ol>';
    document.querySelectorAll('[data-stop-index]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelector('.ft-preparation').open = false;
        renderStop(Number(button.dataset.stopIndex)); saveProgress();
      });
    });
  }

  /* ───────── compartir ───────── */
  function feedbackBtn(btn, text) {
    var original = btn.textContent;
    btn.textContent = text;
    setTimeout(function () { btn.textContent = original; }, 2600);
  }

  async function shareStop(stop, btn) {
    var payload = {
      title: 'Parada ' + stop.numero + ' · ' + stop.titulo + ' · Mijn Utrecht Free Tour',
      text: stop.guia.substring(0, 110) + '…',
      url: location.href
    };
    try {
      if (navigator.share) { await navigator.share(payload); return; }
      await navigator.clipboard.writeText(location.href);
      feedbackBtn(btn, '✅ Enlace copiado');
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      feedbackBtn(btn, '⚠️ Copia la URL');
    }
  }

  async function shareReto(stop, btn) {
    var texto = '📸 Reto en ' + stop.titulo + ': ' + stop.reto_foto + ' #MijnUtrechtTour';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Reto de foto · Mijn Utrecht', text: texto, url: location.href });
        return;
      }
      await navigator.clipboard.writeText(texto + ' — ' + location.href);
      feedbackBtn(btn, '✅ Texto copiado');
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      feedbackBtn(btn, '⚠️ No se pudo compartir');
    }
  }

  /* ───────── pantalla final ───────── */
  function renderFinish() {
    finished = true;
    if (window.FTSpeech) FTSpeech.stopSpeaking();
    saveProgress();

    var total = stops.filter(function (s) { return !!s.acertijo; }).length;
    var aciertos = 0;
    stops.forEach(function (s, i) {
      if (s.acertijo && answers[i] === s.acertijo.correcta) aciertos++;
    });

    var badges = ['<span class="ft-badge">🚶 Explorador</span>'];
    if (total && aciertos === total) badges.push('<span class="ft-badge">📚 Historiador</span>');
    if (aciertos >= 1) badges.push('<span class="ft-badge">🧩 Curioso</span>');


    $('stop-root').innerHTML =
      '<article class="stop-card ft-finish">' +
        '<span class="ft-finish__medal" aria-hidden="true">🏆</span>' +
        '<h1>' + (completed.length === stops.length ? '¡Has completado el tour!' : 'Fin de la ruta') + '</h1>' +
        '<p>' + completed.length + ' de ' + stops.length + ' paradas marcadas como visitadas.</p>' +
        '<p class="muted">' + esc(route.titulo) + ' · ' + stops.length + ' paradas · ' + esc(route.distancia) + '</p>' +
        (total
          ? '<p class="ft-finish__score"><b>' + aciertos + '</b> de ' + total + ' acertijos correctos</p>'
          : '') +
        '<div class="ft-badges">' + badges.join('') + '</div>' +
        '<button type="button" class="btn-cta" id="btn-share-finish">↗ Compartir la ruta</button>' +
        '<div class="btn-row" style="justify-content:center;margin-top:1rem">' +
          '<button type="button" class="btn-soft" id="btn-restart">🔁 Repetir la ruta</button>' +
          '<a class="btn-soft" href="index.html">🚶 Otra ruta</a>' +
          '<a class="btn-soft" href="../index.html">🏠 Mijn Utrecht</a>' +
        '</div>' +
      '</article>';

    updateProgress();
    updateNavButtons();
    $('stop-root').querySelector('h1').tabIndex = -1;
    $('stop-root').querySelector('h1').focus({preventScroll: true});

    $('btn-restart').addEventListener('click', function () {
      resetProgress();
      renderStop(0);
    });
    $('btn-share-finish').addEventListener('click', async function () {
      var btn = this;
      var payload = {
        title: route.titulo + ' · Free Tour de Utrecht',
        text: 'Un paseo por Utrecht: ' + route.titulo + ' · ' + route.distancia + '. #MijnUtrechtTour',
        url: location.origin + location.pathname + '?ruta=' + route.id
      };
      try {
        if (navigator.share) { await navigator.share(payload); return; }
        await navigator.clipboard.writeText(payload.text + ' ' + payload.url);
        feedbackBtn(btn, '✅ Copiado al portapapeles');
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        feedbackBtn(btn, '⚠️ No se pudo compartir');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ───────── swipe y teclado ───────── */
  function setupGestures() {
    var root = $('stop-root');
    if (!root) return;
    var startX = 0, startY = 0;

    root.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].screenX;
      startY = e.changedTouches[0].screenY;
    }, { passive: true });

    root.addEventListener('touchend', function (e) {
      var dx = startX - e.changedTouches[0].screenX;
      var dy = Math.abs(startY - e.changedTouches[0].screenY);
      if (Math.abs(dx) > 60 && dy < 60) {
        if (dx > 0) nextStop(); else prevStop();
      }
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      var dlg = $('resume-dialog');
      if (dlg && dlg.classList.contains('is-open')) {
        // Con el diálogo abierto no se navega por detrás; Escape = empezar de cero
        if (e.key === 'Escape') $('resume-no').click();
        return;
      }
      if (e.target && e.target.closest && e.target.closest('input, textarea, button')) return;
      if (e.key === 'ArrowRight') nextStop();
      if (e.key === 'ArrowLeft') prevStop();
    });
  }

  /* ───────── diálogo de reanudar ───────── */
  function askResume(saved, onYes, onNo) {
    var dlg = $('resume-dialog');
    if (!dlg) { onNo(); return; }
    $('resume-text').textContent = 'Lo dejaste en la parada ' + (saved.currentStop + 1) +
                                  ' de ' + stops.length + '. ¿Sigues desde ahí?';
    dlg.classList.add('is-open');
    dlg.querySelector('.ft-dialog__panel').focus();

    var close = function () { dlg.classList.remove('is-open'); };
    $('resume-yes').onclick = function () { close(); onYes(); };
    $('resume-no').onclick = function () { close(); onNo(); };
  }

  /* ───────── metadatos por ruta ─────────
     Las dos rutas viven en la misma URL con distinto ?ruta=, así que
     canonical y Open Graph se ajustan al abrir la ruta: si no, compartir
     cualquiera de las dos enseña la misma tarjeta. */
  function actualizarMetadatos(data) {
    var base = location.origin + location.pathname.replace(/[^/]*$/, '');
    var url = base + 'ruta.html?ruta=' + data.id;
    var desc = data.subtitulo + ' · ' + data.paradas + ' paradas, ' + data.distancia +
               ' y ' + data.duracion + ' caminando por Utrecht, en español.';

    function meta(sel, attr, valor) {
      var el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        var partes = sel.match(/\[(.+?)=["'](.+?)["']\]/);
        if (partes) el.setAttribute(partes[1], partes[2]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, valor);
    }

    var canon = document.head.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement('link');
      canon.rel = 'canonical';
      document.head.appendChild(canon);
    }
    canon.href = url;

    meta('meta[name="description"]', 'content', desc);
    meta('meta[property="og:title"]', 'content', data.titulo + ' · Free Tour de Utrecht');
    meta('meta[property="og:description"]', 'content', desc);
    meta('meta[property="og:url"]', 'content', url);
    if (data.portada) {
      meta('meta[property="og:image"]', 'content', new URL(data.portada, location.href).href);
    }
  }

  /* ───────── arranque ───────── */
  function loadRoute(routeId) {
    return fetch('data/ruta-' + routeId + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        route = data;
        stops = data.paradas_lista || [];
        if (!stops.length) throw new Error('Ruta sin paradas');

        document.title = data.titulo + ' · Free Tour · Mijn Utrecht';
        var t = $('tour-title');
        if (t) t.textContent = data.icono + ' ' + data.titulo;
        actualizarMetadatos(data);

        setupOutline();
        if (window.FTOffline) FTOffline.setup(data);
        setupMap();
        setupGestures();
        startGeolocation();

        var prev = $('nav-prev');
        var next = $('nav-next');
        if (prev) prev.addEventListener('click', prevStop);
        if (next) next.addEventListener('click', nextStop);

        var saved = loadProgress();
        var hasProgress = saved && !saved.completedAt &&
                          (saved.currentStop > 0 || (saved.completedStops || []).length > 0);

        var requested = Number(getParam('parada'));
        var hasRequested = Number.isInteger(requested) && requested >= 1 && requested <= stops.length;
        if (hasRequested) {
          if (saved && !saved.completedAt) {
            answers = saved.answers || {};
            completed = (saved.completedStops || []).filter(function (n, i, a) { return Number.isInteger(n) && n >= 0 && n < stops.length && a.indexOf(n) === i; });
          }
          renderStop(requested - 1);
        } else if (hasProgress) {
          // Se pinta ya donde lo dejó y el diálogo solo ofrece empezar de cero
          answers = saved.answers || {};
          completed = (saved.completedStops || []).filter(function (n, i, a) { return Number.isInteger(n) && n >= 0 && n < stops.length && a.indexOf(n) === i; });
          renderStop(saved.currentStop || 0);
          askResume(saved, function () { /* sigue donde estaba */ }, function () {
            resetProgress();
            renderStop(0);
          });
        } else {
          if (saved && saved.completedAt) resetProgress();
          renderStop(0);
        }
      })
      .catch(function (err) {
        console.warn('Free Tour:', err);
        var root = $('stop-root');
        if (root) {
          root.innerHTML = '<div class="ft-status">' +
            '<p><strong>No se ha podido cargar esta ruta.</strong></p>' +
            '<p>Comprueba tu conexión o vuelve al listado.</p>' +
            '<p style="margin-top:1.5rem"><a class="btn-soft" href="index.html">← Ver las rutas disponibles</a></p>' +
          '</div>';
        }
      });
  }

  function setupOfflineNote() {
    var note = $('offline-note');
    if (!note) return;
    var sync = function () { note.classList.toggle('is-visible', !navigator.onLine); };
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    sync();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupOfflineNote();

    var id = (getParam('ruta') || 'oculto').toLowerCase();
    if (id !== 'oculto' && id !== 'locura') id = 'oculto';
    loadRoute(id);


  });
})();
