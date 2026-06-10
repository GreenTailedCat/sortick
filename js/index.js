const modeCarouselTrack = document.querySelector("#modos .mode-carousel-track");
const modeCarouselPrev = document.querySelector("#modos .carousel-button-prev");
const modeCarouselNext = document.querySelector("#modos .carousel-button-next");

function scrollModeCarousel(direction) {
  if (!modeCarouselTrack) return;

  const firstCard = modeCarouselTrack.querySelector(".mode-card");
  const amount = firstCard ? firstCard.getBoundingClientRect().width + 18 : 320;

  modeCarouselTrack.scrollBy({
    left: amount * direction,
    behavior: "smooth"
  });
}

if (modeCarouselPrev && modeCarouselNext) {
  modeCarouselPrev.addEventListener("click", () => scrollModeCarousel(-1));
  modeCarouselNext.addEventListener("click", () => scrollModeCarousel(1));
}


const form = document.querySelector("#createForm");
const titleInput = document.querySelector("#drawTitle");
const typeInput = document.querySelector("#drawType");
const modeInput = document.querySelector("#drawMode");
const numberQuantityField = document.querySelector("#numberQuantityField");
const totalNumbersInput = document.querySelector("#totalNumbers");
const bingoQuantityField = document.querySelector("#bingoQuantityField");
const bingoTotalNumbersInput = document.querySelector("#bingoTotalNumbers");
const groupQuantityField = document.querySelector("#groupQuantityField");
const groupCountInput = document.querySelector("#groupCount");
const savedDrawsList = document.querySelector("#savedDrawsList");

function syncTypeSettings() {
  const type = typeInput.value;

  numberQuantityField.classList.toggle("hidden", type !== "numbers");
  totalNumbersInput.required = type === "numbers";

  bingoQuantityField.classList.toggle("hidden", type !== "bingo");
  bingoTotalNumbersInput.required = type === "bingo";

  groupQuantityField.classList.toggle("hidden", type !== "groups");
  groupCountInput.required = type === "groups";
}

typeInput.addEventListener("change", syncTypeSettings);
syncTypeSettings();

function applyTypeFromURL() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("tipo");
  const allowedTypes = ["names", "roulette", "numbers", "bingo", "groups"];

  if (type && allowedTypes.includes(type)) {
    typeInput.value = type;
    syncTypeSettings();
  }
}

applyTypeFromURL();


function getSavedDraws() {
  return Object.values(Sortick.readDraws())
    .filter(item => item && item.id && item.title)
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
}

function getSavedDrawSummary(savedDraw) {
  const options = savedDraw.options || {};
  const participants = Array.isArray(savedDraw.participants) ? savedDraw.participants : [];

  if (savedDraw.type === "bingo") {
    const drawn = Array.isArray(options.bingoDrawnNumbers) ? options.bingoDrawnNumbers.length : 0;
    return `${drawn} número(s) sorteado(s)`;
  }

  if (savedDraw.type === "numbers") {
    return `${participants.length} número(s) ocupado(s)`;
  }

  if (savedDraw.type === "groups") {
    return `${participants.length} participante(s) · ${options.groupCount || 2} grupo(s)`;
  }

  return `${participants.length} participante(s)`;
}

function formatSavedDrawDate(savedDraw) {
  try {
    return Sortick.formatDateTime(savedDraw.updatedAt || savedDraw.createdAt);
  } catch {
    return "Data indisponível";
  }
}

function renderSavedDraws() {
  if (!savedDrawsList) return;

  const savedDraws = getSavedDraws();

  if (!savedDraws.length) {
    savedDrawsList.innerHTML = `
      <div class="saved-empty">
        <strong>Nenhum sorteio salvo ainda</strong>
        <p>Crie um sorteio para ele aparecer aqui automaticamente.</p>
      </div>`;
    return;
  }

  savedDrawsList.innerHTML = "";

  savedDraws.forEach(savedDraw => {
    const item = document.createElement("article");
    item.className = "saved-draw-item";

    const info = document.createElement("div");
    info.className = "saved-draw-info";

    const title = document.createElement("strong");
    title.textContent = savedDraw.title;

    const meta = document.createElement("span");
    meta.textContent = `${Sortick.typeLabel(savedDraw.type)} · ${getSavedDrawSummary(savedDraw)}`;

    const date = document.createElement("small");
    date.textContent = `Atualizado em ${formatSavedDrawDate(savedDraw)}`;

    info.append(title, meta, date);

    const actions = document.createElement("div");
    actions.className = "saved-draw-actions";

    const continueLink = document.createElement("a");
    continueLink.className = "btn btn-secondary saved-continue";
    continueLink.href = `/sorteio/?id=${encodeURIComponent(savedDraw.id)}`;
    continueLink.textContent = "Continuar";

    const deleteButton = document.createElement("button");
    deleteButton.className = "saved-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Excluir";
    deleteButton.setAttribute("aria-label", `Excluir sorteio ${savedDraw.title}`);

    deleteButton.addEventListener("click", () => {
      const shouldDelete = confirm(`Excluir o sorteio "${savedDraw.title}" deste navegador?`);

      if (!shouldDelete) return;

      Sortick.deleteDraw(savedDraw.id);
      renderSavedDraws();
    });

    actions.append(continueLink, deleteButton);
    item.append(info, actions);
    savedDrawsList.appendChild(item);
  });
}


renderSavedDraws();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = Sortick.normalizeText(titleInput.value);
  const type = typeInput.value;
  const mode = modeInput.value;

  if (!title) {
    titleInput.focus();
    return;
  }

  const options = {
    confirmedOnly: false,
    removeWinnerAfterDraw: false,
    soundEnabled: false
  };

  if (type === "numbers") {
    options.totalNumbers = Sortick.clampNumber(totalNumbersInput.value, 2, 500);
  }

  if (type === "bingo") {
    options.totalNumbers = Sortick.clampNumber(bingoTotalNumbersInput.value, 2, 500);
    options.bingoDrawnNumbers = [];
    options.bingoAllowRepeats = false;
  }

  if (type === "groups") {
    options.groupCount = Sortick.clampNumber(groupCountInput.value, 2, 50);
  }

  const draw = {
    id: Sortick.createId("draw"),
    title,
    type,
    mode,
    options,
    participants: [],
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  Sortick.saveDraw(draw);

  if (typeof window.sortickTrack === "function") {
    window.sortickTrack("create_draw", {
      draw_type: type,
      draw_mode: mode
    });
  }

  window.location.href = `/sorteio/?id=${encodeURIComponent(draw.id)}`;
});
