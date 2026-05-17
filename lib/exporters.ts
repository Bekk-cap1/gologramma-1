import type { HologramInputs, HologramResults } from "./hologramMath";
import { formatNumber } from "./hologramMath";

export function printCalculationReport(title: string, text: string) {
  const reportWindow = window.open("", "_blank", "width=920,height=720");
  if (!reportWindow) return;

  const escapedText = escapeHtml(text).replace(/\n/g, "<br />");
  reportWindow.document.write(`<!doctype html>
<html>
<head>
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #111; line-height: 1.48; }
    h1 { font-size: 22px; margin-bottom: 18px; }
    .report { font-family: "Courier New", monospace; font-size: 13px; white-space: normal; }
    @media print { body { margin: 24mm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="report">${escapedText}</div>
  <script>window.onload = () => setTimeout(() => window.print(), 120);</script>
</body>
</html>`);
  reportWindow.document.close();
}

export function downloadDeviceJson(input: HologramInputs, result: HologramResults) {
  const payload = {
    project: "Transmission Hologram Lab",
    generatedAt: new Date().toISOString(),
    note:
      "Digital export for simulation, SLM preparation, or holographic printer preprocessing. A real device still requires pixel pitch and calibration data.",
    units: {
      wavelength: "nm",
      fringePeriod: "nm",
      requiredResolution: "lines/mm",
      coherenceLength: "mm"
    },
    input,
    result: {
      fringePeriodNm: result.dNm,
      fringePeriodMm: result.dMm,
      requiredResolutionLinesPerMm: result.requiredResolutionLinesPerMm,
      coherenceLengthMm: result.coherenceLengthMm,
      diffractionAngleDeg: result.diffractionAngleDeg,
      maxVibrationNm: result.maxVibrationNm,
      filmSuitable: result.filmSuitable
    }
  };

  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    "transmission-hologram-device-package.json"
  );
}

export function downloadFringePattern(input: HologramInputs, result: HologramResults) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const image = ctx.createImageData(size, size);
  const cyclesRaw = Number.isFinite(result.fringesAcrossFilm) ? result.fringesAcrossFilm : 64;
  const cycles = Math.max(8, Math.min(260, cyclesRaw / 180));
  const objectPhaseStrength = Math.max(0.25, Math.min(1.2, input.objectDistanceCm / 18));

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / size - 0.5;
      const ny = y / size - 0.5;
      const radius = Math.sqrt(nx * nx + ny * ny);
      const objectPhase = objectPhaseStrength * Math.sin(22 * radius + 8 * nx);
      const carrier = 2 * Math.PI * (cycles * nx + 0.35 * cycles * ny);
      const intensity = 0.5 + 0.5 * Math.cos(carrier + objectPhase);
      const vignette = Math.max(0.2, 1 - radius * 0.9);
      const value = Math.round(255 * intensity * vignette);
      const index = (y * size + x) * 4;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "18px Arial";
  ctx.fillText(`lambda ${formatNumber(input.wavelengthNm)} nm | theta ${formatNumber(input.angleDeg)} deg`, 24, size - 34);

  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, "transmission-hologram-fringe-pattern.png");
  }, "image/png");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
