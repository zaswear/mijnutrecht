/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · accordion.js
   Acordeones FAQ con transición de max-height.

   <div class="accordion" data-accordion>
     <div class="accordion__item">
       <button class="accordion__trigger" aria-expanded="false" aria-controls="a1">…</button>
       <div class="accordion__panel" id="a1"><div class="accordion__inner">…</div></div>
     </div>
   </div>
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function close(trigger, panel) {
    panel.style.maxHeight = '0px';
    trigger.setAttribute('aria-expanded', 'false');
  }

  function open(trigger, panel) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
    trigger.setAttribute('aria-expanded', 'true');
  }

  document.querySelectorAll('[data-accordion]').forEach(function (root) {
    var pairs = [];

    root.querySelectorAll('.accordion__trigger').forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) return;
      pairs.push([trigger, panel]);

      if (trigger.getAttribute('aria-expanded') === 'true') open(trigger, panel);
      else panel.style.maxHeight = '0px';

      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        if (root.dataset.accordion === 'single') {
          pairs.forEach(function (p) { close(p[0], p[1]); });
        }
        if (isOpen) close(trigger, panel);
        else open(trigger, panel);
      });
    });

    // Recalcular alturas si cambia el ancho (el texto reflota)
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        pairs.forEach(function (p) {
          if (p[0].getAttribute('aria-expanded') === 'true') p[1].style.maxHeight = p[1].scrollHeight + 'px';
        });
      }, 150);
    });
  });
})();
