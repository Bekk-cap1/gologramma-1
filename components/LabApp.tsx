"use client";

import dynamic from "next/dynamic";
import {
  Box,
  Calculator,
  ClipboardCopy,
  Download,
  FileText,
  Globe2,
  Orbit,
  Printer,
  Radio,
  ScanLine,
  TriangleRight,
  Waves
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { buildCalculationText, calculateHologram, defaultInputs, formatNumber, type HologramInputs } from "@/lib/hologramMath";
import { copy, languages, type ComponentLabels, type Lang } from "@/lib/i18n";
import { downloadDeviceJson, downloadFringePattern, printCalculationReport } from "@/lib/exporters";
import type { SceneMode } from "./HologramScene";

const HologramScene = dynamic(() => import("./HologramScene"), {
  ssr: false,
  loading: () => <div className="flex h-[420px] items-center justify-center rounded border border-lab-line bg-lab-panel text-sm text-slate-300">3D...</div>
});

const sections = [
  { id: "equipment", key: "equipment" },
  { id: "scheme", key: "scheme" },
  { id: "recording", key: "recording" },
  { id: "calculator", key: "calculator" },
  { id: "reconstruction", key: "reconstruction" },
  { id: "fragment", key: "fragment" },
  { id: "visualization", key: "visualization" },
  { id: "device", key: "device" }
] as const;

export default function LabApp() {
  const [lang, setLang] = useState<Lang>("ru");
  const [inputs, setInputs] = useState<HologramInputs>(defaultInputs);
  const [sceneMode, setSceneMode] = useState<SceneMode>("setup");
  const [fragmentSize, setFragmentSize] = useState(36);
  const [copied, setCopied] = useState(false);

  const t = copy[lang];
  const result = useMemo(() => calculateHologram(inputs), [inputs]);
  const calculationText = useMemo(() => buildCalculationText(inputs, result), [inputs, result]);

  const updateInput = (key: keyof HologramInputs, value: number) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const copyCalculation = async () => {
    await navigator.clipboard.writeText(calculationText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="scientific-grid min-h-screen text-slate-100">
      <header className="sticky top-0 z-40 border-b border-lab-line bg-[#081012]/94 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <a href="#home" className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded border border-lab-line bg-lab-panel text-lab-cyan">
                <ScanLine size={19} aria-hidden />
              </span>
              <span className="truncate text-base font-semibold tracking-wide md:text-lg">Transmission Hologram Lab</span>
            </a>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Globe2 size={16} aria-hidden />
              <select
                value={lang}
                onChange={(event) => setLang(event.target.value as Lang)}
                className="rounded border border-lab-line bg-lab-panel px-3 py-2 text-sm text-slate-100 outline-none focus:border-lab-cyan"
                aria-label="Language"
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap rounded border border-lab-line bg-lab-panel px-3 py-2 text-sm text-slate-300 transition hover:border-lab-cyan hover:text-white"
              >
                {t.nav[section.key]}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="home" className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1fr_0.86fr] md:px-6 md:py-14">
        <div className="flex flex-col justify-center gap-6">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.26em] text-lab-cyan">{t.hero.eyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">{t.hero.title}</h1>
          </div>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">{t.hero.subtitle}</p>
          <p className="max-w-3xl text-base leading-7 text-slate-300">{t.hero.thesis}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoPanel title={t.hero.photoTitle} text={t.hero.photoText} accent="border-lab-amber" />
            <InfoPanel title={t.hero.hologramTitle} text={t.hero.hologramText} accent="border-lab-cyan" />
          </div>
        </div>
        <div className="min-h-[360px]">
          <HologramScene mode={sceneMode} labels={t.visualization.labels} />
        </div>
      </section>

      <Section id="equipment" title={t.equipment.title} icon={<Box size={22} aria-hidden />}>
        <p className="max-w-3xl text-slate-300">{t.equipment.intro}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {t.equipment.items.map((item) => (
            <article key={item.title} className="rounded border border-lab-line bg-lab-panel/90 p-4">
              <h3 className="mb-3 text-lg font-semibold text-white">{item.title}</h3>
              <TextLine label={t.equipment.labels.purpose} value={item.why} />
              <TextLine label={t.equipment.labels.placement} value={item.where} />
              <TextLine label={t.equipment.labels.importance} value={item.important} />
            </article>
          ))}
        </div>
      </Section>

      <Section id="scheme" title={t.scheme.title} icon={<Radio size={22} aria-hidden />}>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <OpticalScheme referenceLabel={t.scheme.reference} objectLabel={t.scheme.object} labels={t.visualization.labels} />
          <div className="flex flex-col justify-center gap-4">
            <p className="text-base leading-7 text-slate-300">{t.scheme.text}</p>
            <div className="rounded border border-lab-line bg-lab-panel p-4">
              <p className="text-sm text-lab-cyan">{t.scheme.filmNote}</p>
              <p className="mt-2 text-sm text-lab-teal">{t.scheme.objectNote}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="recording" title={t.recording.title} icon={<Waves size={22} aria-hidden />}>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ol className="grid gap-3">
            {t.recording.steps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded border border-lab-line bg-lab-panel/88 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-lab-cyan text-sm font-bold text-lab-ink">
                  {index + 1}
                </span>
                <span className="text-slate-300">{step}</span>
              </li>
            ))}
          </ol>
          <div className="wave-field min-h-[300px] rounded border border-lab-line p-6">
            <div className="relative z-10 flex h-full min-h-[250px] items-center justify-center">
              <div className="h-32 w-20 rounded border border-lab-cyan bg-lab-cyan/10 shadow-beam" />
              <div className="absolute left-8 top-8 h-2 w-2 rounded bg-lab-red shadow-[0_0_26px_rgba(255,91,91,0.9)]" />
              <div className="absolute bottom-8 right-8 h-2 w-2 rounded bg-lab-teal shadow-[0_0_26px_rgba(66,242,180,0.9)]" />
              <p className="absolute bottom-5 rounded bg-lab-ink/80 px-3 py-2 text-sm text-slate-300">{t.recording.interferenceLabel}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="calculator" title={t.calculator.title} icon={<Calculator size={22} aria-hidden />}>
        <p className="mb-6 max-w-3xl text-slate-300">{t.calculator.intro}</p>
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded border border-lab-line bg-lab-panel/92 p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <NumberInput label={t.calculator.inputs.wavelengthNm} unit="nm" value={inputs.wavelengthNm} step={0.1} onChange={(value) => updateInput("wavelengthNm", value)} />
              <NumberInput label={t.calculator.inputs.angleDeg} unit="deg" value={inputs.angleDeg} step={1} onChange={(value) => updateInput("angleDeg", value)} />
              <NumberInput label={t.calculator.inputs.spectralLinewidthNm} unit="nm" value={inputs.spectralLinewidthNm} step={0.001} onChange={(value) => updateInput("spectralLinewidthNm", value)} />
              <NumberInput label={t.calculator.inputs.diffractionOrder} unit="m" value={inputs.diffractionOrder} step={1} onChange={(value) => updateInput("diffractionOrder", value)} />
              <NumberInput label={t.calculator.inputs.filmResolutionLinesPerMm} unit="lines/mm" value={inputs.filmResolutionLinesPerMm} step={50} onChange={(value) => updateInput("filmResolutionLinesPerMm", value)} />
              <NumberInput label={t.calculator.inputs.filmSizeMm} unit="mm" value={inputs.filmSizeMm} step={1} onChange={(value) => updateInput("filmSizeMm", value)} />
              <NumberInput label={t.calculator.inputs.objectDistanceCm} unit="cm" value={inputs.objectDistanceCm} step={0.5} onChange={(value) => updateInput("objectDistanceCm", value)} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded border border-lab-line bg-lab-panel/92 p-4">
              <h3 className="mb-4 text-lg font-semibold text-white">{t.calculator.results}</h3>
              <ResultLine label="d" value={`${formatNumber(result.dNm)} nm`} sub={`${formatNumber(result.dMm, 6)} mm`} />
              <ResultLine label="N" value={`${formatNumber(result.requiredResolutionLinesPerMm)} lines/mm`} sub={t.calculator.requiredResolution} />
              <ResultLine label="Lc" value={`${formatNumber(result.coherenceLengthMm)} mm`} sub={`${formatNumber(result.coherenceLengthCm)} cm`} />
              <ResultLine
                label="α"
                value={result.diffractionAngleDeg === null ? t.calculator.impossible : `${formatNumber(result.diffractionAngleDeg)}°`}
                sub={`mλ / d = ${formatNumber(result.diffractionRatio)}`}
              />
              <ResultLine label={t.calculator.vibration} value={`< ${formatNumber(result.maxVibrationNm)} nm`} sub={`${formatNumber(result.maxVibrationUm)} µm`} />
              <div className={`mt-4 rounded border p-3 text-sm font-semibold ${result.filmSuitable ? "border-lab-teal bg-lab-teal/10 text-lab-teal" : "border-lab-red bg-lab-red/10 text-lab-red"}`}>
                {result.filmSuitable ? t.calculator.suitable : t.calculator.notSuitable}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyCalculation}
                  className="inline-flex items-center gap-2 rounded border border-lab-cyan bg-lab-cyan px-3 py-2 text-sm font-semibold text-lab-ink transition hover:bg-white"
                >
                  <ClipboardCopy size={16} aria-hidden />
                  {copied ? t.calculator.copied : t.calculator.copy}
                </button>
                <button
                  type="button"
                  onClick={() => printCalculationReport("Transmission Hologram Lab calculation", calculationText)}
                  className="inline-flex items-center gap-2 rounded border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-slate-100 transition hover:border-lab-cyan"
                >
                  <Printer size={16} aria-hidden />
                  {t.calculator.pdf}
                </button>
              </div>
            </div>

            <div className="rounded border border-lab-line bg-lab-panel/92 p-4">
              <h3 className="mb-4 text-lg font-semibold text-white">{t.calculator.warnings}</h3>
              {result.warnings.length > 0 ? (
                <ul className="grid gap-2">
                  {result.warnings.map((warning) => (
                    <li key={warning} className="rounded border border-lab-amber/50 bg-lab-amber/10 p-3 text-sm text-amber-100">
                      {t.warnings[warning]}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded border border-lab-teal/50 bg-lab-teal/10 p-3 text-sm text-lab-teal">{t.calculator.noWarnings}</p>
              )}
            </div>

            <div className="rounded border border-lab-line bg-lab-panel/92 p-4 lg:col-span-2">
              <h3 className="mb-4 text-lg font-semibold text-white">{t.calculator.steps}</h3>
              <FormulaSteps inputs={inputs} impossibleLabel={t.calculator.impossible} maxVibrationLabel={t.calculator.maxVibration} />
            </div>
          </div>
        </div>
      </Section>

      <Section id="reconstruction" title={t.reconstruction.title} icon={<FileText size={22} aria-hidden />}>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="max-w-4xl text-base leading-7 text-slate-300">{t.reconstruction.text}</p>
            <div className="equation mt-5 rounded p-5 text-lg text-lab-cyan">{t.reconstruction.formula}</div>
          </div>
          <div className="grid gap-3">
            <p className="rounded border border-lab-line bg-lab-panel p-4 text-slate-300">{t.reconstruction.tx}</p>
            <p className="rounded border border-lab-line bg-lab-panel p-4 text-slate-300">{t.reconstruction.er}</p>
            <p className="rounded border border-lab-line bg-lab-panel p-4 text-slate-300">{t.reconstruction.eout}</p>
          </div>
        </div>
      </Section>

      <Section id="fragment" title={t.fragment.title} icon={<ScanLine size={22} aria-hidden />}>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded border border-lab-line bg-lab-panel p-5">
            <p className="mb-5 leading-7 text-slate-300">{t.fragment.text}</p>
            <label className="block text-sm text-slate-300">
              {t.fragment.slider}: <span className="font-semibold text-lab-cyan">{fragmentSize}%</span>
              <input
                type="range"
                min={8}
                max={100}
                value={fragmentSize}
                onChange={(event) => setFragmentSize(Number(event.target.value))}
                className="mt-4 w-full accent-lab-cyan"
              />
            </label>
            <div className="mt-5 grid gap-3 text-sm">
              <Metric label={t.fragment.brightness} value={`${formatNumber(fragmentSize)}%`} />
              <Metric label={t.fragment.resolution} value={`${formatNumber(Math.sqrt(fragmentSize / 100) * 100)}%`} />
              <Metric label={t.fragment.viewAngle} value={`${formatNumber(Math.max(10, fragmentSize * 0.82))}%`} />
            </div>
          </div>
          <FragmentVisual
            fragmentSize={fragmentSize}
            fragmentLabel={t.fragment.hologramFragment}
            imageLabel={t.fragment.reconstructedImage}
          />
        </div>
      </Section>

      <Section id="visualization" title={t.visualization.title} icon={<Orbit size={22} aria-hidden />}>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["setup", "interference", "reconstruction"] as SceneMode[]).map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => setSceneMode(mode)}
              className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-sm transition ${
                sceneMode === mode
                  ? "border-lab-cyan bg-lab-cyan text-lab-ink"
                  : "border-lab-line bg-lab-panel text-slate-300 hover:border-lab-cyan"
              }`}
            >
              <TriangleRight size={15} aria-hidden />
              {t.visualization.modes[mode]}
            </button>
          ))}
        </div>
        <div className="grid gap-4">
          <HologramScene mode={sceneMode} labels={t.visualization.labels} />
          <div className="grid gap-3 rounded border border-lab-line bg-lab-panel p-4 text-sm md:grid-cols-3">
            <Legend color="bg-lab-red" label={t.visualization.legendReference} />
            <Legend color="bg-lab-teal" label={t.visualization.legendObject} />
            <Legend color="bg-lab-cyan" label={t.visualization.legendReconstructed} />
          </div>
          <BeamFlow2D
            mode={sceneMode}
            title={t.visualization.flowTitle}
            intro={t.visualization.flowIntro}
            labels={t.visualization.labels}
            referenceLabel={t.visualization.legendReference}
            objectLabel={t.visualization.legendObject}
            reconstructedLabel={t.visualization.legendReconstructed}
            flow={t.visualization.flow}
          />
        </div>
      </Section>

      <Section id="device" title={t.device.title} icon={<Download size={22} aria-hidden />}>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="max-w-3xl leading-7 text-slate-300">{t.device.text}</p>
            <p className="mt-4 max-w-3xl text-sm text-slate-400">{t.device.note}</p>
          </div>
          <div className="flex flex-wrap items-start gap-3 rounded border border-lab-line bg-lab-panel p-4">
            <button
              type="button"
              onClick={() => downloadFringePattern(inputs, result)}
              className="inline-flex items-center gap-2 rounded border border-lab-cyan bg-lab-cyan px-4 py-2 text-sm font-semibold text-lab-ink transition hover:bg-white"
            >
              <Download size={16} aria-hidden />
              {t.device.png}
            </button>
            <button
              type="button"
              onClick={() => downloadDeviceJson(inputs, result)}
              className="inline-flex items-center gap-2 rounded border border-lab-line bg-lab-panel2 px-4 py-2 text-sm text-slate-100 transition hover:border-lab-cyan"
            >
              <FileText size={16} aria-hidden />
              {t.device.json}
            </button>
          </div>
        </div>
      </Section>
    </main>
  );
}

function Section({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="section-band scroll-mt-28">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded border border-lab-line bg-lab-panel text-lab-cyan">{icon}</span>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function InfoPanel({ title, text, accent }: { title: string; text: string; accent: string }) {
  return (
    <article className={`rounded border ${accent} bg-lab-panel/82 p-4`}>
      <h2 className="mb-2 text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function TextLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="mb-2 text-sm leading-6 text-slate-300">
      <span className="font-semibold text-slate-100">{label}: </span>
      {value}
    </p>
  );
}

function NumberInput({
  label,
  unit,
  value,
  step,
  onChange
}: {
  label: string;
  unit: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-300">
        <span>{label}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded border border-lab-line bg-[#091315] px-3 py-2 text-slate-100 outline-none transition focus:border-lab-cyan"
      />
    </label>
  );
}

function ResultLine({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="mb-3 border-b border-lab-line/70 pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-right text-base font-semibold text-white">{value}</span>
      </div>
      <p className="mt-1 text-right text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function FormulaSteps({
  inputs,
  impossibleLabel,
  maxVibrationLabel
}: {
  inputs: HologramInputs;
  impossibleLabel: string;
  maxVibrationLabel: string;
}) {
  const result = calculateHologram(inputs);
  const halfAngle = inputs.angleDeg / 2;

  return (
    <div className="grid gap-3">
      <FormulaLine text={`d = λ / (2 sin(θ / 2)) = ${formatNumber(inputs.wavelengthNm)} / (2 sin ${formatNumber(halfAngle)}°) = ${formatNumber(result.dNm)} nm`} />
      <FormulaLine text={`d = ${formatNumber(result.dNm)} nm = ${formatNumber(result.dMm, 6)} mm`} />
      <FormulaLine text={`N = 1 / d(mm) = 1 / ${formatNumber(result.dMm, 6)} = ${formatNumber(result.requiredResolutionLinesPerMm)} lines/mm`} />
      <FormulaLine text={`Lc = λ² / Δλ = ${formatNumber(inputs.wavelengthNm)}² / ${formatNumber(inputs.spectralLinewidthNm)} = ${formatNumber(result.coherenceLengthNm)} nm`} />
      <FormulaLine text={`sin(α) = mλ / d = ${formatNumber(inputs.diffractionOrder)} × ${formatNumber(inputs.wavelengthNm)} / ${formatNumber(result.dNm)} = ${formatNumber(result.diffractionRatio)}`} />
      <FormulaLine text={`α = ${result.diffractionAngleDeg === null ? impossibleLabel : `${formatNumber(result.diffractionAngleDeg)}°`}`} />
      <FormulaLine text={`${maxVibrationLabel} < λ / 4 = ${formatNumber(result.maxVibrationNm)} nm`} />
    </div>
  );
}

function FormulaLine({ text }: { text: string }) {
  return <div className="equation rounded px-3 py-2 text-sm text-slate-200">{text}</div>;
}

function OpticalScheme({
  referenceLabel,
  objectLabel,
  labels
}: {
  referenceLabel: string;
  objectLabel: string;
  labels: {
    laser: string;
    beamSplitter: string;
    mirror: string;
    expandingLens: string;
    object: string;
    film: string;
  };
}) {
  const [beamSplitterLine1, beamSplitterLine2] = splitSvgLabel(labels.beamSplitter);
  const [expandingLensLine1, expandingLensLine2] = splitSvgLabel(labels.expandingLens);
  return (
    <div className="rounded border border-lab-line bg-lab-panel/92 p-3">
      <svg viewBox="0 0 900 360" className="h-auto w-full" role="img" aria-label="Transmission hologram optical scheme">
        <defs>
          <marker id="arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff5b5b" />
          </marker>
          <marker id="arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#42f2b4" />
          </marker>
          <marker id="arrow-white" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#dbeafe" />
          </marker>
        </defs>

        <rect x="15" y="35" width="112" height="54" rx="8" fill="#122022" stroke="#244046" />
        <text x="71" y="68" fill="#eff9f8" textAnchor="middle" fontSize="18">{labels.laser}</text>
        <line x1="127" y1="62" x2="244" y2="62" stroke="#dbeafe" strokeWidth="4" markerEnd="url(#arrow-white)" />

        <rect x="245" y="34" width="132" height="58" rx="8" fill="#102a30" stroke="#35d7ff" />
        <text x="311" y="59" fill="#eff9f8" textAnchor="middle" fontSize="15">{beamSplitterLine1}</text>
        <text x="311" y="78" fill="#eff9f8" textAnchor="middle" fontSize="15">{beamSplitterLine2}</text>

        <path d="M 376 62 L 494 124 L 620 124 L 770 166" fill="none" stroke="#ff5b5b" strokeWidth="5" markerEnd="url(#arrow-red)" />
        <path d="M 376 62 L 494 250 L 585 250 L 682 218 L 770 188" fill="none" stroke="#42f2b4" strokeWidth="5" markerEnd="url(#arrow-teal)" />

        <rect x="474" y="94" width="42" height="70" rx="5" fill="#cbd5da" opacity="0.9" />
        <text x="495" y="88" fill="#dbeafe" textAnchor="middle" fontSize="14">{labels.mirror}</text>
        <ellipse cx="618" cy="124" rx="22" ry="42" fill="#ffbf47" opacity="0.55" stroke="#ffbf47" />
        <text x="618" y="75" fill="#ffbf47" textAnchor="middle" fontSize="13">{expandingLensLine1}</text>
        <text x="618" y="91" fill="#ffbf47" textAnchor="middle" fontSize="13">{expandingLensLine2}</text>

        <rect x="474" y="220" width="42" height="70" rx="5" fill="#cbd5da" opacity="0.9" />
        <text x="495" y="214" fill="#dbeafe" textAnchor="middle" fontSize="14">{labels.mirror}</text>
        <ellipse cx="585" cy="250" rx="22" ry="42" fill="#42f2b4" opacity="0.5" stroke="#42f2b4" />
        <text x="585" y="301" fill="#42f2b4" textAnchor="middle" fontSize="13">{expandingLensLine1}</text>
        <text x="585" y="317" fill="#42f2b4" textAnchor="middle" fontSize="13">{expandingLensLine2}</text>

        <circle cx="682" cy="218" r="34" fill="#ffbf47" opacity="0.82" />
        <circle cx="682" cy="218" r="17" fill="#081012" opacity="0.48" />
        <text x="682" y="276" fill="#ffbf47" textAnchor="middle" fontSize="15">{labels.object}</text>

        <rect x="770" y="96" width="22" height="160" rx="4" fill="#35d7ff" opacity="0.42" stroke="#35d7ff" />
        <text x="804" y="182" fill="#35d7ff" fontSize="16">{labels.film}</text>

        <text x="565" y="112" fill="#ff8a8a" fontSize="15">{referenceLabel}</text>
        <text x="560" y="238" fill="#8effd8" fontSize="15">{objectLabel}</text>
      </svg>
    </div>
  );
}

function splitSvgLabel(label: string) {
  const parts = label.split(" ");
  if (parts.length < 2) return [label, ""];
  const middle = Math.ceil(parts.length / 2);
  return [parts.slice(0, middle).join(" "), parts.slice(middle).join(" ")];
}

type BeamFlowLabels = {
  laserOut: string;
  splitReference: string;
  splitObject: string;
  referencePath: string;
  objectPath: string;
  objectWave: string;
  overlap: string;
  recordedStructure: string;
  reconstructionInput: string;
  reconstructionOutput: string;
};

function BeamFlow2D({
  mode,
  title,
  intro,
  labels,
  referenceLabel,
  objectLabel,
  reconstructedLabel,
  flow
}: {
  mode: SceneMode;
  title: string;
  intro: string;
  labels: ComponentLabels;
  referenceLabel: string;
  objectLabel: string;
  reconstructedLabel: string;
  flow: BeamFlowLabels;
}) {
  const showSetup = mode === "setup";
  const showInterference = mode === "interference";
  const showReconstruction = mode === "reconstruction";
  const refOpacity = showSetup || showInterference || showReconstruction ? 1 : 0.3;
  const objectOpacity = showSetup || showInterference ? 1 : 0.2;
  const reconstructionOpacity = showReconstruction ? 1 : 0;
  const traceSteps = [
    { n: 1, color: "bg-slate-200", label: labels.laser, text: flow.laserOut, active: true },
    { n: 2, color: "bg-lab-cyan", label: labels.beamSplitter, text: `${flow.splitReference}; ${flow.splitObject}`, active: true },
    { n: 3, color: "bg-lab-red", label: referenceLabel, text: flow.referencePath, active: showSetup || showInterference || showReconstruction },
    { n: 4, color: "bg-lab-teal", label: objectLabel, text: flow.objectPath, active: showSetup || showInterference },
    { n: 5, color: "bg-lab-amber", label: labels.object, text: flow.objectWave, active: showSetup || showInterference },
    { n: 6, color: "bg-lab-cyan", label: labels.film, text: flow.overlap, active: showInterference },
    { n: 7, color: "bg-lab-amber", label: labels.film, text: flow.recordedStructure, active: showInterference },
    { n: 8, color: "bg-lab-cyan", label: reconstructedLabel, text: flow.reconstructionOutput, active: showReconstruction }
  ];

  return (
    <div className="rounded border border-lab-line bg-lab-panel/92 p-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{intro}</p>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-x-auto rounded border border-lab-line bg-[#091315]">
        <svg viewBox="0 0 1040 560" className="h-auto min-w-[900px] w-full" role="img" aria-label={title}>
          <defs>
            <marker id="flow-arrow-white" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#dbeafe" />
            </marker>
            <marker id="flow-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff5b5b" />
            </marker>
            <marker id="flow-arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#42f2b4" />
            </marker>
            <marker id="flow-arrow-cyan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#35d7ff" />
            </marker>
            <filter id="beam-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d="M 0 40 H 1040 M 0 120 H 1040 M 0 200 H 1040 M 0 280 H 1040 M 0 360 H 1040 M 0 440 H 1040 M 0 520 H 1040" stroke="#244046" strokeOpacity="0.18" />
          <path d="M 40 0 V 560 M 120 0 V 560 M 200 0 V 560 M 280 0 V 560 M 360 0 V 560 M 440 0 V 560 M 520 0 V 560 M 600 0 V 560 M 680 0 V 560 M 760 0 V 560 M 840 0 V 560 M 920 0 V 560 M 1000 0 V 560" stroke="#244046" strokeOpacity="0.12" />

          <rect x="42" y="238" width="118" height="68" rx="6" fill="#122022" stroke="#5c7278" />
          <circle cx="164" cy="272" r="10" fill="#ff5b5b" filter="url(#beam-glow)" />
          <text x="101" y="265" fill="#eff9f8" textAnchor="middle" fontSize="15" fontWeight="700">{labels.laser}</text>
          <NumberBubble x={50} y={246} n={1} />

          <g transform="translate(248 272) rotate(45)">
            <rect x="-30" y="-30" width="60" height="60" rx="7" fill="#102a30" stroke="#35d7ff" strokeWidth="2" opacity="0.92" />
          </g>
          <NumberBubble x={214} y={224} n={2} />
          <TextBadge x={205} y={188} text={labels.beamSplitter} color="#35d7ff" width={126} />

          <MirrorGlyph x={420} y={122} angle={-34} opacity={refOpacity} />
          <NumberBubble x={390} y={74} n={3} active={showSetup || showInterference || showReconstruction} />
          <TextBadge x={350} y={34} text={labels.mirror} color="#ff5b5b" width={126} opacity={refOpacity} />
          <LensGlyph x={610} y={122} color="#ffbf47" opacity={refOpacity} />
          <TextBadge x={548} y={34} text={labels.expandingLens} color="#ffbf47" width={154} opacity={refOpacity} />

          <MirrorGlyph x={420} y={414} angle={34} opacity={objectOpacity} />
          <NumberBubble x={390} y={432} n={4} active={showSetup || showInterference} />
          <TextBadge x={350} y={496} text={labels.mirror} color="#42f2b4" width={126} opacity={objectOpacity} />
          <LensGlyph x={578} y={414} color="#42f2b4" opacity={objectOpacity} />
          <TextBadge x={512} y={496} text={labels.expandingLens} color="#42f2b4" width={154} opacity={objectOpacity} />

          <circle cx="720" cy="382" r="34" fill="#ffbf47" opacity={objectOpacity * 0.78} />
          <circle cx="720" cy="382" r="16" fill="#081012" opacity="0.5" />
          <NumberBubble x={696} y={346} n={5} active={showSetup || showInterference} />
          <TextBadge x={666} y={428} text={labels.object} color="#ffbf47" width={112} opacity={objectOpacity} />

          <rect x="835" y="164" width="22" height="224" rx="5" fill="#35d7ff" opacity="0.24" stroke="#35d7ff" />
          {Array.from({ length: 12 }, (_, index) => (
            <line
              key={index}
              x1={842}
              y1={178 + index * 16}
              x2={852}
              y2={186 + index * 16}
              stroke={index % 2 === 0 ? "#ffbf47" : "#35d7ff"}
              strokeOpacity={showInterference || showReconstruction ? 0.88 : 0.28}
              strokeWidth="2"
            />
          ))}
          <NumberBubble x={820} y={142} n={6} />
          <TextBadge x={780} y={74} text={labels.film} color="#35d7ff" width={154} />

          <RayPath d="M 164 272 L 218 272" color="#dbeafe" marker="url(#flow-arrow-white)" opacity={1} />
          <RayPath d="M 278 254 L 420 122" color="#ff5b5b" marker="url(#flow-arrow-red)" opacity={refOpacity} />
          <RayPath d="M 420 122 L 610 122" color="#ff5b5b" marker="url(#flow-arrow-red)" opacity={refOpacity} />
          <RayPath d="M 610 122 L 846 222" color="#ff5b5b" marker="url(#flow-arrow-red)" opacity={refOpacity} />
          <RayPath d="M 278 290 L 420 414" color="#42f2b4" marker="url(#flow-arrow-teal)" opacity={objectOpacity} />
          <RayPath d="M 420 414 L 578 414" color="#42f2b4" marker="url(#flow-arrow-teal)" opacity={objectOpacity} />
          <RayPath d="M 578 414 L 720 382" color="#42f2b4" marker="url(#flow-arrow-teal)" opacity={objectOpacity} />
          <RayPath d="M 720 382 L 846 292" color="#42f2b4" marker="url(#flow-arrow-teal)" opacity={objectOpacity} />
          <RayPath d="M 710 370 L 846 250" color="#42f2b4" marker="url(#flow-arrow-teal)" opacity={objectOpacity * 0.42} thin />
          <RayPath d="M 728 394 L 846 330" color="#42f2b4" marker="url(#flow-arrow-teal)" opacity={objectOpacity * 0.42} thin />

          <ReflectionPoint x={420} y={122} color="#ff5b5b" active={showSetup || showInterference || showReconstruction} />
          <ReflectionPoint x={420} y={414} color="#42f2b4" active={showSetup || showInterference} />
          <PassPoint x={610} y={122} color="#ffbf47" active={showSetup || showInterference || showReconstruction} />
          <PassPoint x={578} y={414} color="#42f2b4" active={showSetup || showInterference} />
          <PassPoint x={846} y={222} color="#ff5b5b" active />
          <PassPoint x={846} y={292} color="#42f2b4" active={showSetup || showInterference} />

          <path
            d="M 835 184 C 796 220 796 330 835 366"
            fill="none"
            stroke="#ffbf47"
            strokeDasharray="6 8"
            strokeWidth="3"
            strokeOpacity={showInterference ? 0.9 : 0.24}
          />
          <NumberBubble x={790} y={346} n={7} active={showInterference} />
          <TextBadge x={636} y={238} text={`${referenceLabel} + ${objectLabel}`} color="#ffbf47" width={180} opacity={showInterference ? 1 : 0} />

          <RayPath d="M 164 500 C 346 500 594 430 846 244" color="#ff5b5b" marker="url(#flow-arrow-red)" opacity={reconstructionOpacity} dashed />
          <RayPath d="M 856 260 C 900 238 934 222 984 204" color="#35d7ff" marker="url(#flow-arrow-cyan)" opacity={reconstructionOpacity} />
          <RayPath d="M 856 278 C 910 278 944 278 994 278" color="#35d7ff" marker="url(#flow-arrow-cyan)" opacity={reconstructionOpacity} />
          <RayPath d="M 856 296 C 900 318 934 334 984 354" color="#35d7ff" marker="url(#flow-arrow-cyan)" opacity={reconstructionOpacity} />
          <NumberBubble x={914} y={166} n={8} active={showReconstruction} />
          <TextBadge x={864} y={384} text={reconstructedLabel} color="#35d7ff" width={152} opacity={reconstructionOpacity} />

        </svg>
        </div>
        <div className="grid content-start gap-2">
          {traceSteps.map((step) => (
            <TraceStep key={step.n} {...step} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RayPath({
  d,
  color,
  marker,
  opacity,
  thin,
  dashed
}: {
  d: string;
  color: string;
  marker: string;
  opacity: number;
  thin?: boolean;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={thin ? 2.4 : 5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={opacity}
      strokeDasharray={dashed ? "10 9" : undefined}
      markerEnd={marker}
      filter="url(#beam-glow)"
    />
  );
}

function MirrorGlyph({ x, y, angle, opacity }: { x: number; y: number; angle: number; opacity: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
      <rect x="-8" y="-42" width="16" height="84" rx="4" fill="#d6e2e5" stroke="#ffffff" strokeOpacity="0.65" />
      <rect x="-14" y="-46" width="4" height="92" rx="2" fill="#5c7278" />
    </g>
  );
}

function LensGlyph({ x, y, color, opacity }: { x: number; y: number; color: string; opacity: number }) {
  return (
    <g opacity={opacity}>
      <ellipse cx={x} cy={y} rx="22" ry="48" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2" />
      <line x1={x} y1={y - 58} x2={x} y2={y + 58} stroke={color} strokeOpacity="0.28" />
    </g>
  );
}

function ReflectionPoint({ x, y, color, active }: { x: number; y: number; color: string; active: boolean }) {
  return (
    <g opacity={active ? 1 : 0.25}>
      <circle cx={x} cy={y} r="9" fill="#091315" stroke={color} strokeWidth="2" />
      <circle cx={x} cy={y} r="3" fill={color} />
      <path d={`M ${x - 14} ${y - 14} Q ${x} ${y - 30} ${x + 14} ${y - 14}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function PassPoint({ x, y, color, active }: { x: number; y: number; color: string; active: boolean }) {
  return (
    <g opacity={active ? 1 : 0.25}>
      <circle cx={x} cy={y} r="6" fill={color} fillOpacity="0.28" stroke={color} />
      <circle cx={x} cy={y} r="2.5" fill={color} />
    </g>
  );
}

function TextBadge({
  x,
  y,
  text,
  color,
  width,
  opacity = 1
}: {
  x: number;
  y: number;
  text: string;
  color: string;
  width: number;
  opacity?: number;
}) {
  return (
    <foreignObject x={x} y={y} width={width} height={40} opacity={opacity}>
      <div className="flex h-full w-full items-center justify-center rounded border border-lab-line bg-lab-ink/95 px-2 text-center text-[12px] font-semibold leading-tight text-white">
        <span style={{ color }}>{text}</span>
      </div>
    </foreignObject>
  );
}

function NumberBubble({ x, y, n, active = true }: { x: number; y: number; n: number; active?: boolean }) {
  return (
    <g opacity={active ? 1 : 0}>
      <circle cx={x} cy={y} r="15" fill="#081012" stroke="#35d7ff" strokeWidth="2" />
      <text x={x} y={y + 5} fill="#eff9f8" textAnchor="middle" fontSize="14" fontWeight="700">
        {n}
      </text>
    </g>
  );
}

function TraceStep({
  n,
  color,
  label,
  text,
  active
}: {
  n: number;
  color: string;
  label: string;
  text: string;
  active: boolean;
}) {
  return (
    <div className={`flex gap-3 rounded border border-lab-line bg-[#091315] p-3 text-sm ${active ? "opacity-100" : "opacity-42"}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-lab-cyan bg-lab-ink text-xs font-bold text-white">
        {n}
      </span>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className={`h-2.5 w-7 rounded ${color}`} />
          <span className="font-semibold text-white">{label}</span>
        </div>
        <p className="leading-5 text-slate-300">
        {text}
        </p>
      </div>
    </div>
  );
}

function FragmentVisual({
  fragmentSize,
  fragmentLabel,
  imageLabel
}: {
  fragmentSize: number;
  fragmentLabel: string;
  imageLabel: string;
}) {
  const blur = Math.max(0, 8 - fragmentSize / 16);
  const brightness = Math.max(0.25, fragmentSize / 100);
  const fragmentWidth = Math.max(26, fragmentSize);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded border border-lab-line bg-lab-panel p-4">
        <p className="mb-3 text-sm text-slate-400">{fragmentLabel}</p>
        <div className="flex h-72 items-center justify-center rounded border border-lab-line bg-[#091315]">
          <div
            className="h-44 rounded border border-lab-cyan bg-lab-cyan/15 hologram-noise"
            style={{ width: `${fragmentWidth}%`, opacity: 0.55 + fragmentSize / 220 }}
          />
        </div>
      </div>
      <div className="rounded border border-lab-line bg-lab-panel p-4">
        <p className="mb-3 text-sm text-slate-400">{imageLabel}</p>
        <div className="relative flex h-72 items-center justify-center overflow-hidden rounded border border-lab-line bg-[#091315]">
          <div className="absolute inset-0 hologram-noise opacity-20" />
          <div
            className="relative h-36 w-36 rounded-full border-2 border-lab-amber"
            style={{ filter: `blur(${blur}px) brightness(${brightness})`, opacity: Math.max(0.32, brightness) }}
          >
            <div className="absolute left-1/2 top-2 h-32 w-1 -translate-x-1/2 bg-lab-amber" />
            <div className="absolute left-6 top-16 h-1 w-24 bg-lab-amber" />
            <div className="absolute bottom-5 left-9 h-1 w-20 rotate-45 bg-lab-amber" />
            <div className="absolute bottom-5 right-9 h-1 w-20 -rotate-45 bg-lab-amber" />
          </div>
          <div
            className="absolute bottom-0 left-1/2 h-28 -translate-x-1/2 border-x border-lab-cyan/50"
            style={{ width: `${Math.max(60, fragmentSize * 2.1)}px` }}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-lab-line bg-[#091315] px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-3 w-8 rounded ${color}`} />
      <span className="text-slate-300">{label}</span>
    </div>
  );
}
