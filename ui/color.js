// Pestaña "Color": mide piel, pelo y ojos en la foto (con balance de blancos) + test → estación,
// paleta, joyería y drapeado virtual (tu cara con dos colores al lado para comparar tú mismo).
(function () {
  "use strict";
  const { color, mask: maskLib, asesor, app } = window.FA;
  const { $, el, swatch } = app;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const taps = $("taps");
  const LABELS = { wb: "Blanco", skin: "Piel", hair: "Pelo", eyes: "Iris" };
  const PROMPTS = { wb: "Toca algo blanco o gris claro de la foto (pared, papel, camiseta blanca).", skin: "Toca tu mejilla, donde no haya sombra ni brillo.", hair: "Toca tu pelo, en una zona sin reflejos.", eyes: "Toca el color de tu iris (amplía la foto si hace falta)." };
  const mem = app.memory.load("color") || {};
  const st = { samples: {}, points: {}, auto: false, est: null, mesh: null, sites: null, flushed: false, answers: mem.answers || {}, forced: mem.forced || null, pick: null, frame: 0 };
  const remember = () => app.memory.save("color", { answers: st.answers, forced: st.forced });
  app.on("remember", remember);

  // ---- muestreo ----
  function radius(kind) {
    const w = app.source.width;
    return Math.max(2, w * { wb: 0.012, skin: 0.018, hair: 0.012, eyes: 0.004 }[kind]);
  }

  // Luz de toda la foto sin la cara ni el pelo (su piel rojiza la haría pasar por cálida).
  function estimateLight() {
    const { data, width: w, height: h } = app.source, box = app.getFaceBox();
    const skip = box && { x0: box.cx - 0.75 * box.width, x1: box.cx + 0.75 * box.width, y0: box.top - 0.6 * box.width, y1: box.top + 1.6 * box.width };
    st.est = color.estimateIlluminant(data, w, h, 4, skip) || color.estimateIlluminant(data, w, h, 4);
  }
  // Blanco tocado a mano > balance automático > nada.
  const gains = () => (st.samples.wb ? color.whiteBalance(st.samples.wb) : st.est ? color.autoGains(st.est.illuminant) : null);

  // Mejillas a partir de la caja de piel (o de los puntos de «Cara» si ya están puestos).
  function autoSkin() {
    const { data, width: w, height: h } = app.source;
    const fp = app.profile.facePoints, box = app.getFaceBox();
    let spots;
    if (st.mesh) spots = st.mesh.spots;
    else if (fp) spots = ["L", "R"].map((s) => [(fp["cheek" + s][0] * 2 + fp.chin[0]) / 3, (fp["cheek" + s][1] * 2 + fp.chin[1]) / 3]);
    else if (box) spots = [-1, 1].map((d) => [box.cx + d * 0.22 * box.width, box.top + 0.8 * box.width]);
    else return;
    const r = st.mesh ? st.mesh.r : box ? box.width * 0.07 : radius("skin");
    const g = gains(); // el filtro de piel se aplica con la luz ya corregida
    const isSkin = g ? (rr, gg, bb) => maskLib.isSkin(...color.applyGains([rr, gg, bb], g)) : maskLib.isSkin;
    // con la malla se mide también la frente: el subtono sale de la mediana de todas las zonas
    st.sites = st.mesh ? st.mesh.sites.map(([x, y]) => color.sampleCircle(data, w, h, x, y, r, isSkin)) : null;
    const got = spots.map(([x, y]) => color.sampleCircle(data, w, h, x, y, r, isSkin)).filter(Boolean);
    if (!got.length) return;
    st.samples.skin = [0, 1, 2].map((i) => got.reduce((a, c) => a + c[i], 0) / got.length);
    st.points.skin = spots[0];
    st.auto = true;
  }

  // Con MediaPipe (D-19) las mejillas y la zona de la cara salen de la malla, que no depende de la luz
  // ni de que el fondo o la ropa parezcan piel. Mientras carga (o si falla) vale la caja por color.
  async function refineWithMesh() {
    const v = app.version;
    let lm = null;
    try { lm = await app.mp.faceLandmarks(); } catch { return; }
    if (!lm || v !== app.version || !app.source) return;
    const { data, width: w, height: h } = app.source;
    st.mesh = asesor.skinSpots(lm, w, h);
    st.est = color.estimateIlluminant(data, w, h, 4, st.mesh.box) || st.est;
    if (!st.samples.wb) app.wbGains = gains();
    if (st.auto || !st.samples.skin) autoSkin();
    update();
  }

  function corrected(kind) {
    const rgb = st.samples[kind];
    if (!rgb) return null;
    const g = gains();
    if (kind === "skin" && st.auto && st.sites) {
      const rs = color.robustSkin(st.sites.map((s) => s && color.rgbToLab(color.applyGains(s, g))));
      if (rs) { st.flushed = rs.flushed; return color.labToRgb(rs.lab); }
    }
    return color.applyGains(rgb, g);
  }

  // ---- marcas sobre la foto ----
  function drawTaps() {
    const on = app.tab === "color" && !!app.source && !app.camera.stream;
    taps.toggleAttribute("hidden", !on);
    taps.classList.toggle("picking", !!st.pick);
    if (!on) return;
    const { width: w, height: h } = app.source;
    taps.setAttribute("viewBox", `0 0 ${w} ${h}`);
    taps.setAttribute("preserveAspectRatio", "none");
    taps.replaceChildren();
    const k = w / (taps.getBoundingClientRect().width || w);
    for (const [kind, [x, y]] of Object.entries(st.points)) {
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("transform", `translate(${x} ${y})`);
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("r", Math.max(radius(kind), 7 * k));
      c.setAttribute("class", "tap-ring");
      const t = document.createElementNS(SVG_NS, "text");
      t.setAttribute("y", -12 * k);
      t.setAttribute("font-size", 13 * k);
      t.setAttribute("text-anchor", "middle");
      t.textContent = LABELS[kind] + (kind === "skin" && st.auto ? " (auto)" : "");
      g.append(c, t);
      taps.appendChild(g);
    }
  }

  function setPick(kind) {
    st.pick = st.pick === kind ? null : kind;
    for (const b of document.querySelectorAll("[data-pick]")) b.setAttribute("aria-pressed", String(b.dataset.pick === st.pick));
    $("pick-hint").textContent = st.pick ? PROMPTS[st.pick] : "";
    drawTaps();
  }

  taps.addEventListener("pointerdown", (e) => {
    if (!st.pick || !app.source) return;
    const [x, y] = app.toImage(e, taps);
    const { data, width: w, height: h } = app.source;
    const rgb = color.sampleCircle(data, w, h, x, y, radius(st.pick));
    if (!rgb) return;
    st.samples[st.pick] = rgb;
    st.points[st.pick] = [x, y];
    if (st.pick === "skin") { st.auto = false; st.sites = null; st.flushed = false; }
    if (st.pick === "wb") { app.wbGains = gains(); app.wbManual = true; } // el probador lo aplica a las prendas de esta foto
    setPick(null);
    update();
  });
  for (const b of document.querySelectorAll("[data-pick]")) b.addEventListener("click", () => setPick(b.dataset.pick));

  function paintChips() {
    for (const kind of Object.keys(LABELS)) {
      const rgb = kind === "wb" ? st.samples.wb : corrected(kind);
      const chip = $("sw-" + kind);
      chip.style.setProperty("background", rgb ? color.rgbToHex(rgb) : "transparent");
      chip.classList.toggle("empty", !rgb);
    }
  }

  // ---- drapeado virtual ----
  // Se pinta con la misma corrección de luz que las medidas (con una lámpara, la cara salía naranja y
  // «Tu color» parecía no favorecer) y se encuadra con la malla si está (la caja por piel se une al cuello).
  let drapeSrc = null, drapeKey = "";
  function drapeSource() {
    const g = gains();
    if (!g) return $("photo");
    const key = app.version + ":" + g.join(",");
    if (key !== drapeKey) {
      const { data, width: w, height: h } = app.source;
      drapeSrc = drapeSrc || document.createElement("canvas");
      drapeSrc.width = w; drapeSrc.height = h;
      drapeSrc.getContext("2d").putImageData(new ImageData(color.correctImage(data, g), w, h), 0, 0);
      drapeKey = key;
    }
    return drapeSrc;
  }

  function drape(parent, fill, label, metal) {
    const fig = el("figure", "", parent, "drape");
    const c = el("canvas", "", fig);
    const W = 180, H = 220;
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const box = st.mesh ? st.mesh.face : app.getFaceBox();
    const src = drapeSource();
    const fw = box.width * 1.9, fx = box.cx - fw / 2, fy = box.top - box.width * 0.45, fh = fw * (H / W);
    g.fillStyle = fill;
    g.fillRect(0, 0, W, H);
    g.drawImage(src, fx, fy, fw, fh, 0, 0, W, H);
    // tela bajo la barbilla, como en un drapeado real
    const cape = metal ? (() => { const gr = g.createLinearGradient(0, H * 0.7, W, H); metal.forEach((m, i) => gr.addColorStop(i / (metal.length - 1), m)); return gr; })() : fill;
    g.fillStyle = cape;
    g.beginPath();
    g.moveTo(0, H * 0.72);
    g.quadraticCurveTo(W / 2, H * 0.95, W, H * 0.72);
    g.lineTo(W, H); g.lineTo(0, H); g.closePath();
    g.fill();
    c.setAttribute("role", "img");
    c.setAttribute("aria-label", `Tu cara con ${label}`);
    el("figcaption", label, fig);
  }

  // ---- informe ----
  function gauge(parent, title, value, left, mid, right) {
    const row = el("div", "", parent, "gauge");
    el("span", title, row, "gauge-title");
    const track = el("span", "", row, "gauge-track");
    const dot = el("i", "", track);
    dot.style.setProperty("left", `${((value + 1) / 2) * 100}%`);
    const lab = el("span", "", row, "gauge-labels");
    el("span", left, lab); el("span", mid, lab); el("span", right, lab);
  }

  function swatchGrid(parent, list, cls) {
    const grid = el("div", "", parent, "swatches " + (cls || ""));
    for (const hex of list) {
      const cell = el("div", "", grid, "sw-cell");
      swatch(hex, cell, hex, "swatch big");
      el("code", hex, cell);
    }
  }

  // el test se construye una vez (no pierde el foco al responder); solo se repinta el resultado
  const rep = el("div", "", $("report-color"), "result");
  const quizBox = el("div", "", $("report-color"));
  el("h3", "📝 Test rápido (afina el resultado)", quizBox, "sec-title");
  app.quiz(el("div", "", quizBox, "quiz wide"), color.QUIZ, st.answers, () => update());

  function render() {
    rep.replaceChildren();
    const lab = {};
    for (const k of ["skin", "hair", "eyes"]) { const c = corrected(k); if (c) lab[k] = color.rgbToLab(c); }
    app.profile.hairRgb = corrected("hair"); // el probador lo usa como color natural de la barba
    const answered = Object.values(st.answers).some(Boolean);
    const hasData = answered || Object.keys(lab).length > 0;

    if (!hasData) {
      el("p", app.source ? "Midiendo…" : "Sube una foto en «Mi foto» o responde el test de abajo: con las dos cosas acierta más.", rep, "empty");
      app.profile.color = null;
    } else {
      const quality = color.photoQuality(Object.keys(lab).length ? st.est : null, !!st.samples.wb);
      const r = color.analyze(lab, st.answers, st.forced, quality);
      app.profile.color = r;
      app.emit("profile", "color");
      const s = r.season;

      const hero = el("div", "", rep, "hero color-hero");
      const txt = el("div", "", hero);
      el("p", "Tu estación", txt, "kicker");
      el("h2", s.name, txt);
      if (r.between) el("p", `Estás entre ${s.name} y ${r.between}: prueba las dos con el drapeado de abajo.`, txt, "kicker");
      el("p", s.desc, txt);
      const strip = el("div", "", txt, "strip");
      for (const hex of s.best) swatch(hex, strip, hex, "strip-cell");
      const gauges = el("div", "", hero, "gauges");
      gauge(gauges, "Subtono", r.axes.w, "Frío", "Neutro", "Cálido");
      gauge(gauges, "Profundidad", r.axes.d, "Claro", "Medio", "Profundo");
      gauge(gauges, "Intensidad", r.axes.c, "Suave", "Medio", "Intenso");
      if (r.traits.contrast) el("p", `Contraste entre tu piel y tu pelo: ${r.traits.contrast}`, gauges, "hint");

      const issues = [...r.quality.issues];
      if (st.auto && st.flushed) issues.push("Una zona de tu cara salió más rojiza (rubor o reflejo): se ha usado la mediana de mejillas y frente para que no te dé más frío de lo que eres.");
      if (issues.length) {
        const warn = el("ul", "", rep, "tips warn");
        for (const t of issues) el("li", "⚠ " + t, warn);
      }
      const alt = el("div", "", rep, "chips season-chips");
      el("span", "¿No te convence? Prueba:", alt, "hint");
      for (const t of r.ranking) {
        const b = el("button", `${t.name} · ${Math.round(t.pct)} %`, alt);
        b.type = "button";
        b.setAttribute("aria-pressed", String(t.id === s.id));
        b.addEventListener("click", () => { st.forced = t.id; update(); });
      }
      if (st.forced) {
        const b = el("button", "↺ Volver a la calculada", alt);
        b.type = "button";
        b.addEventListener("click", () => { st.forced = null; update(); });
      }

      el("h3", "✔ Tus mejores colores (cerca de la cara: camisas, jerséis, bufandas)", rep, "sec-title");
      swatchGrid(rep, s.best);
      el("h3", "🧱 Neutros para la base del armario (pantalones, abrigos, zapatos)", rep, "sec-title");
      swatchGrid(rep, s.neutrals);
      el("h3", "✖ Evita cerca de la cara", rep, "sec-title");
      swatchGrid(rep, s.avoid, "avoid");
      el("p", "Si te encanta un color de la lista de evitar, llévalo lejos de la cara: pantalón, zapatillas o un accesorio.", rep, "hint");

      const j = r.jewelry;
      el("h3", "💍 Joyería, reloj y metales", rep, "sec-title");
      const jc = el("div", "", rep, "jewel");
      const metals = el("div", "", jc, "metals");
      for (const m of j.swatch) {
        const dot = swatch(m, metals, m, "metal");
        dot.style.setProperty("background", `radial-gradient(circle at 30% 30%, #ffffffcc, ${m} 45%, #00000055)`);
      }
      const jl = el("ul", "", jc, "tips");
      const li = (b, t) => { const n = el("li", "", jl); el("b", b, n); n.append(t); };
      li("Mejor: ", j.main);
      li("También: ", j.also.join(", "));
      if (j.avoid) li("Evita: ", j.avoid);
      li("Acabado: ", j.finish);
      li("Tamaño: ", j.size);
      li("Montura de gafas: ", j.frames.join(", "));

      if (app.profile.sexo === "mujer") {
        const mk = color.makeup(s.id, r.axes, r.traits.contrast);
        el("h3", "💄 Maquillaje", rep, "sec-title");
        for (const [title, list] of [["Labios", mk.lips], ["Colorete", mk.blush], ["Sombras", mk.eyes]]) {
          el("h4", title, rep);
          const row = el("div", "", rep, "swatches");
          for (const [n, hex] of list) { const c = el("div", "", row, "sw-cell"); swatch(hex, c, n, "swatch big"); el("code", n, c); }
        }
        el("p", `${mk.finish} Evita: ${mk.avoid.toLowerCase()}.`, rep, "hint");
        if (mk.contrastTip) el("p", mk.contrastTip, rep, "hint");
        el("p", mk.amount, rep, "hint");
      }

      if (app.source && (st.mesh || app.getFaceBox())) {
        el("h3", "🪞 Compruébalo tú: drapeado virtual", rep, "sec-title");
        el("p", "Mira dónde se te ven menos ojeras, la piel más uniforme y los ojos más vivos. Ese es tu lado.", rep, "hint");
        const row = el("div", "", rep, "drapes");
        drape(row, s.best[0], "Tu color");
        drape(row, s.avoid[0], "Color a evitar");
        drape(row, "#B8902C", "Oro", ["#8A6A1E", "#F3D27A", "#B8902C", "#FCEBB0"]);
        drape(row, "#A8A8A8", "Plata", ["#7A7A7A", "#F2F2F2", "#A8A8A8", "#FFFFFF"]);
      }
      const how = el("details", "", rep);
      el("summary", "¿Cómo se ha calculado?", how);
      const f = (v) => (v === null || v === undefined ? "—" : v.toFixed(2));
      el("p", `Foto → subtono ${f(r.photo.w)}, profundidad ${f(r.photo.d)}, intensidad ${f(r.photo.c)}. Test → ${f(r.quiz.w)}, ${f(r.quiz.d)}, ${f(r.quiz.c)}. La foto pesa ${Math.round(40 * r.quality.weight)} % y el test el resto, porque la luz engaña más que las respuestas${r.quality.weight < 1 ? " (menos de 40 % por la calidad de la foto)" : ""}. ${st.samples.wb ? "Balance de blancos con el blanco que tocaste." : st.est ? "Balance de blancos automático con toda la foto menos tu cara; si tienes algo blanco cerca, tócalo y será más preciso." : "Sin balance de blancos."}`, how, "hint");
    }
  }

  function update() {
    remember();
    if (st.frame) return;
    st.frame = requestAnimationFrame(() => {
      st.frame = 0;
      paintChips();
      drawTaps();
      render();
    });
  }

  app.on("photo", (src) => {
    st.samples = {}; st.points = {}; st.auto = false; st.pick = null;
    st.est = null; st.mesh = null; st.sites = null; st.flushed = false;
    if (src) estimateLight();
    app.wbGains = gains(); app.wbManual = false;
    $("color-box").disabled = !src;
    if (src) { autoSkin(); refineWithMesh(); }
    update();
  });
  app.on("tab", (t) => {
    if (t !== "color") { if (st.pick) setPick(null); drawTaps(); return; }
    // si «Cara» ya colocó los puntos, la mejilla automática se recalcula con ellos
    if (app.source && st.auto && app.profile.facePoints) autoSkin();
    update();
  });
  app.on("profile", (k) => { if (k === "sexo") update(); });
  app.on("camera", drawTaps);
  window.addEventListener("resize", () => { if (app.tab === "color") drawTaps(); });
  update();
})();
