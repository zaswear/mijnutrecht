/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · map.js
   Mapa Leaflet: puntos de interés, filtros por categoría,
   modo noche y rutas ciclistas en GPX.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var map = L.map('map', { scrollWheelZoom: false }).setView([52.0907, 5.1214], 14);
  map.on('click', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  var attr = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>';
  var dayTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: attr, maxZoom: 19 });
  var nightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: attr, maxZoom: 19 });
  dayTiles.addTo(map);

  /* Modo noche del mapa */
  var isNight = false;
  var NightControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      var btn = L.DomUtil.create('button', 'leaflet-bar map-night-btn');
      btn.type = 'button';
      btn.title = 'Modo noche del mapa';
      btn.setAttribute('aria-label', 'Modo noche del mapa');
      btn.textContent = '🌙';
      L.DomEvent.on(btn, 'click', function (e) {
        L.DomEvent.stop(e);
        isNight = !isNight;
        if (isNight) { map.removeLayer(dayTiles); nightTiles.addTo(map); }
        else { map.removeLayer(nightTiles); dayTiles.addTo(map); }
        btn.textContent = isNight ? '☀️' : '🌙';
        btn.title = isNight ? 'Modo día del mapa' : 'Modo noche del mapa';
      });
      return btn;
    }
  });
  map.addControl(new NightControl());

  /* Marcadores */
  var COLORES = {
    orange: { bg: '#E86A33', glyph: '★' },
    green: { bg: '#5A8F6E', glyph: '🍴' },
    blue: { bg: '#3A6B7C', glyph: '🌳' },
    red: { bg: '#B3382C', glyph: '✕' }
  };

  function makeIcon(color) {
    var c = COLORES[color] || { bg: '#6B5E55', glyph: '•' };
    return L.divIcon({
      className: '',
      html: '<div style="width:28px;height:28px;background:' + c.bg + ';border:2.5px solid #fff;border-radius:50%;' +
            'box-shadow:0 2px 6px rgba(26,22,20,.35);display:flex;align-items:center;justify-content:center;' +
            'font-size:13px;line-height:1;color:#fff">' + c.glyph + '</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }

  var markers = [];

  fetch('./maps/puntos.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var n = document.getElementById('n-puntos');
      if (n) n.textContent = String(data.length);

      data.forEach(function (lugar) {
        var tipo = lugar.tipo ? (Array.isArray(lugar.tipo) ? lugar.tipo.join(' · ') : lugar.tipo) : '';
        var html =
          '<div class="popup">' +
            '<p class="popup__title">' + esc(lugar.nombre) + '</p>' +
            (lugar.descripcion ? '<p class="popup__desc">' + esc(lugar.descripcion) + '</p>' : '') +
            (lugar.nota ? '<p class="popup__nota">' + esc(lugar.nota) + '</p>' : '') +
            (lugar.google_maps_url
              ? '<a class="popup__link" href="' + esc(lugar.google_maps_url) + '" target="_blank" rel="noopener">Ver en Google Maps →</a>'
              : '') +
            (tipo ? '<p class="popup__tipo">' + esc(tipo) + '</p>' : '') +
          '</div>';

        var m = L.marker(lugar.coordenadas, { icon: makeIcon(lugar.color), title: lugar.nombre })
          .addTo(map)
          .bindPopup(html);
        m._color = lugar.color;
        markers.push(m);
      });
    })
    .catch(function () { console.warn('No se pudo cargar maps/puntos.json'); });

  /* Filtros */
  document.querySelectorAll('[data-map-filter] .chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('[data-map-filter]').querySelectorAll('.chip').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      var color = btn.dataset.color;
      markers.forEach(function (m) {
        if (color === 'all' || m._color === color) m.addTo(map);
        else m.remove();
      });
    });
  });

  /* Rutas ciclistas GPX */
  var RUTA_COLORES = ['#E86A33', '#3A6B7C', '#5A8F6E', '#8C5AA0', '#B3382C'];
  var capas = {};
  var lista = document.getElementById('rutas-list');

  function cargarGPX(archivo, color) {
    if (capas[archivo] || typeof L.GPX === 'undefined') return;
    new L.GPX('rutas/' + archivo, {
      async: true,
      polyline_options: { color: color, weight: 4, opacity: 0.85 },
      marker_options: { startIconUrl: null, endIconUrl: null, shadowUrl: null }
    }).on('loaded', function (e) {
      capas[archivo] = e.target;
      e.target.remove();
    }).addTo(map);
  }

  window.toggleRuta = function (archivo, color, btn) {
    var layer = capas[archivo];
    if (!layer) return;
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      btn.textContent = 'Ver en mapa';
      btn.style.background = '';
      btn.style.color = color;
      btn.setAttribute('aria-pressed', 'false');
    } else {
      layer.addTo(map);
      map.fitBounds(layer.getBounds(), { padding: [40, 40] });
      btn.textContent = 'Ocultar';
      btn.style.background = color;
      btn.style.color = '#fff';
      btn.setAttribute('aria-pressed', 'true');
      document.getElementById('mapa').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (lista) {
    fetch('./rutas/index.json')
      .then(function (r) { return r.json(); })
      .then(function (rutas) {
        var n = document.getElementById('n-rutas');
        if (n) n.textContent = String(rutas.length);

        lista.innerHTML = rutas.map(function (ruta, i) {
          var color = RUTA_COLORES[i % RUTA_COLORES.length];
          var enlace = ruta.archivo
            ? '<a class="ruta-link" href="rutas/' + esc(ruta.archivo) + '" download>Descargar GPX</a>'
            : '<a class="ruta-link" href="' + esc(ruta.fuente) + '" target="_blank" rel="noopener">Ver ruta ↗</a>';
          return '<article class="ruta-card">' +
            '<div class="ruta-card__head"><span aria-hidden="true">' + esc(ruta.emoji || '🚴') + '</span>' +
              '<h4 class="ruta-card__name">' + esc(ruta.nombre) + '</h4></div>' +
            '<p class="ruta-card__meta"><span>' + esc(ruta.distancia) + '</span><span>' + esc(ruta.duracion) + '</span><span>' + esc(ruta.dificultad) + '</span></p>' +
            '<p class="ruta-card__desc">' + esc(ruta.descripcion) + '</p>' +
            '<div class="ruta-card__actions">' +
              (ruta.archivo
                ? '<button type="button" class="ruta-toggle" aria-pressed="false" style="color:' + color + '" ' +
                  'onclick="toggleRuta(\'' + esc(ruta.archivo) + '\',\'' + color + '\',this)">Ver en mapa</button>'
                : '') +
              enlace +
            '</div>' +
          '</article>';
        }).join('');

        rutas.forEach(function (ruta, i) {
          if (ruta.archivo) cargarGPX(ruta.archivo, RUTA_COLORES[i % RUTA_COLORES.length]);
        });
      })
      .catch(function () {
        lista.innerHTML = '<p class="muted small">No se han podido cargar las rutas ciclistas.</p>';
      });
  }
})();
