/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · weather.js
   Clima actual de Utrecht (Open-Meteo, sin API key) con
   recomendación local según el tiempo que haga.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var tempEl = document.getElementById('weather-temp');
  if (!tempEl) return;

  var iconEl = document.getElementById('weather-icon');
  var descEl = document.getElementById('weather-desc');
  var adviceEl = document.getElementById('weather-advice');
  var forecastEl = document.getElementById('weather-forecast');
  var timeEl = document.getElementById('weather-time');

  function icono(code) {
    if (code === 0) return '☀️';
    if (code >= 1 && code <= 3) return '⛅';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '🌨️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95) return '🌩️';
    return '⛅';
  }

  function consejo(code) {
    if (code === 0) return ['Cielos despejados', 'Día espectacular: alquila una bici, recorre los canales y siéntate en una terraza de los werven.'];
    if (code <= 3) return ['Parcialmente despejado', 'Buen momento para caminar por el centro histórico y subir a la Domtoren.'];
    if (code === 45 || code === 48) return ['Niebla típica', 'Utrecht misteriosa: la Torre del Dom entre la niebla es la mejor foto que te llevarás.'];
    if (code <= 57) return ['Llovizna (motregen)', 'Llovizna fina holandesa. Chubasquero mejor que paraguas si vas en bici; si no, Speelklok o Spoorwegmuseum.'];
    if (code <= 67) return ['Lluvia', 'Día de interior: catedral, museos o una cerveza artesana bajo las bóvedas del Café Olivier.'];
    if (code <= 77) return ['Nieve', 'Poco habitual y precioso. Los canales con nieve merecen un paseo corto y un chocolate caliente después.'];
    if (code <= 82) return ['Chubascos pasajeros', 'El cielo cambia rápido: alterna paseos cortos con paradas en cafés.'];
    if (code >= 95) return ['Tormenta', 'Quédate a cubierto. Buen plan de museos o de bruine café.'];
    return ['Templado típico', 'Clima cambiante: lleva siempre un cortavientos.'];
  }

  var url = 'https://api.open-meteo.com/v1/forecast?latitude=52.0907&longitude=5.1214' +
            '&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min' +
            '&forecast_days=3&timezone=Europe/Amsterdam';

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var code = data.current.weather_code;
      var texto = consejo(code);

      tempEl.textContent = Math.round(data.current.temperature_2m) + '°C';
      if (iconEl) iconEl.textContent = icono(code);
      if (descEl) descEl.textContent = texto[0];
      if (adviceEl) adviceEl.textContent = texto[1];
      if (timeEl) timeEl.textContent = 'Ahora mismo en Utrecht';

      if (forecastEl && data.daily && data.daily.time) {
        var dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        var html = '';
        for (var i = 1; i <= 2; i++) {
          if (data.daily.time[i] == null) continue;
          var d = new Date(data.daily.time[i] + 'T00:00:00');
          var nombre = i === 1 ? 'Mañana' : dias[d.getDay()];
          html += '<div class="weather__day">' +
            '<span class="weather__day-name">' + nombre + '</span>' +
            '<span class="weather__day-icon">' + icono(data.daily.weather_code[i]) + '</span>' +
            '<span class="weather__day-temp">' + Math.round(data.daily.temperature_2m_max[i]) + '° / ' +
              Math.round(data.daily.temperature_2m_min[i]) + '°</span>' +
          '</div>';
        }
        forecastEl.innerHTML = html;
      }
    })
    .catch(function () {
      tempEl.textContent = '--°C';
      if (timeEl) timeEl.textContent = 'Sin conexión con el servicio';
      if (descEl) descEl.textContent = 'Templado típico';
      if (adviceEl) adviceEl.textContent = 'Utrecht tiene un clima muy cambiante: lleva siempre cortavientos y algo impermeable.';
    });
})();
