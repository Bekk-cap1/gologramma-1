"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Eye, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { formatNumber } from "@/lib/hologramMath";
import type { Lang } from "@/lib/i18n";

type ReconstructionSimulatorProps = {
  lang: Lang;
  recordedAngleDeg: number;
  recordedWavelengthNm: number;
};

type ComparisonTone = "teal" | "amber" | "red";

type ReconstructionCopy = {
  title: string;
  intro: string;
  status: {
    restored: string;
    badAngle: string;
    badWavelength: string;
  };
  controls: {
    title: string;
    angle: string;
    wavelength: string;
  };
  metrics: {
    recordedAngle: string;
    currentAngle: string;
    recordedWavelength: string;
    currentWavelength: string;
    quality: string;
  };
  previewTitle: string;
  whyTitle: string;
  comparisons: Array<{ title: string; tone: ComparisonTone; lines: string[] }>;
  laserTitle: string;
  laserHeaders: [string, string, string, string];
  laserChoices: Array<[string, string, string, string]>;
  laserTip: string;
  diagram: {
    aria: string;
    laser: string;
    lens: string;
    hologram: string;
    observer: string;
  };
};

const reconstructionCopy: Record<Lang, ReconstructionCopy> = {
  ru: {
    title: "Симулятор восстановления голограммы",
    intro:
      "Готовую transmission-голограмму освещают лазером той же длины волны и под тем же углом, что использовались при записи. Свет проходит сквозь плёнку и восстанавливает объектную волну.",
    status: {
      restored: "✓ 3D-изображение восстановлено",
      badAngle: "✗ Изображение смещено или не видно: угол не совпадает с углом записи",
      badWavelength: "✗ Размытое/радужное изображение: длина волны отличается"
    },
    controls: {
      title: "Параметры освещения",
      angle: "Угол падения лазера",
      wavelength: "Длина волны лазера"
    },
    metrics: {
      recordedAngle: "Угол записи",
      currentAngle: "Текущий угол",
      recordedWavelength: "λ записи",
      currentWavelength: "Текущая λ",
      quality: "Качество восстановления"
    },
    previewTitle: "3D-превью результата",
    whyTitle: "Почему не проектор?",
    comparisons: [
      {
        title: "Лазер - правильно",
        tone: "teal",
        lines: [
          "Монохроматический: одна длина волны даёт чёткую дифракцию.",
          "Когерентный: фазы согласованы, волновой фронт восстанавливается.",
          "Результат: яркое и резкое 3D-изображение."
        ]
      },
      {
        title: "Проектор - неправильно",
        tone: "amber",
        lines: [
          "Белый свет содержит много длин волн: каждая дифрагирует под своим углом.",
          "Некогерентный свет разрушает фазовую картину.",
          "Результат: мутное пятно или радужное размытие."
        ]
      },
      {
        title: "Лампочка - неправильно",
        tone: "red",
        lines: [
          "Точечный белый свет иногда даёт слабую картинку, но с радугой и размытием.",
          "Для transmission-голограммы нужен проходящий когерентный лазерный свет."
        ]
      }
    ],
    laserTitle: "Подбери свой лазер",
    laserHeaders: ["Лазер записи", "λ записи", "Лазер для просмотра", "Цена"],
    laserChoices: [
      ["He-Ne", "632.8 нм (красный)", "He-Ne или красный лазер 633 нм", "$50-200"],
      ["Аргоновый", "488 нм (голубой)", "Аргоновый или диод 488 нм", "$100-500"],
      ["Nd:YAG×2", "532 нм (зелёный)", "Зелёная лазерная указка 532 нм", "$10-50"],
      ["Диодный", "405 нм (фиолетовый)", "Фиолетовая лазерная указка", "$5-20"]
    ],
    laserTip:
      "Если не знаете, каким лазером записывали, попробуйте зелёную указку 532 нм: она доступная и часто используется.",
    diagram: {
      aria: "Схема восстановления transmission-голограммы",
      laser: "Лазер",
      lens: "Расш. линза",
      hologram: "Голограмма / плёнка",
      observer: "Наблюдатель"
    }
  },
  en: {
    title: "Hologram Reconstruction Simulator",
    intro:
      "A recorded transmission hologram is illuminated with a laser of the same wavelength and at the same angle used during recording. Light passes through the film and reconstructs the object wave.",
    status: {
      restored: "✓ 3D image reconstructed",
      badAngle: "✗ The image is shifted or invisible: the angle does not match the recording angle",
      badWavelength: "✗ Blurred/rainbow image: the wavelength is different"
    },
    controls: {
      title: "Illumination parameters",
      angle: "Laser incidence angle",
      wavelength: "Laser wavelength"
    },
    metrics: {
      recordedAngle: "Recording angle",
      currentAngle: "Current angle",
      recordedWavelength: "Recording λ",
      currentWavelength: "Current λ",
      quality: "Reconstruction quality"
    },
    previewTitle: "3D result preview",
    whyTitle: "Why not a projector?",
    comparisons: [
      {
        title: "Laser - correct",
        tone: "teal",
        lines: [
          "Monochromatic: one wavelength gives clean diffraction.",
          "Coherent: phases match, so the wavefront is reconstructed.",
          "Result: a bright, sharp 3D image."
        ]
      },
      {
        title: "Projector - incorrect",
        tone: "amber",
        lines: [
          "White light contains many wavelengths, and each diffracts at a different angle.",
          "Incoherent light destroys the phase relation.",
          "Result: a dull spot or rainbow blur."
        ]
      },
      {
        title: "Lamp - incorrect",
        tone: "red",
        lines: [
          "A point white source can sometimes show a weak image, but it stays rainbow-like and blurred.",
          "A transmission hologram needs transmitted coherent laser light."
        ]
      }
    ],
    laserTitle: "Choose your laser",
    laserHeaders: ["Recording laser", "Recording λ", "Viewing laser", "Price"],
    laserChoices: [
      ["He-Ne", "632.8 nm (red)", "He-Ne or 633 nm red laser", "$50-200"],
      ["Argon", "488 nm (blue)", "Argon or 488 nm diode", "$100-500"],
      ["Nd:YAG×2", "532 nm (green)", "532 nm green laser pointer", "$10-50"],
      ["Diode", "405 nm (violet)", "Violet laser pointer", "$5-20"]
    ],
    laserTip:
      "If you do not know which laser was used for recording, try a 532 nm green pointer: it is accessible and common.",
    diagram: {
      aria: "Transmission hologram reconstruction scheme",
      laser: "Laser",
      lens: "Exp. lens",
      hologram: "Hologram / film",
      observer: "Observer"
    }
  },
  uz: {
    title: "Gologrammani 3D tiklash simulyatori",
    intro:
      "Tayyor transmission-gologramma yozish vaqtida ishlatilgan to'lqin uzunligi va burchakka mos lazer bilan yoritiladi. Yorug'lik plyonkadan o'tib, obyekt to'lqinini tiklaydi.",
    status: {
      restored: "✓ 3D tasvir tiklandi",
      badAngle: "✗ Tasvir siljigan yoki ko'rinmaydi: burchak yozish burchagiga mos emas",
      badWavelength: "✗ Xira/rangli tasvir: to'lqin uzunligi farq qiladi"
    },
    controls: {
      title: "Yoritish parametrlari",
      angle: "Lazer tushish burchagi",
      wavelength: "Lazer to'lqin uzunligi"
    },
    metrics: {
      recordedAngle: "Yozish burchagi",
      currentAngle: "Joriy burchak",
      recordedWavelength: "Yozish λ",
      currentWavelength: "Joriy λ",
      quality: "Tiklash sifati"
    },
    previewTitle: "3D natija ko'rinishi",
    whyTitle: "Nega proyektor emas?",
    comparisons: [
      {
        title: "Lazer - to'g'ri",
        tone: "teal",
        lines: [
          "Monoxromatik: bitta to'lqin uzunligi aniq difraksiya beradi.",
          "Kogerent: fazalar mos keladi, shuning uchun to'lqin fronti tiklanadi.",
          "Natija: yorqin va aniq 3D tasvir."
        ]
      },
      {
        title: "Proyektor - noto'g'ri",
        tone: "amber",
        lines: [
          "Oq yorug'likda ko'p to'lqin uzunliklari bor, har biri boshqa burchakda difraksiya qiladi.",
          "Nokogerent yorug'lik fazaviy bog'lanishni buzadi.",
          "Natija: xira dog' yoki rangli yoyilish."
        ]
      },
      {
        title: "Chiroq - noto'g'ri",
        tone: "red",
        lines: [
          "Nuqtaviy oq manba ba'zan kuchsiz tasvir beradi, lekin u rangli va xira bo'lib qoladi.",
          "Transmission-gologramma uchun plyonkadan o'tuvchi kogerent lazer nuri kerak."
        ]
      }
    ],
    laserTitle: "Mos lazerni tanlang",
    laserHeaders: ["Yozish lazeri", "Yozish λ", "Ko'rish uchun lazer", "Narx"],
    laserChoices: [
      ["He-Ne", "632.8 nm (qizil)", "He-Ne yoki 633 nm qizil lazer", "$50-200"],
      ["Argon", "488 nm (ko'k)", "Argon yoki 488 nm diod", "$100-500"],
      ["Nd:YAG×2", "532 nm (yashil)", "532 nm yashil lazer ko'rsatkich", "$10-50"],
      ["Diod", "405 nm (binafsha)", "Binafsha lazer ko'rsatkich", "$5-20"]
    ],
    laserTip:
      "Agar qaysi lazer bilan yozilganini bilmasangiz, 532 nm yashil ko'rsatkichni sinab ko'ring: u arzon va ko'p ishlatiladi.",
    diagram: {
      aria: "Transmission-gologrammani tiklash sxemasi",
      laser: "Lazer",
      lens: "Keng. linza",
      hologram: "Gologramma / plyonka",
      observer: "Kuzatuvchi"
    }
  }
};

