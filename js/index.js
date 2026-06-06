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
