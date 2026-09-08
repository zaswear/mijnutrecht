(function () {
  'use strict';
  function ask(worker, type, route) {
    return new Promise(function (resolve, reject) {
      var channel = new MessageChannel();
      var timer = setTimeout(function () { channel.port1.close(); reject(new Error('Tiempo agotado')); }, 30000);
      channel.port1.onmessage = function (event) {
        clearTimeout(timer); channel.port1.close();
        if (event.data.error) reject(new Error('Descarga')); else resolve(event.data);
      };
      worker.postMessage({type: type, route: route}, [channel.port2]);
    });
  }
  window.FTOffline = { setup: async function (route) {
    var button = document.getElementById('download-route');
    var status = document.getElementById('download-status');
    var inventory = document.getElementById('download-inventory');
    if (!button || !status) return;
    function show(data) {
      status.textContent = data.ready ? 'Ruta preparada para leer sin conexión en este navegador.' : 'Descarga incompleta. Con conexión, pulsa Guardar para preparar la ruta.';
      inventory.textContent = 'Textos y controles: ' + data.coreSaved + '/' + data.coreTotal + ' archivos. Fotos disponibles: ' + data.photosSaved + '/' + data.photosTotal + '.' +
        (data.missingPhotos ? ' Hay ' + data.missingPhotos + ' paradas sin foto disponible.' : '');
      button.textContent = data.ready ? 'Actualizar descarga' : 'Guardar ruta sin conexión';
    }
    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      status.textContent = 'Este navegador no permite guardar la ruta sin conexión. Puedes leerla mientras tengas conexión.';
      button.disabled = true; return;
    }
    try {
      var registration = await navigator.serviceWorker.register('sw.js');
      var worker = registration.installing || registration.waiting || registration.active;
      if (!worker) throw new Error('Registro');
      if (worker.state !== 'activated') await new Promise(function (resolve, reject) {
        var timer = setTimeout(function () { worker.removeEventListener('statechange', changed); reject(new Error('Registro')); }, 10000);
        function changed() {
          if (worker.state === 'activated' || worker.state === 'redundant') {
            clearTimeout(timer); worker.removeEventListener('statechange', changed);
            if (worker.state === 'activated') resolve(); else reject(new Error('Registro'));
          }
        }
        worker.addEventListener('statechange', changed); changed();
      });
      button.disabled = false;
      button.addEventListener('click', async function () {
        button.disabled = true;
        status.textContent = 'Guardando textos, controles y fotos disponibles…';
        try { show(await ask(worker, 'DOWNLOAD', route.id)); }
        catch (e) { status.textContent = 'No se pudo completar la descarga. Comprueba la conexión y vuelve a intentarlo.'; }
        finally { button.disabled = false; }
      });
      show(await ask(worker, 'STATUS', route.id));
    } catch (e) {
      status.textContent = 'No se pudo preparar el guardado sin conexión. Recarga para volver a intentarlo.';
      button.disabled = true;
    }
  }};
})();
