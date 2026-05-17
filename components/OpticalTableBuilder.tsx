"use client";

import { RotateCcw, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/hologramMath";

type ComponentType = "laser" | "splitter" | "mirror" | "lens" | "film" | "object";

type OpticalComponent = {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  angle: number;
};

type Vec = { x: number; y: number };

type RayRole = "source" | "reference" | "object";

type Ray = {
  origin: Vec;
  dir: Vec;
  role: RayRole;
  power: number;
  expanded?: boolean;
  ignoreId?: string;
  depth: number;
};

type RaySegment = {
  from: Vec;
  to: Vec;
  role: RayRole;
  power: number;
  expanded?: boolean;
  dashed?: boolean;
};

type FilmHit = {
  role: RayRole;
  point: Vec;
  dir: Vec;
};

type TraceResult = {
  segments: RaySegment[];
  filmHits: FilmHit[];
  splitterHit: boolean;
  objectHit: boolean;
  interference: boolean;
  thetaDeg: number | null;
};

type Interaction =
  | { kind: "drag"; id: string; dx: number; dy: number }
  | { kind: "rotate"; id: string }
  | null;

const TABLE_WIDTH = 900;
const TABLE_HEIGHT = 560;
const LASER_WAVELENGTH_NM = 632.8;

const standardPreset: OpticalComponent[] = [
  { id: "laser", type: "laser", x: 82, y: 280, angle: 0 },
  { id: "splitter", type: "splitter", x: 230, y: 280, angle: 45 },
  { id: "mirror-ref", type: "mirror", x: 430, y: 280, angle: -5 },
  { id: "lens-ref", type: "lens", x: 600, y: 250, angle: 90 },
  { id: "mirror-obj", type: "mirror", x: 230, y: 430, angle: 40 },
  { id: "lens-obj", type: "lens", x: 430, y: 395, angle: 90 },
  { id: "object", type: "object", x: 600, y: 340, angle: 0 },
  { id: "film", type: "film", x: 780, y: 260, angle: 90 }
];

const emptyPreset: OpticalComponent[] = [
  { id: "laser", type: "laser", x: 78, y: 90, angle: 0 },
  { id: "splitter", type: "splitter", x: 80, y: 170, angle: 45 },
  { id: "mirror-ref", type: "mirror", x: 80, y: 250, angle: 0 },
  { id: "lens-ref", type: "lens", x: 80, y: 325, angle: 90 },
  { id: "mirror-obj", type: "mirror", x: 80, y: 400, angle: 35 },
  { id: "lens-obj", type: "lens", x: 80, y: 475, angle: 90 },
  { id: "object", type: "object", x: 185, y: 475, angle: 0 },
  { id: "film", type: "film", x: 835, y: 280, angle: 90 }
];

const errorPreset: OpticalComponent[] = [
  { id: "laser", type: "laser", x: 82, y: 280, angle: 0 },
  { id: "splitter", type: "splitter", x: 230, y: 280, angle: 45 },
  { id: "mirror-ref", type: "mirror", x: 430, y: 280, angle: -5 },
  { id: "lens-ref", type: "lens", x: 600, y: 250, angle: 90 },
  { id: "mirror-obj", type: "mirror", x: 230, y: 430, angle: -25 },
  { id: "lens-obj", type: "lens", x: 430, y: 470, angle: 90 },
  { id: "object", type: "object", x: 620, y: 460, angle: 0 },
  { id: "film", type: "film", x: 780, y: 260, angle: 90 }
];

const labels = {
  title: "Оптический стол",
  subtitle: "Перетаскивайте компоненты. Вращайте колесом мыши или круглой ручкой над элементом.",
  standard: "Стандартная схема",
  empty: "Пустой стол",
  error: "Ошибка: нет интерференции",
  training: "Обучающий режим",
  theta: "Угол θ",
  period: "Период d",
  resolution: "Разрешение N",
  interferenceOk: "✓ Интерференция! Голограмма записывается",
  noInterference: "✗ Нет интерференции — нужны оба луча",
  tips: {
    splitter: "Поставьте светоделитель на пути лазера.",
    reference: "Направьте опорный луч зеркалом и линзой на плёнку.",
    object: "Направьте объектный луч на объект.",
    film: "Добейтесь, чтобы объектная волна и опорный луч пришли на плёнку.",
    done: "Схема готова: оба луча попадают на плёнку."
  },
  components: {
    laser: "Лазер",
    splitter: "Светоделитель",
    mirror: "Зеркало",
    lens: "Расш. линза",
    film: "Плёнка",
    object: "Объект"
  },
  steps: [
    "Поставьте лазер в левый угол стола",
    "Разместите светоделитель на пути луча",
    "Направьте опорный луч зеркалом на плёнку",
    "Направьте объектный луч на объект",
    "Добейтесь интерференции на плёнке"
  ]
};

export default function OpticalTableBuilder() {
  const [components, setComponents] = useState<OpticalComponent[]>(standardPreset);
  const [selectedId, setSelectedId] = useState<string>("splitter");
  const [interaction, setInteraction] = useState<Interaction>(null);
  const [training, setTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);

  const trace = useMemo(() => traceOptics(components), [components]);
  const metrics = useMemo(() => calculateTraceMetrics(trace), [trace]);
  const selected = components.find((component) => component.id === selectedId) ?? null;
  const trainingChecks = useMemo(() => getTrainingChecks(components, trace), [components, trace]);
  const activeTip = getActiveTip(trace);

  const setPreset = (preset: OpticalComponent[]) => {
    setComponents(preset.map((component) => ({ ...component })));
    setSelectedId(preset[0]?.id ?? "");
    setTrainingStep(0);
  };

  const updateComponent = (id: string, patch: Partial<OpticalComponent>) => {
    setComponents((current) =>
      current.map((component) => (component.id === id ? { ...component, ...patch } : component))
    );
  };

  const pointerToTable = (event: React.PointerEvent<SVGSVGElement>): Vec => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * TABLE_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * TABLE_HEIGHT
    };
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!interaction) return;
    const point = pointerToTable(event);
    if (interaction.kind === "drag") {
      updateComponent(interaction.id, {
        x: clamp(point.x - interaction.dx, 30, TABLE_WIDTH - 30),
        y: clamp(point.y - interaction.dy, 30, TABLE_HEIGHT - 30)
      });
      return;
    }

    const component = components.find((item) => item.id === interaction.id);
    if (!component) return;
    updateComponent(interaction.id, {
      angle: radiansToDegrees(Math.atan2(point.y - component.y, point.x - component.x))
    });
  };

  const handleComponentPointerDown = (event: React.PointerEvent<SVGGElement>, component: OpticalComponent) => {
    event.preventDefault();
    event.stopPropagation();
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const point = {
      x: ((event.clientX - rect.left) / rect.width) * TABLE_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * TABLE_HEIGHT
    };
    setSelectedId(component.id);
    setInteraction({ kind: "drag", id: component.id, dx: point.x - component.x, dy: point.y - component.y });
  };

  const handleRotatePointerDown = (event: React.PointerEvent<SVGCircleElement>, id: string) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(id);
    setInteraction({ kind: "rotate", id });
  };

  const handleWheel = (event: React.WheelEvent<SVGGElement>, component: OpticalComponent) => {
    event.preventDefault();
    updateComponent(component.id, { angle: normalizeDegrees(component.angle + (event.deltaY > 0 ? 5 : -5)) });
  };

  const nextTrainingStep = () => {
    if (trainingChecks[trainingStep]) {
      setTrainingStep((step) => Math.min(step + 1, labels.steps.length - 1));
    }
  };

  return (
    <div className="rounded border border-lab-line bg-lab-panel/92 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{labels.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{labels.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPreset(standardPreset)} className="rounded border border-lab-cyan bg-lab-cyan px-3 py-2 text-sm font-semibold text-lab-ink">
            {labels.standard}
          </button>
          <button type="button" onClick={() => setPreset(emptyPreset)} className="rounded border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-slate-100">
            {labels.empty}
          </button>
          <button type="button" onClick={() => setPreset(errorPreset)} className="rounded border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-slate-100">
            {labels.error}
          </button>
          <button
            type="button"
            onClick={() => setTraining((value) => !value)}
            className={`rounded border px-3 py-2 text-sm ${training ? "border-lab-teal bg-lab-teal text-lab-ink" : "border-lab-line bg-lab-panel2 text-slate-100"}`}
          >
            {labels.training}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded border border-lab-line bg-[#071113]">
          <svg
            viewBox={`0 0 ${TABLE_WIDTH} ${TABLE_HEIGHT}`}
            className="h-auto w-full touch-none select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={() => setInteraction(null)}
            onPointerCancel={() => setInteraction(null)}
            role="img"
            aria-label="Interactive optical table"
          >
            <TableGrid />
            {training && <TrainingZone step={trainingStep} />}

            {trace.segments.map((segment, index) => (
              <RaySegmentView key={`${index}-${segment.role}`} segment={segment} />
            ))}

            {trace.interference && <InterferenceBands film={getComponent(components, "film")} />}

            {components.map((component) => (
              <ComponentGlyph
                key={component.id}
                component={component}
                selected={component.id === selectedId}
                onPointerDown={handleComponentPointerDown}
                onRotatePointerDown={handleRotatePointerDown}
                onWheel={handleWheel}
              />
            ))}
          </svg>
        </div>

        <aside className="grid content-start gap-3">
          <div className={`rounded border p-4 ${trace.interference ? "border-lab-amber bg-lab-amber/10" : "border-lab-line bg-[#091315]"}`}>
            <p className={`text-sm font-semibold ${trace.interference ? "text-lab-amber" : "text-slate-300"}`}>
              {trace.interference ? labels.interferenceOk : labels.noInterference}
            </p>
          </div>

          <MetricLine label={labels.theta} value={metrics.thetaText} />
          <MetricLine label={labels.period} value={metrics.periodText} />
          <MetricLine label={labels.resolution} value={metrics.resolutionText} />

          <div className="rounded border border-lab-line bg-[#091315] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <Target size={16} aria-hidden />
              Подсказка
            </div>
            <p className="text-sm leading-6 text-slate-300">{activeTip}</p>
          </div>

          {selected && (
            <div className="rounded border border-lab-line bg-[#091315] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <RotateCcw size={16} aria-hidden />
                {componentLabel(selected.type)}
              </div>
              <p className="text-sm text-slate-400">x {formatNumber(selected.x, 0)} / y {formatNumber(selected.y, 0)}</p>
              <p className="mt-1 text-sm text-slate-400">angle {formatNumber(normalizeDegrees(selected.angle), 1)}°</p>
            </div>
          )}

          {training && (
            <div className="rounded border border-lab-line bg-[#091315] p-4">
              <h4 className="text-sm font-semibold text-white">{labels.training}</h4>
              <ol className="mt-3 grid gap-2">
                {labels.steps.map((step, index) => (
                  <li key={step} className={`rounded border px-3 py-2 text-sm ${trainingChecks[index] ? "border-lab-teal bg-lab-teal/10 text-lab-teal" : index === trainingStep ? "border-lab-cyan bg-lab-cyan/10 text-white" : "border-lab-line text-slate-500"}`}>
                    {trainingChecks[index] ? "✓ " : `${index + 1}. `}
                    {step}
                  </li>
                ))}
              </ol>
              <button type="button" onClick={nextTrainingStep} className="mt-3 rounded border border-lab-cyan px-3 py-2 text-sm text-lab-cyan">
                Следующий шаг
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function TableGrid() {
  return (
    <>
      <rect width={TABLE_WIDTH} height={TABLE_HEIGHT} fill="#071113" />
      {Array.from({ length: 18 }, (_, index) => (
        <line key={`v-${index}`} x1={index * 54} y1="0" x2={index * 54} y2={TABLE_HEIGHT} stroke="#244046" strokeOpacity="0.23" />
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <line key={`h-${index}`} x1="0" y1={index * 52} x2={TABLE_WIDTH} y2={index * 52} stroke="#244046" strokeOpacity="0.23" />
      ))}
    </>
  );
}

function ComponentGlyph({
  component,
  selected,
  onPointerDown,
  onRotatePointerDown,
  onWheel
}: {
  component: OpticalComponent;
  selected: boolean;
  onPointerDown: (event: React.PointerEvent<SVGGElement>, component: OpticalComponent) => void;
  onRotatePointerDown: (event: React.PointerEvent<SVGCircleElement>, id: string) => void;
  onWheel: (event: React.WheelEvent<SVGGElement>, component: OpticalComponent) => void;
}) {
  const label = componentLabel(component.type);
  const color = componentColor(component.type);

  return (
    <g
      transform={`translate(${component.x} ${component.y}) rotate(${component.angle})`}
      onPointerDown={(event) => onPointerDown(event, component)}
      onWheel={(event) => onWheel(event, component)}
      className="cursor-grab active:cursor-grabbing"
    >
      {component.type === "laser" && (
        <>
          <rect x="-44" y="-18" width="88" height="36" rx="8" fill="#18272a" stroke={selected ? "#35d7ff" : "#31545a"} strokeWidth="2" />
          <circle cx="46" cy="0" r="7" fill="#ff5b5b" />
        </>
      )}
      {component.type === "splitter" && (
        <>
          <rect x="-25" y="-25" width="50" height="50" rx="6" fill="#2d2709" stroke={selected ? "#35d7ff" : "#ffbf47"} strokeWidth="2" />
          <line x1="-20" y1="20" x2="20" y2="-20" stroke="#ffbf47" strokeWidth="3" />
        </>
      )}
      {component.type === "mirror" && (
        <rect x="-44" y="-5" width="88" height="10" rx="3" fill="#d4dde0" stroke={selected ? "#35d7ff" : "#7f9399"} strokeWidth="2" />
      )}
      {component.type === "lens" && (
        <>
          <path d="M -12 -34 C 8 -18 8 18 -12 34" fill="none" stroke={selected ? "#35d7ff" : "#61dfff"} strokeWidth="4" />
          <path d="M 12 -34 C -8 -18 -8 18 12 34" fill="none" stroke={selected ? "#35d7ff" : "#61dfff"} strokeWidth="4" />
        </>
      )}
      {component.type === "film" && (
        <rect x="-8" y="-70" width="16" height="140" rx="4" fill="#ffbf47" fillOpacity="0.35" stroke={selected ? "#35d7ff" : "#ffbf47"} strokeWidth="2" />
      )}
      {component.type === "object" && (
        <>
          <circle cx="0" cy="0" r="32" fill="#a060ff" fillOpacity="0.58" stroke={selected ? "#35d7ff" : "#c39aff"} strokeWidth="2" />
          <path d="M -14 -7 C 0 -24 18 -14 12 8 C 4 25 -22 18 -14 -7" fill="#d2bdff" fillOpacity="0.22" />
        </>
      )}
      <text x="0" y={component.type === "film" ? -82 : -38} textAnchor="middle" fill={color} fontSize="12" fontWeight="700" transform={`rotate(${-component.angle})`}>
        {label}
      </text>
      {selected && (
        <>
          <line x1="0" y1="-58" x2="0" y2="-82" stroke="#35d7ff" strokeDasharray="4 3" />
          <circle
            cx="0"
            cy="-90"
            r="10"
            fill="#081012"
            stroke="#35d7ff"
            strokeWidth="2"
            onPointerDown={(event) => onRotatePointerDown(event, component.id)}
            className="cursor-crosshair"
          />
        </>
      )}
    </g>
  );
}

function RaySegmentView({ segment }: { segment: RaySegment }) {
  const color = rayColor(segment.role);
  const width = svgNumber(segment.role === "source" ? 3 : 4.5 * segment.power);
  const opacity = svgNumber(segment.role === "source" ? 0.78 : 0.94 * segment.power);
  const points = `${svgPoint(segment.from)} ${svgPoint(segment.to)}`;

  return (
    <g>
      {segment.expanded && (
        <polygon
          points={`${svgNumber(segment.from.x)},${svgNumber(segment.from.y - 12)} ${svgNumber(segment.to.x)},${svgNumber(segment.to.y - 28)} ${svgNumber(segment.to.x)},${svgNumber(segment.to.y + 28)} ${svgNumber(segment.from.x)},${svgNumber(segment.from.y + 12)}`}
          fill={color}
          opacity="0.1"
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={opacity}
        strokeDasharray={segment.dashed ? "10 8" : undefined}
      />
    </g>
  );
}

function InterferenceBands({ film }: { film?: OpticalComponent }) {
  if (!film) return null;
  return (
    <g transform={`translate(${film.x} ${film.y}) rotate(${film.angle})`}>
      <rect x="-16" y="-78" width="32" height="156" rx="6" fill="#ffbf47" opacity="0.3" />
      {Array.from({ length: 11 }, (_, index) => (
        <line key={index} x1="-15" x2="15" y1={-66 + index * 13} y2={-58 + index * 13} stroke={index % 2 === 0 ? "#fff2b2" : "#35d7ff"} strokeWidth="2" opacity="0.8" />
      ))}
    </g>
  );
}

function TrainingZone({ step }: { step: number }) {
  const zones = [
    { x: 20, y: 210, width: 150, height: 145 },
    { x: 190, y: 230, width: 100, height: 100 },
    { x: 385, y: 215, width: 80, height: 115 },
    { x: 560, y: 325, width: 110, height: 95 },
    { x: 720, y: 155, width: 120, height: 220 }
  ];
  const zone = zones[Math.min(step, zones.length - 1)];
  return <rect {...zone} rx="12" fill="#35d7ff" fillOpacity="0.08" stroke="#35d7ff" strokeDasharray="8 6" strokeWidth="2" />;
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-lab-line bg-[#091315] px-3 py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function traceOptics(components: OpticalComponent[]): TraceResult {
  const laser = getComponent(components, "laser");
  const film = getComponent(components, "film");
  const segments: RaySegment[] = [];
  const filmHits: FilmHit[] = [];
  let splitterHit = false;
  let objectHit = false;

  if (!laser) {
    return { segments, filmHits, splitterHit, objectHit, interference: false, thetaDeg: null };
  }

  const queue: Ray[] = [
    {
      origin: add(point(laser), scale(angleVector(laser.angle), 48)),
      dir: angleVector(laser.angle),
      role: "source",
      power: 1,
      depth: 0
    }
  ];

  while (queue.length > 0 && segments.length < 36) {
    const ray = queue.shift();
    if (!ray || ray.depth > 7 || ray.power < 0.08) continue;

    const hit = nearestHit(ray, components);
    if (!hit) {
      segments.push({ from: ray.origin, to: add(ray.origin, scale(ray.dir, 1200)), role: ray.role, power: ray.power, expanded: ray.expanded });
      continue;
    }

    segments.push({ from: ray.origin, to: hit.point, role: ray.role, power: ray.power, expanded: ray.expanded });

    if (hit.component.type === "splitter") {
      splitterHit = true;
      const transmittedRole: RayRole = ray.role === "source" ? "reference" : ray.role;
      const reflectedRole: RayRole = ray.role === "source" ? "object" : ray.role;
      queue.push({
        origin: add(hit.point, scale(ray.dir, 2)),
        dir: ray.dir,
        role: transmittedRole,
        power: ray.power * 0.55,
        ignoreId: hit.component.id,
        depth: ray.depth + 1
      });
      const reflected = rotate(ray.dir, Math.PI / 2);
      queue.push({
        origin: add(hit.point, scale(reflected, 2)),
        dir: reflected,
        role: reflectedRole,
        power: ray.power * 0.55,
        ignoreId: hit.component.id,
        depth: ray.depth + 1
      });
      continue;
    }

    if (hit.component.type === "mirror") {
      const reflected = reflectAcrossLine(ray.dir, degreesToRadians(hit.component.angle));
      queue.push({
        origin: add(hit.point, scale(reflected, 2)),
        dir: reflected,
        role: ray.role === "source" ? "reference" : ray.role,
        power: ray.power * 0.92,
        expanded: ray.expanded,
        ignoreId: hit.component.id,
        depth: ray.depth + 1
      });
      continue;
    }

    if (hit.component.type === "lens") {
      queue.push({
        origin: add(hit.point, scale(ray.dir, 2)),
        dir: ray.dir,
        role: ray.role,
        power: ray.power * 0.96,
        expanded: true,
        ignoreId: hit.component.id,
        depth: ray.depth + 1
      });
      continue;
    }

    if (hit.component.type === "object") {
      objectHit = true;
      if (film) {
        const filmPoints = sampleFilmPoints(film, 7);
        filmPoints.forEach((filmPoint, index) => {
          const dir = normalize(sub(filmPoint, hit.point));
          segments.push({
            from: hit.point,
            to: filmPoint,
            role: "object",
            power: ray.power * (index === 3 ? 0.62 : 0.36),
            expanded: true
          });
          filmHits.push({ role: "object", point: filmPoint, dir });
        });
      }
      continue;
    }

    if (hit.component.type === "film") {
      if (ray.role === "reference") {
        filmHits.push({ role: "reference", point: hit.point, dir: ray.dir });
      }
    }
  }

  const refHit = filmHits.find((hit) => hit.role === "reference");
  const objHit = filmHits.find((hit) => hit.role === "object");
  const objectComponent = getComponent(components, "object");
  const objectWaveDir = objectComponent && film ? normalize(sub(point(film), point(objectComponent))) : objHit?.dir;
  const thetaDeg = refHit && objHit && objectWaveDir ? angleBetween(refHit.dir, objectWaveDir) : null;

  return {
    segments,
    filmHits,
    splitterHit,
    objectHit,
    interference: Boolean(refHit && objHit),
    thetaDeg
  };
}

function nearestHit(ray: Ray, components: OpticalComponent[]) {
  let best: { component: OpticalComponent; point: Vec; distance: number } | null = null;

  for (const component of components) {
    if (component.id === ray.ignoreId || component.type === "laser") continue;
    const hit = intersectComponent(ray, component);
    if (!hit) continue;
    if (!best || hit.distance < best.distance) best = { component, point: hit.point, distance: hit.distance };
  }

  return best;
}

function intersectComponent(ray: Ray, component: OpticalComponent): { point: Vec; distance: number } | null {
  if (component.type === "mirror" || component.type === "film") {
    const length = component.type === "film" ? 150 : 90;
    const half = scale(angleVector(component.angle), length / 2);
    const a = sub(point(component), half);
    const b = add(point(component), half);
    return intersectRaySegment(ray.origin, ray.dir, a, b);
  }

  const radius = component.type === "splitter" ? 34 : component.type === "object" ? 34 : 30;
  return intersectRayCircle(ray.origin, ray.dir, point(component), radius);
}

function calculateTraceMetrics(trace: TraceResult) {
  if (trace.thetaDeg === null) {
    return { thetaText: "—", periodText: "—", resolutionText: "—" };
  }
  const dNm = LASER_WAVELENGTH_NM / (2 * Math.sin(degreesToRadians(trace.thetaDeg) / 2));
  const resolution = 1 / (dNm * 1e-6);
  return {
    thetaText: `${formatNumber(trace.thetaDeg, 1)}°`,
    periodText: `${formatNumber(dNm)} nm`,
    resolutionText: `${formatNumber(resolution)} lines/mm`
  };
}

function getTrainingChecks(components: OpticalComponent[], trace: TraceResult) {
  const laser = getComponent(components, "laser");
  return [
    Boolean(laser && laser.x < 180 && laser.y > 170 && laser.y < 390),
    trace.splitterHit,
    trace.filmHits.some((hit) => hit.role === "reference"),
    trace.objectHit,
    trace.interference
  ];
}

function getActiveTip(trace: TraceResult) {
  if (!trace.splitterHit) return labels.tips.splitter;
  if (!trace.filmHits.some((hit) => hit.role === "reference")) return labels.tips.reference;
  if (!trace.objectHit) return labels.tips.object;
  if (!trace.interference) return labels.tips.film;
  return labels.tips.done;
}

function sampleFilmPoints(film: OpticalComponent, count: number) {
  const axis = angleVector(film.angle);
  const center = point(film);
  return Array.from({ length: count }, (_, index) => {
    const t = (index / (count - 1) - 0.5) * 118;
    return add(center, scale(axis, t));
  });
}

function getComponent(components: OpticalComponent[], idOrType: string) {
  return components.find((component) => component.id === idOrType || component.type === idOrType);
}

function componentLabel(type: ComponentType) {
  return labels.components[type];
}

function componentColor(type: ComponentType) {
  return {
    laser: "#ff5b5b",
    splitter: "#ffbf47",
    mirror: "#d4dde0",
    lens: "#61dfff",
    film: "#ffbf47",
    object: "#c39aff"
  }[type];
}

function rayColor(role: RayRole) {
  if (role === "reference") return "#00e8d0";
  if (role === "object") return "#a060ff";
  return "#ff5b5b";
}

function svgNumber(value: number) {
  const rounded = Number(value.toFixed(3));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function svgPoint(value: Vec) {
  return `${svgNumber(value.x)},${svgNumber(value.y)}`;
}

function intersectRayCircle(origin: Vec, dir: Vec, center: Vec, radius: number) {
  const oc = sub(origin, center);
  const b = 2 * dot(oc, dir);
  const c = dot(oc, oc) - radius * radius;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0) return null;
  const sqrt = Math.sqrt(discriminant);
  const t1 = (-b - sqrt) / 2;
  const t2 = (-b + sqrt) / 2;
  const t = [t1, t2].filter((value) => value > 1.5).sort((a, bValue) => a - bValue)[0];
  if (!Number.isFinite(t)) return null;
  return { point: add(origin, scale(dir, t)), distance: t };
}

function intersectRaySegment(origin: Vec, dir: Vec, a: Vec, b: Vec) {
  const segment = sub(b, a);
  const denom = cross(dir, segment);
  if (Math.abs(denom) < 0.00001) return null;
  const diff = sub(a, origin);
  const t = cross(diff, segment) / denom;
  const u = cross(diff, dir) / denom;
  if (t <= 1.5 || u < 0 || u > 1) return null;
  return { point: add(origin, scale(dir, t)), distance: t };
}

function reflectAcrossLine(dir: Vec, lineAngleRad: number) {
  const line = { x: Math.cos(lineAngleRad), y: Math.sin(lineAngleRad) };
  return normalize(sub(scale(line, 2 * dot(dir, line)), dir));
}

function angleBetween(a: Vec, b: Vec) {
  const cosine = clamp(dot(normalize(a), normalize(b)), -1, 1);
  return radiansToDegrees(Math.acos(cosine));
}

function point(component: OpticalComponent): Vec {
  return { x: component.x, y: component.y };
}

function angleVector(angleDeg: number): Vec {
  const angle = degreesToRadians(angleDeg);
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

function scale(a: Vec, value: number): Vec {
  return { x: a.x * value, y: a.y * value };
}

function dot(a: Vec, b: Vec) {
  return a.x * b.x + a.y * b.y;
}

function cross(a: Vec, b: Vec) {
  return a.x * b.y - a.y * b.x;
}

function normalize(a: Vec): Vec {
  const len = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / len, y: a.y / len };
}

function rotate(a: Vec, radians: number): Vec {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

function normalizeDegrees(degrees: number) {
  const value = degrees % 360;
  return value < 0 ? value + 360 : value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
