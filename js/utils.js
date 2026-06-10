const Sortick = (() => {
  const STORAGE_KEY = "sortick_draws_v7";

  function createId(prefix = "st") {
    const partA = Date.now().toString(36);
    const partB = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${partA}_${partB}`;
  }

  function readDraws() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function writeDraws(draws) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
  }

  function saveDraw(draw) {
    const draws = readDraws();
    draws[draw.id] = draw;
    writeDraws(draws);
    return draw;
  }

  function getDraw(id) {
    const draws = readDraws();
    return draws[id] || null;
  }

  function deleteDraw(id) {
    const draws = readDraws();

    if (!draws[id]) return false;

    delete draws[id];
    writeDraws(draws);
    return true;
  }

  function updateDraw(id, updater) {
    const draws = readDraws();
    if (!draws[id]) return null;

    const updated = updater(draws[id]);
    draws[id] = updated;
    writeDraws(draws);

    return updated;
  }

  function secureRandomIndex(length) {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error("Tamanho inválido para sorteio.");
    }

    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      const max = 0xffffffff;
      const limit = max - (max % length);

      let value;
      do {
        window.crypto.getRandomValues(array);
        value = array[0];
      } while (value >= limit);

      return value % length;
    }

    return Math.floor(Math.random() * length);
  }

  function shuffleArray(array) {
    const copy = array.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = secureRandomIndex(index + 1);
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function formatDateTime(isoString) {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium"
    }).format(new Date(isoString));
  }

  function typeLabel(type) {
    const labels = {
      names: "Sorteio por nomes",
      roulette: "Roleta",
      numbers: "Número da sorte",
      bingo: "Bingo",
      groups: "Grupos / Times"
    };

    return labels[type] || "Sorteio";
  }

  function statusLabel(status) {
    return status === "confirmed" ? "Confirmado" : "Pendente";
  }

  function normalizeText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  function clampNumber(value, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return min;
    return Math.min(Math.max(parsed, min), max);
  }

  return {
    createId,
    readDraws,
    saveDraw,
    getDraw,
    deleteDraw,
    updateDraw,
    secureRandomIndex,
    shuffleArray,
    formatDateTime,
    typeLabel,
    statusLabel,
    normalizeText,
    escapeHTML,
    clampNumber
  };
})();
