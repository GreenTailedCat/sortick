const params = new URLSearchParams(window.location.search);
const drawId = params.get("id");

let draw = drawId ? Sortick.getDraw(drawId) : null;
let isDrawing = false;
let currentWheelRotation = 0;

const WHEEL_COLORS = ["#6c4dff", "#00c2a8", "#ff4b6e", "#ffca3a", "#2f80ed", "#9b51e0", "#f2994a", "#27ae60", "#eb5757", "#56ccf2"];

const drawTitle = document.querySelector("#drawTitle");
const drawKind = document.querySelector("#drawKind");
const drawStatus = document.querySelector("#drawStatus");
const animationArea = document.querySelector("#animationArea");
const winnerCard = document.querySelector("#winnerCard");
const winnerName = document.querySelector("#winnerName");
const winnerMeta = document.querySelector("#winnerMeta");
const proofText = document.querySelector("#proofText");
const drawButton = document.querySelector("#drawButton");
const copyButton = document.querySelector("#copyButton");
const shareButton = document.querySelector("#shareButton");
const downloadButton = document.querySelector("#downloadButton");
const resetButton = document.querySelector("#resetButton");
const participantForm = document.querySelector("#participantForm");
const participantName = document.querySelector("#participantName");
const participantNumber = document.querySelector("#participantNumber");
const participantStatus = document.querySelector("#participantStatus");
const participantList = document.querySelector("#participantList");
const participantHelp = document.querySelector("#participantHelp");
const validationMessage = document.querySelector("#validationMessage");
const sampleButton = document.querySelector("#sampleButton");
const clearParticipantsButton = document.querySelector("#clearParticipantsButton");
const numberLegend = document.querySelector("#numberLegend");
const confirmedOnlyToggle = document.querySelector("#confirmedOnlyToggle");
const removeWinnerToggle = document.querySelector("#removeWinnerToggle");
const soundToggle = document.querySelector("#soundToggle");
const participantFilter = document.querySelector("#participantFilter");
const statusSummary = document.querySelector("#statusSummary");
const bulkButton = document.querySelector("#bulkButton");
const shuffleButton = document.querySelector("#shuffleButton");
const bulkAddPanel = document.querySelector("#bulkAddPanel");
const bulkText = document.querySelector("#bulkText");
const confirmBulkButton = document.querySelector("#confirmBulkButton");
const cancelBulkButton = document.querySelector("#cancelBulkButton");

if (!draw) {
  document.body.innerHTML = `
    <main class="section"><div class="create-panel"><div>
      <p class="eyebrow">Sorteio não encontrado</p>
      <h2>Este sorteio não existe neste navegador.</h2>
      <p class="subtle">Crie um novo sorteio para continuar.</p>
      <a class="btn btn-primary" href="index.html">Criar sorteio</a>
    </div></div></main>`;
} else {
  draw.options = draw.options || {};
  draw.options.confirmedOnly = Boolean(draw.options.confirmedOnly);
  draw.options.removeWinnerAfterDraw = Boolean(draw.options.removeWinnerAfterDraw);
  draw.options.soundEnabled = Boolean(draw.options.soundEnabled);
  draw.participants = draw.participants.map(p => ({ ...p, status: p.status || "pending" }));
  setupDraw();
}

function setupDraw() {
  drawTitle.textContent = draw.title;
  drawKind.textContent = Sortick.typeLabel(draw.type);
  drawStatus.textContent = draw.mode === "simple" ? "Modo simples" : "Modo ao vivo";
  confirmedOnlyToggle.checked = Boolean(draw.options.confirmedOnly);
  removeWinnerToggle.checked = Boolean(draw.options.removeWinnerAfterDraw);
  if (soundToggle) soundToggle.checked = Boolean(draw.options.soundEnabled);

  if (draw.type === "numbers") {
    participantNumber.classList.remove("hidden");
    numberLegend.classList.remove("hidden");
    bulkButton.classList.add("hidden");
    participantNumber.placeholder = `Número de 1 a ${getTotalNumbers()}`;
    participantNumber.max = getTotalNumbers();
    participantHelp.textContent = "Toque em um número verde para selecionar. Toque em um número ocupado para alternar Confirmado/Pendente.";
  } else if (draw.type === "roulette") {
    participantHelp.textContent = "Adicione nomes ou opções para a roleta. Use Confirmado/Pendente para controlar quem entra.";
  } else {
    participantHelp.textContent = "Adicione nomes para o sorteio. Use Confirmado/Pendente para controlar quem entra.";
  }

  render();
}

