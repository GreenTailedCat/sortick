const modeCarouselTrack = document.querySelector("#modos .mode-carousel-track");
const modeCarouselPrev = document.querySelector("#modos .carousel-button-prev");
const modeCarouselNext = document.querySelector("#modos .carousel-button-next");

function scrollModeCarousel(direction) {
  if (!modeCarouselTrack) return;
  const card = modeCarouselTrack.querySelector(".mode-card");
  const amount = card ? card.getBoundingClientRect().width + 18 : 320;
  modeCarouselTrack.scrollBy({ left: direction * amount, behavior: "smooth" });
}
if (modeCarouselPrev) modeCarouselPrev.addEventListener("click", () => scrollModeCarousel(-1));
if (modeCarouselNext) modeCarouselNext.addEventListener("click", () => scrollModeCarousel(1));

const form = document.querySelector("#createForm");
const typeInput = document.querySelector("#drawType");
const titleInput = document.querySelector("#drawTitle");
const modeInput = document.querySelector("#drawMode");
const activityWizard = document.querySelector("#activityCreateWizard");
const cartelaWizard = document.querySelector("#cartelaCreateWizard");
const quickCreationField = document.querySelector("#quickCreationField");
const activityDescription = document.querySelector("#activityDescription");
const activityDate = document.querySelector("#activityDate");
const activityNote = document.querySelector("#activityNote");
const activityImage = document.querySelector("#activityCreateImage");
const activityImagePreview = document.querySelector("#activityCreateImagePreview");
const activityImagePreviewImage = document.querySelector("#activityCreateImagePreviewImage");
const activityImageName = document.querySelector("#activityCreateImageName");
const activityImageStatus = document.querySelector("#activityCreateImageStatus");
const activityRemoveImage = document.querySelector("#activityCreateRemoveImage");
const activityNext1 = document.querySelector("#activityWizardNext1");
const activityBack2 = document.querySelector("#activityWizardBack2");
const activityNext2 = document.querySelector("#activityWizardNext2");
const activityBack3 = document.querySelector("#activityWizardBack3");
const activityModeConfigArea = document.querySelector("#activityModeConfigArea");
const selectionField = document.querySelector("#selectionCreationField");
const selectionMode = document.querySelector("#selectionModeInput");
const selectionCountField = document.querySelector("#selectionCountField");
const selectionCount = document.querySelector("#selectionCountInput");
const noRepeat = document.querySelector("#noRepeatInput");
const bingoField = document.querySelector("#bingoQuantityField");
const bingoTotal = document.querySelector("#bingoTotalNumbers");
const groupField = document.querySelector("#groupQuantityField");
const groupCount = document.querySelector("#groupCount");
const groupNamesField = document.querySelector("#groupNamesCreationField");
const groupNames = document.querySelector("#groupNamesInput");
const quickType = document.querySelector("#quickTypeInput");
const quickDiceField = document.querySelector("#quickDiceField");
const quickDiceSides = document.querySelector("#quickDiceSidesInput");
const quickRandomFields = document.querySelector("#quickRandomFields");
const quickMin = document.querySelector("#quickMinInput");
const quickMax = document.querySelector("#quickMaxInput");
const quickRepeat = document.querySelector("#quickRandomRepeatInput");
const cartelaCreateTitle = document.querySelector("#cartelaCreateTitle");
const cartelaCreateDescription = document.querySelector("#cartelaCreateDescription");
const cartelaCreateTotal = document.querySelector("#cartelaCreateTotal");
const cartelaCreateDate = document.querySelector("#cartelaCreateDate");
const cartelaCreateValue = document.querySelector("#cartelaCreateValue");
const cartelaCreateNote = document.querySelector("#cartelaCreateNote");
const cartelaCreatePrizeList = document.querySelector("#cartelaCreatePrizeList");
const cartelaCreateAddPrize = document.querySelector("#cartelaCreateAddPrize");
const cartelaImage = document.querySelector("#cartelaCreateImage");
const cartelaImagePreview = document.querySelector("#cartelaCreateImagePreview");
const cartelaImagePreviewImage = document.querySelector("#cartelaCreateImagePreviewImage");
const cartelaImageName = document.querySelector("#cartelaCreateImageName");
const cartelaImageStatus = document.querySelector("#cartelaCreateImageStatus");
const cartelaRemoveImage = document.querySelector("#cartelaCreateRemoveImage");
const cartelaNext1 = document.querySelector("#cartelaWizardNext1");
const cartelaBack2 = document.querySelector("#cartelaWizardBack2");
const cartelaNext2 = document.querySelector("#cartelaWizardNext2");
const cartelaBack3 = document.querySelector("#cartelaWizardBack3");
const cartelaCreate = document.querySelector("#cartelaWizardCreate");
const savedDrawsList = document.querySelector("#savedDrawsList");

