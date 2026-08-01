/* ═══════════════════════════════════════════════════════════
   Mijn Utrecht · free-tour/js/speech.js
   Lector del texto del guía con la Web Speech API.
   Expone window.FTSpeech.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var synth = global.speechSynthesis || null;
  var current = null;
  var onEndCb = null;

  function supported() {
    return !!synth && typeof global.SpeechSynthesisUtterance === 'function';
  }

  /** Mejor voz española disponible (es-ES primero, luego cualquier es-*). */
  function pickVoice() {
    if (!supported()) return null;
    var voices = synth.getVoices() || [];
    return voices.find(function (v) { return v.lang === 'es-ES'; }) ||
           voices.find(function (v) { return v.lang && v.lang.indexOf('es') === 0; }) ||
           null;
  }

  function speakText(text) {
    if (!supported() || !text) return false;
    stopSpeaking();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = 0.95;
    u.pitch = 1;
    var voice = pickVoice();
    if (voice) u.voice = voice;
    u.onend = u.onerror = function () {
      current = null;
      if (onEndCb) onEndCb();
    };
    current = u;
    synth.speak(u);
    return true;
  }

  function stopSpeaking() {
    if (!supported()) return;
    synth.cancel();
    current = null;
  }

  function isSpeaking() {
    return supported() && (synth.speaking || synth.pending);
  }

  function onEnd(cb) { onEndCb = cb; }

  // Algunos navegadores cargan las voces de forma asíncrona
  if (supported() && typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', function () { /* refresca la lista */ });
  }

  // El motor se detiene si se abandona la página
  global.addEventListener('pagehide', stopSpeaking);

  global.FTSpeech = {
    supported: supported,
    speakText: speakText,
    stopSpeaking: stopSpeaking,
    isSpeaking: isSpeaking,
    onEnd: onEnd
  };
})(window);