function getTotalNumbers() { return Sortick.clampNumber(draw.options.totalNumbers || 50, 2, 500); }
function persist() { draw.updatedAt = new Date().toISOString(); Sortick.saveDraw(draw); }
function setValidation(message = "") { validationMessage.textContent = message; }

function setRuleOptionsLocked(locked) {
  document.body.classList.toggle("drawing-locked", locked);
  confirmedOnlyToggle.disabled = locked;
  removeWinnerToggle.disabled = locked;
}
function getMinimumParticipants() { return draw.type === "numbers" ? 1 : 2; }
function getEligibleParticipants() { return draw.options.confirmedOnly ? draw.participants.filter(p => p.status === "confirmed") : draw.participants; }
function getStatusCounts() {
  const confirmed = draw.participants.filter(p => p.status === "confirmed").length;
  return { total: draw.participants.length, confirmed, pending: draw.participants.length - confirmed };
}

function render() {
  renderStatusSummary();
  renderParticipants();
  renderAnimationIdle();
  renderResult();
  drawButton.disabled = getEligibleParticipants().length < getMinimumParticipants() || isDrawing;
  copyButton.disabled = !draw.result;
  shareButton.disabled = !draw.result;
  downloadButton.disabled = !draw.result;
  setRuleOptionsLocked(isDrawing);
}

function renderStatusSummary() {
  const c = getStatusCounts();
  statusSummary.innerHTML = `
    <span>Total: ${c.total}</span>
    <span>Confirmados: ${c.confirmed}</span>
    <span>Pendentes: ${c.pending}</span>
    ${draw.type === "numbers" ? `<span>Disponíveis: ${getTotalNumbers() - c.total}</span>` : ""}
  `;
}

function renderParticipants() {
  participantList.innerHTML = "";
  let items = draw.participants.slice();
  const filter = participantFilter.value;
  if (filter !== "all") items = items.filter(p => p.status === filter);
  if (draw.type === "numbers") items.sort((a, b) => Number(a.number || 0) - Number(b.number || 0));

  if (items.length === 0) {
    participantList.innerHTML = `<li><span>Nenhum participante para mostrar</span></li>`;
    return;
  }

  items.forEach(participant => {
    const originalIndex = draw.participants.findIndex(p => p.id === participant.id);
    const li = document.createElement("li");
    const statusClass = participant.status === "confirmed" ? "confirmed" : "pending";
    const dotClass = participant.status === "confirmed" ? "confirmed-dot" : "pending-dot";
    const title = draw.type === "numbers" ? `Nº ${Sortick.escapeHTML(participant.number)}` : Sortick.escapeHTML(participant.name);
    const sub = draw.type === "numbers" ? `<small>${Sortick.escapeHTML(participant.name)}</small>` : "";

    li.innerHTML = `
      <div class="participant-main-line">
        <span class="participant-name-line"><i class="status-dot ${dotClass}"></i><strong>${title}</strong>${sub}</span>
        <button class="remove-button" type="button" aria-label="Remover participante">×</button>
      </div>
      <div class="participant-actions">
        <button class="status-label ${statusClass}" type="button"><i class="dot ${dotClass}"></i>${Sortick.statusLabel(participant.status)}</button>
        <small>Toque para alternar</small>
      </div>`;

    li.querySelector(".remove-button").addEventListener("click", () => {
      if (isDrawing) return;
      draw.participants.splice(originalIndex, 1);
      draw.result = null;
      persist();
      render();
    });

    li.querySelector(".status-label").addEventListener("click", () => {
      if (isDrawing) return;
      toggleParticipantStatus(participant.id);
    });

    participantList.appendChild(li);
  });
}

