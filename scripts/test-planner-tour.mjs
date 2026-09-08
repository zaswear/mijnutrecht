// Requiere agent-browser y la web servida. Usa una sesión aislada y datos locales de prueba.
// node scripts/test-planner-tour.mjs --isolated-server
// El servidor aislado se apaga durante las pruebas offline: CDP no bloquea siempre la red del SW.
import { execFileSync, spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const isolated = process.argv.includes('--isolated-server');
const base = isolated ? 'http://127.0.0.1:18765' : (process.argv[2] || 'http://127.0.0.1:8765').replace(/\/$/, '');
let server;
async function startServer() {
  server = spawn('python3', ['-m', 'http.server', '18765', '--bind', '127.0.0.1'], {stdio: 'ignore'});
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (server.exitCode !== null) throw new Error('No se pudo iniciar el servidor aislado');
    try { if ((await fetch(base)).ok) return; } catch {}
  }
  throw new Error('Servidor aislado no disponible');
}
async function stopServer() {
  if (!server) return;
  const stopped = new Promise(resolve => server.once('exit', resolve));
  server.kill('SIGTERM'); await stopped; server = null;
}
if (isolated) await startServer();
const session = 'mu-regression-' + process.pid;
function browser(...args) {
  const result = JSON.parse(execFileSync('agent-browser', ['--session', session, '--json', ...args], {encoding: 'utf8', timeout: 45000}));
  assert.equal(result.success, true, JSON.stringify(result));
  return result.data;
}
const evaluate = (code) => browser('eval', code).result;
const open = (path) => browser('open', base + path);
const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const wait = (condition) => browser('wait', '--fn', condition);
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; console.log('PASS ' + message); }
try {
  open('/mi-plan.html');
  wait("document.querySelectorAll('[data-add-plan]').length === 4");
  click('[data-plan-filter="Lluvia"]');
  check(evaluate("document.querySelectorAll('[data-add-plan]').length") === 2, 'Filtro de lluvia');
  click('[data-add-plan="lluvia"]');
  check(evaluate('MUPlan.read().length') === 2, 'Guardar plan');
  click('[data-add-plan="lluvia"]');
  check(evaluate('MUPlan.read().length') === 2, 'No duplica al guardar de nuevo');
  click('[data-move="1"][data-direction="-1"]');
  check(evaluate('MUPlan.read()[0].id') === 'lluvia-1', 'Reordenar paradas');
  browser('reload');
  wait("document.querySelectorAll('[data-remove]').length === 2");
  check(evaluate('MUPlan.read()[0].id') === 'lluvia-1', 'Persistencia después de recargar');
  click('[data-remove="0"]');
  check(evaluate('MUPlan.read().length') === 1, 'Quitar parada');
  evaluate("window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function(){throw new Error('blocked')}");
  click('[data-add-plan="lluvia"]');
  check(evaluate("document.getElementById('plan-status').textContent.includes('No se pudo')"), 'Error de almacenamiento visible');
  evaluate('Storage.prototype.setItem = window.originalSetItem');
  open('/index.html');
  wait("document.querySelector('[data-save-days]')");
  click('[data-save-days="1"]');
  open('/mi-plan.html');
  check(evaluate('MUPlan.read().length') === 6, 'Guardar itinerario original de un día');
  for (const width of [390, 1440]) {
    browser('set', 'viewport', String(width), '900');
    for (const path of ['/index.html', '/expat.html', '/historia.html', '/mi-plan.html', '/free-tour/', '/free-tour/ruta.html?ruta=oculto']) {
      open(path);
      check(evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Sin desbordamiento ' + width + ' ' + path);
    }
  }
  open('/free-tour/ruta.html?ruta=oculto');
  wait("!document.getElementById('download-route').disabled");
  click('#download-route');
  wait("document.getElementById('download-status').textContent.includes('Ruta preparada')");
  check(evaluate("document.getElementById('download-inventory').textContent.includes('10/10')"), 'Descarga de todos los archivos esenciales');
  if (isolated) await stopServer();
  browser('set', 'offline', 'on');
  browser('reload');
  wait("document.querySelector('#btn-arrived')");
  check(evaluate("document.querySelectorAll('[data-stop-index]').length") === 7, 'Esquema y lista de siete paradas sin red');
  check(evaluate("document.querySelector('.progress-bar').getAttribute('aria-valuenow')") === '0', 'Navegar no equivale a visitar');
  click('#nav-next');
  check(evaluate("document.querySelector('.progress-bar').getAttribute('aria-valuenow')") === '0', 'Avanzar sin marcar mantiene el progreso');
  click('#nav-prev');
  for (let i = 0; i < 7; i++) {
    check(evaluate('document.querySelector(".stop-card__eyebrow").textContent').includes('Parada ' + (i + 1)), 'Parada offline ' + (i + 1));
    const photo = evaluate("document.querySelector('.stop-card__image')?.getAttribute('src') || ''");
    if (photo) check(awaitResultPhoto(photo), 'Foto disponible sin red en parada ' + (i + 1));
    click('#btn-arrived');
  }
  check(evaluate("document.querySelector('.progress-bar').getAttribute('aria-valuenow')") === '100', 'Ruta completa sin conexión');
  check(evaluate("!!JSON.parse(localStorage.getItem('mijnutrecht-tour-progress')).oculto.completedAt"), 'Finalización persistida');
  check(evaluate("document.querySelector('h1').textContent.includes('completado')"), 'Pantalla final');
  open('/free-tour/ruta.html?ruta=locura');
  wait("!document.querySelector('#stop-root').textContent.includes('Cargando')");
  check(evaluate("document.querySelector('#stop-root').textContent.includes('No se ha podido cargar')"), 'Ruta no descargada no recibe JSON de otra ruta');
  browser('set', 'offline', 'off');
  if (isolated) await startServer();
  open('/free-tour/ruta.html?ruta=locura');
  wait("!document.getElementById('download-route').disabled");
  click('#download-route');
  wait("document.getElementById('download-status').textContent.includes('Ruta preparada')");
  if (isolated) await stopServer();
  browser('set', 'offline', 'on');
  open('/free-tour/ruta.html?ruta=locura&parada=3');
  wait("document.querySelector('.stop-card__eyebrow')");
  check(evaluate("document.querySelector('.stop-card__eyebrow').textContent.includes('Parada 3')"), 'Enlace directo a otra ruta y parada sin red');
  console.log(`${checks} comprobaciones correctas.`);
} finally {
  try { browser('set', 'offline', 'off'); browser('close'); } catch {}
  if (server) await stopServer();
}
function awaitResultPhoto(src) {
  return evaluate(`(async () => {const image = new Image(); image.src = ${JSON.stringify(src)}; try {await image.decode(); return image.naturalWidth > 0;} catch {return false;}})()`);
}