let activityStep = 1;
let cartelaStep = 1;
let activityImageData = "";
let activityImageNameValue = "";
let cartelaImageData = "";
let cartelaImageNameValue = "";

function normalize(text) { return Sortick.normalizeText(text || ""); }
function allowedType(type) { return ["names", "roulette", "numbers", "bingo", "groups", "quick"].includes(type) ? type : "names"; }
function currentType() { return allowedType(typeInput.value); }
function isGeneric() { return ["names", "roulette", "bingo", "groups"].includes(currentType()); }
function setHidden(element, hidden) { if (element) element.classList.toggle("hidden", hidden); }

function setActivityStep(step) {
  activityStep = Math.max(1, Math.min(3, Number(step) || 1));
  document.querySelectorAll("[data-activity-step]").forEach(section => setHidden(section, Number(section.dataset.activityStep) !== activityStep));
  document.querySelectorAll("[data-activity-step-indicator]").forEach(indicator => {
    const value = Number(indicator.dataset.activityStepIndicator);
    indicator.classList.toggle("is-active", value === activityStep);
    indicator.classList.toggle("is-complete", value < activityStep);
  });
  if (activityModeConfigArea) setHidden(activityModeConfigArea, activityStep !== 3 || !isGeneric());
}

function setCartelaStep(step) {
  cartelaStep = Math.max(1, Math.min(3, Number(step) || 1));
  document.querySelectorAll("[data-cartela-step]").forEach(section => setHidden(section, Number(section.dataset.cartelaStep) !== cartelaStep));
  document.querySelectorAll("[data-cartela-step-indicator]").forEach(indicator => {
    const value = Number(indicator.dataset.cartelaStepIndicator);
    indicator.classList.toggle("is-active", value === cartelaStep);
    indicator.classList.toggle("is-complete", value < cartelaStep);
  });
}

function syncSelection() { setHidden(selectionCountField, selectionMode.value !== "multiple"); }
function syncQuick() {
  const type = quickType.value;
  setHidden(quickDiceField, type !== "dice");
  setHidden(quickRandomFields, type !== "random");
}
function syncForm() {
  const type = currentType();
  const generic = isGeneric();
  setHidden(activityWizard, !generic);
  setHidden(cartelaWizard, type !== "numbers");
  setHidden(quickCreationField, type !== "quick");
  titleInput.required = generic;
  setHidden(selectionField, !(generic && (type === "names" || type === "roulette")));
  setHidden(bingoField, !(generic && type === "bingo"));
  setHidden(groupField, !(generic && type === "groups"));
  setHidden(groupNamesField, !(generic && type === "groups"));
  if (generic) setActivityStep(activityStep);
  if (type === "numbers") setCartelaStep(cartelaStep);
  syncSelection();
  syncQuick();
}

