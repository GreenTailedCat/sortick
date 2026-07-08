(() => {
  const DICE_LIMIT = 10;
  const DICE_TYPES = [4, 6, 8, 10, 12, 20];
  const STORAGE_KEY = "sortick_draws_v1";
  const LEGACY_STORAGE_KEYS = ["sortick_draws", "sortick_test_draws_v1"];

/* v1.25: som direto dos dados, acionado pelo clique em Rolar */
let sortickDiceAudioContextV125 = null;
let sortickDiceSoundEnabledV125 = localStorage.getItem("sortick_dice_sound_enabled_v125") !== "false";
let sortickDiceRollTimerV125 = null;

function sortickGetDiceAudioV125() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sortickDiceAudioContextV125) sortickDiceAudioContextV125 = new AudioContextClass();
    if (sortickDiceAudioContextV125.state === "suspended") sortickDiceAudioContextV125.resume();
    return sortickDiceAudioContextV125;
  } catch {
    return null;
  }
}

function sortickBeepV125(frequency, duration = 0.055, volume = 0.08, type = "triangle") {
  if (!sortickDiceSoundEnabledV125) return;
  const context = sortickGetDiceAudioV125();
  if (!context) return;

  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, context.currentTime);
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  osc.connect(gain);
  gain.connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + duration);
}

function sortickStartDiceRollSoundV125() {
  if (!sortickDiceSoundEnabledV125) return;
  sortickGetDiceAudioV125();
  sortickStopDiceRollSoundV125(false);

  let index = 0;
  const pattern = [120, 160, 210, 150, 250, 180, 310, 140];
  sortickDiceRollTimerV125 = window.setInterval(() => {
    sortickBeepV125(pattern[index % pattern.length], 0.045, 0.055, index % 2 ? "square" : "triangle");
    index += 1;
  }, 58);
}

function sortickStopDiceRollSoundV125(playLand = true) {
  if (sortickDiceRollTimerV125) {
    window.clearInterval(sortickDiceRollTimerV125);
    sortickDiceRollTimerV125 = null;
  }
  if (playLand && sortickDiceSoundEnabledV125) {
    sortickBeepV125(360, 0.07, 0.11, "triangle");
    window.setTimeout(() => sortickBeepV125(190, 0.09, 0.09, "sine"), 65);
  }
}

function sortickToggleDiceSoundV125() {
  sortickDiceSoundEnabledV125 = !sortickDiceSoundEnabledV125;
  localStorage.setItem("sortick_dice_sound_enabled_v125", sortickDiceSoundEnabledV125 ? "true" : "false");
  if (!sortickDiceSoundEnabledV125) sortickStopDiceRollSoundV125(false);
  else sortickBeepV125(420, 0.08, 0.1, "triangle");
  const draw = getDraw();
  if (isDiceDraw(draw)) render(draw);
}


let diceAudioContext = null;
let diceRollNodes = null;
let diceSoundEnabled = localStorage.getItem("sortick_dice_sound_enabled") !== "false";

function getDiceAudioContext() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!diceAudioContext) diceAudioContext = new AudioContextClass();
    if (diceAudioContext.state === "suspended") diceAudioContext.resume();
    return diceAudioContext;
  } catch {
    return null;
  }
}

function startDiceRollSound() {
  if (!diceSoundEnabled) return;
  const context = getDiceAudioContext();
  if (!context) return;

  sortickStopDiceRollSoundV125();

  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(0.085, context.currentTime + 0.025);
  master.connect(context.destination);

  const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.45, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(520, context.currentTime);
  filter.Q.setValueAtTime(1.2, context.currentTime);

  const oscillator = context.createOscillator();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(48, context.currentTime);

  const clickGain = context.createGain();
  clickGain.gain.setValueAtTime(0.018, context.currentTime);

  noise.connect(filter);
  filter.connect(master);
  oscillator.connect(clickGain);
  clickGain.connect(master);

  noise.start();
  oscillator.start();

  diceRollNodes = { context, master, noise, oscillator };
}

function stopDiceRollSound({ land = true } = {}) {
  if (!diceRollNodes) return;

  const { context, master, noise, oscillator } = diceRollNodes;
  try {
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value || 0.0001, 0.0001), context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.08);
    noise.stop(context.currentTime + 0.09);
    oscillator.stop(context.currentTime + 0.09);
  } catch {
    try { noise.stop(); } catch {}
    try { oscillator.stop(); } catch {}
  }

  diceRollNodes = null;

  if (land && diceSoundEnabled) playDiceLandSound();
}

