(function () {
  'use strict';
  var esc = function (s) { return String(s || '').replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var plans = [];
  var filter = 'Todos';
  var status = document.getElementById('plan-status');
  function details(s) {
    return '<p class="small muted">' + esc(s.time) + '</p><p>' + esc(s.text) + '</p>' +
      (s.access ? '<p class="plan-access"><strong>Acceso:</strong> ' + esc(s.access) + '</p>' : '') +
      '<div class="plan-links">' +
      '<a href="https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent(s.map || s.title + ' Utrecht') + '">Abrir lugar en mapa ↗</a>' +
      (s.source ? '<a href="' + esc(s.source) + '">Información oficial de acceso ↗</a>' : '') +
      (s.link ? '<a href="' + esc(s.link) + '">Leer en la guía →</a>' : '') + '</div>';
  }
  function renderSaved() {
    var saved = MUPlan.read();
    document.getElementById('saved-stops').innerHTML = saved.length ? '<ol class="plan-stops">' + saved.map(function (s, i) {
      return '<li data-stop="' + i + '">' +
        '<span class="plan-drag" aria-hidden="true" title="Arrastra para reordenar">⠿</span>' +
        '<h3>' + esc(s.title) + '</h3>' + details(s) + '<div class="plan-controls">' +
        '<button type="button" class="btn btn-ghost" data-move="' + i + '" data-direction="-1" ' + (i === 0 ? 'disabled' : '') + ' aria-label="Subir ' + esc(s.title) + '">↑ Subir</button>' +
        '<button type="button" class="btn btn-ghost" data-move="' + i + '" data-direction="1" ' + (i === saved.length - 1 ? 'disabled' : '') + ' aria-label="Bajar ' + esc(s.title) + '">↓ Bajar</button>' +
        '<button type="button" class="btn btn-ghost" data-remove="' + i + '" aria-label="Quitar ' + esc(s.title) + '">Quitar</button></div></li>';
    }).join('') + '</ol>' : '<p class="plan-empty">Todavía no has guardado paradas. Añade un plan de abajo o guarda uno de los itinerarios de la guía.</p>';
    initDrag();
  }

  /* Reordenar arrastrando. Los botones ↑/↓ siguen siendo la vía accesible:
     esto es un atajo con ratón o dedo, no la única forma de reordenar.
     Mientras se arrastra solo se mueven transforms; el orden real no se
     escribe hasta soltar, así que un drag cancelado no toca el almacén. */
  function initDrag() {
    var lista = document.querySelector('#saved-stops .plan-stops');
    if (!lista) return;
    var items, rects, arrastrado, desde, hasta, inicioY, altura;

    lista.addEventListener('pointerdown', function (ev) {
      var asa = ev.target.closest('.plan-drag');
      if (!asa || ev.button !== 0) return;
      ev.preventDefault();
      arrastrado = asa.closest('li');
      items = [].slice.call(lista.children);
      rects = items.map(function (li) { return li.getBoundingClientRect(); });
      desde = items.indexOf(arrastrado);
      hasta = desde;
      inicioY = ev.clientY;
      altura = rects[desde].height + 12;
      arrastrado.classList.add('is-dragging');
      lista.classList.add('is-reordering');
      asa.setPointerCapture(ev.pointerId);
    });

    lista.addEventListener('pointermove', function (ev) {
      if (!arrastrado) return;
      var dy = ev.clientY - inicioY;
      arrastrado.style.transform = 'translateY(' + dy + 'px)';
      var centro = rects[desde].top + rects[desde].height / 2 + dy;
      var nuevo = desde;
      rects.forEach(function (r, i) {
        if (i === desde) return;
        /* >= y <=: si el centro queda justo en la mitad del vecino, cuenta
           como que ya lo ha pasado. Con > estricto el último hueco de la
           lista no se alcanza nunca. */
        if (i < desde && centro <= r.top + r.height / 2) nuevo = Math.min(nuevo, i);
        if (i > desde && centro >= r.top + r.height / 2) nuevo = Math.max(nuevo, i);
      });
      if (nuevo !== hasta) {
        hasta = nuevo;
        items.forEach(function (li, i) {
          if (li === arrastrado) return;
          var d = 0;
          if (hasta > desde && i > desde && i <= hasta) d = -altura;
          if (hasta < desde && i >= hasta && i < desde) d = altura;
          li.style.transform = d ? 'translateY(' + d + 'px)' : '';
        });
      }
    });

    function soltar() {
      if (!arrastrado) return;
      items.forEach(function (li) { li.style.transform = ''; li.classList.remove('is-dragging'); });
      lista.classList.remove('is-reordering');
      var mover = hasta !== desde;
      var origen = desde;
      arrastrado = null;
      if (!mover) return;
      var guardadas = MUPlan.read();
      guardadas.splice(hasta, 0, guardadas.splice(origen, 1)[0]);
      var ok = MUPlan.write(guardadas);
      status.textContent = ok
        ? 'Parada movida a la posición ' + (hasta + 1) + ' de ' + guardadas.length + '.'
        : 'No se pudo guardar el nuevo orden. Tu itinerario anterior se conserva.';
      if (!ok) renderSaved();
    }
    lista.addEventListener('pointerup', soltar);
    lista.addEventListener('pointercancel', soltar);
  }
  function renderIdeas() {
    document.getElementById('plan-ideas').innerHTML = plans.filter(function (p) { return filter === 'Todos' || p.tags.indexOf(filter) !== -1; }).map(function (p) {
      return '<article class="plan-option plan-option--' + p.tone + '"><p class="eyebrow">' + p.tags.map(esc).join(' · ') + '</p><h3>' + esc(p.title) + '</h3><p>' + esc(p.summary) + '</p><ol class="plan-stops">' + p.stops.map(function (s) { return '<li><h4>' + esc(s.title) + '</h4>' + details(s) + '</li>'; }).join('') + '</ol><button class="btn btn-primary" type="button" data-add-plan="' + p.id + '">Añadir a mi itinerario</button></article>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add-plan]');
    var remove = e.target.closest('[data-remove]');
    var move = e.target.closest('[data-move]');
    var chip = e.target.closest('[data-plan-filter]');
    if (chip) {
      filter = chip.dataset.planFilter;
      document.querySelectorAll('[data-plan-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === chip)); });
      renderIdeas();
    }
    if (add) {
      var plan = plans.find(function (p) { return p.id === add.dataset.addPlan; });
      if (!plan) return;
      var ok = MUPlan.add(plan.stops.map(function (s, i) { return Object.assign({}, s, {id: plan.id + '-' + i}); }));
      status.textContent = ok ? 'Plan añadido. Puedes quitar y reordenar sus paradas arriba. Se conserva al cerrar esta página.' : 'No se pudo guardar. Comprueba el almacenamiento del navegador o el límite de 100 paradas.';
      add.textContent = ok ? 'Añadido · Ver mi itinerario arriba' : 'Reintentar guardar';
    }
    if (remove || move) {
      var items = MUPlan.read();
      var index = Number((remove || move).dataset[remove ? 'remove' : 'move']);
      var target = index;
      if (remove) items.splice(index, 1);
      else {
        target = index + Number(move.dataset.direction);
        if (target < 0 || target >= items.length) return;
        var temp = items[index]; items[index] = items[target]; items[target] = temp;
      }
      var saved = MUPlan.write(items);
      status.textContent = saved ? 'Itinerario actualizado en este navegador.' : 'No se pudo guardar el cambio. Tu itinerario anterior se conserva.';
      var focus = document.querySelector('[data-remove="' + Math.min(target, items.length - 1) + '"]');
      if (focus) focus.focus();
      else { status.tabIndex = -1; status.focus(); }
    }
  });
  window.addEventListener('mu:plan-changed', renderSaved);
  window.addEventListener('storage', renderSaved);
  renderSaved();
  fetch('assets/data/planes.json').then(function (r) { if (!r.ok) throw new Error('Carga'); return r.json(); }).then(function (data) {
    plans = data.plans; renderIdeas();
  }).catch(function () {
    document.getElementById('plan-ideas').innerHTML = '<p>No se han podido cargar las propuestas. Tu itinerario guardado sigue disponible. <a href="mi-plan.html">Reintentar</a></p>';
  });
})();
