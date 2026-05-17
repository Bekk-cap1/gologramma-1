const statusNode = document.getElementById("status");
const messageNode = document.getElementById("message");
const downloadButton = document.getElementById("download");
const authorInput = document.getElementById("author");
const workTitleInput = document.getElementById("work-title");
const dateInput = document.getElementById("report-date");

const metricNodes = {
  lambda: document.getElementById("metric-lambda"),
  theta: document.getElementById("metric-theta"),
  delta: document.getElementById("metric-delta"),
  d: document.getElementById("metric-d"),
  n: document.getElementById("metric-n"),
  lc: document.getElementById("metric-lc"),
  alpha: document.getElementById("metric-alpha")
};

let currentData = null;

function format(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  }).format(number);
}

function setStatus(kind, text) {
  statusNode.className = `status status--${kind}`;
  statusNode.textContent = text;
}

function setMessage(text) {
  messageNode.textContent = text;
}

function readSettings() {
  const options = {};
  document.querySelectorAll("[data-option]").forEach((input) => {
    options[input.dataset.option] = input.checked;
  });

  return {
    author: authorInput.value.trim(),
    title: workTitleInput.value.trim(),
    date: dateInput.value,
    options
  };
}

function applySettings(settings) {
  authorInput.value = settings.author || "";
  workTitleInput.value = settings.title || "";
  dateInput.value = settings.date || new Date().toISOString().slice(0, 10);

  document.querySelectorAll("[data-option]").forEach((input) => {
    if (settings.options && input.dataset.option in settings.options) {
      input.checked = Boolean(settings.options[input.dataset.option]);
    }
  });
}

function saveSettings() {
  chrome.storage.local.set({ hologramPdfSettings: readSettings() });
}

function renderData(rawData) {
  const data = window.HologramReport.normalizeData(rawData);
  currentData = data;

  metricNodes.lambda.textContent = `${format(data.input.lambda, 1)} нм`;
  metricNodes.theta.textContent = `${format(data.input.theta, 1)}°`;
  metricNodes.delta.textContent = `${format(data.input.deltaLambda, 4)} нм`;
  metricNodes.d.textContent = `${format(data.results.d, 1)} нм`;
  metricNodes.n.textContent = `${format(data.results.linesPerMm, 0)} лин/мм`;
  metricNodes.lc.textContent = `${format(data.results.LcCm, 2)} см`;
  metricNodes.alpha.textContent = data.results.diffAngle === null ? "невозможно" : `${format(data.results.diffAngle, 1)}°`;

  downloadButton.disabled = false;
}

function requestPageData() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) {
      setStatus("error", "✗ Откройте приложение Hologram Lab");
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "GET_DATA" }, (response) => {
      if (chrome.runtime.lastError || !response?.connected || !response.data) {
        setStatus("error", "✗ Откройте страницу Transmission Hologram Lab");
        downloadButton.disabled = true;
        return;
      }

      setStatus("ok", "✓ Подключено к Hologram Lab");
      renderData(response.data);
    });
  });
}

function safeFilename(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/giu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

downloadButton.addEventListener("click", async () => {
  if (!currentData) return;

  try {
    downloadButton.disabled = true;
    setMessage("Генерация PDF...");
    const settings = readSettings();
    const blob = await window.HologramReport.createPdfBlob(currentData, settings);
    const url = URL.createObjectURL(blob);
    const suffix = safeFilename(settings.title || "transmission-hologram-report") || "transmission-hologram-report";

    chrome.downloads.download(
      {
        url,
        filename: `${suffix}.pdf`,
        saveAs: true
      },
      () => {
        window.setTimeout(() => URL.revokeObjectURL(url), 30000);
        downloadButton.disabled = false;
        setMessage(chrome.runtime.lastError ? "Не удалось скачать PDF." : "PDF готов.");
      }
    );
  } catch (error) {
    downloadButton.disabled = false;
    setMessage(error instanceof Error ? error.message : "Ошибка генерации PDF.");
  }
});

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", saveSettings);
  input.addEventListener("change", saveSettings);
});

chrome.storage.local.get("hologramPdfSettings", (stored) => {
  applySettings(stored.hologramPdfSettings || {});
  requestPageData();
});