function playDiceLandSound() {
  const context = getDiceAudioContext();
  if (!context) return;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.11, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
  gain.connect(context.destination);

  [160, 230, 310].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.018);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.56, context.currentTime + 0.16);
    oscillator.connect(gain);
    oscillator.start(context.currentTime + index * 0.018);
    oscillator.stop(context.currentTime + 0.19 + index * 0.018);
  });
}

function toggleDiceSound() {
  diceSoundEnabled = !diceSoundEnabled;
  localStorage.setItem("sortick_dice_sound_enabled", diceSoundEnabled ? "true" : "false");
  if (!diceSoundEnabled) stopDiceRollSound({ land: false });
  else playDiceLandSound();
  const draw = getDraw();
  if (isDiceDraw(draw)) render(draw);
}


  const escapeHTML = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function drawId() { return new URLSearchParams(location.search).get("id"); }

  function rawStore() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (current && typeof current === "object") return current;
      for (const key of LEGACY_STORAGE_KEYS) {
        const legacy = JSON.parse(localStorage.getItem(key) || "null");
        if (legacy && typeof legacy === "object") return legacy;
      }
    } catch { return {}; }
    return {};
  }

  function writeRawStore(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }
    catch {}
  }

  function readDraw() {
    const id = drawId();
    if (!id) return null;
    if (window.Sortick && typeof Sortick.getDraw === "function") return Sortick.getDraw(id);
    const raw = rawStore();
    if (Array.isArray(raw)) return raw.find(item => item && item.id === id) || null;
    return raw && raw[id] ? raw[id] : null;
  }

  function saveDraw(draw) {
    if (!draw || !draw.id) return;
    if (window.Sortick && typeof Sortick.saveDraw === "function") {
      try { Sortick.saveDraw(draw); return; } catch {}
    }
    const raw = rawStore();
    if (Array.isArray(raw)) {
      const index = raw.findIndex(item => item && item.id === draw.id);
      if (index >= 0) raw[index] = draw; else raw.push(draw);
      writeRawStore(raw);
      return;
    }
    raw[draw.id] = draw;
    writeRawStore(raw);
  }

  function isDiceDraw(draw) {
    return draw && draw.type === "quick" && draw.options && draw.options.quickType === "dice";
  }

  function randomIndex(max) {
    if (max <= 0) return 0;
    if (window.crypto && typeof crypto.getRandomValues === "function") {
      const buffer = new Uint32Array(1);
      const limit = Math.floor(0xffffffff / max) * max;
      let value;
      do { crypto.getRandomValues(buffer); value = buffer[0]; } while (value >= limit);
      return value % max;
    }
    return Math.floor(Math.random() * max);
  }

  function makeId() { return `die_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }

  function getState(draw) {
    draw.options = draw.options || {};
    draw.options.diceTable = draw.options.diceTable || {};
    const source = Array.isArray(draw.options.diceTable.dice)
      ? draw.options.diceTable.dice
      : Array.isArray(draw.options.diceTray)
        ? draw.options.diceTray
        : [];
    draw.options.diceTable.dice = source
      .filter(item => item && DICE_TYPES.includes(Number(item.sides)))
      .slice(0, DICE_LIMIT)
      .map(item => ({ id: item.id || makeId(), sides: Number(item.sides), value: Number.isInteger(Number(item.value)) ? Number(item.value) : null }));
    draw.options.diceTable.lastTotal = draw.options.diceTable.dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    return draw.options.diceTable;
  }

  function diceSvg(sides, value) {
    const v = escapeHTML(value ?? "?");
    const shapes = {
      4: `<path class="dice-shadow" d="M42 182 L178 182 L110 28 Z"/><path class="dice-main" d="M110 20 L204 186 L16 186 Z"/><path class="dice-side dice-side-a" d="M110 20 L110 186 L16 186 Z"/><path class="dice-side dice-side-b" d="M110 20 L204 186 L110 186 Z"/><path class="dice-line" d="M110 20 L110 186 M16 186 L204 186"/>`,
      6: `<path class="dice-shadow" d="M54 174 L166 174 L198 64 L88 54 Z"/><path class="dice-top" d="M58 52 L144 24 L198 64 L112 94 Z"/><path class="dice-main" d="M112 94 L198 64 L198 148 L112 180 Z"/><path class="dice-side dice-side-a" d="M58 52 L112 94 L112 180 L58 136 Z"/><path class="dice-line" d="M58 52 L112 94 L198 64 M112 94 L112 180"/>`,
      8: `<path class="dice-shadow" d="M110 192 L202 104 L110 14 L18 104 Z"/><path class="dice-top" d="M110 14 L202 104 L110 106 Z"/><path class="dice-side dice-side-a" d="M110 14 L110 106 L18 104 Z"/><path class="dice-main" d="M18 104 L110 106 L110 192 Z"/><path class="dice-side dice-side-b" d="M202 104 L110 106 L110 192 Z"/><path class="dice-line" d="M110 14 L110 192 M18 104 L202 104"/>`,
      10: `<path class="dice-shadow" d="M30 100 L70 30 L150 18 L202 90 L170 168 L96 190 L36 146 Z"/><path class="dice-top" d="M70 30 L150 18 L202 90 L112 106 Z"/><path class="dice-side dice-side-a" d="M30 100 L70 30 L112 106 L36 146 Z"/><path class="dice-main" d="M202 90 L170 168 L112 106 Z"/><path class="dice-side dice-side-b" d="M36 146 L112 106 L96 190 Z"/><path class="dice-side dice-side-c" d="M112 106 L170 168 L96 190 Z"/><path class="dice-line" d="M70 30 L112 106 L150 18 M30 100 L112 106 L202 90 M36 146 L112 106 L96 190 M170 168 L112 106"/>`,
      12: `<path class="dice-shadow" d="M110 12 L178 42 L206 108 L166 176 L92 192 L30 144 L26 70 Z"/><path class="dice-main" d="M110 42 L162 72 L150 134 L86 134 L66 74 Z"/><path class="dice-top" d="M110 12 L178 42 L162 72 L110 42 Z"/><path class="dice-side dice-side-a" d="M178 42 L206 108 L150 134 L162 72 Z"/><path class="dice-side dice-side-b" d="M150 134 L166 176 L92 192 L86 134 Z"/><path class="dice-side dice-side-c" d="M26 70 L66 74 L86 134 L30 144 Z"/><path class="dice-line" d="M110 42 L162 72 L150 134 L86 134 L66 74 Z M110 42 L110 12 M162 72 L178 42 M150 134 L206 108 M86 134 L92 192 M66 74 L26 70"/>`,
      20: `<path class="dice-shadow" d="M110 10 L192 54 L198 144 L110 194 L22 144 L28 54 Z"/><path class="dice-main" d="M110 42 L168 76 L142 138 L78 138 L52 76 Z"/><path class="dice-top" d="M110 10 L192 54 L168 76 L110 42 Z"/><path class="dice-side dice-side-a" d="M192 54 L198 144 L142 138 L168 76 Z"/><path class="dice-side dice-side-b" d="M142 138 L110 194 L78 138 Z"/><path class="dice-side dice-side-c" d="M22 144 L52 76 L78 138 Z"/><path class="dice-side dice-side-d" d="M28 54 L110 10 L110 42 L52 76 Z"/><path class="dice-line" d="M110 42 L168 76 L142 138 L78 138 L52 76 Z M110 10 L110 42 M192 54 L168 76 M198 144 L142 138 M110 194 L142 138 M110 194 L78 138 M22 144 L78 138 M28 54 L52 76"/>`
    };
    return `<svg class="dice-piece-svg dice-piece-svg-d${sides}" viewBox="0 0 220 205" role="img" aria-label="D${sides}, resultado ${v}">${shapes[sides]}<text class="dice-type-text" x="110" y="58" text-anchor="middle">D${sides}</text><text class="dice-value-text" x="110" y="137" text-anchor="middle">${v}</text></svg>`;
  }

  function render(draw, rolling = false) {
    if (!isDiceDraw(draw)) return false;
    const stage = document.querySelector(".draw-stage");
    const side = document.querySelector(".draw-side") || document.querySelector(".side-panel");
    if (!stage) return false;

    document.body.classList.add("dice-direct-mode");
    document.querySelectorAll("#winnerCard,.winner-card,#participantPanel,#activityInfoPanel").forEach(item => item.classList.add("hidden"));

    const current = getState(draw);
    const dice = current.dice;
    const total = dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const sizeClass = dice.length >= 8 ? "is-compact" : dice.length >= 5 ? "is-medium" : "";

    stage.innerHTML = `
      <div class="dice-direct-card">
        <div class="dice-direct-head">
          <div><p class="eyebrow">DECISÕES RÁPIDAS</p><h1>Jogar os dados</h1><p>${dice.length ? "Role novamente, remova dados ou limpe a mesa." : "Escolha um ou mais dados abaixo para começar."}</p></div>
          <div class="dice-head-actions">
            <button id="diceSoundToggle" class="dice-sound-toggle" type="button">${sortickDiceSoundEnabledV125 ? "🔊 Som" : "🔇 Som"}</button>
            <span class="dice-count">${dice.length}/${DICE_LIMIT} dados</span>
          </div>
        </div>
        <div class="dice-table ${sizeClass} ${rolling ? "is-rolling" : ""}">
          ${dice.length ? `<div class="dice-pieces">${dice.map(item => `<article class="dice-piece dice-piece-d${item.sides}" data-die="${escapeHTML(item.id)}"><button class="dice-remove" type="button" aria-label="Remover D${item.sides}">×</button>${diceSvg(item.sides, item.value || "?")}</article>`).join("")}</div>${dice.length > 1 ? `<div class="dice-total-box"><span>Total</span><strong>${total}</strong></div>` : ""}` : `<div class="dice-empty"><strong>Mesa vazia</strong><span>Use os botões abaixo para adicionar dados.</span></div>`}
        </div>
        <div class="dice-controls">
          <div class="dice-add-row">${DICE_TYPES.map(n => `<button class="dice-add" data-sides="${n}" type="button" ${dice.length >= DICE_LIMIT ? "disabled" : ""}>+ D${n}</button>`).join("")}</div>
          <div class="dice-action-row"><button id="diceRollButton" class="btn btn-primary" type="button" ${dice.length ? "" : "disabled"}>Rolar</button><button id="diceClearButton" class="btn btn-ghost light" type="button" ${dice.length ? "" : "disabled"}>Limpar</button></div>
          ${dice.length >= DICE_LIMIT ? `<p class="dice-limit-note">Limite de ${DICE_LIMIT} dados atingido.</p>` : ""}
        </div>
      </div>`;

    if (side) {
      side.innerHTML = `<aside class="info-card"><h3>Transparência</h3><p>Os resultados usam a aleatoriedade do navegador com crypto.getRandomValues, quando disponível.</p></aside>`;
    }

    stage.querySelectorAll(".dice-add").forEach(btn => btn.addEventListener("click", () => {
      const sides = Number(btn.dataset.sides);
      const state = getState(draw);
      if (!DICE_TYPES.includes(sides) || state.dice.length >= DICE_LIMIT) return;
      state.dice.push({ id: makeId(), sides, value: null });
      draw.options.diceTable = state;
      draw.result = null;
      saveDraw(draw);
      render(draw);
    }));

    stage.querySelectorAll(".dice-remove").forEach(btn => btn.addEventListener("click", () => {
      const id = btn.closest(".dice-piece")?.dataset.die;
      const state = getState(draw);
      state.dice = state.dice.filter(item => item.id !== id);
      draw.options.diceTable = state;
      draw.result = null;
      saveDraw(draw);
      render(draw);
    }));

    const soundToggle = stage.querySelector("#diceSoundToggle");
    if (soundToggle) soundToggle.addEventListener("click", sortickToggleDiceSoundV125);

    const roll = stage.querySelector("#diceRollButton");
    const clear = stage.querySelector("#diceClearButton");
    if (roll) roll.addEventListener("click", () => rollDice(draw));
    if (clear) clear.addEventListener("click", () => {
      const state = getState(draw);
      state.dice = [];
      state.lastTotal = 0;
      draw.options.diceTable = state;
      draw.result = null;
      saveDraw(draw);
      render(draw);
    });
    return true;
  }

  function rollDice(draw) {
    const state = getState(draw);
    if (!state.dice.length) return;
    let tick = 0;
    const timer = setInterval(() => {
      tick += 1;
      state.dice = state.dice.map(item => ({ ...item, value: randomIndex(item.sides) + 1 }));
      draw.options.diceTable = state;
      render(draw, true);
      if (tick >= 13) {
        clearInterval(timer);
        state.dice = state.dice.map(item => ({ ...item, value: randomIndex(item.sides) + 1 }));
        state.lastTotal = state.dice.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        draw.result = { quickResult: { label: `Total: ${state.lastTotal}`, value: String(state.lastTotal) }, diceResults: state.dice.map(item => ({ sides: item.sides, value: item.value })), createdAt: new Date().toISOString() };
        saveDraw(draw);
        sortickStopDiceRollSoundV125();
        render(draw, false);
      }
    }, 58);
  }

  function boot() {
    const draw = readDraw();
    return render(draw);
  }

  function forceBoot() {
    let tries = 0;
    const run = () => {
      tries += 1;
      boot();
      if (tries < 30) setTimeout(run, 100);
    };
    run();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", forceBoot);
  else forceBoot();
})();