function updateImagePreview(kind) {
  const isActivity = kind === "activity";
  const data = isActivity ? activityImageData : cartelaImageData;
  const name = isActivity ? activityImageNameValue : cartelaImageNameValue;
  const preview = isActivity ? activityImagePreview : cartelaImagePreview;
  const image = isActivity ? activityImagePreviewImage : cartelaImagePreviewImage;
  const label = isActivity ? activityImageName : cartelaImageName;
  if (!preview) return;
  setHidden(preview, !data);
  if (data) { image.src = data; label.textContent = name || "Imagem selecionada"; }
  else { image.removeAttribute("src"); label.textContent = "Imagem selecionada"; }
}
function setImageStatus(kind, message) { const el = kind === "activity" ? activityImageStatus : cartelaImageStatus; if (el) el.textContent = message; }
async function handleImage(kind) {
  const input = kind === "activity" ? activityImage : cartelaImage;
  const file = input && input.files ? input.files[0] : null;
  if (!file) return;
  setImageStatus(kind, "Preparando imagem...");
  try {
    const prepared = await Sortick.prepareImageFile(file);
    if (kind === "activity") { activityImageData = prepared.dataUrl; activityImageNameValue = prepared.name; }
    else { cartelaImageData = prepared.dataUrl; cartelaImageNameValue = prepared.name; }
    updateImagePreview(kind); setImageStatus(kind, "Imagem pronta.");
  } catch (error) {
    input.value = "";
    if (kind === "activity") { activityImageData = ""; activityImageNameValue = ""; }
    else { cartelaImageData = ""; cartelaImageNameValue = ""; }
    updateImagePreview(kind); setImageStatus(kind, error && error.message ? error.message : "Não foi possível usar esta imagem.");
  }
}
function removeImage(kind) {
  const input = kind === "activity" ? activityImage : cartelaImage;
  if (input) input.value = "";
  if (kind === "activity") { activityImageData = ""; activityImageNameValue = ""; }
  else { cartelaImageData = ""; cartelaImageNameValue = ""; }
  updateImagePreview(kind); setImageStatus(kind, "Imagem removida.");
}