export default function ReconstructionSimulator({ lang, recordedAngleDeg, recordedWavelengthNm }: ReconstructionSimulatorProps) {
  const text = reconstructionCopy[lang];
  const [angle, setAngle] = useState(recordedAngleDeg);
  const [wavelength, setWavelength] = useState(recordedWavelengthNm);

  const angleError = Math.abs(angle - recordedAngleDeg);
  const wavelengthError = Math.abs(wavelength - recordedWavelengthNm);
  const quality = Math.max(0, 1 - angleError / 18 - wavelengthError / 90);
  const angleOk = angleError <= 3;
  const wavelengthOk = wavelengthError <= 4;
  const restored = angleOk && wavelengthOk;
  const message = restored ? text.status.restored : !angleOk ? text.status.badAngle : text.status.badWavelength;

  return (
    <div className="rounded border border-lab-line bg-lab-panel/92 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{text.title}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{text.intro}</p>
        </div>
        <div className={`rounded border px-4 py-3 text-sm font-semibold ${restored ? "border-lab-teal bg-lab-teal/10 text-lab-teal" : "border-lab-amber bg-lab-amber/10 text-lab-amber"}`}>
          {message}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <ReconstructionDiagram
            angle={angle}
            recordedAngle={recordedAngleDeg}
            wavelength={wavelength}
            recordedWavelength={recordedWavelengthNm}
            quality={quality}
            restored={restored}
            labels={text.diagram}
          />
          <div className="rounded border border-lab-line bg-[#091315] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <SlidersHorizontal size={16} aria-hidden />
              {text.controls.title}
            </div>
            <label className="block text-sm text-slate-300">
              {text.controls.angle}: <span className="font-semibold text-lab-cyan">{formatNumber(angle, 1)}°</span>
              <input
                type="range"
                min={0}
                max={75}
                step={0.5}
                value={angle}
                onChange={(event) => setAngle(Number(event.target.value))}
                className="mt-3 w-full accent-lab-cyan"
              />
            </label>
            <label className="mt-4 block text-sm text-slate-300">
              {text.controls.wavelength}: <span className="font-semibold text-lab-cyan">{formatNumber(wavelength, 1)} nm</span>
              <input
                type="range"
                min={390}
                max={700}
                step={0.5}
                value={wavelength}
                onChange={(event) => setWavelength(Number(event.target.value))}
                className="mt-3 w-full accent-lab-cyan"
              />
            </label>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <Metric title={text.metrics.recordedAngle} value={`${formatNumber(recordedAngleDeg, 1)}°`} />
          <Metric title={text.metrics.currentAngle} value={`${formatNumber(angle, 1)}°`} warning={!angleOk} />
          <Metric title={text.metrics.recordedWavelength} value={`${formatNumber(recordedWavelengthNm, 1)} nm`} />
          <Metric title={text.metrics.currentWavelength} value={`${formatNumber(wavelength, 1)} nm`} warning={!wavelengthOk} />
          <Metric title={text.metrics.quality} value={`${formatNumber(quality * 100, 0)}%`} warning={quality < 0.7} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div>
          <h4 className="mb-3 text-lg font-semibold text-white">{text.previewTitle}</h4>
          <div className="h-[360px] overflow-hidden rounded border border-lab-line bg-[#071113]">
            <Canvas camera={{ position: [0, 1.4, 5.4], fov: 46 }} dpr={[1, 1.6]} gl={{ preserveDrawingBuffer: true }}>
              <color attach="background" args={["#071113"]} />
              <ambientLight intensity={0.9} />
              <pointLight position={[-3, 4, 3]} intensity={16} color="#aeefff" />
              <OrbitCamera />
              <ReconstructionPreviewScene quality={quality} wavelengthError={wavelengthError} angleError={angleError} />
            </Canvas>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold text-white">{text.whyTitle}</h4>
          <div className="grid gap-3">
            {text.comparisons.map((card) => (
              <ComparisonCard key={card.title} title={card.title} tone={card.tone} lines={card.lines} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded border border-lab-line bg-[#091315] p-4">
        <h4 className="text-lg font-semibold text-white">{text.laserTitle}</h4>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-slate-300">
                {text.laserHeaders.map((header) => (
                  <th key={header} className="border border-lab-line px-3 py-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {text.laserChoices.map((row) => (
                <tr key={row[0]} className="text-slate-300">
                  {row.map((cell) => (
                    <td key={cell} className="border border-lab-line px-3 py-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-lab-cyan">{text.laserTip}</p>
      </div>
    </div>
  );
}

function ReconstructionDiagram({
  angle,
  recordedAngle,
  wavelength,
  recordedWavelength,
  quality,
  restored,
  labels
}: {
  angle: number;
  recordedAngle: number;
  wavelength: number;
  recordedWavelength: number;
  quality: number;
  restored: boolean;
  labels: ReconstructionCopy["diagram"];
}) {
  const angleOffset = (angle - recordedAngle) * 2.2;
  const wavelengthMismatch = Math.abs(wavelength - recordedWavelength) > 4;
  const objectOpacity = Math.max(0.18, quality);
  const objectBlur = Math.max(0, (1 - quality) * 7);

  return (
    <div className="overflow-hidden rounded border border-lab-line bg-[#091315]">
      <svg viewBox="0 0 980 380" className="h-auto w-full min-w-[780px]" role="img" aria-label={labels.aria}>
        <defs>
          <marker id="restore-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#35d7ff" />
          </marker>
          <filter id="restore-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="restore-blur">
            <feGaussianBlur stdDeviation={objectBlur} />
          </filter>
        </defs>

        <rect width="980" height="380" fill="#071113" />
        <path d="M 0 60 H 980 M 0 140 H 980 M 0 220 H 980 M 0 300 H 980" stroke="#244046" strokeOpacity="0.2" />
        <path d="M 80 0 V 380 M 160 0 V 380 M 240 0 V 380 M 320 0 V 380 M 400 0 V 380 M 480 0 V 380 M 560 0 V 380 M 640 0 V 380 M 720 0 V 380 M 800 0 V 380 M 880 0 V 380" stroke="#244046" strokeOpacity="0.16" />

        <rect x="48" y="174" width="112" height="48" rx="8" fill="#172428" stroke="#31545a" />
        <circle cx="164" cy="198" r="8" fill="#ff5b5b" filter="url(#restore-glow)" />
        <text x="104" y="202" fill="#eff9f8" textAnchor="middle" fontSize="15" fontWeight="700">{labels.laser}</text>

        <ellipse cx="280" cy="198" rx="20" ry="62" fill="#35d7ff" fillOpacity="0.16" stroke="#35d7ff" strokeWidth="2" />
        <text x="280" y="118" fill="#35d7ff" textAnchor="middle" fontSize="13">{labels.lens}</text>

        <rect x="496" y="78" width="22" height="240" rx="5" fill="#ffbf47" fillOpacity="0.24" stroke="#ffbf47" />
        {Array.from({ length: 13 }, (_, index) => (
          <line key={index} x1="502" y1={94 + index * 16} x2="514" y2={102 + index * 16} stroke={index % 2 ? "#35d7ff" : "#ffbf47"} strokeWidth="2" strokeOpacity="0.8" />
        ))}
        <text x="507" y="54" fill="#ffbf47" textAnchor="middle" fontSize="14" fontWeight="700">{labels.hologram}</text>

        <path d={`M 168 198 L 280 198 L 506 ${198 - angleOffset}`} fill="none" stroke="#35d7ff" strokeWidth="5" strokeLinecap="round" markerEnd="url(#restore-arrow)" filter="url(#restore-glow)" />
        <path d={`M 280 170 L 506 ${174 - angleOffset}`} fill="none" stroke="#35d7ff" strokeWidth="2" strokeOpacity="0.35" />
        <path d={`M 280 226 L 506 ${222 - angleOffset}`} fill="none" stroke="#35d7ff" strokeWidth="2" strokeOpacity="0.35" />

        <path d={`M 518 ${198 - angleOffset} C 604 ${150 - angleOffset / 2} 674 140 760 124`} fill="none" stroke="#35d7ff" strokeWidth="4" strokeOpacity={objectOpacity} markerEnd="url(#restore-arrow)" />
        <path d={`M 518 ${198 - angleOffset} C 608 ${198 - angleOffset / 4} 692 198 780 198`} fill="none" stroke="#35d7ff" strokeWidth="4" strokeOpacity={objectOpacity} markerEnd="url(#restore-arrow)" />
        <path d={`M 518 ${198 - angleOffset} C 604 ${248 - angleOffset / 2} 674 256 760 274`} fill="none" stroke="#35d7ff" strokeWidth="4" strokeOpacity={objectOpacity} markerEnd="url(#restore-arrow)" />

        {wavelengthMismatch && (
          <>
            <path d="M 520 210 C 620 110 720 100 840 72" fill="none" stroke="#ff5b5b" strokeWidth="2" strokeOpacity="0.45" />
            <path d="M 520 215 C 630 240 720 266 850 322" fill="none" stroke="#ffbf47" strokeWidth="2" strokeOpacity="0.45" />
            <path d="M 520 220 C 640 190 740 190 870 190" fill="none" stroke="#a060ff" strokeWidth="2" strokeOpacity="0.45" />
          </>
        )}

        <g transform={`translate(${780 + angleOffset} 198)`} opacity={objectOpacity} filter="url(#restore-blur)">
          <circle cx="0" cy="0" r="48" fill="none" stroke={restored ? "#35d7ff" : "#a060ff"} strokeWidth="3" />
          <path d="M -28 0 H 28 M 0 -34 V 34 M -20 -20 L 20 20 M 20 -20 L -20 20" stroke={restored ? "#35d7ff" : "#a060ff"} strokeWidth="3" />
        </g>

        <g transform="translate(900 198)">
          <path d="M -28 0 C -12 -22 12 -22 28 0 C 12 22 -12 22 -28 0Z" fill="none" stroke="#dbeafe" strokeWidth="3" />
          <circle cx="0" cy="0" r="8" fill="#dbeafe" />
          <text x="0" y="48" fill="#dbeafe" textAnchor="middle" fontSize="13">{labels.observer}</text>
        </g>
      </svg>
    </div>
  );
}

function ReconstructionPreviewScene({
  quality,
  wavelengthError,
  angleError
}: {
  quality: number;
  wavelengthError: number;
  angleError: number;
}) {
  const objectRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!objectRef.current) return;
    objectRef.current.rotation.y = clock.elapsedTime * 0.35;
    objectRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.15;
  });

  return (
    <group>
      <Grid3D />
      <Beam3D start={[-3.2, 0, 0]} end={[-0.35, 0, 0]} color="#35d7ff" opacity={0.9} />
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.06, 2.0, 1.4]} />
        <meshPhysicalMaterial color="#ffbf47" transparent opacity={0.28} roughness={0.22} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={index} position={[-0.04, -0.8 + index * 0.2, 0]}>
          <boxGeometry args={[0.018, 0.018, 1.42]} />
          <meshBasicMaterial color={index % 2 ? "#35d7ff" : "#ffbf47"} transparent opacity={0.5} />
        </mesh>
      ))}
      <Beam3D start={[0.1, 0, 0]} end={[2.9, 0.55, 0.35]} color="#35d7ff" opacity={Math.max(0.2, quality)} />
      <Beam3D start={[0.1, 0, 0]} end={[2.9, 0, 0]} color="#35d7ff" opacity={Math.max(0.2, quality)} />
      <Beam3D start={[0.1, 0, 0]} end={[2.9, -0.55, -0.35]} color="#35d7ff" opacity={Math.max(0.2, quality)} />
      {wavelengthError > 4 && (
        <>
          <Beam3D start={[0.1, 0, 0]} end={[2.8, 0.85, -0.45]} color="#ff5b5b" opacity={0.32} />
          <Beam3D start={[0.1, 0, 0]} end={[2.8, -0.85, 0.45]} color="#a060ff" opacity={0.32} />
        </>
      )}
      <group ref={objectRef} position={[2.2 + angleError / 16, 0, 0]} scale={0.7 + quality * 0.35}>
        <mesh>
          <torusKnotGeometry args={[0.45, 0.12, 96, 16]} />
          <meshBasicMaterial color={quality > 0.75 ? "#35d7ff" : "#a060ff"} wireframe transparent opacity={Math.max(0.2, quality)} />
        </mesh>
        {quality < 0.7 && (
          <mesh position={[0.22, 0.06, 0]}>
            <torusKnotGeometry args={[0.45, 0.12, 96, 16]} />
            <meshBasicMaterial color="#ff5b5b" wireframe transparent opacity={0.18} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function OrbitCamera() {
  const { camera, gl, invalidate } = useThree();
  const controlsRef = useRef<ThreeOrbitControls | null>(null);

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 8;
    controls.target.set(0.4, 0, 0);
    const handleChange = () => invalidate();
    controls.addEventListener("change", handleChange);
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.removeEventListener("change", handleChange);
      controls.dispose();
    };
  }, [camera, gl, invalidate]);

  useFrame(() => controlsRef.current?.update());
  return null;
}

function Beam3D({
  start,
  end,
  color,
  opacity
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  opacity: number;
}) {
  const transform = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const midpoint = a.clone().add(b).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return { midpoint, quaternion, length: direction.length() };
  }, [start, end]);

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion}>
      <cylinderGeometry args={[0.025, 0.025, transform.length, 16]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function Grid3D() {
  return (
    <gridHelper args={[6, 12, "#244046", "#244046"]} position={[0, -1.15, 0]} />
  );
}

function Metric({ title, value, warning }: { title: string; value: string; warning?: boolean }) {
  return (
    <div className={`rounded border px-3 py-2 text-sm ${warning ? "border-lab-amber bg-lab-amber/10" : "border-lab-line bg-[#091315]"}`}>
      <div className="text-slate-400">{title}</div>
      <div className="mt-1 font-semibold text-white">{value}</div>
    </div>
  );
}

function ComparisonCard({ title, tone, lines }: { title: string; tone: ComparisonTone; lines: string[] }) {
  const classes = {
    teal: "border-lab-teal bg-lab-teal/10",
    amber: "border-lab-amber bg-lab-amber/10",
    red: "border-lab-red bg-lab-red/10"
  }[tone];

  return (
    <article className={`rounded border p-4 ${classes}`}>
      <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <Eye size={15} aria-hidden />
        {title}
      </h5>
      <ul className="grid gap-2 text-sm leading-6 text-slate-300">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
  );
}
