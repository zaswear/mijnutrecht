/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · free-tour/js/geolocation.js
   Posición del usuario y distancias (fórmula de Haversine).
   Expone window.FTGeo.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var watchId = null;

  function supported() {
    return 'geolocation' in navigator;
  }

  /** Posición puntual. Devuelve una promesa con {lat, lng, accuracy}. */
  function getUserPosition(options) {
    return new Promise(function (resolve, reject) {
      if (!supported()) {
        reject(new Error('Geolocalización no disponible en este navegador'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        },
        reject,
        Object.assign({ enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }, options || {})
      );
    });
  }

  /** Seguimiento continuo. callback({lat,lng,accuracy}), onError(err). */
  function watchPosition(callback, onError) {
    if (!supported()) {
      if (onError) onError(new Error('Geolocalización no disponible'));
      return null;
    }
    stopWatching();
    watchId = navigator.geolocation.watchPosition(
      function (pos) {
        callback({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      function (err) { if (onError) onError(err); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
    return watchId;
  }

  function stopWatching() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  /** Distancia en metros entre dos coordenadas (Haversine). */
  function calculateDistance(lat1, lng1, lat2, lng2) {
    var R = 6371000;
    var toRad = function (d) { return d * Math.PI / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  /** "120 m" · "1,2 km" */
  function formatDistance(meters) {
    if (meters == null || isNaN(meters)) return '—';
    if (meters < 1000) return Math.round(meters) + ' m';
    return (meters / 1000).toFixed(1).replace('.', ',') + ' km';
  }

  /** Abre la app de mapas del móvil con indicaciones a pie. */
  function openDirections(lat, lng, label) {
    var q = lat + ',' + lng;
    var url = 'https://www.google.com/maps/dir/?api=1&destination=' +
              encodeURIComponent(q) + '&travelmode=walking';
    if (label) url += '&destination_place_id=';
    window.open(url, '_blank', 'noopener');
  }

  global.FTGeo = {
    supported: supported,
    getUserPosition: getUserPosition,
    watchPosition: watchPosition,
    stopWatching: stopWatching,
    calculateDistance: calculateDistance,
    formatDistance: formatDistance,
    openDirections: openDirections
  };
})(window);
