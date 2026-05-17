"use client";

import dynamic from "next/dynamic";
import {
  Box,
  Calculator,
  ClipboardCopy,
  Download,
  FileText,
  Globe2,
  Eye,
  Orbit,
  Printer,
  Radio,
  ScanLine,
  Table2,
  TriangleRight,
  Waves
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { buildCalculationText, calculateHologram, defaultInputs, formatNumber, type HologramInputs, type HologramResults } from "@/lib/hologramMath";
import { copy, languages, type ComponentLabels, type Lang } from "@/lib/i18n";
import { downloadDeviceJson, downloadFringePattern, printCalculationReport } from "@/lib/exporters";
import OpticalTableBuilder from "./OpticalTableBuilder";
import ReconstructionSimulator from "./ReconstructionSimulator";
import type { SceneMode } from "./HologramScene";

declare global {
  interface Window {
    __HOLOGRAM_DATA__?: unknown;
  }
}

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
  { id: "optical-table", key: "opticalTable" },
  { id: "restore-simulator", key: "restoreLab" },
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
  const hologramExportData = useMemo(
    () => ({
      project: "Transmission Hologram Lab",
      version: "1.0.0",
      language: lang,
      generatedAt: "",
      input: {
        lambda: inputs.wavelengthNm,
        theta: inputs.angleDeg,
        deltaLambda: inputs.spectralLinewidthNm,
        diffractionOrder: inputs.diffractionOrder,
        filmResolution: inputs.filmResolutionLinesPerMm,
        filmSize: inputs.filmSizeMm,
        objectDistance: inputs.objectDistanceCm
      },
      results: {
        d: result.dNm,
        dMm: result.dMm,
        linesPerMm: result.requiredResolutionLinesPerMm,
        LcNm: result.coherenceLengthNm,
        LcMm: result.coherenceLengthMm,
        LcCm: result.coherenceLengthCm,
        diffAngle: result.diffractionAngleDeg,
        maxVibrationNm: result.maxVibrationNm,
        filmSuitable: result.filmSuitable,
        warnings: result.warnings
      },
      steps: calculationText.split("\n"),
      reportText: calculationText
    }),
    [calculationText, inputs, lang, result]
  );
  const hologramExportJson = useMemo(
    () => JSON.stringify(hologramExportData).replace(/</g, "\\u003c"),
    [hologramExportData]
  );

  useEffect(() => {
    window.__HOLOGRAM_DATA__ = hologramExportData;
  }, [hologramExportData]);

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
      <script
        id="hologram-export-data"
        type="application/json"
        data-hologram-export
        dangerouslySetInnerHTML={{ __html: hologramExportJson }}
      />
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

            <FormulaGuide lang={lang} inputs={inputs} result={result} />
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

      <Section id="optical-table" title={t.nav.opticalTable} icon={<Table2 size={22} aria-hidden />}>
        <OpticalTableBuilder lang={lang} />
      </Section>

      <Section id="restore-simulator" title={t.nav.restoreLab} icon={<Eye size={22} aria-hidden />}>
        <ReconstructionSimulator lang={lang} recordedAngleDeg={inputs.angleDeg} recordedWavelengthNm={inputs.wavelengthNm} />
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

type FormulaGuideText = {
  title: string;
  intro: string;
  workflowTitle: string;
  workflow: string[];
  labels: {
    purpose: string;
    when: string;
    where: string;
    units: string;
    decision: string;
    current: string;
    watch: string;
  };
  items: Array<{
    formula: string;
    title: string;
    purpose: string;
    when: string;
    where: string;
    units: string;
    decision: string;
    watch: string;
  }>;
};

const formulaGuideCopy: Record<Lang, FormulaGuideText> = {
  ru: {
    title: "Как пользоваться формулами",
    intro:
      "Формулы идут не отдельным списком, а как маршрут эксперимента: сначала проектируем геометрию записи, затем выбираем плёнку и лазер, проверяем стабильность, после этого прогнозируем восстановление изображения.",
    workflowTitle: "Порядок применения",
    workflow: [
      "1. Выберите λ и угол θ, затем найдите период полос d.",
      "2. По d рассчитайте минимальное разрешение N и сравните его с плёнкой.",
      "3. По Δλ найдите длину когерентности Lc и проверьте глубину объекта/разность хода.",
      "4. По λ/4 задайте допустимую вибрацию стола.",
      "5. Для просмотра используйте α и E_out, чтобы понять направление восстановленной волны."
    ],
    labels: {
      purpose: "Что решает",
      when: "Когда использовать",
      where: "Где в установке",
      units: "Единицы",
      decision: "Какое решение принять",
      current: "Сейчас по вашим данным",
      watch: "Не перепутать"
    },
    items: [
      {
        formula: "d = λ / (2 sin(θ/2))",
        title: "Период интерференционных полос",
        purpose: "Показывает расстояние между соседними светлыми/тёмными полосами, которые запишутся в эмульсии.",
        when: "Сразу после выбора лазера и угла между опорным и объектным лучом.",
        where: "На поверхности голографической плёнки, в зоне встречи двух лучей.",
        units: "Если λ задана в nm, d получится в nm. Для сравнения с плёнкой переведите d в mm.",
        decision: "Меньший d означает более плотные полосы и более жёсткое требование к плёнке.",
        watch: "θ берётся как угол между лучами, а в формуле стоит половина угла θ/2."
      },
      {
        formula: "N = 10^6 / d[nm]",
        title: "Минимальное разрешение плёнки",
        purpose: "Переводит период полос в пространственную частоту, которую должна различить плёнка.",
        when: "Перед выбором фотоматериала и перед выводом о пригодности плёнки.",
        where: "В паспорте/характеристиках голографической плёнки: lines/mm.",
        units: "N считается в lines/mm. Эквивалентно: N = 1 / d[mm].",
        decision: "Плёнка подходит, если её разрешение больше или равно рассчитанному N.",
        watch: "Самая частая ошибка - делить 1 на d в nm без перевода в mm."
      },
      {
        formula: "Lc = λ² / Δλ",
        title: "Длина когерентности лазера",
        purpose: "Оценивает, на какой разности хода лучи ещё сохраняют устойчивую интерференцию.",
        when: "До записи, когда выбираете лазер и глубину сцены/расстояние до объекта.",
        where: "Во всей оптической схеме: сравнивается с разностью оптических путей reference и object beam.",
        units: "λ и Δλ должны быть в одинаковых единицах; результат будет в тех же единицах.",
        decision: "Разность хода должна быть меньше Lc, иначе полосы потеряют контраст.",
        watch: "Малая Δλ даёт большую Lc; широкий спектр резко ухудшает запись."
      },
      {
        formula: "sin(α) = mλ / d",
        title: "Угол дифракции и наблюдения",
        purpose: "Показывает, под каким углом появится дифрагированный порядок при восстановлении.",
        when: "После расчёта d, когда нужно объяснить, куда выходит восстановленная волна.",
        where: "На этапе просмотра: за плёнкой, куда проходит diffracted/reconstructed beam.",
        units: "λ и d берутся в одинаковых единицах; α получается в градусах после arcsin.",
        decision: "Если |mλ/d| ≤ 1, порядок существует; если больше 1, такой угол физически невозможен.",
        watch: "m = 0 даёт прямой луч, m = 1 обычно используют для первого восстановленного изображения."
      },
      {
        formula: "vibration < λ / 4",
        title: "Условие механической стабильности",
        purpose: "Задаёт максимальное смещение установки, при котором интерференционные полосы не смазываются.",
        when: "Перед экспозицией, при настройке оптического стола и виброизоляции.",
        where: "Лазер, зеркала, объект и плёнка должны оставаться стабильны относительно друг друга.",
        units: "λ/4 обычно удобно показывать в nm и µm.",
        decision: "Если вибрации больше λ/4, запись будет слабой или испорченной.",
        watch: "Даже маленький толчок стола меняет фазу, потому что голограмма записывает волну, а не картинку."
      },
      {
        formula: "I(x,y) = |Er + Eo|²",
        title: "Интенсивность интерференционной картины",
        purpose: "Объясняет, почему на плёнке появляется структура полос: складываются опорная и объектная волны.",
        when: "В теоретическом объяснении процесса записи.",
        where: "Только в области плёнки, где одновременно присутствуют reference beam и object beam.",
        units: "Это распределение интенсивности по координатам x,y на плёнке.",
        decision: "Для записи нужны оба луча; один луч не создаёт голограмму.",
        watch: "Именно фазовый член 2ArAo cos(φ) несёт информацию об объектной волне."
      },
      {
        formula: "E_out = T(x,y) · Er",
        title: "Восстановление объектной волны",
        purpose: "Показывает, как готовая плёнка превращает опорный луч в восстановленную волну.",
        when: "На этапе просмотра готовой transmission-голограммы.",
        where: "Свет проходит сквозь плёнку; за плёнкой появляется reconstructed wave.",
        units: "T(x,y) - функция пропускания плёнки, Er - опорная волна при восстановлении.",
        decision: "Для чёткого 3D нужно повторить длину волны и угол опорного луча, близкие к записи.",
        watch: "Проектор или белый свет не заменяют когерентный лазер: фазы и длины волн не совпадают."
      }
    ]
  },
  en: {
    title: "How to Use the Formulas",
    intro:
      "The formulas are an experiment workflow: design the recording geometry, choose the film and laser, check stability, then predict reconstruction.",
    workflowTitle: "Use order",
    workflow: [
      "1. Choose λ and θ, then calculate fringe period d.",
      "2. Convert d into required resolution N and compare it with the film.",
      "3. Use Δλ to calculate coherence length Lc and check path difference/object depth.",
      "4. Use λ/4 to set the vibration limit.",
      "5. Use α and E_out to explain where the reconstructed wave appears."
    ],
    labels: {
      purpose: "What it solves",
      when: "When to use",
      where: "Where in setup",
      units: "Units",
      decision: "Decision",
      current: "With current inputs",
      watch: "Watch out"
    },
    items: [
      {
        formula: "d = λ / (2 sin(θ/2))",
        title: "Interference Fringe Period",
        purpose: "Finds the spacing between neighboring fringes recorded in the emulsion.",
        when: "Right after selecting the laser wavelength and the angle between beams.",
        where: "On the holographic film, where reference and object beams overlap.",
        units: "If λ is in nm, d is in nm. Convert d to mm before comparing with film specs.",
        decision: "Smaller d means denser fringes and a higher film resolution requirement.",
        watch: "θ is the angle between the beams, but the formula uses θ/2."
      },
      {
        formula: "N = 10^6 / d[nm]",
        title: "Required Film Resolution",
        purpose: "Converts fringe spacing into the spatial frequency the film must resolve.",
        when: "Before choosing the photographic material and judging film suitability.",
        where: "In film datasheets, usually listed as lines/mm.",
        units: "N is in lines/mm. Equivalent form: N = 1 / d[mm].",
        decision: "The film is suitable when its resolution is at least the calculated N.",
        watch: "Do not divide 1 by d in nm without converting to mm."
      },
      {
        formula: "Lc = λ² / Δλ",
        title: "Laser Coherence Length",
        purpose: "Estimates the path difference over which beams still interfere with good contrast.",
        when: "Before recording, while choosing the laser and scene depth.",
        where: "Across the optical setup: compare it with the optical path difference.",
        units: "λ and Δλ must use the same unit; Lc comes out in that unit.",
        decision: "Keep the path difference below Lc, or fringes lose contrast.",
        watch: "A narrow linewidth gives long coherence length; broad spectrum destroys the recording."
      },
      {
        formula: "sin(α) = mλ / d",
        title: "Diffraction and Viewing Angle",
        purpose: "Predicts the angle of the diffracted order during reconstruction.",
        when: "After calculating d, when explaining where the reconstructed wave exits.",
        where: "During viewing, behind the film in the transmitted diffracted beam.",
        units: "λ and d use the same unit; α is obtained in degrees after arcsin.",
        decision: "If |mλ/d| ≤ 1 the order exists; if it is greater than 1, it is impossible.",
        watch: "m = 0 is the straight beam; m = 1 is usually the first reconstructed image."
      },
      {
        formula: "vibration < λ / 4",
        title: "Mechanical Stability Condition",
        purpose: "Sets the maximum motion before interference fringes smear.",
        when: "Before exposure, while preparing the optical table and isolation.",
        where: "Laser, mirrors, object, and film must remain stable relative to each other.",
        units: "λ/4 is best shown in nm and µm.",
        decision: "If vibration exceeds λ/4, the recording becomes weak or ruined.",
        watch: "A hologram records a wave phase, not just an image, so tiny motion matters."
      },
      {
        formula: "I(x,y) = |Er + Eo|²",
        title: "Interference Intensity",
        purpose: "Explains why fringes appear: reference and object waves are added.",
        when: "In the theory of the recording process.",
        where: "Only on film regions reached by both beams.",
        units: "It is an intensity distribution over x,y on the film.",
        decision: "Both beams are required; one beam alone cannot record a hologram.",
        watch: "The phase term 2ArAo cos(φ) carries object-wave information."
      },
      {
        formula: "E_out = T(x,y) · Er",
        title: "Object Wave Reconstruction",
        purpose: "Shows how the developed film converts the reference beam into the reconstructed wave.",
        when: "When viewing the finished transmission hologram.",
        where: "Light passes through the film; the reconstructed wave appears behind it.",
        units: "T(x,y) is film transmittance; Er is the reconstruction reference wave.",
        decision: "Use a laser wavelength and reference angle close to the recording conditions.",
        watch: "A projector or white light does not replace a coherent laser."
      }
    ]
  },
  uz: {
    title: "Formulalardan qanday foydalanish kerak",
    intro:
      "Formulalar tajriba tartibi bo'yicha ishlatiladi: avval yozish geometriyasi, keyin plyonka va lazer tanlovi, barqarorlik tekshiruvi, so'ng tiklash yo'nalishi.",
    workflowTitle: "Qo'llash tartibi",
    workflow: [
      "1. λ va θ ni tanlang, so'ng polosalar davri d ni hisoblang.",
      "2. d orqali kerakli N ni topib, plyonka bilan solishtiring.",
      "3. Δλ orqali Lc ni topib, optik yo'l farqi va obyekt chuqurligini tekshiring.",
      "4. λ/4 orqali stol tebranishi chegarasini belgilang.",
      "5. α va E_out orqali tiklangan to'lqin qayerga chiqishini tushuntiring."
    ],
    labels: {
      purpose: "Nimani hal qiladi",
      when: "Qachon ishlatiladi",
      where: "Qayerda ishlatiladi",
      units: "Birliklar",
      decision: "Qanday xulosa",
      current: "Hozirgi qiymatlar bilan",
      watch: "Ehtiyot bo'ling"
    },
    items: [
      {
        formula: "d = λ / (2 sin(θ/2))",
        title: "Interferensiya polosalari davri",
        purpose: "Emulsiyada yoziladigan qo'shni polosalar orasidagi masofani ko'rsatadi.",
        when: "Lazer to'lqin uzunligi va ikki nur orasidagi burchak tanlangandan keyin.",
        where: "Tayanch va obyekt nurlari uchrashadigan golografik plyonka yuzasida.",
        units: "λ nm bo'lsa, d ham nm chiqadi. Plyonka bilan solishtirish uchun d ni mm ga o'tkazing.",
        decision: "d kichik bo'lsa, polosalar zichroq bo'ladi va plyonkadan yuqori aniqlik talab qilinadi.",
        watch: "θ - ikki nur orasidagi burchak, lekin formulada θ/2 ishlatiladi."
      },
      {
        formula: "N = 10^6 / d[nm]",
        title: "Plyonka uchun kerakli aniqlik",
        purpose: "Polosa davrini plyonka ajrata olishi kerak bo'lgan fazoviy chastotaga aylantiradi.",
        when: "Fotomaterial tanlash va plyonka mosligini tekshirishdan oldin.",
        where: "Plyonka pasportida odatda lines/mm ko'rinishida beriladi.",
        units: "N lines/mm bo'ladi. Ekvivalent: N = 1 / d[mm].",
        decision: "Plyonka aniqligi hisoblangan N dan katta yoki teng bo'lsa, mos keladi.",
        watch: "d nm bo'lsa, uni mm ga o'tkazmasdan 1/d qilish xato."
      },
      {
        formula: "Lc = λ² / Δλ",
        title: "Lazer kogerentlik uzunligi",
        purpose: "Nurlar qaysi optik yo'l farqigacha yaxshi interferensiya berishini baholaydi.",
        when: "Yozishdan oldin, lazer va obyekt chuqurligini tanlashda.",
        where: "Reference va object beam optik yo'llari farqi bilan solishtiriladi.",
        units: "λ va Δλ bir xil birlikda bo'lishi kerak; natija ham shu birlikda chiqadi.",
        decision: "Optik yo'l farqi Lc dan kichik bo'lishi kerak.",
        watch: "Δλ kichik bo'lsa Lc katta bo'ladi; keng spektr yozuvni yomonlashtiradi."
      },
      {
        formula: "sin(α) = mλ / d",
        title: "Difraksiya va kuzatish burchagi",
        purpose: "Tiklashda difraksion tartib qaysi burchakda chiqishini ko'rsatadi.",
        when: "d hisoblangandan keyin, tiklangan to'lqin yo'nalishini tushuntirishda.",
        where: "Ko'rish bosqichida, plyonkadan o'tgan nur tomonda.",
        units: "λ va d bir xil birlikda olinadi; α arcsin dan keyin gradusda chiqadi.",
        decision: "Agar |mλ/d| ≤ 1 bo'lsa tartib mavjud; katta bo'lsa fizik jihatdan mumkin emas.",
        watch: "m = 0 to'g'ri o'tgan nur; m = 1 odatda birinchi tiklangan tasvir."
      },
      {
        formula: "vibration < λ / 4",
        title: "Mexanik barqarorlik sharti",
        purpose: "Interferensiya polosalari surkalmasligi uchun maksimal siljishni belgilaydi.",
        when: "Ekspozitsiyadan oldin, optik stol va izolyatsiyani sozlashda.",
        where: "Lazer, ko'zgular, obyekt va plyonka bir-biriga nisbatan barqaror turishi kerak.",
        units: "λ/4 ni nm va µm da ko'rsatish qulay.",
        decision: "Tebranish λ/4 dan katta bo'lsa, yozuv sifati yomonlashadi.",
        watch: "Gologramma rasmni emas, to'lqin fazasini yozadi; juda kichik siljish ham muhim."
      },
      {
        formula: "I(x,y) = |Er + Eo|²",
        title: "Interferensiya intensivligi",
        purpose: "Plyonkada polosalar nima uchun paydo bo'lishini tushuntiradi.",
        when: "Yozish jarayoni nazariyasini tushuntirishda.",
        where: "Faqat ikkala nur tushgan plyonka sohasida.",
        units: "Bu x,y bo'yicha intensivlik taqsimoti.",
        decision: "Gologramma yozilishi uchun ikkala nur ham kerak.",
        watch: "2ArAo cos(φ) fazaviy hadi obyekt to'lqini haqidagi ma'lumotni saqlaydi."
      },
      {
        formula: "E_out = T(x,y) · Er",
        title: "Obyekt to'lqinini tiklash",
        purpose: "Tayyor plyonka tayanch nurni qanday qilib tiklangan to'lqinga aylantirishini ko'rsatadi.",
        when: "Tayyor transmission-gologrammani ko'rishda.",
        where: "Yorug'lik plyonkadan o'tadi va uning orqasida reconstructed wave hosil bo'ladi.",
        units: "T(x,y) - plyonka o'tkazuvchanligi, Er - tiklashdagi tayanch to'lqin.",
        decision: "Aniq 3D uchun yozishdagi lazer λ va burchakka yaqin sharoit kerak.",
        watch: "Proyektor yoki oq yorug'lik kogerent lazerni almashtira olmaydi."
      }
    ]
  }
};

function FormulaGuide({ lang, inputs, result }: { lang: Lang; inputs: HologramInputs; result: HologramResults }) {
  const guide = formulaGuideCopy[lang];
  const currentValues = buildFormulaGuideCurrentValues(lang, inputs, result);

  return (
    <div className="rounded border border-lab-line bg-lab-panel/92 p-4 lg:col-span-2">
      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <div>
          <h3 className="text-lg font-semibold text-white">{guide.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{guide.intro}</p>
          <div className="mt-4 rounded border border-lab-line bg-[#091315] p-4">
            <h4 className="text-sm font-semibold text-lab-cyan">{guide.workflowTitle}</h4>
            <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              {guide.workflow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {guide.items.map((item, index) => (
            <article key={item.formula} className="rounded border border-lab-line bg-[#091315] p-4">
              <div className="equation mb-3 rounded px-3 py-2 text-sm text-lab-cyan">{item.formula}</div>
              <h4 className="text-base font-semibold text-white">{item.title}</h4>
              <FormulaGuideRow label={guide.labels.purpose} text={item.purpose} />
              <FormulaGuideRow label={guide.labels.when} text={item.when} />
              <FormulaGuideRow label={guide.labels.where} text={item.where} />
              <FormulaGuideRow label={guide.labels.units} text={item.units} />
              <FormulaGuideRow label={guide.labels.decision} text={item.decision} />
              <FormulaGuideRow label={guide.labels.watch} text={item.watch} warning />
              <div className="mt-3 rounded border border-lab-cyan/40 bg-lab-cyan/10 p-3 text-sm text-lab-cyan">
                <span className="font-semibold">{guide.labels.current}: </span>
                {currentValues[index]}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildFormulaGuideCurrentValues(lang: Lang, inputs: HologramInputs, result: HologramResults) {
  const diffraction =
    result.diffractionAngleDeg === null
      ? {
          ru: `mλ/d = ${formatNumber(result.diffractionRatio)}; угол невозможен`,
          en: `mλ/d = ${formatNumber(result.diffractionRatio)}; angle is impossible`,
          uz: `mλ/d = ${formatNumber(result.diffractionRatio)}; burchak mumkin emas`
        }[lang]
      : `α = ${formatNumber(result.diffractionAngleDeg)}°; mλ/d = ${formatNumber(result.diffractionRatio)}`;

  const interference = result.filmSuitable
    ? {
        ru: "Оба луча дают записываемую интерференционную картину.",
        en: "Both beams create a recordable interference pattern.",
        uz: "Ikkala nur yoziladigan interferensiya kartinasini hosil qiladi."
      }[lang]
    : {
        ru: "Оба луча нужны, но разрешения плёнки всё ещё недостаточно.",
        en: "Both beams are needed, but film resolution is still not enough.",
        uz: "Ikkala nur kerak, lekin plyonka aniqligi hali yetarli emas."
      }[lang];

  const reconstruction = {
    ru: `Используйте λ ≈ ${formatNumber(inputs.wavelengthNm)} nm и угол опорного луча ≈ ${formatNumber(inputs.angleDeg)}°`,
    en: `Use λ ≈ ${formatNumber(inputs.wavelengthNm)} nm and reference angle ≈ ${formatNumber(inputs.angleDeg)}°`,
    uz: `λ ≈ ${formatNumber(inputs.wavelengthNm)} nm va tayanch nur burchagi ≈ ${formatNumber(inputs.angleDeg)}° bo'lsin`
  }[lang];

  return [
    `d = ${formatNumber(result.dNm)} nm = ${formatNumber(result.dMm, 6)} mm`,
    `N = ${formatNumber(result.requiredResolutionLinesPerMm)} lines/mm; film = ${formatNumber(inputs.filmResolutionLinesPerMm)} lines/mm`,
    `Lc = ${formatNumber(result.coherenceLengthMm)} mm = ${formatNumber(result.coherenceLengthCm)} cm`,
    diffraction,
    `< ${formatNumber(result.maxVibrationNm)} nm = ${formatNumber(result.maxVibrationUm)} µm`,
    interference,
    reconstruction
  ];
}

function FormulaGuideRow({ label, text, warning }: { label: string; text: string; warning?: boolean }) {
  return (
    <p className="mt-3 text-sm leading-6 text-slate-300">
      <span className={warning ? "font-semibold text-lab-amber" : "font-semibold text-slate-100"}>{label}: </span>
      {text}
    </p>
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
