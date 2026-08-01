/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · tabs.js
   Tabs accesibles genéricas. Markup esperado:

   <div class="tabs" role="tablist" data-tabs>
     <button class="tab" role="tab" aria-selected="true"  aria-controls="p1" id="t1">1 día</button>
     <button class="tab" role="tab" aria-selected="false" aria-controls="p2" id="t2">2 días</button>
   </div>
   <div class="tab-panel" role="tabpanel" id="p1" aria-labelledby="t1">…</div>
   <div class="tab-panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden>…</div>
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function activate(tablist, tab) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    tablist.dispatchEvent(new CustomEvent('tabchange', { detail: { tab: tab }, bubbles: true }));
  }

  document.querySelectorAll('[data-tabs]').forEach(function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    tabs.forEach(function (tab, i) {
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;

      tab.addEventListener('click', function () { activate(tablist, tab); });

      tab.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        activate(tablist, next);
      });
    });
  });
})();
