const Sortick = (() => {
  const STORAGE_KEY = "sortick_draws_v1";
  const LEGACY_STORAGE_KEYS = ["sortick_draws", "sortick_test_draws_v1"];

  function createId(prefix = "st") {
    const partA = Date.now().toString(36);
    const partB = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${partA}_${partB}`;
  }

  function readDraws() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (current && typeof current === "object" && !Array.isArray(current)) return current;

      for (const key of LEGACY_STORAGE_KEYS) {
        const legacy = JSON.parse(localStorage.getItem(key) || "null");
        if (legacy && typeof legacy === "object") {
          const normalized = Array.isArray(legacy)
            ? Object.fromEntries(legacy.filter(item => item && item.id).map(item => [item.id, item]))
            : legacy;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch {
      return {};
    }
    return {};
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
      groups: "Grupos / Times",
      quick: "Decisões rápidas"
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




  function prepareImageFile(file, {
    maxWidth = 1000,
    maxHeight = 700,
    quality = 0.82,
    maxDataUrlLength = 380000
  } = {}) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || !file.type.startsWith("image/")) {
        reject(new Error("Selecione uma imagem válida."));
        return;
      }

      const reader = new FileReader();

      reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));

      reader.onload = () => {
        const image = new Image();

        image.onerror = () => reject(new Error("Não foi possível abrir a imagem."));

        image.onload = () => {
          let width = image.naturalWidth || image.width;
          let height = image.naturalHeight || image.height;
          const scale = Math.min(1, maxWidth / width, maxHeight / height);

          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Não foi possível preparar a imagem."));
            return;
          }

          let attempt = 0;
          let currentQuality = quality;
          let currentWidth = width;
          let currentHeight = height;
          let dataUrl = "";

          do {
            canvas.width = currentWidth;
            canvas.height = currentHeight;

            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, currentWidth, currentHeight);
            context.drawImage(image, 0, 0, currentWidth, currentHeight);

            dataUrl = canvas.toDataURL("image/jpeg", currentQuality);

            if (dataUrl.length <= maxDataUrlLength) break;

            currentQuality = Math.max(0.58, currentQuality - 0.08);
            currentWidth = Math.max(360, Math.round(currentWidth * 0.82));
            currentHeight = Math.max(240, Math.round(currentHeight * 0.82));
            attempt += 1;
          } while (attempt < 4);

          if (dataUrl.length > maxDataUrlLength) {
            reject(new Error("A imagem ficou grande demais. Escolha outra imagem mais simples."));
            return;
          }

          resolve({
            dataUrl,
            name: normalizeText(file.name).slice(0, 80)
          });
        };

        image.src = String(reader.result || "");
      };

      reader.readAsDataURL(file);
    });
  }

  function createActionModal({
    title,
    message = "",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    tone = "default",
    input = null
  }) {
    return new Promise(resolve => {
      const previousFocus = document.activeElement;
      const overlay = document.createElement("div");
      const panel = document.createElement("section");
      const headingId = `sortick-dialog-${createId("title")}`;

      overlay.className = "sortick-modal-backdrop";
      overlay.setAttribute("role", "presentation");

      panel.className = `sortick-modal sortick-modal-${tone}`;
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-labelledby", headingId);

      const heading = document.createElement("h2");
      heading.id = headingId;
      heading.textContent = title;

      const description = document.createElement("p");
      description.className = "sortick-modal-description";
      description.textContent = message;

      const fieldWrap = document.createElement("label");
      fieldWrap.className = "sortick-modal-field hidden";

      const fieldLabel = document.createElement("span");
      const field = document.createElement("input");
      field.type = "text";
      field.maxLength = input?.maxLength || 80;
      field.autocomplete = "off";

      if (input) {
        fieldWrap.classList.remove("hidden");
        fieldLabel.textContent = input.label || "Texto";
        field.placeholder = input.placeholder || "";
        field.value = input.value || "";
        fieldWrap.append(fieldLabel, field);
      }

      const error = document.createElement("p");
      error.className = "sortick-modal-error";
      error.setAttribute("aria-live", "polite");

      const actions = document.createElement("div");
      actions.className = "sortick-modal-actions";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "btn btn-ghost sortick-modal-cancel";
      cancelButton.textContent = cancelText;

      const confirmButton = document.createElement("button");
      confirmButton.type = "button";
      confirmButton.className = tone === "danger"
        ? "btn btn-danger sortick-modal-confirm"
        : "btn btn-primary sortick-modal-confirm";
      confirmButton.textContent = confirmText;

      actions.append(cancelButton, confirmButton);
      panel.append(heading, description, fieldWrap, error, actions);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      document.body.classList.add("sortick-modal-open");

      let isClosed = false;

      function close(result) {
        if (isClosed) return;
        isClosed = true;
        document.removeEventListener("keydown", onKeyDown);
        overlay.remove();
        document.body.classList.remove("sortick-modal-open");

        if (previousFocus && typeof previousFocus.focus === "function") {
          previousFocus.focus();
        }

        resolve(result);
      }

      function onKeyDown(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          close({ confirmed: false, value: input ? field.value : "" });
          return;
        }

        if (event.key === "Enter" && input && document.activeElement === field) {
          event.preventDefault();
          confirmButton.click();
        }
      }

      cancelButton.addEventListener("click", () => {
        close({ confirmed: false, value: input ? field.value : "" });
      });

      overlay.addEventListener("mousedown", event => {
        if (event.target === overlay) {
          close({ confirmed: false, value: input ? field.value : "" });
        }
      });

      confirmButton.addEventListener("click", () => {
        const value = input ? normalizeText(field.value).slice(0, field.maxLength) : "";

        if (input && typeof input.validate === "function") {
          const validationMessage = input.validate(value);

          if (validationMessage) {
            error.textContent = validationMessage;
            field.focus();
            return;
          }
        }

        close({ confirmed: true, value });
      });

      document.addEventListener("keydown", onKeyDown);

      requestAnimationFrame(() => {
        if (input) {
          field.focus();
          field.select();
        } else {
          confirmButton.focus();
        }
      });
    });
  }

  function askForConfirmation(options) {
    return createActionModal(options);
  }

  function askForText(options) {
    return createActionModal(options);
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
    clampNumber,
    prepareImageFile,
    askForConfirmation,
    askForText
  };
})();