function toggleParticipantStatus(participantId) {
  const participant = draw.participants.find(p => p.id === participantId);
  if (!participant) return;
  participant.status = participant.status === "confirmed" ? "pending" : "confirmed";
  draw.result = null;
  persist();
  setValidation(`${participant.name} agora está como ${Sortick.statusLabel(participant.status)}.`);
  render();
}

function renderAnimationIdle() {
  if (draw.type === "numbers") return renderNumberBoard();
  if (draw.type === "roulette") return renderRouletteCanvas(draw.result?.wheelRotation || 0, draw.result?.participantIndex ?? null);

  if (draw.result) {
    animationArea.innerHTML = `<div class="rolling-name">${Sortick.escapeHTML(getParticipantDisplay(draw.result.participant))}</div>`;
    return;
  }

  const eligible = getEligibleParticipants();
  animationArea.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">✨</span>
      <strong>${eligible.length >= getMinimumParticipants() ? "Pronto para sortear" : `Faltam participantes elegíveis`}</strong>
      <p>${eligible.length} participante(s) pronto(s) para o sorteio.</p>
    </div>`;
}

function renderRouletteCanvas(rotation = currentWheelRotation, activeIndex = null) {
  const participants = (draw.result && draw.result.rouletteParticipants && activeIndex !== null)
    ? draw.result.rouletteParticipants
    : getEligibleParticipants();
  const count = participants.length;
  if (count === 0) {
    animationArea.innerHTML = `<div class="empty-state"><span class="empty-icon">🎡</span><strong>Roleta vazia</strong><p>Adicione participantes ou desative “sortear apenas confirmados”.</p></div>`;
    return;
  }

  currentWheelRotation = rotation;
  const activeText = activeIndex !== null && participants[activeIndex] ? getParticipantDisplay(participants[activeIndex]) : "Sortick";
  animationArea.innerHTML = `
    <div class="roulette-wrap">
      <div class="canvas-wheel-scene">
        <div class="canvas-pointer"></div>
        <canvas id="rouletteCanvas" class="roulette-canvas" width="900" height="900"></canvas>
        <div class="canvas-center">${Sortick.escapeHTML(activeText)}</div>
      </div>
      <div class="roulette-winner-strip">${activeIndex !== null ? `Resultado: ${Sortick.escapeHTML(activeText)}` : `${count} participante(s) na roleta`}</div>
    </div>`;

  drawWheel(document.querySelector("#rouletteCanvas"), participants, rotation, activeIndex);
}

function drawWheel(canvas, participants, rotationDegrees = 0, activeIndex = null) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = size * 0.46;
  const count = participants.length;
  const slice = (Math.PI * 2) / count;
  const rotation = degreesToRadians(rotationDegrees);

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(center, center);

  ctx.beginPath();
  ctx.arc(0, 0, radius + 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();

  for (let index = 0; index < count; index += 1) {
    const start = -Math.PI / 2 + rotation + index * slice;
    const end = start + slice;
    const middle = start + slice / 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, radius, start, end); ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length]; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.62)"; ctx.lineWidth = 4; ctx.stroke();

    const label = getRouletteLabel(participants[index], index, count);
    ctx.save();
    ctx.rotate(middle);
    ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${getLabelFontSize(count)}px Inter, system-ui, sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 5;
    ctx.fillText(label, radius * 0.72, 0, radius * 0.38);
    ctx.restore();
  }

  ctx.beginPath(); ctx.arc(0, 0, radius * 0.37, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2); ctx.strokeStyle = "rgba(16,15,46,0.10)"; ctx.lineWidth = 8; ctx.stroke();

  if (activeIndex !== null) {
    const start = -Math.PI / 2 + rotation + activeIndex * slice;
    const end = start + slice;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, radius, start, end); ctx.closePath();
    ctx.strokeStyle = "#ffca3a"; ctx.lineWidth = 12; ctx.stroke();
  }
  ctx.restore();
}

function getRouletteLabel(participant, index, count) {
  if (count > 24) return String(index + 1);
  const text = getParticipantDisplay(participant);
  return text.length > 14 ? text.slice(0, 13) + "…" : text;
}
function getLabelFontSize(count) { return count <= 6 ? 34 : count <= 10 ? 28 : count <= 16 ? 22 : count <= 24 ? 17 : 14; }
function degreesToRadians(degrees) { return degrees * Math.PI / 180; }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function renderNumberBoard(highlightNumber = null) {
  const total = getTotalNumbers();
  const takenByNumber = new Map(draw.participants.map(p => [String(p.number), p]));
  const winnerNumber = highlightNumber || (draw.result ? String(draw.result.participant.number) : null);
  const counts = getStatusCounts();
  let cells = "";

  for (let number = 1; number <= total; number += 1) {
    const participant = takenByNumber.get(String(number));
    const isWinner = String(number) === String(winnerNumber);
    const dot = participant ? `<i class="status-dot ${participant.status === "confirmed" ? "confirmed-dot" : "pending-dot"}"></i>` : "";
    cells += `
      <button class="number-cell ${participant ? "taken" : "available"} ${isWinner ? "winner" : ""}" type="button" data-number="${number}" title="${Sortick.escapeHTML(participant ? participant.name : "Disponível")}">
        ${dot}<span>${number}</span>${participant ? `<small>${Sortick.escapeHTML(participant.name)}</small>` : ""}
      </button>`;
  }

  animationArea.innerHTML = `
    <div class="number-board-wrap">
      <div class="number-board-header"><span>Cartela de 1 a ${total}</span><small>${total - counts.total} disponíveis · ${counts.total} ocupados · ${counts.confirmed} confirmados</small></div>
      <div class="number-board">${cells}</div>
    </div>`;

  animationArea.querySelectorAll(".number-cell").forEach(button => {
    button.addEventListener("click", () => {
      if (isDrawing) return;
      const number = button.dataset.number;
      const participant = takenByNumber.get(String(number));
      if (participant) return toggleParticipantStatus(participant.id);
      participantNumber.value = number;
      playSelectSound();
      participantName.focus();
      setValidation(`Número ${number} selecionado. Informe o nome do participante.`);
    });
  });
}

function renderResult() {
  if (!draw.result) {
    winnerCard.classList.add("hidden"); winnerName.textContent = ""; winnerMeta.textContent = ""; proofText.textContent = ""; return;
  }
  const p = draw.result.participant;
  winnerCard.classList.remove("hidden");
  winnerName.textContent = getParticipantDisplay(p);
  winnerMeta.textContent = draw.type === "numbers" ? `Associado a: ${p.name} · ${Sortick.statusLabel(p.status)}` : `${Sortick.typeLabel(draw.type)} · ${Sortick.statusLabel(p.status)}`;
  proofText.textContent = createProofText();
}

function getParticipantDisplay(participant) { return draw.type === "numbers" ? `Nº ${participant.number}` : participant.name; }
function createProofText() {
  if (!draw.result) return "";

  const p = draw.result.participant;
  const lines = [
    `Sortick — Resultado do sorteio`,
    `Sorteio: ${draw.title}`,
    `Tipo: ${Sortick.typeLabel(draw.type)}`,
    `Vencedor: ${getParticipantDisplay(p)}`
  ];

  if (draw.type === "numbers") {
    lines.push(`Associado a: ${p.name}`);
    lines.push(`Cartela: 1 a ${getTotalNumbers()}`);
  }

  lines.push(`Status: ${Sortick.statusLabel(p.status)}`);
  lines.push(`Participantes no sorteio: ${draw.result.participantCount || draw.participants.length}`);
  lines.push(`Data: ${Sortick.formatDateTime(draw.result.createdAt)}`);
  lines.push(`Feito no Sortick`);

  return lines.join("\n");
}

function createShareText() {
  if (!draw.result) return "";

  const p = draw.result.participant;
  const lines = [
    `Veja o resultado do meu sorteio no Sortick:`,
    ``,
    `Sorteio: ${draw.title}`,
    `Vencedor: ${getParticipantDisplay(p)}`
  ];

  if (draw.type === "numbers") {
    lines.push(`Associado a: ${p.name}`);
  }

  lines.push(`Status: ${Sortick.statusLabel(p.status)}`);
  lines.push(`Data: ${Sortick.formatDateTime(draw.result.createdAt)}`);
  lines.push(``);
  lines.push(`Feito no Sortick`);

  if (draw.result.shareUrl) {
    lines.push(draw.result.shareUrl);
  }

  return lines.join("\n");
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let currentY = y;

  for (let index = 0; index < words.length; index += 1) {
    const testLine = line ? `${line} ${words[index]}` : words[index];
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = words[index];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    context.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function downloadResultImage() {
  if (!draw.result) return;

  const p = draw.result.participant;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#6c4dff");
  gradient.addColorStop(1, "#00c2a8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(1060, 130, 170, 0, Math.PI * 2);
  ctx.fill();

  const cardX = 90;
  const cardY = 95;
  const cardW = canvas.width - 180;
  const cardH = canvas.height - 190;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, cardX, cardY, cardW, cardH, 42);
  ctx.fill();

  ctx.fillStyle = "#17142f";
  ctx.font = "900 44px Inter, Arial, sans-serif";
  ctx.fillText("Resultado do sorteio", 150, 180);

  ctx.fillStyle = "#6f6b85";
  ctx.font = "700 28px Inter, Arial, sans-serif";
  ctx.fillText(draw.title, 150, 228);

  ctx.fillStyle = "#f5f5ff";
  roundRect(ctx, 150, 275, cardW - 120, 260, 34);
  ctx.fill();

  ctx.fillStyle = "#6f6b85";
  ctx.font = "800 28px Inter, Arial, sans-serif";
  ctx.fillText("Vencedor", 190, 340);

  ctx.fillStyle = "#17142f";
  ctx.font = "900 84px Inter, Arial, sans-serif";
  const winnerText = getParticipantDisplay(p);
  let winnerFont = 84;
  while (ctx.measureText(winnerText).width > cardW - 180 && winnerFont > 46) {
    winnerFont -= 4;
    ctx.font = `900 ${winnerFont}px Inter, Arial, sans-serif`;
  }
  ctx.fillText(winnerText, 190, 425);

  ctx.fillStyle = "#6f6b85";
  ctx.font = "800 30px Inter, Arial, sans-serif";
  const metaText = draw.type === "numbers"
    ? `Associado a ${p.name} · ${Sortick.statusLabel(p.status)}`
    : `${Sortick.typeLabel(draw.type)} · ${Sortick.statusLabel(p.status)}`;
  wrapCanvasText(ctx, metaText, 190, 480, cardW - 200, 40);

  let y = 620;
  ctx.fillStyle = "#17142f";
  ctx.font = "900 36px Inter, Arial, sans-serif";
  ctx.fillText("Resumo", 150, y);
  y += 60;

  ctx.fillStyle = "#6f6b85";
  ctx.font = "700 29px Inter, Arial, sans-serif";
  y = wrapCanvasText(ctx, `Tipo: ${Sortick.typeLabel(draw.type)}`, 150, y, cardW - 160, 40);
  y = wrapCanvasText(ctx, `Participantes no sorteio: ${draw.result.participantCount || draw.participants.length}`, 150, y + 10, cardW - 160, 40);

  if (draw.type === "numbers") {
    y = wrapCanvasText(ctx, `Cartela: 1 a ${getTotalNumbers()}`, 150, y + 10, cardW - 160, 40);
  }

  y = wrapCanvasText(ctx, `Data: ${Sortick.formatDateTime(draw.result.createdAt)}`, 150, y + 10, cardW - 160, 40);

  ctx.fillStyle = "#17142f";
  ctx.font = "900 34px Inter, Arial, sans-serif";
  ctx.fillText("Feito no Sortick", 150, 1060);

  const link = document.createElement("a");
  const safeTitle = draw.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "sorteio";
  link.download = `sortick-resultado-${safeTitle}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

participantForm.addEventListener("submit", event => {
  event.preventDefault(); if (isDrawing) return; setValidation();
  const name = Sortick.normalizeText(participantName.value);
  const number = Sortick.normalizeText(participantNumber.value);
  const status = participantStatus.value === "confirmed" ? "confirmed" : "pending";
  if (!name) { setValidation("Informe o nome do participante."); participantName.focus(); return; }
  const participant = { id: Sortick.createId("p"), name, status };

  if (draw.type === "numbers") {
    if (!number) { setValidation("Informe o número do participante."); participantNumber.focus(); return; }
    const numericNumber = Number.parseInt(number, 10);
    if (Number.isNaN(numericNumber) || numericNumber < 1 || numericNumber > getTotalNumbers()) { setValidation(`Informe um número entre 1 e ${getTotalNumbers()}.`); return; }
    if (draw.participants.some(p => String(p.number) === String(numericNumber))) { setValidation("Este número já está ocupado."); return; }
    participant.number = String(numericNumber);
  } else if (draw.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    setValidation("Este nome já está na lista."); return;
  }

  draw.participants.push(participant); draw.result = null; persist();
  participantName.value = ""; participantNumber.value = ""; participantName.focus(); render();
});

drawButton.addEventListener("click", async () => {
  const eligible = getEligibleParticipants();
  if (isDrawing || eligible.length < getMinimumParticipants()) return;
  isDrawing = true;
  drawButton.disabled = true;
  copyButton.disabled = true;
  shareButton.disabled = true;
  downloadButton.disabled = true;
  setRuleOptionsLocked(true);
  winnerCard.classList.add("hidden");
  await runCountdown();
  const winnerIndex = Sortick.secureRandomIndex(eligible.length);
  const winner = eligible[winnerIndex];
  const animationResult = await runAnimation(winner, winnerIndex, eligible);
  draw.result = {
    participant: winner,
    participantIndex: winnerIndex,
    createdAt: new Date().toISOString(),
    wheelRotation: animationResult.wheelRotation || null,
    participantCount: eligible.length,
    rouletteParticipants: draw.type === "roulette" ? eligible.map(participant => ({ ...participant })) : null
  };
  if (draw.options.removeWinnerAfterDraw) {
    draw.participants = draw.participants.filter(participant => participant.id !== winner.id);
  }
  persist();
  isDrawing = false;
  setRuleOptionsLocked(false);
  render();
  launchConfetti();
});


let sortickAudioContext = null;

function getSortickAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return null;
  }

  if (!sortickAudioContext) {
    sortickAudioContext = new AudioContext();
  }

  if (sortickAudioContext.state === "suspended") {
    sortickAudioContext.resume();
  }

  return sortickAudioContext;
}

