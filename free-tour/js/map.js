/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · free-tour/js/map.js
   Mapa Leaflet del tour: polilínea de la ruta, pins numerados
   y punto del usuario. Expone window.FTMap.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var map = null;
  var polyline = null;
  var stopMarkers = [];
  var userMarker = null;

  function available() {
    return typeof L !== 'undefined';
  }

  function initMap(containerId, center, zoom) {
    if (!available() || map) return map;
    var el = document.getElementById(containerId);
    if (!el) return null;

    map = L.map(containerId, {
      center: center || [52.0907, 5.1214],
      zoom: zoom || 15,
      scrollWheelZoom: false,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    return map;
  }

  function addRoutePolyline(coords) {
    if (!map || !coords || coords.length < 2) return;
    if (polyline) map.removeLayer(polyline);
    polyline = L.polyline(coords, {
      color: '#3A6B7C',
      weight: 4,
      opacity: 0.85,
      dashArray: '1 0'
    }).addTo(map);
  }

  function addStopMarker(lat, lng, number, title) {
    if (!map) return null;
    var marker = L.marker([lat, lng], {
      title: number + '. ' + title,
      icon: L.divIcon({
        className: '',
        html: '<div class="ft-pin">' + number + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      })
    }).addTo(map).bindPopup('<strong>' + number + '. ' + title + '</strong>');
    stopMarkers.push(marker);
    return marker;
  }

  /** Repinta los pins: actual en ladrillo, ya vistos en verde. */
  function highlightStop(index, completed) {
    stopMarkers.forEach(function (m, i) {
      var cls = 'ft-pin';
      if (i === index) cls += ' ft-pin--current';
      else if (completed && completed.indexOf(i) > -1) cls += ' ft-pin--done';
      m.setIcon(L.divIcon({
        className: '',
        html: '<div class="' + cls + '">' + (i + 1) + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      }));
    });
  }

  function addUserMarker(lat, lng) {
    if (!map) return;
    if (userMarker) {
      userMarker.setLatLng([lat, lng]);
      return;
    }
    userMarker = L.marker([lat, lng], {
      title: 'Tu posición',
      zIndexOffset: 500,
      icon: L.divIcon({
        className: '',
        html: '<div class="ft-user-dot"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      })
    }).addTo(map);
  }

  function fitBoundsToRoute() {
    if (!map || !polyline) return;
    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
  }

  function panTo(lat, lng, zoom) {
    if (!map) return;
    map.setView([lat, lng], zoom || map.getZoom());
  }

  function invalidate() {
    if (map) setTimeout(function () { map.invalidateSize(); }, 120);
  }

  global.FTMap = {
    available: available,
    initMap: initMap,
    addRoutePolyline: addRoutePolyline,
    addStopMarker: addStopMarker,
    highlightStop: highlightStop,
    addUserMarker: addUserMarker,
    fitBoundsToRoute: fitBoundsToRoute,
    panTo: panTo,
    invalidate: invalidate
  };
})(window);
