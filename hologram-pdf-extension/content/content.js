function readEmbeddedData() {
  const node = document.querySelector("#hologram-export-data[data-hologram-export]");
  if (!node || !node.textContent) return null;

  try {
    return JSON.parse(node.textContent);
  } catch {
    return null;
  }
}

function readDomFallback() {
  const value = (selector) => {
    const node = document.querySelector(selector);
    return node ? Number(node.getAttribute("data-value") || node.textContent?.replace(/[^\d.-]/g, "")) : undefined;
  };

  const lambda = value("[data-hologram-value='lambda']");
  const theta = value("[data-hologram-value='theta']");
  const deltaLambda = value("[data-hologram-value='deltaLambda']");

  if (!Number.isFinite(lambda) || !Number.isFinite(theta) || !Number.isFinite(deltaLambda)) return null;

  return {
    project: "Transmission Hologram Lab",
    version: "1.0.0",
    language: "ru",
    input: {
      lambda,
      theta,
      deltaLambda,
      diffractionOrder: value("[data-hologram-value='diffractionOrder']") || 1,
      filmResolution: value("[data-hologram-value='filmResolution']") || 0,
      filmSize: value("[data-hologram-value='filmSize']") || 0,
      objectDistance: value("[data-hologram-value='objectDistance']") || 0
    },
    results: {
      d: value("[data-hologram-result='d']"),
      linesPerMm: value("[data-hologram-result='linesPerMm']"),
      LcMm: value("[data-hologram-result='LcMm']"),
      LcCm: value("[data-hologram-result='LcCm']"),
      diffAngle: value("[data-hologram-result='diffAngle']")
    },
    steps: [],
    reportText: ""
  };
}

function readPageWindowData() {
  return new Promise((resolve) => {
    const requestId = `hologram-data-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const cleanup = (script, listener) => {
      window.removeEventListener("message", listener);
      script?.remove();
    };

    const script = document.createElement("script");
    const listener = (event) => {
      if (event.source !== window || event.data?.source !== "hologram-lab-export" || event.data.requestId !== requestId) {
        return;
      }
      cleanup(script, listener);
      resolve(event.data.payload || null);
    };

    window.addEventListener("message", listener);
    script.textContent = `
      window.postMessage({
        source: "hologram-lab-export",
        requestId: ${JSON.stringify(requestId)},
        payload: window.__HOLOGRAM_DATA__ || null
      }, "*");
    `;
    (document.head || document.documentElement).appendChild(script);

    window.setTimeout(() => {
      cleanup(script, listener);
      resolve(null);
    }, 300);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "GET_DATA") return false;

  const embedded = readEmbeddedData();
  if (embedded) {
    sendResponse({ connected: true, data: embedded, source: "embedded-json" });
    return false;
  }

  readPageWindowData().then((pageData) => {
    const data = pageData || readDomFallback();
    sendResponse({
      connected: Boolean(data),
      data,
      source: pageData ? "window" : "dom-fallback"
    });
  });

  return true;
});
