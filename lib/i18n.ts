import type { WarningKey } from "./hologramMath";

export type Lang = "ru" | "en" | "uz";

export type ComponentLabels = {
  laser: string;
  beamSplitter: string;
  mirror: string;
  expandingLens: string;
  object: string;
  film: string;
};

export const languages: { code: Lang; label: string }[] = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "uz", label: "O'zbek" }
];

export const copy = {
  ru: {
    nav: {
      equipment: "Оборудование",
      scheme: "Схема",
      recording: "Запись",
      calculator: "Расчёты",
      reconstruction: "Восстановление",
      fragment: "Фрагмент",
      visualization: "3D",
      device: "Устройство"
    },
    hero: {
      title: "Transmission Hologram Lab",
      eyebrow: "Инструмент для диссертации по оптике",
      subtitle: "Интерактивная лаборатория для объяснения, расчёта и визуализации просвечивающей голограммы.",
      thesis:
        "Просвечивающая голограмма записывает не обычное изображение объекта, а интерференционную структуру, где сохранена информация о фазе и амплитуде объектной волны. При освещении опорным лучом эта структура восстанавливает объектную волну, и наблюдатель видит 3D-изображение.",
      photoTitle: "Обычная фотография",
      photoText: "Регистрирует распределение интенсивности на плоскости. Фазовая информация теряется.",
      hologramTitle: "Просвечивающая голограмма",
      hologramText:
        "Регистрирует интерференцию опорного и объектного лучей. Фаза кодируется в полосах, поэтому возможно восстановление волнового фронта."
    },
    equipment: {
      title: "Оборудование",
      intro: "Компоненты должны быть механически стабильны и согласованы по длине оптических путей.",
      labels: {
        purpose: "Назначение",
        placement: "Где используется",
        importance: "Почему важно"
      },
      items: [
        {
          title: "Лазер",
          why: "Даёт когерентный монохроматический свет.",
          where: "Источник всей оптической схемы.",
          important: "Без высокой когерентности интерференционная картина размывается."
        },
        {
          title: "Делитель луча",
          why: "Делит лазерный луч на опорный и объектный лучи.",
          where: "Ставится после лазера.",
          important: "Позволяет получить две взаимно когерентные волны."
        },
        {
          title: "Зеркала",
          why: "Направляют лучи по нужным оптическим путям.",
          where: "Используются в обеих ветвях.",
          important: "Точная юстировка определяет угол интерференции и качество записи."
        },
        {
          title: "Расширяющие линзы",
          why: "Расширяют луч, чтобы равномерно осветить объект и плёнку.",
          where: "Перед объектом и перед плёнкой.",
          important: "Плохое расширение создаёт неравномерную экспозицию."
        },
        {
          title: "Объект",
          why: "Рассеивает объектный луч и формирует объектную волну.",
          where: "Перед плёнкой в объектной ветви.",
          important: "Поверхность объекта задаёт фазовый фронт будущего 3D-изображения."
        },
        {
          title: "Голографическая плёнка",
          why: "Записывает интерференционные полосы.",
          where: "В месте встречи опорного и объектного лучей.",
          important: "Разрешение плёнки должно быть выше требуемой пространственной частоты."
        },
        {
          title: "Виброизоляционный стол",
          why: "Снижает движение компонентов во время экспозиции.",
          where: "Под всей оптической схемой.",
          important: "Смещение больше λ/4 заметно разрушает интерференционную картину."
        },
        {
          title: "Тёмная комната",
          why: "Исключает посторонний свет.",
          where: "Вся запись выполняется в затемнённой комнате.",
          important: "Паразитная засветка снижает контраст и динамический диапазон плёнки."
        }
      ]
    },
    scheme: {
      title: "Оптическая схема",
      text:
        "Плёнка стоит в области пересечения двух лучей. Объект находится в объектном луче перед плёнкой, а опорный луч освещает плёнку напрямую после отражения и расширения.",
      reference: "опорный луч",
      object: "объектный луч",
      filmNote: "Плёнка: плоскость, где встречаются оба луча",
      objectNote: "Объект: рассеивает объектный луч"
    },
    recording: {
      title: "Процесс записи",
      interferenceLabel: "опорный луч + объектный луч -> интерференционная картина",
      steps: [
        "Лазерный луч делится на два взаимно когерентных луча.",
        "Опорный луч идёт на плёнку без взаимодействия с объектом.",
        "Объектный луч отражается и рассеивается от объекта.",
        "Оба луча встречаются на поверхности плёнки.",
        "Формируется интерференционная картина с фазовой информацией.",
        "Плёнка фиксирует эту структуру как просвечивающую голограмму."
      ]
    },
    calculator: {
      title: "Калькулятор",
      intro: "Все результаты пересчитываются автоматически при изменении параметров.",
      inputs: {
        wavelengthNm: "Длина волны λ",
        angleDeg: "Угол между лучами θ",
        spectralLinewidthNm: "Спектральная ширина Δλ",
        diffractionOrder: "Порядок дифракции m",
        filmResolutionLinesPerMm: "Разрешение плёнки",
        filmSizeMm: "Размер плёнки",
        objectDistanceCm: "Расстояние от объекта до плёнки"
      },
      results: "Результаты",
      steps: "Пошаговое решение",
      suitable: "Подходит",
      notSuitable: "Не подходит",
      copy: "Скопировать расчёт для диссертации",
      copied: "Скопировано",
      pdf: "Печать / сохранить PDF",
      warnings: "Предупреждения",
      noWarnings: "Для текущих данных физических предупреждений нет.",
      impossible: "Невозможно",
      requiredResolution: "требуемое разрешение плёнки",
      vibration: "вибрация",
      maxVibration: "максимальная вибрация"
    },
    reconstruction: {
      title: "Восстановление",
      text:
        "После проявления плёнку освещают тем же опорным лучом. Свет дифрагирует на записанной пропускающей структуре, и на выходе формируется восстановленная объектная волна. Глаз получает почти тот же волновой фронт, который пришёл бы от настоящего объекта.",
      formula: "E_out = T(x, y) * E_r",
      tx: "T(x, y) - функция пропускания голографической плёнки",
      er: "E_r - опорная волна",
      eout: "E_out - выходная восстановленная волна"
    },
    fragment: {
      title: "Демонстрация фрагмента",
      text:
        "Даже маленькая часть голограммы содержит информацию обо всём объекте. Изображение остаётся целым, но становится темнее, менее резким и имеет меньший угол обзора.",
      slider: "Размер фрагмента",
      brightness: "Яркость",
      resolution: "Разрешение",
      viewAngle: "Угол обзора",
      hologramFragment: "Фрагмент голограммы",
      reconstructedImage: "Восстановленное изображение"
    },
    visualization: {
      title: "3D-визуализация",
      modes: {
        setup: "Режим оптической установки",
        interference: "Режим интерференции",
        reconstruction: "Режим восстановления"
      },
      legendReference: "Опорный луч",
      legendObject: "Объектный луч",
      legendReconstructed: "Восстановленный луч",
      flowTitle: "2D-трассировка лучей",
      flowIntro:
        "Здесь видно, откуда выходит луч, где он делится, где отражается от зеркал, проходит через линзы и где встречается с другим лучом на плёнке.",
      flow: {
        laserOut: "исходный когерентный луч",
        splitReference: "выход 1: опорный луч",
        splitObject: "выход 2: объектный луч",
        referencePath: "направляется зеркалом и расширяется линзой",
        objectPath: "направляется зеркалом и расширяется линзой",
        objectWave: "после объекта выходит рассеянная объектная волна",
        overlap: "опорный луч + объектная волна встречаются на плёнке",
        recordedStructure: "на плёнке записывается интерференционная структура",
        reconstructionInput: "при восстановлении плёнку освещают опорным лучом",
        reconstructionOutput: "из плёнки выходит восстановленная объектная волна"
      },
      labels: {
        laser: "Лазер",
        beamSplitter: "Делитель луча",
        mirror: "Зеркало",
        expandingLens: "Расширяющая линза",
        object: "Объект",
        film: "Голографическая плёнка"
      }
    },
    device: {
      title: "Экспорт для устройства",
      text:
        "Физическую голограмму нельзя просто отправить на обычный экран, но можно экспортировать цифровую интерференционную картину и метаданные для SLM, голографического принтера или последующей симуляции.",
      png: "Скачать PNG с полосами",
      json: "Скачать JSON для устройства",
      note: "Для реального устройства потребуется указать шаг пикселя, размер активной области и оптическую калибровку."
    },
    warnings: {
      invalidWavelength: "Длина волны должна быть больше нуля.",
      invalidLinewidth: "Δλ должна быть больше нуля, иначе длина когерентности не определяется.",
      invalidAngle: "Угол между лучами должен быть больше 0° и меньше 180°.",
      smallAngle: "Угол θ слишком маленький: период полос будет большим, а разделение волн слабым.",
      diffractionImpossible: "mλ / d > 1: угол дифракции физически невозможен.",
      filmTooLow: "Разрешение плёнки ниже требуемого: запись будет невозможной или некачественной.",
      smallFilm: "Очень маленький размер плёнки уменьшит поле обзора и яркость.",
      nearObject: "Объект расположен слишком близко к плёнке: возможны сильные аберрации и тени."
    } satisfies Record<WarningKey, string>
  },
  en: {
    nav: {
      equipment: "Equipment",
      scheme: "Scheme",
      recording: "Recording",
      calculator: "Calculator",
      reconstruction: "Reconstruction",
      fragment: "Fragment",
      visualization: "3D",
      device: "Device"
    },
    hero: {
      title: "Transmission Hologram Lab",
      eyebrow: "Optics dissertation tool",
      subtitle: "An interactive laboratory for explaining, calculating, and visualizing a transmission hologram.",
      thesis:
        "A transmission hologram records an interference structure, not a normal object image. The structure stores phase and amplitude information from the object wave. When illuminated again by the reference beam, it reconstructs the object wave and produces a 3D image.",
      photoTitle: "Ordinary photograph",
      photoText: "Records intensity distribution on a plane. Phase information is lost.",
      hologramTitle: "Transmission hologram",
      hologramText:
        "Records interference between the reference beam and the object beam. Phase is encoded in fringes, so the wavefront can be reconstructed."
    },
    equipment: {
      title: "Equipment",
      intro: "The components must be mechanically stable and matched by optical path length.",
      labels: {
        purpose: "Purpose",
        placement: "Placement",
        importance: "Importance"
      },
      items: [
        {
          title: "Laser",
          why: "Provides coherent monochromatic light.",
          where: "The source of the whole optical setup.",
          important: "Without high coherence the interference pattern becomes blurred."
        },
        {
          title: "Beam Splitter",
          why: "Splits the laser beam into the reference beam and object beam.",
          where: "Placed after the laser.",
          important: "Creates two mutually coherent waves."
        },
        {
          title: "Mirrors",
          why: "Steer beams along the required optical paths.",
          where: "Used in both branches.",
          important: "Precise alignment defines the interference angle and recording quality."
        },
        {
          title: "Expanding Lenses",
          why: "Expand the beam to illuminate the object and film uniformly.",
          where: "Placed before the object and before the film.",
          important: "Poor expansion produces uneven exposure."
        },
        {
          title: "Object",
          why: "Scatters the object beam and forms the object wave.",
          where: "Placed in the object branch before the film.",
          important: "Its surface defines the phase front of the future 3D image."
        },
        {
          title: "Holographic Film",
          why: "Records the interference fringes.",
          where: "Placed where reference and object beams overlap.",
          important: "Its resolution must exceed the required spatial frequency."
        },
        {
          title: "Vibration Isolation Table",
          why: "Reduces component motion during exposure.",
          where: "Under the whole optical setup.",
          important: "Motion above λ/4 can destroy the interference pattern."
        },
        {
          title: "Dark Room",
          why: "Blocks unwanted ambient light.",
          where: "The recording is performed in a dark room.",
          important: "Stray exposure reduces contrast and film dynamic range."
        }
      ]
    },
    scheme: {
      title: "Optical Scheme",
      text:
        "The film is placed where the two beams overlap. The object is in the object beam before the film, while the reference beam illuminates the film directly after reflection and expansion.",
      reference: "reference beam",
      object: "object beam",
      filmNote: "Film: plane where both beams meet",
      objectNote: "Object: scatters the object beam"
    },
    recording: {
      title: "Recording Process",
      interferenceLabel: "reference beam + object beam -> interference pattern",
      steps: [
        "The laser beam is split into two mutually coherent beams.",
        "The reference beam reaches the film without interacting with the object.",
        "The object beam reflects and scatters from the object.",
        "Both beams meet on the film surface.",
        "An interference pattern containing phase information is formed.",
        "The film records this structure as a transmission hologram."
      ]
    },
    calculator: {
      title: "Calculator",
      intro: "All results update automatically when the parameters change.",
      inputs: {
        wavelengthNm: "Wavelength λ",
        angleDeg: "Angle between beams θ",
        spectralLinewidthNm: "Spectral linewidth Δλ",
        diffractionOrder: "Diffraction order m",
        filmResolutionLinesPerMm: "Film resolution",
        filmSizeMm: "Film size",
        objectDistanceCm: "Object distance from film"
      },
      results: "Results",
      steps: "Step-by-step solution",
      suitable: "Suitable",
      notSuitable: "Not suitable",
      copy: "Copy calculation for dissertation",
      copied: "Copied",
      pdf: "Print / Save PDF",
      warnings: "Warnings",
      noWarnings: "No physical warnings for the current inputs.",
      impossible: "Impossible",
      requiredResolution: "required film resolution",
      vibration: "vibration",
      maxVibration: "maximum vibration"
    },
    reconstruction: {
      title: "Reconstruction",
      text:
        "After processing, the film is illuminated by the same reference beam. Light diffracts from the recorded transmission structure, and the reconstructed object wave appears at the output. The eye receives nearly the same wavefront that would come from the real object.",
      formula: "E_out = T(x, y) * E_r",
      tx: "T(x, y) - transmission function of holographic film",
      er: "E_r - reference wave",
      eout: "E_out - output reconstructed wave"
    },
    fragment: {
      title: "Fragment Demo",
      text:
        "Even a small hologram fragment contains information about the whole object. The image remains complete, but it becomes darker, less sharp, and has a smaller viewing angle.",
      slider: "Fragment size",
      brightness: "Brightness",
      resolution: "Resolution",
      viewAngle: "View angle",
      hologramFragment: "Hologram fragment",
      reconstructedImage: "Reconstructed image"
    },
    visualization: {
      title: "3D Visualization",
      modes: {
        setup: "Optical Setup Mode",
        interference: "Interference Mode",
        reconstruction: "Reconstruction Mode"
      },
      legendReference: "Reference beam",
      legendObject: "Object beam",
      legendReconstructed: "Reconstructed beam",
      flowTitle: "2D ray trace: path and reflections",
      flowIntro:
        "This view shows where the beam comes from, where it splits, where it reflects from mirrors, passes through lenses, and where both beams meet on the film.",
      flow: {
        laserOut: "original coherent beam",
        splitReference: "output 1: reference beam",
        splitObject: "output 2: object beam",
        referencePath: "steered by mirror and expanded by lens",
        objectPath: "steered by mirror and expanded by lens",
        objectWave: "after the object, a scattered object wave comes out",
        overlap: "reference beam + object wave meet on the film",
        recordedStructure: "the interference structure is recorded in the film",
        reconstructionInput: "during reconstruction the film is illuminated by the reference beam",
        reconstructionOutput: "the reconstructed object wave exits the film"
      },
      labels: {
        laser: "Laser",
        beamSplitter: "Beam Splitter",
        mirror: "Mirror",
        expandingLens: "Expanding Lens",
        object: "Object",
        film: "Holographic Film"
      }
    },
    device: {
      title: "Device Export",
      text:
        "A physical hologram cannot be sent to a normal display as-is, but the calculated fringe pattern and metadata can be exported for an SLM, holographic printer, or later simulation.",
      png: "Download fringe PNG",
      json: "Download device JSON",
      note: "A real device also needs pixel pitch, active area size, and optical calibration."
    },
    warnings: {
      invalidWavelength: "Wavelength must be greater than zero.",
      invalidLinewidth: "Δλ must be greater than zero, otherwise coherence length is undefined.",
      invalidAngle: "The angle between beams must be greater than 0° and less than 180°.",
      smallAngle: "θ is too small: the fringe period becomes large and wave separation is weak.",
      diffractionImpossible: "mλ / d > 1: the diffraction angle is physically impossible.",
      filmTooLow: "The film resolution is below the required value: recording will fail or be poor.",
      smallFilm: "A very small film reduces field of view and brightness.",
      nearObject: "The object is very close to the film: strong aberrations and shadows may appear."
    } satisfies Record<WarningKey, string>
  },
  uz: {
    nav: {
      equipment: "Uskunalar",
      scheme: "Sxema",
      recording: "Yozish",
      calculator: "Hisoblash",
      reconstruction: "Tiklash",
      fragment: "Fragment",
      visualization: "3D",
      device: "Qurilma"
    },
    hero: {
      title: "Transmission Hologram Lab",
      eyebrow: "Optika dissertatsiyasi uchun vosita",
      subtitle:
        "Transmission hologramni tushuntirish, hisoblash va vizual ko'rsatish uchun interaktiv laboratoriya.",
      thesis:
        "Transmission hologram oddiy tasvirni emas, interferensiya strukturasini yozib oladi. Unda obyekt to'lqinining fazasi va amplitudasi haqidagi ma'lumot saqlanadi. Plyonka tayanch nur bilan qayta yoritilganda obyekt to'lqini tiklanadi va 3D tasvir hosil bo'ladi.",
      photoTitle: "Oddiy fotografiya",
      photoText: "Tekislikdagi intensivlik taqsimotini yozadi. Faza haqidagi ma'lumot yo'qoladi.",
      hologramTitle: "Transmission hologram",
      hologramText:
        "Tayanch nur va obyekt nuri interferensiyasini yozadi. Faza polosalar ichida kodlanadi, shu sababli to'lqin frontini tiklash mumkin."
    },
    equipment: {
      title: "Uskunalar",
      intro: "Komponentlar mexanik jihatdan barqaror va optik yo'l uzunligi bo'yicha mos bo'lishi kerak.",
      labels: {
        purpose: "Vazifasi",
        placement: "Qayerda ishlatiladi",
        importance: "Nima uchun muhim"
      },
      items: [
        {
          title: "Lazer",
          why: "Kogerent monoxromatik yorug'lik beradi.",
          where: "Butun optik sxemaning manbai.",
          important: "Kogerentlik yetarli bo'lmasa interferensiya tasviri xiralashadi."
        },
        {
          title: "Nur bo'lgich",
          why: "Lazer nurini tayanch nur va obyekt nuriga ajratadi.",
          where: "Lazerdan keyin qo'yiladi.",
          important: "O'zaro kogerent ikki to'lqinni hosil qiladi."
        },
        {
          title: "Ko'zgular",
          why: "Nurlarni kerakli optik yo'l bo'ylab yo'naltiradi.",
          where: "Ikkala tarmoqda ishlatiladi.",
          important: "Aniq sozlash interferensiya burchagi va yozish sifatini belgilaydi."
        },
        {
          title: "Kengaytiruvchi linzalar",
          why: "Nurni kengaytirib obyekt va plyonkani bir tekis yoritadi.",
          where: "Obyekt va plyonka oldida joylashadi.",
          important: "Yomon kengaytirish ekspozitsiyani notekis qiladi."
        },
        {
          title: "Obyekt",
          why: "Obyekt nurini sochadi va obyekt to'lqinini yaratadi.",
          where: "Obyekt tarmog'ida, plyonkadan oldin turadi.",
          important: "Uning yuzasi kelajakdagi 3D tasvirning faza frontini belgilaydi."
        },
        {
          title: "Golografik plyonka",
          why: "Interferensiya polosalarini yozib oladi.",
          where: "Tayanch nur va obyekt nuri kesishgan joyda turadi.",
          important: "Plyonka aniqligi talab qilinadigan fazoviy chastotadan yuqori bo'lishi kerak."
        },
        {
          title: "Tebranishni izolyatsiyalovchi stol",
          why: "Ekspozitsiya vaqtida tebranishlarni kamaytiradi.",
          where: "Butun optik sxema ostida.",
          important: "λ/4 dan katta siljish interferensiya tasvirini buzadi."
        },
        {
          title: "Qorong'i xona",
          why: "Begona yorug'likni to'sadi.",
          where: "Yozish jarayoni qorong'i xonada bajariladi.",
          important: "Qo'shimcha yorug'lik kontrast va plyonka dinamik diapazonini pasaytiradi."
        }
      ]
    },
    scheme: {
      title: "Optik sxema",
      text:
        "Plyonka ikki nur kesishadigan joyga qo'yiladi. Obyekt obyekt nuri ichida plyonkadan oldin turadi, tayanch nur esa aks ettirish va kengaytirishdan keyin plyonkani bevosita yoritadi.",
      reference: "tayanch nur",
      object: "obyekt nuri",
      filmNote: "Plyonka: ikki nur uchrashadigan tekislik",
      objectNote: "Obyekt: obyekt nurini sochadi"
    },
    recording: {
      title: "Yozish jarayoni",
      interferenceLabel: "tayanch nur + obyekt nuri -> interferensiya tasviri",
      steps: [
        "Lazer nuri o'zaro kogerent ikki nurga bo'linadi.",
        "Tayanch nur obyektga tegmasdan plyonkaga boradi.",
        "Obyekt nuri obyektdan qaytadi va sochiladi.",
        "Ikkala nur plyonka yuzasida uchrashadi.",
        "Faza ma'lumotini saqlaydigan interferensiya tasviri hosil bo'ladi.",
        "Plyonka bu strukturani transmission hologram sifatida yozib oladi."
      ]
    },
    calculator: {
      title: "Kalkulyator",
      intro: "Parametrlar o'zgarganda barcha natijalar avtomatik qayta hisoblanadi.",
      inputs: {
        wavelengthNm: "To'lqin uzunligi λ",
        angleDeg: "Nurlar orasidagi burchak θ",
        spectralLinewidthNm: "Spektral kenglik Δλ",
        diffractionOrder: "Difraksiya tartibi m",
        filmResolutionLinesPerMm: "Plyonka aniqligi",
        filmSizeMm: "Plyonka o'lchami",
        objectDistanceCm: "Obyektdan plyonkagacha masofa"
      },
      results: "Natijalar",
      steps: "Bosqichma-bosqich yechim",
      suitable: "Mos keladi",
      notSuitable: "Mos kelmaydi",
      copy: "Hisobni dissertatsiya uchun nusxalash",
      copied: "Nusxalandi",
      pdf: "Chop etish / PDF saqlash",
      warnings: "Ogohlantirishlar",
      noWarnings: "Joriy qiymatlar uchun fizik ogohlantirish yo'q.",
      impossible: "Mumkin emas",
      requiredResolution: "talab qilinadigan plyonka aniqligi",
      vibration: "tebranish",
      maxVibration: "maksimal tebranish"
    },
    reconstruction: {
      title: "Tasvirni tiklash",
      text:
        "Plyonka ishlov berilgandan keyin o'sha tayanch nur bilan yoritiladi. Yorug'lik yozilgan o'tkazuvchi strukturada difraksiyalanadi va chiqishda tiklangan obyekt to'lqini hosil bo'ladi. Ko'z haqiqiy obyektdan keladiganga yaqin to'lqin frontini qabul qiladi.",
      formula: "E_out = T(x, y) * E_r",
      tx: "T(x, y) - golografik plyonkaning o'tkazish funksiyasi",
      er: "E_r - tayanch to'lqin",
      eout: "E_out - chiqishdagi tiklangan to'lqin"
    },
    fragment: {
      title: "Fragment namoyishi",
      text:
        "Hologrammaning kichik qismi ham butun obyekt haqidagi ma'lumotni saqlaydi. Tasvir to'liq qoladi, ammo qoraroq, kamroq aniq va ko'rish burchagi kichikroq bo'ladi.",
      slider: "Fragment o'lchami",
      brightness: "Yorqinlik",
      resolution: "Aniqlik",
      viewAngle: "Ko'rish burchagi",
      hologramFragment: "Hologramma fragmenti",
      reconstructedImage: "Tiklangan tasvir"
    },
    visualization: {
      title: "3D-vizualizatsiya",
      modes: {
        setup: "Optik qurilma rejimi",
        interference: "Interferensiya rejimi",
        reconstruction: "Tiklash rejimi"
      },
      legendReference: "Tayanch nur",
      legendObject: "Obyekt nuri",
      legendReconstructed: "Tiklangan nur",
      flowTitle: "2D nur yo'li: qayerdan qayerga boradi",
      flowIntro:
        "Bu ko'rinish nur qayerdan chiqishini, qayerda bo'linishini, ko'zgulardan qayerda aks etishini, linzalardan o'tishini va plyonkada qayerda uchrashishini ko'rsatadi.",
      flow: {
        laserOut: "dastlabki kogerent nur",
        splitReference: "chiqish 1: tayanch nur",
        splitObject: "chiqish 2: obyekt nuri",
        referencePath: "ko'zgu bilan yo'naltiriladi va linza bilan kengayadi",
        objectPath: "ko'zgu bilan yo'naltiriladi va linza bilan kengayadi",
        objectWave: "obyektdan keyin sochilgan obyekt to'lqini chiqadi",
        overlap: "tayanch nur + obyekt to'lqini plyonkada uchrashadi",
        recordedStructure: "plyonkada interferensiya strukturasi yoziladi",
        reconstructionInput: "tiklashda plyonka tayanch nur bilan yoritiladi",
        reconstructionOutput: "plyonkadan tiklangan obyekt to'lqini chiqadi"
      },
      labels: {
        laser: "Lazer",
        beamSplitter: "Nur bo'lgich",
        mirror: "Ko'zgu",
        expandingLens: "Kengaytiruvchi linza",
        object: "Obyekt",
        film: "Golografik plyonka"
      }
    },
    device: {
      title: "Qurilma uchun eksport",
      text:
        "Fizik hologrammani oddiy ekranga to'g'ridan-to'g'ri yuborib bo'lmaydi, lekin hisoblangan interferensiya tasviri va metadatalarni SLM, golografik printer yoki simulyatsiya uchun eksport qilish mumkin.",
      png: "Polosalar PNG faylini yuklab olish",
      json: "Qurilma JSON faylini yuklab olish",
      note: "Haqiqiy qurilma uchun pixel pitch, faol maydon o'lchami va optik kalibrlash ham kerak."
    },
    warnings: {
      invalidWavelength: "To'lqin uzunligi noldan katta bo'lishi kerak.",
      invalidLinewidth: "Δλ noldan katta bo'lishi kerak, aks holda kogerentlik uzunligi aniqlanmaydi.",
      invalidAngle: "Nurlar orasidagi burchak 0° dan katta va 180° dan kichik bo'lishi kerak.",
      smallAngle: "θ juda kichik: polosa davri katta bo'ladi va to'lqinlar ajralishi sustlashadi.",
      diffractionImpossible: "mλ / d > 1: difraksiya burchagi fizik jihatdan mumkin emas.",
      filmTooLow: "Plyonka aniqligi talabdan past: yozish sifatsiz yoki imkonsiz bo'ladi.",
      smallFilm: "Juda kichik plyonka ko'rish maydoni va yorqinlikni kamaytiradi.",
      nearObject: "Obyekt plyonkaga juda yaqin: kuchli aberratsiya va soyalar paydo bo'lishi mumkin."
    } satisfies Record<WarningKey, string>
  }
} as const;
