/* Itinerario personal: referencias y textos locales, sin cuenta ni backend. */
(function () {
  'use strict';
  var KEY = 'mijnutrecht:itinerary:v1';
  function text(value) { return typeof value === 'string' ? value.slice(0, 3000) : ''; }
  function safeLink(value) {
    if (!value) return '';
    try {
      var url = new URL(value, location.href);
      return (url.protocol === 'https:' || (url.origin === location.origin && /^https?:$/.test(url.protocol))) ? url.href : '';
    } catch (e) { return ''; }
  }
  function clean(stop) {
    if (!stop || typeof stop !== 'object' || !text(stop.title)) return null;
    return { id: text(stop.id), title: text(stop.title), time: text(stop.time), text: text(stop.text),
      map: text(stop.map), source: safeLink(stop.source), link: safeLink(stop.link), access: text(stop.access) };
  }
  function read() {
    try {
      var items = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(items) ? items.slice(0, 100).map(clean).filter(Boolean) : [];
    } catch (e) { return []; }
  }
  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items.slice(0, 100).map(clean).filter(Boolean)));
      window.dispatchEvent(new Event('mu:plan-changed'));
      return true;
    } catch (e) { return false; }
  }
  function add(items) {
    var saved = read();
    items.forEach(function (item) {
      var stop = clean(item);
      if (stop && !saved.some(function (s) { return s.id === stop.id; })) saved.push(stop);
    });
    if (saved.length > 100) return false;
    return write(saved);
  }
  window.MUPlan = { read: read, write: write, add: add };
})();
