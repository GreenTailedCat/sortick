const form = document.querySelector("#createForm");
const titleInput = document.querySelector("#drawTitle");
const typeInput = document.querySelector("#drawType");
const modeInput = document.querySelector("#drawMode");
const numberQuantityField = document.querySelector("#numberQuantityField");
const totalNumbersInput = document.querySelector("#totalNumbers");

function syncNumberSettings() {
  const isNumbers = typeInput.value === "numbers";
  numberQuantityField.classList.toggle("hidden", !isNumbers);
  totalNumbersInput.required = isNumbers;
}

typeInput.addEventListener("change", syncNumberSettings);
syncNumberSettings();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = Sortick.normalizeText(titleInput.value);
  const type = typeInput.value;
  const mode = modeInput.value;

  if (!title) {
    titleInput.focus();
    return;
  }

  const options = { confirmedOnly: false,
    removeWinnerAfterDraw: false };

  if (type === "numbers") {
    options.totalNumbers = Sortick.clampNumber(totalNumbersInput.value, 2, 500);
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

  window.location.href = `sorteio.html?id=${encodeURIComponent(draw.id)}`;
});
