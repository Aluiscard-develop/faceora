// Dibujos SVG generados por código (D-15, D-28): formas de cara, cortes, barbas, pendientes, monturas y conjuntos,
// en estilo figurín de salón: busto, rasgos con trazo fino, sombreado suave y mechones.
// Puro: devuelve cadenas SVG con atributos de presentación (la CSP prohíbe `style=` en línea). Sin filtros ni
// degradados: cada dibujo es autónomo y se puede repetir en la página.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else (root.FA = root.FA || {}).dibujos = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SKIN = "#EBCBB0", SKIN_LINE = "#9C7660", SHADE = "#C99A7E", HAIR = "#2B2220", HAIR_HI = "#7A6254", INK = "#3A2A24";
  const SHIRT = "#2E2B28", COLLAR = "#F4EFE7";
  // Lo dibujado en la mitad izquierda, repetido en espejo a la derecha (la cara es simétrica en x = 50).
  const mirror = (m) => m + `<g transform="translate(100 0) scale(-1 1)">${m}</g>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const wrap = (vb, label, body, cls = "pic") =>
    `<svg class="${cls}" viewBox="${vb}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

  // Catmull-Rom cerrado → curvas Bézier. `sharp` = índices de puntos que se dejan en esquina.
  function smoothPath(pts, sharp = []) {
    const n = pts.length, P = (i) => pts[(i + n) % n];
    let d = `M${P(0).map((v) => v.toFixed(1)).join(",")}`;
    for (let i = 0; i < n; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const k1 = sharp.includes(i % n) ? 0 : 1 / 6, k2 = sharp.includes((i + 1) % n) ? 0 : 1 / 6;
      const c1 = [p1[0] + (p2[0] - p0[0]) * k1, p1[1] + (p2[1] - p0[1]) * k1];
      const c2 = [p2[0] - (p3[0] - p1[0]) * k2, p2[1] - (p3[1] - p1[1]) * k2];
      d += `C${c1.map((v) => v.toFixed(1))} ${c2.map((v) => v.toFixed(1))} ${p2.map((v) => v.toFixed(1))}`;
    }
    return d + "Z";
  }

  // ---- formas de cara: contorno a partir de las mismas proporciones que mide el asesor ----
  const FACE_PROTOS = {
    ovalada: { ratio: 1.42, forehead: 0.9, jaw: 0.72, angular: false },
    redonda: { ratio: 1.12, forehead: 0.88, jaw: 0.82, angular: false },
    cuadrada: { ratio: 1.12, forehead: 0.97, jaw: 0.97, angular: true },
    rectangular: { ratio: 1.55, forehead: 0.96, jaw: 0.94, angular: true },
    alargada: { ratio: 1.62, forehead: 0.86, jaw: 0.74, angular: false },
    corazon: { ratio: 1.36, forehead: 1.0, jaw: 0.6, angular: false },
    diamante: { ratio: 1.42, forehead: 0.7, jaw: 0.62, angular: false },
    triangular: { ratio: 1.3, forehead: 0.72, jaw: 1.0, angular: true },
  };

  function faceOutline(id) {
    const p = FACE_PROTOS[id] || FACE_PROTOS.ovalada;
    const W = 62, len = Math.min(104, p.ratio * W), top = (120 - len) / 2, cx = 50;
    const y = (f) => top + f * len;
    const pts = [
      [cx, top], [cx + (p.forehead * W) / 2, y(0.16)], [cx + W / 2, y(0.45)], [cx + (p.jaw * W) / 2, y(0.78)],
      [cx + (p.angular ? 0.22 : 0.12) * W, y(0.97)], [cx, y(1)], [cx - (p.angular ? 0.22 : 0.12) * W, y(0.97)],
      [cx - (p.jaw * W) / 2, y(0.78)], [cx - W / 2, y(0.45)], [cx - (p.forehead * W) / 2, y(0.16)],
    ];
    return smoothPath(pts, p.angular ? [3, 7] : []);
  }

  function faceShape(id, label) {
    const d = faceOutline(id);
    // guías de visagismo: eje central y línea de pómulos
    return wrap("0 0 100 120", label || `Cara ${id}`,
      `<path d="${d}" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2.5"/>` +
      `<path d="M50,6 V114 M10,60 H90" fill="none" stroke="${SKIN_LINE}" stroke-width=".8" stroke-dasharray="3 4" opacity=".7"/>`);
  }

  // ---- cabeza base para cortes y barbas: busto de figurín ----
  const HEAD = "M50,28 C67,28 76,42 76,60 C76,80 66,96 50,96 C34,96 24,80 24,60 C24,42 33,28 50,28Z";
  const EAR = `<path d="M24.6,55.5 C19,54.5 18.4,66 21,70.2 C22.6,72.8 24.6,72.2 25.6,70Z" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.2"/>` +
    `<path d="M23.4,59.4 Q21.4,63 23.4,67" fill="none" stroke="${SHADE}" stroke-width="1"/>`;
  const EYE = `<path d="M36,61 Q41,57.6 46,60.8 Q41,63.4 36,61Z" fill="#FBF8F3"/>` +
    `<circle cx="41" cy="60.6" r="2" fill="#4A3426"/><circle cx="41.7" cy="59.9" r=".55" fill="#FFFFFF"/>` +
    `<path d="M35.6,60.9 Q41,56.9 46.4,60.5" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>`;
  const LASHES = `<path d="M45.9,60.3 L47.6,59.1 M44.5,59 L45.6,57.6" fill="none" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>`;
  const BROW = `<path d="M35,54.8 Q40,51.8 46.2,53.6 L46,55.2 Q40.5,54 35.6,56.4Z" fill="${HAIR}"/>`;
  const BROW_F = `<path d="M35.4,54.6 Q40,50.8 46,53.2 L45.8,54.3 Q40.4,52.5 35.8,55.6Z" fill="${HAIR}"/>`;
  const NOSE = `<path d="M48.6,57.5 C48.4,63 46.6,68 46.4,70.4 Q47.6,72.6 50,72.2 Q52.4,72.6 53.6,70.4" fill="none" stroke="${SHADE}" stroke-width="1.3" stroke-linecap="round"/>` +
    `<path d="M47.6,71 Q48.4,70.2 49.2,71 M50.8,71 Q51.6,70.2 52.4,71" fill="none" stroke="${SKIN_LINE}" stroke-width=".8"/>`;
  const LIPS = `<path d="M44.2,80.6 Q47,79.2 50,80.2 Q53,79.2 55.8,80.6 Q50,81.6 44.2,80.6Z" fill="#B87566"/>` +
    `<path d="M45.5,81.2 Q50,85.4 54.5,81.2Z" fill="#C98A7A" opacity=".75"/>` +
    `<path d="M44,80.7 Q50,81.8 56,80.7" fill="none" stroke="#7E4A40" stroke-width="1"/>`;
  const LIPS_F = `<path d="M43.8,80.6 Q47,78.4 50,79.8 Q53,78.4 56.2,80.6 Q53,82 50,81.4 Q47,82 43.8,80.6Z" fill="#B4505C"/>` +
    `<path d="M44.4,81 Q50,87 55.6,81 Q50,82.4 44.4,81Z" fill="#C9646F"/>` +
    `<path d="M47.5,83.6 Q50,84.4 52.5,83.6" fill="none" stroke="#E8A0A8" stroke-width=".7"/>`;

  // Cabeza con la forma de cara de la persona: el contorno de faceOutline, escalado para caber entre la frente
  // y el cuello. Sin forma, la cabeza ovalada de siempre. k = ancho relativo (pelo, orejas, sombreado);
  // ky = alto relativo de la mitad inferior (barba).
  const f2 = (v) => +v.toFixed(3);
  function headGeom(shape) {
    if (!shape || !FACE_PROTOS[shape]) return { d: HEAD, t: "", k: 1, ky: 1, earDx: 0 };
    const len = Math.min(104, FACE_PROTOS[shape].ratio * 62), s = Math.min(52 / 62, 70 / len), half = 31 * s;
    return { d: faceOutline(shape), t: `translate(50 62) scale(${f2(s)}) translate(-50 -60)`, k: f2(half / 26), ky: f2((62 + (len / 2) * s - 60) / 36), earDx: f2(26 - half) };
  }

  // `back` = pelo por detrás de la cabeza (melenas); `fem` = rasgos y escote femeninos; `shape` = forma de cara;
  // `nape` = pelo de la nuca que cae delante de los hombros pero detrás de la cara (mullet).
  function head(inner, label, beardLayer = "", back = "", fem = false, shape = null, nape = "") {
    const g = headGeom(shape);
    const fit = (m, ky = 1) => (g.k === 1 && ky === 1 ? m : `<g transform="translate(50 60) scale(${g.k} ${ky}) translate(-50 -60)">${m}</g>`);
    const face = (attrs) => `<path d="${g.d}"${g.t ? ` transform="${g.t}"` : ""} ${attrs}/>`;
    const bust = `<path d="M14,120 C16,109 28,103 40,101 L60,101 C72,103 84,109 86,120Z" fill="${SHIRT}"/>` +
      (fem ? `<path d="M39,101 Q50,113 61,101Z" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1"/>`
        : `<path d="M41,101 L50,111 L59,101 L56,99 L50,105 L44,99Z" fill="${COLLAR}"/>`);
    const neck = `<path d="M41,86 C41,94 40,98 39,102 Q50,107 61,102 C60,98 59,94 59,86Z" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.2"/>` +
      `<path d="M41,90 Q50,98 59,90 L59,95 Q50,102 41,95Z" fill="${SHADE}" opacity=".45"/>`;
    const shading = mirror(`<path d="M27.5,64 Q29.5,78 37,87" fill="none" stroke="${SHADE}" stroke-width="4" stroke-linecap="round" opacity=".28"/>`) +
      `<path d="M46,91 Q50,92.6 54,91" fill="none" stroke="${SHADE}" stroke-width=".9" opacity=".7"/>`;
    // segundo trazo desplazado: contorno de boceto a tinta, como dibujado a mano
    const sketch = `<g transform="translate(.7 -.5)">${face(`fill="none" stroke="${SKIN_LINE}" stroke-width=".7" opacity=".35"`)}</g>`;
    return wrap("0 0 100 120", label,
      fit(back) + bust + neck + fit(nape) + mirror(g.earDx ? `<g transform="translate(${g.earDx} 0)">${EAR}</g>` : EAR) +
      face(`fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.3"`) + sketch +
      // el sombreado se recorta a la cara: en mentones estrechos se salía
      `<clipPath id="fc-${shape && FACE_PROTOS[shape] ? shape : "base"}">${face("")}</clipPath><g clip-path="url(#fc-${shape && FACE_PROTOS[shape] ? shape : "base"})">${fit(shading)}</g>` +
      fit(beardLayer, g.ky) +
      mirror((fem ? BROW_F : BROW) + EYE + (fem ? LASHES : "")) + NOSE +
      (fem ? LIPS_F : LIPS) +
      fit(inner));
  }

  // Mechones: trazos finos recortados a la forma del pelo o la barba. El id del recorte es fijo por dibujo:
  // si el mismo dibujo sale dos veces en la página, los dos recortes son idénticos.
  // short = peinado hacia atrás desde la frente; long = cae desde la coronilla; beard = trazos cortos alternados.
  const f1 = (v) => v.toFixed(1);
  function strands(kind) {
    const d = [];
    if (kind === "beard") {
      for (let row = 0, y = 64; y < 118; row++, y += 5.5) {
        for (let x = 23 + (row % 2) * 1.6; x < 78; x += 3.2) d.push(`M${f1(x)},${f1(y)} l${x < 50 ? "-.7" : ".7"},3.6`);
      }
    } else if (kind === "long") {
      for (let i = -7; i <= 7; i++) {
        const s = i * 4.2, w = i % 2 ? 2.5 : -2.5;
        d.push(`M${f1(50 + i * 1.5)},20 C${f1(50 + s)},34 ${f1(50 + s * 1.15 + w)},70 ${f1(50 + s * 1.25)},118`);
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const x = 24 + i * 4.6, y = 52 - (i % 3) * 5;
        d.push(`M${f1(x)},${f1(y)} C${f1(x + 2)},${f1(y - 12)} ${f1(x + 7)},${f1(y - 22)} ${f1(x + 16)},${f1(y - 28)}`);
      }
    }
    return d.join(" ");
  }
  function textured(markup, key, kind = "short") {
    return markup + `<clipPath id="${key}">${markup}</clipPath>` +
      `<g clip-path="url(#${key})" fill="none" stroke="${HAIR_HI}" stroke-width="${kind === "beard" ? ".55" : ".7"}" stroke-linecap="round" opacity=".5"><path d="${strands(kind)}"/></g>`;
  }
  // Degradado (fade) en los laterales: pelo muy corto entre la sien y la oreja.
  const FADE = mirror(`<path d="M24.2,46 C23.6,51 23.6,56 24.2,60.5 L27.6,58.5 C27.2,54 27.4,50 28.4,46.5Z" fill="${HAIR}" opacity=".32"/>`);
  const FADED = new Set(["crew", "quiff", "pompadour", "fauxhawk", "crop", "sidepart", "slick", "curly", "mullet", "manbun"]);

  const CAP_BOTTOM = "C74,46 70,40 64,38 C56,35 44,35 36,38 C30,40 26,46 24,56Z";
  const HAIRCUTS = {
    crew: `<path d="M24,56 C22,32 36,23 50,23 C64,23 78,32 76,56 ${CAP_BOTTOM}" fill="${HAIR}"/>`,
    buzz: `<path d="M24,56 C22,30 36,25 50,25 C64,25 78,30 76,56 ${CAP_BOTTOM}" fill="${HAIR}" opacity=".55"/>`,
    quiff: `<path d="M24,56 C22,32 30,24 38,21 C44,10 62,7 71,13 C66,15 64,18 66,22 C74,28 78,40 76,56 ${CAP_BOTTOM}" fill="${HAIR}"/>`,
    pompadour: `<path d="M24,56 C23,40 25,33 30,30 L70,30 C75,33 77,40 76,56 ${CAP_BOTTOM}" fill="${HAIR}" opacity=".5"/>` +
      `<path d="M30,38 C26,24 34,10 50,9 C66,8 76,18 72,32 C68,36 62,37 56,36 C48,35 38,36 30,38Z" fill="${HAIR}"/>`,
    sidepart: `<path d="M24,56 C22,30 36,20 52,20 C66,20 78,30 76,56 ${CAP_BOTTOM}" fill="${HAIR}"/>` +
      `<path d="M38,22 Q37,30 38,37" stroke="${SKIN}" stroke-width="1.6" fill="none"/>`,
    crop: `<path d="M24,56 C22,31 36,22 50,22 C64,22 78,31 76,56 C75,48 72,45 68,44 L64,47 L60,43 L55,47 L50,43 L45,47 L40,43 L35,47 L32,44 C28,45 25,49 24,56Z" fill="${HAIR}"/>`,
    medium: `<path d="M21,74 C14,40 30,17 50,17 C70,17 86,40 79,74 C77,64 75,54 73,47 C64,38 36,38 27,47 C25,54 23,64 21,74Z" fill="${HAIR}"/>` +
      `<path d="M27,47 Q30,60 25,70 M73,47 Q70,60 75,70" stroke="#4A3A35" stroke-width="1.2" fill="none"/>`,
    slick: `<path d="M24,56 C22,30 34,17 50,17 C66,17 78,30 76,56 ${CAP_BOTTOM}" fill="${HAIR}"/>` +
      `<path d="M38,37 Q44,22 62,20 M46,36 Q52,24 68,24 M56,35 Q62,28 72,30" stroke="#5A4A45" stroke-width="1.2" fill="none"/>`,
    fauxhawk: `<path d="M24,56 C22,34 36,26 50,26 C64,26 78,34 76,56 ${CAP_BOTTOM}" fill="${HAIR}" opacity=".5"/>` +
      `<path d="M40,37 L42,16 L46,26 L50,10 L54,26 L58,16 L60,37Z" fill="${HAIR}"/>`,
    curly: `<path d="M24,56 C23,40 26,34 30,32 L70,32 C74,34 77,40 76,56 ${CAP_BOTTOM}" fill="${HAIR}" opacity=".55"/>` +
      [[34, 30], [42, 24], [50, 21], [58, 24], [66, 30], [38, 36], [46, 31], [54, 31], [62, 36], [50, 14], [42, 16], [58, 16]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${HAIR}"/>`).join(""),
    sides: `<path d="M19,66 C17,34 33,20 50,20 C67,20 83,34 81,66 C79,56 75,47 69,42 C59,37 41,37 31,42 C25,47 21,56 19,66Z" fill="${HAIR}"/>`,
    bowl: `<path d="M22,62 C19,30 34,18 50,18 C66,18 81,30 78,62 L77,48 C68,46 32,46 23,48Z" fill="${HAIR}"/>`,
    receding: `<path d="M24,56 C22,36 30,28 36,27 C40,34 46,30 50,30 C54,30 60,34 64,27 C70,28 78,36 76,56 ${CAP_BOTTOM}" fill="${HAIR}"/>`,
    // largos: { back, front } como los de mujer
    longm: { back: `<path d="M16,104 C10,52 27,18 50,18 C73,18 90,52 84,104 Q50,108 16,104Z" fill="${HAIR}"/>`,
      front: `<path d="M21,102 C15,50 30,20 50,20 C70,20 85,50 79,102 L73,100 C75,72 73,54 68,46 Q60,38 50,30 Q40,38 32,46 C27,54 25,72 27,100Z" fill="${HAIR}"/>` },
    manbun: { back: `<circle cx="50" cy="15" r="9.5" fill="${HAIR}"/>`,
      front: `<path d="M24,56 C22,30 36,21 50,21 C64,21 78,30 76,56 ${CAP_BOTTOM}" fill="${HAIR}"/><path d="M44,22 Q50,19 56,22" stroke="#4A3A35" stroke-width="1.6" fill="none"/>` },
    curtainsm: { front: `<path d="M23,70 C17,38 32,19 50,19 C68,19 83,38 77,70 C76,60 73,52 68,47 Q60,42 50,32 Q40,42 32,47 C27,52 24,60 23,70Z" fill="${HAIR}"/>` },
    mullet: { nape: `<path d="M31,78 C30,88 28,95 26,101 Q38,99 41,99 L59,99 Q62,99 74,101 C72,95 70,88 69,78Z" fill="${HAIR}"/>`,
      front: `<path d="M24,56 C22,31 36,22 50,22 C64,22 78,31 76,56 C75,48 72,45 68,44 L64,47 L60,43 L55,47 L50,43 L45,47 L40,43 L35,47 L32,44 C28,45 25,49 24,56Z" fill="${HAIR}"/>` },
    afro: { back: [[28, 34], [72, 34], [22, 48], [78, 48], [24, 62], [76, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="${HAIR}"/>`).join(""),
      front: [[30, 28], [40, 21], [50, 18], [60, 21], [70, 28], [26, 40], [74, 40], [36, 31], [50, 27], [64, 31], [43, 36], [57, 36]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${HAIR}"/>`).join("") },
  };

  // Peinados de mujer: `back` va detrás de la cabeza (largo de la melena), `front` enmarca la cara.
  const FACE_WINDOW = "C74,70 72,52 66,44 C58,38 42,38 34,44 C28,52 26,70";
  const TIGHT_CAP = `<path d="M24,56 C22,30 36,22 50,22 C64,22 78,30 76,56 ${CAP_BOTTOM}" fill="${HAIR}"/>`;
  const HAIRCUTS_F = {
    pixie: { front: `<path d="M24,58 C22,30 36,20 52,20 C66,20 78,30 76,56 C75,48 72,44 68,42 C60,40 50,43 40,51 C34,51 30,46 28,48 C26,50 25,53 24,58Z" fill="${HAIR}"/>` +
      `<path d="M66,26 Q56,30 44,44 M72,32 Q62,36 52,46" stroke="#4A3A35" stroke-width="1.2" fill="none"/>` },
    bob: { back: `<path d="M17,90 C12,52 26,19 50,19 C74,19 88,52 83,90 Q50,96 17,90Z" fill="${HAIR}"/>`,
      front: `<path d="M22,88 C17,52 30,21 50,21 C70,21 83,52 78,88 L72,88 ${FACE_WINDOW} 28,88Z" fill="${HAIR}"/>` },
    lob: { back: `<path d="M15,106 C8,52 26,17 50,17 C74,17 92,52 85,106 Q50,110 15,106Z" fill="${HAIR}"/>`,
      front: `<path d="M20,104 C14,52 30,19 50,19 C70,19 86,52 80,104 L72,104 ${FACE_WINDOW} 28,104Z" fill="${HAIR}"/>` },
    long: { back: `<path d="M13,120 C5,52 26,15 50,15 C74,15 95,52 87,120 L80,114 L74,120 L26,120 L20,114Z" fill="${HAIR}"/>`,
      front: `<path d="M19,118 C12,52 30,18 50,18 C70,18 88,52 81,118 L74,110 ${FACE_WINDOW} 26,110Z" fill="${HAIR}"/>` },
    waves: { back: `<path d="M14,112 C4,96 14,86 10,72 C6,40 28,16 50,16 C72,16 94,40 90,72 C86,86 96,96 86,112 Q50,118 14,112Z" fill="${HAIR}"/>`,
      front: `<path d="M19,108 C12,52 30,18 50,18 C70,18 88,52 81,108 L74,108 ${FACE_WINDOW} 26,108Z" fill="${HAIR}"/>` +
        `<path d="M24,70 Q19,80 25,90 Q30,98 23,106 M76,70 Q81,80 75,90 Q70,98 77,106" stroke="#4A3A35" stroke-width="1.2" fill="none"/>` },
    bangs: { back: `<path d="M16,100 C10,52 26,18 50,18 C74,18 90,52 84,100 Q50,104 16,100Z" fill="${HAIR}"/>`,
      front: `<path d="M21,98 C15,52 30,20 50,20 C70,20 85,52 79,98 L73,98 C75,70 74,56 72,47 L28,47 C26,56 25,70 27,98Z" fill="${HAIR}"/>` },
    curtain: { back: `<path d="M14,112 C6,52 26,16 50,16 C74,16 94,52 86,112 Q50,116 14,112Z" fill="${HAIR}"/>`,
      front: `<path d="M20,110 C14,52 30,19 50,19 C70,19 86,52 80,110 L73,110 C75,74 73,56 68,48 Q60,40 50,31 Q40,40 32,48 C27,56 25,74 27,110Z" fill="${HAIR}"/>` },
    sideswept: { back: `<path d="M15,104 C8,52 26,17 50,17 C74,17 92,52 85,104 Q50,108 15,104Z" fill="${HAIR}"/>`,
      front: `<path d="M21,102 C15,52 30,20 50,20 C70,20 85,52 79,102 L73,102 C75,70 74,56 70,46 C60,42 44,42 34,52 C30,58 27,70 27,102Z" fill="${HAIR}"/>` },
    crown: { back: `<path d="M14,112 C6,52 26,16 50,16 C74,16 94,52 86,112 Q50,116 14,112Z" fill="${HAIR}"/>`,
      front: `<path d="M20,110 C14,60 22,30 30,22 C38,4 62,4 70,22 C78,30 86,60 80,110 L73,110 ${FACE_WINDOW} 27,110Z" fill="${HAIR}"/>` },
    flat: { back: `<path d="M17,118 L18,40 C20,22 34,18 50,18 C66,18 80,22 82,40 L83,118Z" fill="${HAIR}"/>`,
      front: `<path d="M22,116 L24,44 C26,28 38,22 50,22 C62,22 74,28 76,44 L78,116 L73,116 L72,50 C70,40 60,32 50,26 C40,32 30,40 28,50 L27,116Z" fill="${HAIR}"/>` },
    ponytail: { back: `<path d="M70,30 C86,34 90,62 82,96 C80,72 76,48 64,34Z" fill="${HAIR}"/>`, front: TIGHT_CAP },
    updo: { back: `<circle cx="50" cy="19" r="11" fill="${HAIR}"/>`, front: TIGHT_CAP },
    curlyF: { back: [[22, 40], [78, 40], [16, 58], [84, 58], [16, 76], [84, 76], [20, 94], [80, 94], [28, 104], [72, 104]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${HAIR}"/>`).join(""),
      front: [[32, 26], [42, 20], [52, 18], [62, 21], [70, 28], [26, 38], [75, 38], [24, 52], [77, 52], [24, 66], [77, 66]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${HAIR}"/>`).join("") },
  };

  // Pendientes: dibujados desde el lóbulo (0,0); el derecho es el espejo del izquierdo.
  const EARRINGS = {
    stud: `<circle cx="0" cy="1" r="2.2"/>`,
    studbig: `<circle cx="0" cy="1.5" r="3.8"/>`,
    hoopsmall: `<circle cx="0" cy="4" r="4" fill="none" stroke-width="1.6"/>`,
    hoop: `<circle cx="0" cy="7" r="7" fill="none" stroke-width="1.8"/>`,
    hoopbig: `<circle cx="0" cy="11" r="11" fill="none" stroke-width="2"/>`,
    drop: `<path d="M0,0 V3" fill="none" stroke-width="1"/><path d="M0,3 C-3.5,8 -3.5,11 0,12 C3.5,11 3.5,8 0,3Z"/>`,
    longdrop: `<path d="M0,0 V4" fill="none" stroke-width="1"/><path d="M0,4 C-3,12 -3,17 0,18 C3,17 3,12 0,4Z"/>`,
    long: `<path d="M0,0 V22" fill="none" stroke-width="1.2"/><circle cx="0" cy="23" r="1.8"/>`,
    chandelier: `<path d="M0,0 V3" fill="none" stroke-width="1"/><path d="M0,3 L7,15 L-7,15Z"/><circle cx="-7" cy="17" r="1.3"/><circle cx="0" cy="17" r="1.3"/><circle cx="7" cy="17" r="1.3"/>`,
    point: `<path d="M-4.5,1 L4.5,1 L0,15Z"/>`,
    diamond: `<path d="M0,1 L4.5,8 L0,15 L-4.5,8Z"/>`,
    geo: `<rect x="-2.5" y="1" width="5" height="15" rx=".5"/>`,
    square: `<rect x="-3.5" y="1" width="7" height="7"/>`,
    cluster: `<circle cx="0" cy="2" r="2.2"/><circle cx="-2.6" cy="5.6" r="2.2"/><circle cx="2.6" cy="5.6" r="2.2"/><circle cx="0" cy="9" r="2.2"/>`,
  };

  const BEARD_REGION = "M24,60 C24,82 34,101 50,102 C66,101 76,82 76,60 C73,68 69,73 63,75 C58,72 42,72 37,75 C31,73 27,68 24,60Z";
  const MOUSTACHE = "M41,79 Q50,74 59,79 Q60,82 57,81 Q50,78 43,81 Q40,82 41,79Z";
  const BEARDS = {
    stubble: `<path d="${BEARD_REGION}" fill="${HAIR}" opacity=".28"/><path d="${MOUSTACHE}" fill="${HAIR}" opacity=".3"/>`,
    box: `<path d="M25,62 L27,74 C30,90 40,98 50,98 C60,98 70,90 73,74 L75,62 C72,69 68,73 63,75 C58,72 42,72 37,75 C32,73 28,69 25,62Z" fill="${HAIR}"/><path d="${MOUSTACHE}" fill="${HAIR}"/>`,
    full: `<path d="${BEARD_REGION}" fill="${HAIR}"/><path d="${MOUSTACHE}" fill="${HAIR}"/>`,
    long: `<path d="M24,60 C24,84 36,110 50,116 C64,110 76,84 76,60 C73,68 69,73 63,75 C58,72 42,72 37,75 C31,73 27,68 24,60Z" fill="${HAIR}"/><path d="${MOUSTACHE}" fill="${HAIR}"/>`,
    goatee: `<path d="${MOUSTACHE}" fill="${HAIR}"/><path d="M41,80 L40,90 Q50,100 60,90 L59,80 Q57,86 50,86 Q43,86 41,80Z" fill="${HAIR}"/>`,
    circle: `<path d="M41,79 Q50,73 59,79 Q63,84 60,90 Q50,100 40,90 Q37,84 41,79Z M44,81 Q50,85 56,81 Q54,87 50,87 Q46,87 44,81Z" fill="${HAIR}" fill-rule="evenodd"/>`,
    balbo: `<path d="M40,78 Q50,74 60,78 Q59,80 50,79 Q41,80 40,78Z" fill="${HAIR}"/><path d="M38,86 Q50,90 62,86 L62,90 Q50,101 38,90Z" fill="${HAIR}"/>`,
    vandyke: `<path d="M40,79 Q50,74 60,79 Q62,77 63,75 Q63,80 58,81 Q50,78 42,81 Q37,80 37,75 Q38,77 40,79Z" fill="${HAIR}"/><path d="M45,86 Q50,88 55,86 L50,100Z" fill="${HAIR}"/>`,
    chinstrap: `<path d="M24,60 C24,82 34,100 50,100 C66,100 76,82 76,60 L73,62 C72,80 64,95 50,95 C36,95 28,80 27,62Z" fill="${HAIR}"/>`,
    moustache: `<path d="${MOUSTACHE}" fill="${HAIR}" transform="translate(-6 -3) scale(1.12)"/>`,
  };

  // ---- monturas (vista frontal, solo las gafas) ----
  const lens = (d) => `<path d="${d}" transform="translate(0 0)"/><path d="${d}" transform="translate(120 0) scale(-1 1)"/>`;
  const GLASSES = {
    rect: lens("M14,14 H52 Q55,14 55,17 V33 Q55,36 52,36 H14 Q11,36 11,33 V17 Q11,14 14,14Z"),
    square: lens("M15,10 H52 Q55,10 55,13 V36 Q55,39 52,39 H15 Q12,39 12,36 V13 Q12,10 15,10Z"),
    round: lens("M33,8 A17,17 0 1 1 32.9,8Z"),
    oval: lens("M33,12 C46,12 55,18 55,25 C55,32 46,38 33,38 C20,38 11,32 11,25 C11,18 20,12 33,12Z"),
    wayfarer: lens("M10,12 L55,12 L52,34 Q51,38 46,38 L20,38 Q15,38 14,34Z") + `<path d="M10,12 H110" stroke-width="5"/>`,
    aviator: lens("M12,14 H54 Q56,14 55,20 C53,34 46,42 34,42 C20,42 12,32 12,20 Q12,14 12,14Z") + `<path d="M50,13 Q60,9 70,13" />`,
    browline: lens("M12,22 C12,34 20,40 33,40 C46,40 54,34 54,22") + `<path d="M8,15 Q10,12 16,12 H52 Q56,12 56,18 L54,22 H12 L9,20Z M112,15 Q110,12 104,12 H68 Q64,12 64,18 L66,22 H108 L111,20Z" fill="currentColor"/>`,
    panto: lens("M12,14 H54 C55,30 46,40 33,40 C20,40 11,30 12,14Z"),
    rimless: `<g stroke-dasharray="2 3" stroke-width="1.5">${lens("M14,14 H52 Q55,14 55,17 V33 Q55,36 52,36 H14 Q11,36 11,33 V17 Q11,14 14,14Z")}</g>`,
    big: lens("M12,6 H53 Q56,6 56,9 V40 Q56,44 52,44 H14 Q10,44 10,40 V9 Q10,6 12,6Z"),
    bottomwide: lens("M18,14 H50 Q54,14 55,18 L56,32 Q55,40 46,40 H18 Q9,40 10,30 L12,20 Q13,14 18,14Z"),
    small: lens("M22,18 H48 Q50,18 50,20 V30 Q50,32 48,32 H22 Q20,32 20,30 V20 Q20,18 22,18Z"),
    cateye: lens("M5,8 Q14,13 24,13 H52 Q56,13 55,18 Q53,34 40,38 Q26,40 17,33 Q11,26 10,18 Q8,12 5,8Z"),
  };
  const BRIDGE = `<path d="M55,22 Q60,18 65,22" fill="none"/><path d="M11,18 L2,16 M109,18 L118,16" />`;

  // Reflejo del cristal: dos trazos blancos dentro de cada lente (caben en todas las monturas, también las pequeñas).
  const GLINT = `<g stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity=".9"><path d="M26,30 L31,24 M30,31 L33,27.5"/><path d="M90,30 L95,24 M94,31 L97,27.5"/></g>`;

  function glasses(id, label, color = INK) {
    const body = GLASSES[id] || GLASSES.rect;
    return wrap("0 0 120 50", label || id,
      `<g fill="#9FB4C4" fill-opacity=".14" stroke="${color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" color="${color}">${body}${BRIDGE}</g>` + GLINT);
  }

  // ---- texto de la recomendación → dibujo ----
  const ICONS = {
    cutF: [
      [/rizo|shag/i, "curlyF"], [/pixie/i, "pixie"], [/lob|bob largo/i, "lob"], [/bob/i, "bob"], [/cortina/i, "curtain"], [/flequillo recto/i, "bangs"],
      [/coronilla|volumen arriba/i, "crown"], [/ondas|volumen a la altura/i, "waves"], [/tirante/i, "ponytail"],
      [/raya al centro|pegado|lisa/i, "flat"], [/flequillo lateral|raya lateral/i, "sideswept"], [/melena|capas/i, "long"],
    ],
    earring: [
      [/chandelier|base más ancha|base ancha|triángulo/i, "chandelier"], [/punta/i, "point"], [/rombo/i, "diamond"], [/racimo/i, "cluster"],
      [/cuadrados|angulosos/i, "square"], [/rectangulares/i, "geo"], [/gota alargada|lágrima/i, "longdrop"], [/largos/i, "long"],
      [/gota|curvos|ovalados/i, "drop"], [/enormes|aros grandes/i, "hoopbig"], [/aros pequeños/i, "hoopsmall"], [/aros/i, "hoop"],
      [/botón grande|cortos y anchos/i, "studbig"], [/botón|pequeños/i, "stud"],
    ],
    cut: [
      [/moño|man bun/i, "manbun"], [/mullet/i, "mullet"], [/afro/i, "afro"], [/cortinas|raya al medio/i, "curtainsm"],
      [/hasta los hombros|melena larga|melena (lisa|por)/i, "longm"], [/mandíbula|mejillas/i, "medium"],
      [/pompadour/i, "pompadour"], [/faux hawk|cresta/i, "fauxhawk"], [/quiff|tupé/i, "quiff"],
      [/curly|rizo/i, "curly"], [/crop|flequillo/i, "crop"], [/hacia atrás|tirante/i, "slick"],
      [/medio largo|ondas/i, "medium"], [/laterales (con algo de largo|medios|con algo de volumen|largos)|lados no rapados|a los lados/i, "sides"],
      [/casco/i, "bowl"], [/crew|militar|corto/i, "crew"], [/rapado|al cero|degradado alto|geométricos/i, "buzz"],
      [/raya/i, "sidepart"], [/altura|volumen/i, "quiff"],
    ],
    beard: [
      [/stubble|3–5 días/i, "stubble"], [/ancla|balbo/i, "balbo"], [/van dyke/i, "vandyke"],
      [/circle|redonda/i, "circle"], [/candado|goatee|perilla/i, "goatee"], [/chin strap|contorno|cuello/i, "chinstrap"],
      [/caja|box/i, "box"], [/punta|larga/i, "long"], [/bigote/i, "moustache"], [/completa|mejillas|patillas|voluminosa/i, "full"],
      [/corta/i, "box"],
    ],
    glasses: [
      [/ojo de gato/i, "cateye"], [/browline|clubmaster|parte superior/i, "browline"], [/wayfarer/i, "wayfarer"], [/aviador/i, "aviator"], [/panto/i, "panto"],
      [/al aire|sin montura/i, "rimless"], [/redondas/i, "round"], [/ovaladas/i, "oval"],
      [/parte inferior más ancha|base más ancha|base ancha/i, "bottomwide"], [/grandes|altura|enormes/i, "big"],
      [/pequeñas|estrechas/i, "small"], [/cuadradas/i, "square"], [/rectangular/i, "rect"], [/puente/i, "wayfarer"],
    ],
  };

  function iconFor(kind, title) {
    for (const [re, id] of ICONS[kind] || []) if (re.test(title)) return id;
    return null;
  }

  // Los rizos (círculos) no llevan mechones: ya tienen textura.
  const CURLS = new Set(["curly", "afro", "curlyF"]);
  const LONG_STRANDS = new Set(["medium", "sides", "longm", "curtainsm"]);
  function haircut(id, label, shape) {
    const f = HAIRCUTS_F[id];
    if (f) return head(CURLS.has(id) ? f.front : textured(f.front, `pf-${id}`, id === "pixie" ? "short" : "long"), label || id, "", f.back || "", true, shape);
    const key = HAIRCUTS[id] ? id : "crew", h = HAIRCUTS[key], front = typeof h === "string" ? h : h.front;
    const hair = CURLS.has(key) ? front : textured(front, `pm-${key}`, LONG_STRANDS.has(key) ? "long" : "short");
    const parts = typeof h === "string" ? {} : h;
    return head((FADED.has(key) ? FADE : "") + hair, label || id, "", parts.back || "", false, shape, parts.nape || "");
  }
  function earring(id, label, metal = "#C9A227", shape) {
    const e = EARRINGS[id] || EARRINGS.stud;
    const pair = `<g fill="${metal}" stroke="${metal}" stroke-width=".6">` +
      `<g transform="translate(23.5 68)">${e}</g><g transform="translate(76.5 68) scale(-1 1)">${e}</g></g>`;
    return head(textured(HAIRCUTS_F.updo.front, "pf-updo", "short") + pair, label || id, "", HAIRCUTS_F.updo.back, true, shape);
  }
  function beard(id, label, shape) {
    const key = BEARDS[id] ? id : "full";
    return head(FADE + textured(HAIRCUTS.crew, "pm-crew"), label || id, textured(BEARDS[key], `pb-${key}`, "beard"), "", false, shape);
  }

  // ---- conjuntos de ropa: figura sencilla rellena con colores de la paleta ----
  /**
   * @param {{top:string, outer?:string, outerType?:"blazer"|"overshirt"|"hoodie"|"jacket", bottom:string,
   *   bottomType?:"pants"|"jeans"|"shorts"|"skirt"|"midi", shoes:string, shoeType?:"sneaker"|"boot"|"dress"|"heel"|"flat",
   *   tie?:string, fem?:boolean}} o  `fem` = figura con cintura y melena; skirt = falda a la rodilla, midi = por debajo
   */
  function outfit(o, label) {
    const hem = { skirt: 136, midi: 152 }[o.bottomType];
    const legs = hem
      ? `<path d="M36,${hem} L46,${hem} L46,168 L37,168Z M54,${hem} L64,${hem} L63,168 L54,168Z" fill="${SKIN}"/>` +
        `<path d="M31,96 L69,96 L${hem === 136 ? 76 : 79},${hem} L${hem === 136 ? 24 : 21},${hem}Z" fill="${o.bottom}"/>`
      : o.bottomType === "shorts"
      ? `<path d="M34,96 L66,96 L68,128 L52,128 L50,108 L48,128 L32,128Z" fill="${o.bottom}"/>` +
        `<path d="M34,128 L46,128 L46,168 L35,168Z M54,128 L66,128 L65,168 L54,168Z" fill="${SKIN}"/>`
      : `<path d="M34,96 L66,96 L67,168 L54,168 L50,112 L46,168 L33,168Z" fill="${o.bottom}"/>` +
        (o.bottomType === "jeans" ? `<path d="M50,98 V112 M38,100 Q42,104 46,100" stroke="#F2D27A" stroke-width=".8" fill="none" opacity=".8"/>` : "");
    const shoe = o.shoeType === "heel"
      ? `<path d="M36,167 L46,167 L48,174 L40,174 L37,177 L35,177Z M54,167 L64,167 L65,177 L63,177 L60,174 L52,174Z" fill="${o.shoes}"/>`
      : o.shoeType === "flat"
      ? `<path d="M35,168 L47,168 L48,175 L32,175 Q32,170 35,168Z M53,168 L65,168 Q68,170 68,175 L52,175Z" fill="${o.shoes}"/>`
      : o.shoeType === "boot"
      ? `<path d="M32,160 L47,160 L48,176 L28,176 Q28,170 32,168Z M53,160 L68,160 L72,168 Q72,176 72,176 L52,176Z" fill="${o.shoes}"/>`
      : `<path d="M33,168 L47,168 L48,176 L26,176 Q26,170 33,168Z M53,168 L67,168 Q74,170 74,176 L52,176Z" fill="${o.shoes}"/>` +
        (o.shoeType === "sneaker" ? `<path d="M26,176 H48 M52,176 H74" stroke="#FFFFFF" stroke-width="2"/>` : "");
    const torso = o.fem ? "M31,36 Q50,30 69,36 L76,44 L68,72 L71,98 L29,98 L32,72 L24,44Z" : "M30,36 Q50,30 70,36 L78,44 L74,98 L26,98 L22,44Z";
    const arms = (fill) => `<path d="M22,44 L12,92 L20,94 L30,56Z M78,44 L88,92 L80,94 L70,56Z" fill="${fill}"/>`;
    let top = arms(o.outer || o.top) + `<path d="${torso}" fill="${o.top}"/>`;
    if (o.tie) top += `<path d="M48,38 L52,38 L54,72 L50,78 L46,72Z" fill="${o.tie}"/>`;
    if (o.outer && o.outerType === "hoodie") {
      top = arms(o.outer) + `<path d="${torso}" fill="${o.outer}"/><path d="M36,34 Q50,22 64,34 Q50,44 36,34Z" fill="${o.outer}" stroke="#00000033"/><path d="M47,40 V56 M53,40 V56" stroke="#FFFFFF" stroke-width="1.2"/>`;
    } else if (o.outer) {
      const lapel = o.outerType === "blazer" ? `<path d="M40,34 L50,66 L36,52Z M60,34 L50,66 L64,52Z" fill="#00000026"/>` : "";
      top += `<path d="M30,36 L22,44 L26,98 L46,98 L50,66 L44,34Z M70,36 L78,44 L74,98 L54,98 L50,66 L56,34Z" fill="${o.outer}"/>${lapel}`;
      if (o.outerType === "overshirt") top += `<path d="M30,58 H42 M58,58 H70" stroke="#00000033" stroke-width="1.5"/>`;
    }
    const mane = o.fem ? `<path d="M36,16 Q34,0 50,1 Q66,0 64,16 L67,44 Q50,48 33,44Z" fill="${HAIR}"/>` : "";
    const headG = mane + `<path d="M44,26 L56,26 L56,34 L44,34Z" fill="${SKIN}"/><circle cx="50" cy="16" r="12" fill="${SKIN}"/><path d="M38,14 Q40,2 50,3 Q61,3 62,14 Q56,8 50,9 Q43,9 38,14Z" fill="${HAIR}"/>` +
      `<circle cx="16" cy="95" r="4" fill="${SKIN}"/><circle cx="84" cy="95" r="4" fill="${SKIN}"/>`;
    // pliegue del pantalón largo y contorno fino de ilustración en todas las piezas
    const crease = hem || o.bottomType === "shorts" ? "" : `<path d="M41,102 L40,166 M59,102 L60,166" fill="none" stroke="#1A1814" stroke-opacity=".22" stroke-width=".8"/>`;
    return wrap("0 0 100 180", label || "Conjunto",
      `<g stroke="#1A1814" stroke-opacity=".3" stroke-width=".8" stroke-linejoin="round">${headG + legs + shoe + top}</g>` + crease, "pic outfit");
  }

  return { FACE_PROTOS, HAIRCUTS, HAIRCUTS_F, BEARDS, EARRINGS, GLASSES, faceShape, faceOutline, haircut, beard, earring, glasses, outfit, iconFor, smoothPath };
});
