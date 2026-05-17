export type HologramInputs = {
  wavelengthNm: number;
  angleDeg: number;
  spectralLinewidthNm: number;
  diffractionOrder: number;
  filmResolutionLinesPerMm: number;
  filmSizeMm: number;
  objectDistanceCm: number;
};

export type WarningKey =
  | "invalidWavelength"
  | "invalidLinewidth"
  | "invalidAngle"
  | "smallAngle"
  | "diffractionImpossible"
  | "filmTooLow"
  | "smallFilm"
  | "nearObject";

export type HologramResults = {
  thetaRad: number;
  dNm: number;
  dMm: number;
  requiredResolutionLinesPerMm: number;
  coherenceLengthNm: number;
  coherenceLengthMm: number;
  coherenceLengthCm: number;
  diffractionRatio: number;
  diffractionAngleDeg: number | null;
  maxVibrationNm: number;
  maxVibrationUm: number;
  filmSuitable: boolean;
  fringesAcrossFilm: number;
  warnings: WarningKey[];
};

export const defaultInputs: HologramInputs = {
  wavelengthNm: 632.8,
  angleDeg: 40,
  spectralLinewidthNm: 0.01,
  diffractionOrder: 1,
  filmResolutionLinesPerMm: 3000,
  filmSizeMm: 50,
  objectDistanceCm: 12
};

export function calculateHologram(input: HologramInputs): HologramResults {
  const thetaRad = (input.angleDeg * Math.PI) / 180;
  const sinHalfTheta = Math.sin(thetaRad / 2);
  const dNm =
    input.wavelengthNm > 0 && input.angleDeg > 0 && input.angleDeg < 180 && sinHalfTheta > 0
      ? input.wavelengthNm / (2 * sinHalfTheta)
      : Number.NaN;
  const dMm = dNm * 1e-6;
  const requiredResolutionLinesPerMm = Number.isFinite(dMm) && dMm > 0 ? 1 / dMm : Number.NaN;
  const coherenceLengthNm =
    input.wavelengthNm > 0 && input.spectralLinewidthNm > 0
      ? (input.wavelengthNm * input.wavelengthNm) / input.spectralLinewidthNm
      : Number.NaN;
  const coherenceLengthMm = coherenceLengthNm * 1e-6;
  const coherenceLengthCm = coherenceLengthNm * 1e-7;
  const diffractionRatio =
    Number.isFinite(dNm) && dNm > 0 ? (input.diffractionOrder * input.wavelengthNm) / dNm : Number.NaN;
  const diffractionAngleDeg =
    Number.isFinite(diffractionRatio) && Math.abs(diffractionRatio) <= 1
      ? (Math.asin(diffractionRatio) * 180) / Math.PI
      : null;
  const maxVibrationNm = input.wavelengthNm / 4;
  const maxVibrationUm = maxVibrationNm / 1000;
  const filmSuitable =
    Number.isFinite(requiredResolutionLinesPerMm) &&
    input.filmResolutionLinesPerMm >= requiredResolutionLinesPerMm;
  const fringesAcrossFilm =
    Number.isFinite(requiredResolutionLinesPerMm) && input.filmSizeMm > 0
      ? requiredResolutionLinesPerMm * input.filmSizeMm
      : Number.NaN;

  const warnings: WarningKey[] = [];

  if (input.wavelengthNm <= 0) warnings.push("invalidWavelength");
  if (input.spectralLinewidthNm <= 0) warnings.push("invalidLinewidth");
  if (input.angleDeg <= 0 || input.angleDeg >= 180) warnings.push("invalidAngle");
  if (input.angleDeg > 0 && input.angleDeg < 5) warnings.push("smallAngle");
  if (Number.isFinite(diffractionRatio) && Math.abs(diffractionRatio) > 1) {
    warnings.push("diffractionImpossible");
  }
  if (Number.isFinite(requiredResolutionLinesPerMm) && !filmSuitable) warnings.push("filmTooLow");
  if (input.filmSizeMm > 0 && input.filmSizeMm < 10) warnings.push("smallFilm");
  if (input.objectDistanceCm > 0 && input.objectDistanceCm < 3) warnings.push("nearObject");

  return {
    thetaRad,
    dNm,
    dMm,
    requiredResolutionLinesPerMm,
    coherenceLengthNm,
    coherenceLengthMm,
    coherenceLengthCm,
    diffractionRatio,
    diffractionAngleDeg,
    maxVibrationNm,
    maxVibrationUm,
    filmSuitable,
    fringesAcrossFilm,
    warnings
  };
}

export function formatNumber(value: number | null, digits = 3): string {
  if (value === null || !Number.isFinite(value)) return "not defined";
  if (Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  }).format(value);
}

export function buildCalculationText(input: HologramInputs, result: HologramResults): string {
  const halfAngle = input.angleDeg / 2;
  const alpha =
    result.diffractionAngleDeg === null ? "impossible because |mλ / d| > 1" : `${formatNumber(result.diffractionAngleDeg)} deg`;

  return [
    "Transmission Hologram Lab",
    "",
    "Given:",
    `lambda = ${formatNumber(input.wavelengthNm)} nm`,
    `theta = ${formatNumber(input.angleDeg)} deg`,
    `delta lambda = ${formatNumber(input.spectralLinewidthNm)} nm`,
    `m = ${formatNumber(input.diffractionOrder)}`,
    `film resolution = ${formatNumber(input.filmResolutionLinesPerMm)} lines/mm`,
    `film size = ${formatNumber(input.filmSizeMm)} mm`,
    `object distance from film = ${formatNumber(input.objectDistanceCm)} cm`,
    "",
    "Calculation:",
    "d = lambda / (2 sin(theta / 2))",
    `d = ${formatNumber(input.wavelengthNm)} / (2 sin ${formatNumber(halfAngle)} deg)`,
    `d = ${formatNumber(result.dNm)} nm = ${formatNumber(result.dMm, 6)} mm`,
    "",
    "Required film resolution:",
    "N = 1 / d(mm)",
    `N = 1 / ${formatNumber(result.dMm, 6)} = ${formatNumber(result.requiredResolutionLinesPerMm)} lines/mm`,
    "",
    "Coherence length:",
    "Lc = lambda^2 / delta lambda",
    `Lc = ${formatNumber(input.wavelengthNm)}^2 / ${formatNumber(input.spectralLinewidthNm)} = ${formatNumber(
      result.coherenceLengthNm
    )} nm = ${formatNumber(result.coherenceLengthMm)} mm`,
    "",
    "Diffraction angle:",
    "sin(alpha) = m lambda / d",
    `sin(alpha) = ${formatNumber(input.diffractionOrder)} * ${formatNumber(input.wavelengthNm)} / ${formatNumber(
      result.dNm
    )} = ${formatNumber(result.diffractionRatio)}`,
    `alpha = ${alpha}`,
    "",
    "Stability condition:",
    `maximum vibration < lambda / 4 = ${formatNumber(result.maxVibrationNm)} nm = ${formatNumber(
      result.maxVibrationUm
    )} um`,
    "",
    "Conclusion:",
    result.filmSuitable
      ? `The film is suitable because ${formatNumber(
          input.filmResolutionLinesPerMm
        )} lines/mm >= ${formatNumber(result.requiredResolutionLinesPerMm)} lines/mm.`
      : `The film is not suitable because ${formatNumber(
          input.filmResolutionLinesPerMm
        )} lines/mm < ${formatNumber(result.requiredResolutionLinesPerMm)} lines/mm.`
  ].join("\n");
}
