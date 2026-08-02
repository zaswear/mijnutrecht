/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · tabs.js
   Tabs accesibles genéricas. Markup esperado:

   <div class="tabs" role="tablist" data-tabs data-tabs-param="dia">
     <button class="tab" role="tab" aria-selected="true"  aria-controls="p1" id="t1">1 día</button>
     <button class="tab" role="tab" aria-selected="false" aria-controls="p2" id="t2">2 días</button>
   </div>
   <div class="tab-panel" role="tabpanel" id="p1" aria-labelledby="t1">…</div>
   <div class="tab-panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden>…</div>

   Dos detalles que no son decorativos:
   · los paneles inactivos usan hidden="until-found" para que Ctrl+F
     encuentre su contenido y el navegador los abra solo (evento beforematch);
   · con data-tabs-param="X" la pestaña activa se refleja en la URL (?X=…),
     así se puede compartir un enlace directo a "3 días" o a "cerveza".
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPPORTS_UNTIL_FOUND = 'onbeforematch' in document.body;

  function hidePanel(panel) {
    if (SUPPORTS_UNTIL_FOUND) panel.setAttribute('hidden', 'until-found');
    else panel.hidden = true;
  }

  function showPanel(panel) {
    panel.removeAttribute('hidden');
  }

  function slug(tab) {
    return (tab.dataset.tabSlug || tab.id || '').replace(/^tab-/, '');
  }

  function activate(tablist, tab, opts) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (!panel) return;
      if (selected) showPanel(panel); else hidePanel(panel);
    });

    var param = tablist.dataset.tabsParam;
    if (param && !(opts && opts.silent)) {
      var url = new URL(location.href);
      url.searchParams.set(param, slug(tab));
      history.replaceState(null, '', url);
    }

    tablist.dispatchEvent(new CustomEvent('tabchange', { detail: { tab: tab }, bubbles: true }));
  }

  document.querySelectorAll('[data-tabs]').forEach(function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var param = tablist.dataset.tabsParam;

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

      // Ctrl+F encuentra texto dentro de un panel oculto → se abre su pestaña
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel && SUPPORTS_UNTIL_FOUND) {
        panel.addEventListener('beforematch', function () { activate(tablist, tab); });
      }
    });

    // Estado inicial desde la URL (?dia=3, ?comer=cerveza)
    if (param) {
      var wanted = new URLSearchParams(location.search).get(param);
      if (wanted) {
        var match = tabs.filter(function (t) { return slug(t) === wanted; })[0];
        if (match) activate(tablist, match, { silent: true });
      }
    }

    // Deja los paneles inactivos en until-found aunque el HTML traiga hidden a secas
    tabs.forEach(function (t) {
      if (t.getAttribute('aria-selected') === 'true') return;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p && p.hasAttribute('hidden')) hidePanel(p);
    });
  });
})();