function prizeRow(prize = {}, focus = false) {
  if (!cartelaCreatePrizeList || cartelaCreatePrizeList.children.length >= 10) return;
  const row = document.createElement("div");
  row.className = "cartela-prize-row";
  row.dataset.prizeId = prize.id || Sortick.createId("prize");
  row.innerHTML = `<label>Prêmio<input data-prize-name type="text" maxlength="100" value="${Sortick.escapeHTML(prize.name || "")}" placeholder="Ex: Cesta de chocolates" /></label><label class="inline-option cartela-prize-repeat-option"><input data-prize-repeat type="checkbox" ${prize.repeatable ? "checked" : ""} />Pode repetir este prêmio</label><button class="link-button danger-text" type="button">Remover</button>`;
  row.querySelector("button").addEventListener("click", () => { if (cartelaCreatePrizeList.children.length === 1) { row.querySelector("[data-prize-name]").value = ""; row.querySelector("[data-prize-repeat]").checked = false; } else row.remove(); });
  cartelaCreatePrizeList.appendChild(row); if (focus) row.querySelector("[data-prize-name]").focus();
}
function prizes() {
  return Array.from(cartelaCreatePrizeList ? cartelaCreatePrizeList.querySelectorAll(".cartela-prize-row") : []).map(row => ({ id: row.dataset.prizeId || Sortick.createId("prize"), name: normalize(row.querySelector("[data-prize-name]").value).slice(0,100), repeatable: Boolean(row.querySelector("[data-prize-repeat]").checked) })).filter(item => item.name);
}
function groupNameList(value, count) {
  const entries = String(value || "").split(/[\n,;]+/).map(normalize).filter(Boolean).slice(0,count);
  return Array.from({length: count}, (_, index) => entries[index] || `Grupo ${index + 1}`);
}
function validateGenericStepOne() { if (!normalize(titleInput.value)) { titleInput.focus(); return false; } return true; }
function validateCartelaStepOne() {
  if (!normalize(cartelaCreateTitle.value)) { cartelaCreateTitle.focus(); return false; }
  const value = Number.parseInt(cartelaCreateTotal.value, 10);
  if (!Number.isInteger(value) || value < 2 || value > 500) { cartelaCreateTotal.focus(); return false; }
  return true;
}
function createCartela() {
  if (!validateCartelaStepOne()) { setCartelaStep(1); return; }
  const allPrizes = prizes();
  const draw = { id: Sortick.createId("draw"), title: normalize(cartelaCreateTitle.value).slice(0,80), type:"numbers", mode:"simple", participants:[], result:null, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), options:{ confirmedOnly:false, removeWinnerAfterDraw:false, soundEnabled:false, totalNumbers:Sortick.clampNumber(cartelaCreateTotal.value,2,500), cartelaInfo:{ description:normalize(cartelaCreateDescription.value).slice(0,180), prize:allPrizes[0] ? allPrizes[0].name : "", prizes:allPrizes, prizeDrawHistory:[], imageData:cartelaImageData, imageName:cartelaImageNameValue, value:normalize(cartelaCreateValue.value).slice(0,30), drawDate:cartelaCreateDate.value || "", note:normalize(cartelaCreateNote.value).slice(0,180), exportShowNames:false } } };
  try { Sortick.saveDraw(draw); } catch { setImageStatus("cartela", "Não foi possível salvar a cartela. Tente remover a imagem ou usar outra menor."); setCartelaStep(2); return; }
  window.location.href = `/sorteio/?id=${encodeURIComponent(draw.id)}`;
}
function createGenericOrQuick() {
  const type = currentType();
  if (type === "numbers") return createCartela();
  if (type !== "quick" && !validateGenericStepOne()) { setActivityStep(1); return; }
  const quickTitles = {coin:"Cara ou coroa",dice:"Dado",random:"Número aleatório"};
  const title = type === "quick" ? quickTitles[quickType.value] || "Decisão rápida" : normalize(titleInput.value).slice(0,80);
  const options = { confirmedOnly:false, removeWinnerAfterDraw:false, soundEnabled:false };
  if (type !== "quick") options.activityInfo = { description:normalize(activityDescription.value).slice(0,180), date:activityDate.value || "", note:normalize(activityNote.value).slice(0,180), imageData:activityImageData, imageName:activityImageNameValue };
  if (type === "names" || type === "roulette") { options.selectionMode=["single","multiple","order"].includes(selectionMode.value) ? selectionMode.value : "single"; options.selectionCount=Sortick.clampNumber(selectionCount.value,2,100); options.noRepeat=Boolean(noRepeat.checked); options.roundDrawnIds=[]; }
  if (type === "bingo") { options.totalNumbers=Sortick.clampNumber(bingoTotal.value,2,500); options.bingoDrawnNumbers=[]; options.bingoAllowRepeats=false; }
  if (type === "groups") { options.groupCount=Sortick.clampNumber(groupCount.value,2,50); options.groupNames=groupNameList(groupNames.value,options.groupCount); }
  if (type === "quick") {
    const selected = ["coin","dice","random"].includes(quickType.value) ? quickType.value : "coin";
    const sides = Number.parseInt(quickDiceSides.value,10);
    const min = Number.parseInt(quickMin.value,10), max=Number.parseInt(quickMax.value,10);
    options.quickType=selected; options.diceSides=[4,6,8,10,12,20].includes(sides)?sides:6; options.diceTray=[]; options.randomMin=Number.isInteger(min)?min:1; options.randomMax=Number.isInteger(max)?max:100; if(options.randomMin>options.randomMax)[options.randomMin,options.randomMax]=[options.randomMax,options.randomMin]; options.randomAllowRepeats=Boolean(quickRepeat.checked); options.randomDrawnNumbers=[];
  }
  const draw={id:Sortick.createId("draw"),title,type,mode:"simple",options,participants:[],result:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  Sortick.saveDraw(draw); window.location.href=`/sorteio/?id=${encodeURIComponent(draw.id)}`;
}

// Step controls.
activityNext1.addEventListener("click", () => { if (validateGenericStepOne()) setActivityStep(2); });
activityBack2.addEventListener("click", () => setActivityStep(1));
activityNext2.addEventListener("click", () => setActivityStep(3));
activityBack3.addEventListener("click", () => setActivityStep(2));
cartelaNext1.addEventListener("click", () => { if (validateCartelaStepOne()) setCartelaStep(2); });
cartelaBack2.addEventListener("click", () => setCartelaStep(1));
cartelaNext2.addEventListener("click", () => setCartelaStep(3));
cartelaBack3.addEventListener("click", () => setCartelaStep(2));
cartelaCreate.addEventListener("click", createCartela);
cartelaCreateAddPrize.addEventListener("click", () => prizeRow({}, true));
if (!cartelaCreatePrizeList.children.length) prizeRow();
activityImage.addEventListener("change", () => handleImage("activity"));
cartelaImage.addEventListener("change", () => handleImage("cartela"));
activityRemoveImage.addEventListener("click", () => removeImage("activity"));
cartelaRemoveImage.addEventListener("click", () => removeImage("cartela"));
typeInput.addEventListener("change", () => { activityStep=1; cartelaStep=1; syncForm(); });
selectionMode.addEventListener("change", syncSelection);
quickType.addEventListener("change", syncQuick);
form.addEventListener("submit", event => { event.preventDefault(); createGenericOrQuick(); });

function readDraws() { return Object.values(Sortick.readDraws()).filter(item => item && item.id && item.title).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)); }
function drawSummary(item) { const p=(item.participants||[]).length; if(item.type==="numbers")return `${p} número(s) ocupado(s)`; if(item.type==="bingo")return `${(item.options?.bingoDrawnNumbers||[]).length} número(s) sorteado(s)`; if(item.type==="groups")return `${p} participante(s) · ${item.options?.groupCount||2} grupo(s)`; if(item.type==="quick")return ({coin:"Cara ou coroa",dice:"Dados",random:"Número aleatório"})[item.options?.quickType]||"Decisão rápida"; return `${p} participante(s)`; }
function renderSavedDraws() {
  if(!savedDrawsList)return; const draws=readDraws();
  if(!draws.length){savedDrawsList.innerHTML='<div class="saved-empty"><strong>Nenhum sorteio salvo ainda</strong><p>Quando você criar um sorteio, ele ficará salvo automaticamente neste navegador.</p></div>';return;}
  savedDrawsList.innerHTML="";
  draws.forEach(item=>{const card=document.createElement("article");card.className="saved-draw-item";card.innerHTML=`<div class="saved-draw-info"><strong>${Sortick.escapeHTML(item.title)}</strong><span>${Sortick.escapeHTML(Sortick.typeLabel(item.type))} · ${Sortick.escapeHTML(drawSummary(item))}</span><small>Atualizado em ${Sortick.escapeHTML(Sortick.formatDateTime(item.updatedAt||item.createdAt))}</small></div><div class="saved-draw-actions"><a class="btn btn-secondary saved-continue" href="/sorteio/?id=${encodeURIComponent(item.id)}">Continuar</a><button class="saved-action-button" type="button">Duplicar</button><button class="saved-delete" type="button">Excluir</button></div>`;const [duplicate,remove]=card.querySelectorAll("button");duplicate.addEventListener("click",()=>{const copy={...item,id:Sortick.createId("draw"),title:`${item.title} (cópia)`.slice(0,80),participants:(item.participants||[]).map(p=>({...p,id:Sortick.createId("p")})),result:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};Sortick.saveDraw(copy);window.location.href=`/sorteio/?id=${encodeURIComponent(copy.id)}`;});remove.addEventListener("click",async()=>{const confirmation=await Sortick.askForConfirmation({title:"Excluir sorteio?",message:`“${item.title}” será removido deste navegador.`,confirmText:"Excluir",tone:"danger"});if(confirmation.confirmed){Sortick.deleteDraw(item.id);renderSavedDraws();}});savedDrawsList.appendChild(card);});
}

const requestedType=new URLSearchParams(location.search).get("tipo"); if(requestedType && ["names","roulette","numbers","bingo","groups","quick"].includes(requestedType)) typeInput.value=requestedType;
syncForm(); renderSavedDraws();