function playTone(frequency = 440, duration = 0.08, type = "sine", volume = 0.035) {
  if (!draw.options.soundEnabled) {
    return;
  }

  try {
    const context = getSortickAudioContext();

    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  } catch {
    // Se o navegador bloquear áudio, o Sortick continua funcionando sem som.
  }
}

function playTickSound() {
  playTone(620, 0.045, "square", 0.025);
}

function playSelectSound() {
  playTone(420, 0.055, "sine", 0.025);
}

function playSuccessSound() {
  if (!draw.options.soundEnabled) {
    return;
  }

  playTone(523.25, 0.09, "sine", 0.045);
  setTimeout(() => playTone(659.25, 0.09, "sine", 0.045), 95);
  setTimeout(() => playTone(783.99, 0.14, "sine", 0.045), 190);
}

function runCountdown() {
  const steps = ["3", "2", "1"];
  let index = 0;
  return new Promise(resolve => {
    function next() {
      if (index >= steps.length) return resolve();
      animationArea.innerHTML = `<div class="countdown-number">${steps[index]}</div>`;
      playTickSound();
      index += 1;
      setTimeout(next, 640);
    }
    next();
  });
}

function launchConfetti() {
  const colors = ["#ffca3a", "#ff4b6e", "#00c2a8", "#6c4dff", "#ffffff"];
  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Sortick.secureRandomIndex(100)}%`;
    piece.style.background = colors[Sortick.secureRandomIndex(colors.length)];
    piece.style.animationDelay = `${Sortick.secureRandomIndex(260)}ms`;
    animationArea.appendChild(piece);
    setTimeout(() => piece.remove(), 1900);
  }
}

async function runAnimation(winner, winnerIndex, eligible) {
  if (draw.type === "roulette") return runRouletteCanvasAnimation(winnerIndex, eligible);
  const duration = 2600, start = performance.now(); let lastTick = 0;
  return new Promise(resolve => {
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const delay = 55 + progress * 170;
      if (now - lastTick > delay) {
        lastTick = now;
        playTickSound();
        const randomParticipant = eligible[Sortick.secureRandomIndex(eligible.length)];
        if (draw.type === "numbers") renderNumberBoard(randomParticipant.number);
        else animationArea.innerHTML = `<div class="rolling-name">${Sortick.escapeHTML(getParticipantDisplay(randomParticipant))}</div>`;
      }
      if (progress < 1) requestAnimationFrame(frame);
      else { draw.type === "numbers" ? renderNumberBoard(winner.number) : animationArea.innerHTML = `<div class="rolling-name">${Sortick.escapeHTML(getParticipantDisplay(winner))}</div>`; playSuccessSound(); setTimeout(() => resolve({}), 350); }
    }
    requestAnimationFrame(frame);
  });
}

function runRouletteCanvasAnimation(winnerIndex, eligible) {
  const count = eligible.length;
  const sliceDegrees = 360 / count;
  const currentBase = currentWheelRotation % 360;
  const winnerCenter = winnerIndex * sliceDegrees + sliceDegrees / 2;
  const normalizedTarget = 360 - winnerCenter;
  const extraTurns = 6 + Sortick.secureRandomIndex(3);
  const finalRotation = currentBase + extraTurns * 360 + ((normalizedTarget - currentBase + 360) % 360);
  const duration = 4300;
  const start = performance.now();
  const startRotation = currentWheelRotation;

  let lastActiveIndex = null;
  let lastWheelTickTime = 0;

  renderRouletteCanvas(startRotation, null);

  return new Promise(resolve => {
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const rotation = startRotation + (finalRotation - startRotation) * easeOutCubic(progress);

      currentWheelRotation = rotation;
      drawWheel(document.querySelector("#rouletteCanvas"), eligible, rotation, null);

      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const pointerAngle = (360 - normalizedRotation + 360) % 360;
      const activeIndex = Math.floor(pointerAngle / sliceDegrees) % count;

      if (activeIndex !== lastActiveIndex && now - lastWheelTickTime > 28) {
        lastActiveIndex = activeIndex;
        lastWheelTickTime = now;
        playTickSound();
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        currentWheelRotation = finalRotation;
        renderRouletteCanvas(finalRotation, winnerIndex);
        playSuccessSound();
        setTimeout(() => resolve({ wheelRotation: finalRotation }), 350);
      }
    }

    requestAnimationFrame(frame);
  });
}

confirmedOnlyToggle.addEventListener("change", () => {
  if (isDrawing) {
    confirmedOnlyToggle.checked = Boolean(draw.options.confirmedOnly);
    return;
  }

  draw.options.confirmedOnly = confirmedOnlyToggle.checked;
  draw.result = null;
  persist();
  render();
});

removeWinnerToggle.addEventListener("change", () => {
  if (isDrawing) {
    removeWinnerToggle.checked = Boolean(draw.options.removeWinnerAfterDraw);
    return;
  }

  draw.options.removeWinnerAfterDraw = removeWinnerToggle.checked;
  persist();
});

if (soundToggle) {
  soundToggle.addEventListener("change", () => {
    draw.options.soundEnabled = soundToggle.checked;
    persist();

    if (soundToggle.checked) {
      getSortickAudioContext();
      playSuccessSound();
      setValidation("Som ativado.");
    } else {
      setValidation("Som desativado.");
    }
  });
}

participantFilter.addEventListener("change", renderParticipants);

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(createProofText());
    copyButton.textContent = "Copiado!";
    setTimeout(() => copyButton.textContent = "Copiar resumo", 1400);
  } catch {
    setValidation("Não foi possível copiar automaticamente. Copie o resumo manualmente.");
  }
});

shareButton.addEventListener("click", async () => {
  if (!draw.result) return;

  const shareText = createShareText();

  try {
    if (navigator.share) {
      await navigator.share({
        title: `Resultado do sorteio — ${draw.title}`,
        text: shareText
      });
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareText);
      setValidation("Seu navegador não abriu o compartilhamento nativo. O texto foi copiado.");
      return;
    }

    setValidation("Compartilhamento nativo não disponível neste navegador.");
  } catch (error) {
    if (String(error && error.name) === "AbortError") return;
    setValidation("Não foi possível compartilhar agora.");
  }
});

downloadButton.addEventListener("click", () => {
  try {
    downloadResultImage();
  } catch {
    setValidation("Não foi possível gerar a imagem agora.");
  }
});

resetButton.addEventListener("click", () => { if (isDrawing) return; draw.result = null; persist(); render(); });
clearParticipantsButton.addEventListener("click", () => {
  if (isDrawing) return; if (!confirm("Limpar todos os participantes deste sorteio?")) return;
  draw.participants = []; draw.result = null; persist(); render();
});

sampleButton.addEventListener("click", () => {
  if (isDrawing) return;
  if (draw.type === "numbers") {
    const total = getTotalNumbers();
    const numbers = [1, Math.min(7, total), Math.min(12, total), Math.min(27, total)].filter((v, i, a) => a.indexOf(v) === i);
    const names = ["Ana", "Bruno", "Carla", "Diego"];
    draw.participants = numbers.map((number, index) => ({ id: Sortick.createId("p"), name: names[index], number: String(number), status: index % 2 === 0 ? "confirmed" : "pending" }));
  } else {
    draw.participants = [
      { name: "Ana", status: "confirmed" }, { name: "Bruno", status: "pending" }, { name: "Carla", status: "confirmed" }, { name: "Diego", status: "pending" }
    ].map(item => ({ id: Sortick.createId("p"), ...item }));
  }
  draw.result = null; persist(); render();
});


bulkButton.addEventListener("click", () => {
  if (draw.type === "numbers") {
    setValidation("Adicionar vários está disponível para nomes e roleta nesta versão.");
    return;
  }
  bulkAddPanel.classList.toggle("hidden");
  bulkText.focus();
});

cancelBulkButton.addEventListener("click", () => {
  bulkAddPanel.classList.add("hidden");
  bulkText.value = "";
});

confirmBulkButton.addEventListener("click", () => {
  if (draw.type === "numbers") return;
  const status = participantStatus.value === "confirmed" ? "confirmed" : "pending";
  const names = bulkText.value.split(/\r?\n/).map(Sortick.normalizeText).filter(Boolean);
  if (!names.length) { setValidation("Cole pelo menos um nome."); return; }
  const existing = new Set(draw.participants.map(participant => participant.name.toLowerCase()));
  let added = 0;
  let ignored = 0;
  names.forEach(name => {
    if (existing.has(name.toLowerCase())) { ignored += 1; return; }
    draw.participants.push({ id: Sortick.createId("p"), name, status });
    existing.add(name.toLowerCase());
    added += 1;
  });
  draw.result = null; persist();
  bulkText.value = "";
  bulkAddPanel.classList.add("hidden");
  setValidation(`${added} nome(s) adicionado(s). ${ignored ? `${ignored} duplicado(s) ignorado(s).` : ""}`);
  render();
});

shuffleButton.addEventListener("click", () => {
  if (isDrawing) return;
  if (draw.type === "numbers") {
    setValidation("A cartela de números já fica organizada por número.");
    return;
  }
  draw.participants = Sortick.shuffleArray(draw.participants);
  draw.result = null;
  persist();
  setValidation("Lista embaralhada.");
  render();
});
