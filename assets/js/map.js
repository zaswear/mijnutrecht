/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · map.js
   Mapa Leaflet: puntos de interés, buscador + lista, filtros
   por categoría, modo noche y rutas ciclistas en GPX.
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

  // Normaliza para buscar sin tildes ni mayúsculas
  var norm = function (s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  var esTactil = window.matchMedia('(hover: none)').matches;

  var map = L.map('map', {
    scrollWheelZoom: false,
    // En táctil el arrastre empieza desactivado: si no, un swipe vertical
    // que empiece sobre el mapa mueve el mapa en vez de bajar la página.
    dragging: !esTactil,
    tap: false
  }).setView([52.0907, 5.1214], 14);

  map.on('click', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  /* Capa de activación en móvil: hasta que no se toca, la página manda */
  if (esTactil) {
    var velo = document.createElement('button');
    velo.type = 'button';
    velo.className = 'map-activar';
    velo.innerHTML = '<span>👆 Toca para mover el mapa</span>';
    velo.setAttribute('aria-label', 'Activar el mapa para poder moverlo con el dedo');
    mapEl.appendChild(velo);
    velo.addEventListener('click', function () {
      map.dragging.enable();
      velo.remove();
    });
  }

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
    orange: { bg: '#E86A33', glyph: '★', etiqueta: 'Imprescindible' },
    green: { bg: '#5A8F6E', glyph: '🍴', etiqueta: 'Gastronomía' },
    blue: { bg: '#3A6B7C', glyph: '🌳', etiqueta: 'Parque o canal' },
    red: { bg: '#B3382C', glyph: '✕', etiqueta: 'Mejor evitarlo' }
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

  var sitios = [];          // { lugar, marker, texto }
  var filtroColor = 'all';
  var filtroTexto = '';

  var listaEl = document.getElementById('puntos-list');
  var countEl = document.getElementById('puntos-count');
  var searchEl = document.getElementById('puntos-search');

  function visibles() {
    return sitios.filter(function (s) {
      if (filtroColor !== 'all' && s.lugar.color !== filtroColor) return false;
      if (filtroTexto && s.texto.indexOf(filtroTexto) === -1) return false;
      return true;
    });
  }

  function pintarLista() {
    if (!listaEl) return;
    var lista = visibles();

    if (countEl) {
      countEl.textContent = lista.length === sitios.length
        ? sitios.length + ' sitios · todos los que recomiendo o evito'
        : lista.length + ' de ' + sitios.length + ' sitios';
    }

    if (!lista.length) {
      listaEl.innerHTML = '<li class="punto-item punto-item--vacio">Ningún sitio coincide. Prueba con otra palabra o quita el filtro.</li>';
      return;
    }

    listaEl.innerHTML = lista.map(function (s) {
      var l = s.lugar;
      var cat = COLORES[l.color] || {};
      return '<li class="punto-item">' +
        '<button type="button" class="punto-item__btn" data-punto="' + s.id + '">' +
          '<span class="punto-item__punto" style="background:' + (cat.bg || '#6B5E55') + '" aria-hidden="true"></span>' +
          '<span class="punto-item__texto">' +
            '<span class="punto-item__nombre">' + esc(l.nombre) + '</span>' +
            (l.nota ? '<span class="punto-item__nota">' + esc(l.nota) + '</span>' : '') +
          '</span>' +
        '</button>' +
        (l.google_maps_url
          ? '<a class="punto-item__gmaps" href="' + esc(l.google_maps_url) + '" target="_blank" rel="noopener"' +
            ' aria-label="Abrir ' + esc(l.nombre) + ' en Google Maps">↗</a>'
          : '') +
      '</li>';
    }).join('');
  }

  function pintarMarcadores() {
    var lista = visibles();
    var ids = lista.map(function (s) { return s.id; });
    sitios.forEach(function (s) {
      if (ids.indexOf(s.id) > -1) s.marker.addTo(map);
      else s.marker.remove();
    });
  }

  function refrescar() {
    pintarMarcadores();
    pintarLista();
  }

  function irAlPunto(id) {
    var s = sitios[id];
    if (!s) return;
    map.setView([s.lugar.coordenadas[0], s.lugar.coordenadas[1]], 17, { animate: true });
    s.marker.openPopup();
    if (esTactil) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  fetch('./maps/puntos.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var n = document.getElementById('n-puntos');
      if (n) n.textContent = String(data.length);

      data.forEach(function (lugar, i) {
        var tipo = lugar.tipo ? (Array.isArray(lugar.tipo) ? lugar.tipo.join(' · ') : lugar.tipo) : '';
        var cat = COLORES[lugar.color] || {};
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

        sitios.push({
          id: i,
          lugar: lugar,
          marker: m,
          texto: norm([lugar.nombre, lugar.descripcion, lugar.nota, tipo, cat.etiqueta].join(' '))
        });
      });

      refrescar();
    })
    .catch(function () {
      console.warn('No se pudo cargar maps/puntos.json');
      if (countEl) countEl.textContent = 'No se han podido cargar los sitios.';
    });

  /* Buscador */
  if (searchEl) {
    var t;
    searchEl.addEventListener('input', function (e) {
      clearTimeout(t);
      var v = e.target.value;
      t = setTimeout(function () {
        filtroTexto = norm(v.trim());
        refrescar();
      }, 140);
    });
  }

  /* Clic en un resultado de la lista */
  if (listaEl) {
    listaEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-punto]');
      if (btn) irAlPunto(parseInt(btn.dataset.punto, 10));
    });
  }

  /* Filtros por categoría */
  document.querySelectorAll('[data-map-filter] .chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('[data-map-filter]').querySelectorAll('.chip').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      filtroColor = btn.dataset.color;
      refrescar();
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
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
