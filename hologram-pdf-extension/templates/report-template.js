(function () {
  const CANVAS_W = 1240;
  const CANVAS_H = 1754;
  const PAGE_W_PT = 595.28;
  const PAGE_H_PT = 841.89;
  const M = 92;

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function round(value, digits = 2) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "-";
    return new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0
    }).format(number);
  }

  function normalizeData(raw) {
    const input = raw?.input || {};
    const results = raw?.results || {};
    const lambda = toNumber(input.lambda ?? input.wavelengthNm, 632.8);
    const theta = toNumber(input.theta ?? input.angleDeg, 40);
    const deltaLambda = toNumber(input.deltaLambda ?? input.spectralLinewidthNm, 0.01);
    const diffractionOrder = toNumber(input.diffractionOrder, 1);
    const filmResolution = toNumber(input.filmResolution ?? input.filmResolutionLinesPerMm, 3000);
    const filmSize = toNumber(input.filmSize ?? input.filmSizeMm, 50);
    const objectDistance = toNumber(input.objectDistance ?? input.objectDistanceCm, 12);
    const thetaRad = (theta * Math.PI) / 180;
    const d = toNumber(results.d ?? results.dNm, lambda / (2 * Math.sin(thetaRad / 2)));
    const linesPerMm = toNumber(results.linesPerMm ?? results.requiredResolutionLinesPerMm, 1e6 / d);
    const LcNm = toNumber(results.LcNm ?? results.coherenceLengthNm, (lambda * lambda) / deltaLambda);
    const ratio = toNumber(results.diffractionRatio, (diffractionOrder * lambda) / d);
    const diffAngle =
      results.diffAngle === null || results.diffractionAngleDeg === null || Math.abs(ratio) > 1
        ? null
        : toNumber(results.diffAngle ?? results.diffractionAngleDeg, (Math.asin(ratio) * 180) / Math.PI);

    return {
      project: raw?.project || "Transmission Hologram Lab",
      input: {
        lambda,
        theta,
        deltaLambda,
        diffractionOrder,
        filmResolution,
        filmSize,
        objectDistance
      },
      results: {
        d,
        dMm: toNumber(results.dMm, d * 1e-6),
        linesPerMm,
        LcNm,
        LcMm: toNumber(results.LcMm ?? results.coherenceLengthMm, LcNm * 1e-6),
        LcCm: toNumber(results.LcCm ?? results.coherenceLengthCm, LcNm * 1e-7),
        diffAngle,
        maxVibrationNm: toNumber(results.maxVibrationNm, lambda / 4),
        filmSuitable: typeof results.filmSuitable === "boolean" ? results.filmSuitable : filmResolution >= linesPerMm
      },
      steps: Array.isArray(raw?.steps) ? raw.steps : []
    };
  }

  function createPage() {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    return { canvas, ctx };
  }

  function drawHeader(ctx, title, pageNo, total) {
    ctx.fillStyle = "#172033";
    ctx.fillRect(0, 0, CANVAS_W, 78);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 28px Arial";
    ctx.fillText(title, M, 50);
    ctx.font = "18px Arial";
    ctx.fillStyle = "#5b6476";
    ctx.fillText(`Расчёт параметров transmission голограммы | ${pageNo}/${total}`, M, CANVAS_H - 48);
  }

  function text(ctx, value, x, y, size = 28, color = "#172033", weight = "400", family = "Arial") {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px ${family}`;
    ctx.fillText(value, x, y);
  }

  function wrapText(ctx, value, x, y, maxWidth, lineHeight, size = 28, color = "#172033", weight = "400") {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Arial`;
    const words = String(value).split(/\s+/);
    let line = "";
    let cursorY = y;

    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cursorY);
        line = word;
        cursorY += lineHeight;
      } else {
        line = test;
      }
    });

    if (line) ctx.fillText(line, x, cursorY);
    return cursorY + lineHeight;
  }

  function drawBox(ctx, x, y, w, h, fill = "#f7f9fc", stroke = "#ccd5e4") {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.stroke();
  }

  function drawTable(ctx, rows, x, y, w, rowH = 58) {
    ctx.strokeStyle = "#9ca8ba";
    ctx.lineWidth = 2;
    rows.forEach((row, index) => {
      const rowY = y + index * rowH;
      ctx.fillStyle = index === 0 ? "#eaf2ff" : "#ffffff";
      ctx.fillRect(x, rowY, w, rowH);
      ctx.strokeRect(x, rowY, w, rowH);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.63, rowY);
      ctx.lineTo(x + w * 0.63, rowY + rowH);
      ctx.stroke();
      text(ctx, row[0], x + 22, rowY + 38, 24, "#172033", index === 0 ? "700" : "400");
      text(ctx, row[1], x + w * 0.63 + 22, rowY + 38, 24, "#172033", index === 0 ? "700" : "400", "Consolas");
    });
  }

  function drawTitlePage(ctx, data, settings) {
    ctx.fillStyle = "#0c1120";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.strokeStyle = "#00e8d0";
    ctx.lineWidth = 5;
    ctx.strokeRect(95, 160, CANVAS_W - 190, CANVAS_H - 320);
    ctx.fillStyle = "rgba(0,232,208,0.12)";
    ctx.fillRect(120, 185, CANVAS_W - 240, 14);
    ctx.fillRect(120, CANVAS_H - 205, CANVAS_W - 240, 14);
    text(ctx, "РАСЧЁТ ПАРАМЕТРОВ", 235, 460, 54, "#ffffff", "700", "Times New Roman");
    text(ctx, "ТРАНСМИССИОННОЙ ГОЛОГРАММЫ", 157, 540, 46, "#00e8d0", "700", "Times New Roman");
    text(ctx, "Transmission Hologram Lab", 350, 650, 30, "#a7b7cc", "400");
    const y = 840;
    text(ctx, `Автор: ${settings.author || "не указан"}`, 205, y, 30, "#ffffff", "400", "Times New Roman");
    text(ctx, `Работа: ${settings.title || "диссертационный расчёт"}`, 205, y + 62, 30, "#ffffff", "400", "Times New Roman");
    text(ctx, `Дата: ${settings.date || new Date().toISOString().slice(0, 10)}`, 205, y + 124, 30, "#ffffff", "400", "Times New Roman");
    text(ctx, `Сгенерировано: ${data.project} v1.0`, 205, y + 216, 24, "#8fa3bc", "400");
  }

  function drawInputs(ctx, data) {
    drawHeader(ctx, "Входные параметры", 0, 0);
    const rows = [
      ["Параметр", "Значение"],
      ["Длина волны лазера (λ)", `${round(data.input.lambda, 2)} нм`],
      ["Угол между лучами (θ)", `${round(data.input.theta, 2)}°`],
      ["Ширина спектральной линии (Δλ)", `${round(data.input.deltaLambda, 4)} нм`],
      ["Порядок дифракции (m)", `${round(data.input.diffractionOrder, 0)}`],
      ["Разрешение плёнки", `${round(data.input.filmResolution, 0)} лин/мм`],
      ["Размер плёнки", `${round(data.input.filmSize, 1)} мм`],
      ["Расстояние объект-плёнка", `${round(data.input.objectDistance, 1)} см`]
    ];
    drawTable(ctx, rows, M, 180, CANVAS_W - M * 2, 66);
  }

  function drawFormulas(ctx) {
    drawHeader(ctx, "Используемые формулы", 0, 0);
    const formulas = [
      ["1. Период интерференционных полос", "d = λ / (2 · sin(θ / 2))"],
      ["2. Пространственная частота", "N = 10⁶ / d[nm]  = 1 / d[mm]"],
      ["3. Длина когерентности", "Lc = λ² / Δλ"],
      ["4. Угол дифракции", "α = arcsin(mλ / d)"],
      ["5. Интенсивность на плёнке", "I(x,y) = |Er + Eo|² = Ar² + Ao² + 2ArAo cos(φ)"],
      ["6. Пропускающая функция", "T(x,y) = T₀ + β · I(x,y)"],
      ["7. Восстановленная волна", "Eout = T(x,y) · Er"]
    ];
    let y = 170;
    formulas.forEach(([title, formula]) => {
      drawBox(ctx, M, y, CANVAS_W - M * 2, 110);
      text(ctx, title, M + 28, y + 42, 24, "#172033", "700");
      text(ctx, formula, M + 28, y + 82, 28, "#005f7a", "700", "Times New Roman");
      y += 132;
    });
  }

  function drawSteps(ctx, data) {
    drawHeader(ctx, "Пошаговый расчёт", 0, 0);
    const i = data.input;
    const r = data.results;
    const half = i.theta / 2;
    const sinHalf = Math.sin((half * Math.PI) / 180);
    const lines = [
      "Шаг 1. Период интерференционных полос:",
      `d = λ / (2 · sin(θ/2))`,
      `d = ${round(i.lambda, 2)} / (2 · sin(${round(half, 2)}°))`,
      `d = ${round(i.lambda, 2)} / (2 · ${round(sinHalf, 4)}) = ${round(r.d, 2)} нм`,
      "",
      "Шаг 2. Необходимое разрешение плёнки:",
      `N = 10⁶ / d = 10⁶ / ${round(r.d, 2)} = ${round(r.linesPerMm, 0)} лин/мм`,
      "",
      "Шаг 3. Длина когерентности:",
      `Lc = λ² / Δλ = ${round(i.lambda, 2)}² / ${round(i.deltaLambda, 4)} = ${round(r.LcCm, 2)} см`,
      "",
      "Шаг 4. Угол дифракции:",
      r.diffAngle === null
        ? "α невозможен, потому что |mλ / d| > 1"
        : `α = arcsin(${round(i.diffractionOrder, 0)} · ${round(i.lambda, 2)} / ${round(r.d, 2)}) = ${round(r.diffAngle, 2)}°`,
      "",
      "Шаг 5. Условие стабильности:",
      `Максимальная вибрация < λ/4 = ${round(r.maxVibrationNm, 2)} нм`
    ];
    let y = 165;
    lines.forEach((line) => {
      if (!line) {
        y += 22;
        return;
      }
      const isTitle = line.startsWith("Шаг");
      text(ctx, line, M, y, isTitle ? 28 : 25, isTitle ? "#172033" : "#263244", isTitle ? "700" : "400", isTitle ? "Arial" : "Consolas");
      y += isTitle ? 48 : 40;
    });
  }

  function drawResults(ctx, data) {
    drawHeader(ctx, "Таблица результатов", 0, 0);
    const r = data.results;
    const rows = [
      ["Параметр", "Значение"],
      ["Период полос d", `${round(r.d, 2)} нм`],
      ["Период полос d", `${round(r.dMm * 1000, 3)} мкм`],
      ["Разрешение плёнки N", `${round(r.linesPerMm, 0)} лин/мм`],
      ["Длина когерентности Lc", `${round(r.LcCm, 2)} см`],
      ["Максимальная вибрация", `< ${round(r.maxVibrationNm, 2)} нм`],
      ["Угол дифракции α", r.diffAngle === null ? "невозможен" : `${round(r.diffAngle, 2)}°`],
      ["Совместимость с плёнкой", r.filmSuitable ? "Подходит" : "Не подходит"]
    ];
    drawTable(ctx, rows, M, 165, CANVAS_W - M * 2, 66);
    const conclusion = r.filmSuitable
      ? `Плёнка подходит: её разрешение выше требуемых ${round(r.linesPerMm, 0)} лин/мм.`
      : `Плёнка не подходит: требуется минимум ${round(r.linesPerMm, 0)} лин/мм.`;
    drawBox(ctx, M, 780, CANVAS_W - M * 2, 140, r.filmSuitable ? "#edfdf8" : "#fff2f2", r.filmSuitable ? "#39b99c" : "#d86b6b");
    wrapText(ctx, conclusion, M + 30, 835, CANVAS_W - M * 2 - 60, 38, 28, r.filmSuitable ? "#0c6b5d" : "#a33b3b", "700");
  }

  function arrow(ctx, x1, y1, x2, y2, color, width = 6) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 22 * Math.cos(angle - 0.45), y2 - 22 * Math.sin(angle - 0.45));
    ctx.lineTo(x2 - 22 * Math.cos(angle + 0.45), y2 - 22 * Math.sin(angle + 0.45));
    ctx.closePath();
    ctx.fill();
  }

  function label(ctx, value, x, y) {
    drawBox(ctx, x, y - 36, ctx.measureText(value).width + 34, 48, "#ffffff", "#c8d3e0");
    text(ctx, value, x + 16, y - 4, 22, "#172033", "700");
  }

  function drawRecordingScheme(ctx) {
    drawHeader(ctx, "Оптическая схема записи", 0, 0);
    text(ctx, "Вид сверху: лазер делится на опорный и объектный путь. Оба луча должны встретиться на плёнке.", M, 150, 26, "#263244");
    const laser = { x: 120, y: 450 };
    const splitter = { x: 330, y: 450 };
    const refMirror = { x: 570, y: 260 };
    const film = { x: 980, y: 450 };
    const objMirror = { x: 560, y: 650 };
    const object = { x: 780, y: 650 };

    drawBox(ctx, laser.x - 55, laser.y - 35, 110, 70, "#ffecec", "#e55252");
    label(ctx, "Лазер", laser.x - 42, laser.y - 58);
    drawBox(ctx, splitter.x - 45, splitter.y - 45, 90, 90, "#fff8dd", "#d9a728");
    label(ctx, "Светоделитель", splitter.x - 86, splitter.y - 70);
    drawBox(ctx, film.x - 16, film.y - 160, 32, 320, "#fff2d8", "#e2a43b");
    label(ctx, "Плёнка", film.x - 48, film.y - 184);
    drawBox(ctx, object.x - 46, object.y - 46, 92, 92, "#f2eaff", "#835cff");
    label(ctx, "Объект", object.x - 52, object.y - 68);

    ctx.strokeStyle = "#9ca8ba";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(refMirror.x - 45, refMirror.y + 45);
    ctx.lineTo(refMirror.x + 45, refMirror.y - 45);
    ctx.stroke();
    label(ctx, "Зеркало", refMirror.x - 52, refMirror.y - 64);
    ctx.beginPath();
    ctx.moveTo(objMirror.x - 45, objMirror.y - 45);
    ctx.lineTo(objMirror.x + 45, objMirror.y + 45);
    ctx.stroke();
    label(ctx, "Зеркало", objMirror.x - 52, objMirror.y + 88);

    arrow(ctx, laser.x + 58, laser.y, splitter.x - 50, splitter.y, "#ff3d3d", 8);
    arrow(ctx, splitter.x + 50, splitter.y, refMirror.x - 55, refMirror.y + 55, "#00a8b8", 7);
    arrow(ctx, refMirror.x + 55, refMirror.y + 20, film.x - 24, film.y - 100, "#00a8b8", 7);
    arrow(ctx, splitter.x + 20, splitter.y + 52, objMirror.x - 50, objMirror.y - 42, "#8754ff", 7);
    arrow(ctx, objMirror.x + 48, objMirror.y, object.x - 55, object.y, "#8754ff", 7);
    arrow(ctx, object.x + 52, object.y - 15, film.x - 24, film.y + 80, "#8754ff", 6);
    arrow(ctx, object.x + 52, object.y + 15, film.x - 24, film.y + 120, "#8754ff", 4);

    text(ctx, "Опорный луч", 610, 330, 25, "#007b88", "700");
    text(ctx, "Объектный луч", 610, 725, 25, "#6b40d8", "700");
    drawBox(ctx, 760, 940, 350, 90, "#fff8dd", "#e2a43b");
    text(ctx, "Интерференция на плёнке", 792, 994, 26, "#7a5200", "700");
  }

  function drawReconstructionScheme(ctx) {
    drawHeader(ctx, "Схема восстановления", 0, 0);
    text(ctx, "Transmission hologram просматривают светом, который проходит сквозь записанную плёнку.", M, 150, 26, "#263244");
    drawBox(ctx, 95, 410, 120, 80, "#ffecec", "#e55252");
    label(ctx, "Лазер", 120, 390);
    drawBox(ctx, 330, 382, 44, 136, "#e9fbff", "#2eb4c8");
    label(ctx, "Расширяющая линза", 265, 350);
    drawBox(ctx, 560, 300, 44, 300, "#fff2d8", "#e2a43b");
    label(ctx, "Голограмма / плёнка", 475, 270);
    drawBox(ctx, 900, 350, 160, 200, "#f3edff", "#835cff");
    label(ctx, "3D-изображение", 880, 322);

    arrow(ctx, 215, 450, 330, 450, "#ff3d3d", 7);
    arrow(ctx, 374, 450, 558, 450, "#00a8b8", 9);
    arrow(ctx, 604, 450, 900, 410, "#8754ff", 6);
    arrow(ctx, 604, 450, 900, 490, "#8754ff", 6);
    arrow(ctx, 604, 450, 900, 450, "#00a8b8", 5);
    text(ctx, "Eout = T(x,y) · Er", 620, 660, 34, "#005f7a", "700", "Times New Roman");
    wrapText(
      ctx,
      "Если угол освещения и длина волны совпадают с записью, дифракция восстанавливает объектную волну, и глаз видит объёмное изображение.",
      M,
      760,
      CANVAS_W - M * 2,
      42,
      27,
      "#263244"
    );
  }

  function drawTheory(ctx) {
    drawHeader(ctx, "Краткая теория", 0, 0);
    let y = 170;
    [
      "Transmission hologram не является обычной фотографией. Фотоплёнка записывает не только распределение яркости, а интерференционную структуру, в которой закодированы амплитуда и фаза объектной волны.",
      "Во время записи опорный луч и объектный луч должны быть когерентными. На плёнке появляется система микроскопических полос. Их период определяет требуемое разрешение фотоматериала.",
      "Во время восстановления готовая плёнка освещается опорным лучом. Свет проходит сквозь плёнку, дифрагирует на записанной структуре и формирует волну, эквивалентную исходной объектной волне."
    ].forEach((paragraph) => {
      y = wrapText(ctx, paragraph, M, y, CANVAS_W - M * 2, 44, 28, "#263244") + 34;
    });
  }

  function drawComparison(ctx) {
    drawHeader(ctx, "Почему не проектор", 0, 0);
    const cards = [
      ["Лазер", "Одна длина волны и когерентная фаза. Волновой фронт восстанавливается чётко.", "#e8fff8", "#00a98f"],
      ["Проектор", "Белый некогерентный свет. Разные длины волн дают разные углы дифракции, изображение размывается.", "#fff5e4", "#c47b00"],
      ["Лампочка", "Точечный белый источник может дать слабую картину, но для transmission hologram остаются радуга и размытие.", "#fff0f0", "#c64d4d"]
    ];
    let y = 170;
    cards.forEach(([title, body, fill, stroke]) => {
      drawBox(ctx, M, y, CANVAS_W - M * 2, 230, fill, stroke);
      text(ctx, title, M + 35, y + 58, 34, stroke, "700");
      wrapText(ctx, body, M + 35, y + 115, CANVAS_W - M * 2 - 70, 42, 27, "#263244");
      y += 270;
    });
  }

  function renderPage(drawer, pageNo, total, title) {
    const { canvas, ctx } = createPage();
    drawer(ctx);
    if (title !== "title") drawHeader(ctx, title, pageNo, total);
    return canvas;
  }

  async function createPdfBlob(rawData, settings = {}) {
    const data = normalizeData(rawData);
    const opts = settings.options || {};
    const pages = [
      { title: "title", draw: (ctx) => drawTitlePage(ctx, data, settings) }
    ];

    if (opts.input !== false) pages.push({ title: "Входные параметры", draw: (ctx) => drawInputs(ctx, data) });
    if (opts.formulas !== false) pages.push({ title: "Используемые формулы", draw: drawFormulas });
    if (opts.steps !== false) pages.push({ title: "Пошаговый расчёт", draw: (ctx) => drawSteps(ctx, data) });
    if (opts.results !== false) pages.push({ title: "Таблица результатов", draw: (ctx) => drawResults(ctx, data) });
    if (opts.recordingScheme !== false) pages.push({ title: "Оптическая схема записи", draw: drawRecordingScheme });
    if (opts.reconstructionScheme !== false) pages.push({ title: "Схема восстановления", draw: drawReconstructionScheme });
    if (opts.theory === true) pages.push({ title: "Краткая теория", draw: drawTheory });
    if (opts.comparison === true) pages.push({ title: "Почему не проектор", draw: drawComparison });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });

    pages.forEach((page, index) => {
      if (index > 0) doc.addPage();
      const canvas = renderPage(page.draw, index + 1, pages.length, page.title);
      doc.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, PAGE_W_PT, PAGE_H_PT);
    });

    return doc.output("blob");
  }

  window.HologramReport = {
    createPdfBlob,
    normalizeData
  };
})();
