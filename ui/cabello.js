// Sección "Tu pelo" dentro de la pestaña Piel (D-34): test → plan de cuidado o de caída con evidencia.
// La pinta piel.js al final de su informe (app.cabello.render), para que las dos compartan columna.
(function () {
  "use strict";
  const { cabello, app } = window.FA;
  const { $, el } = app;
  const mem = app.memory.load("cabello") || {};
  const answers = mem.answers || {};
  const remember = () => app.memory.save("cabello", { answers });
  app.on("remember", remember);

  function badge(level, parent) {
    const b = el("span", `${level} · ${cabello.LEVELS[level].label}`, parent, `level level-${level}`);
    b.title = cabello.LEVELS[level].desc;
  }
  function sources(card, list) {
    const src = el("details", "", card, "sources");
    el("summary", `Estudios (${list.length})`, src);
    for (const x of list) {
      const p = el("p", "", src);
      el("span", x.finding + " ", p);
      const a = el("a", x.cite, p);
      a.href = x.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    }
  }
  function card(parent, t, n) {
    const c = el("article", "", parent, "step-card");
    const head = el("div", "", c, "step-head");
    if (n) el("span", String(n), head, "step-n");
    el("h4", t.name, head);
    badge(t.level, head);
    el("p", t.what, c);
    if (t.how) {
      const facts = el("dl", "", c, "facts");
      const fact = (k, v) => { if (v) { el("dt", k, facts); el("dd", v, facts); } };
      fact("Cómo", t.how);
      fact("Cuándo se nota", t.when);
      fact("Ojo", t.caution);
    }
    if (t.products) {
      const prods = el("div", "", c, "products");
      el("b", "Ejemplos: ", prods);
      prods.append(t.products.join(" · "));
    }
    if (t.marketNote) el("p", t.marketNote, c, "market-note");
    sources(c, t.sources);
  }

  function render(rep) {
    remember();
    const sexo = app.profile.sexo;
    const p = cabello.plan(answers, sexo);
    el("h2", "Tu pelo", rep, "sec-title hair-title");
    if (!Object.values(answers).some(Boolean)) el("p", "Plan de partida. Responde «Tu pelo» a la izquierda para ajustarlo.", rep, "empty");
    for (const a of p.alerts) el("p", a, rep, "market-note");
    if (p.main.length) {
      el("h3", "Tratamiento principal", rep, "sec-title");
      p.main.forEach((t, i) => card(rep, t, i + 1));
    }
    if (p.extra.length) {
      el("h3", "Puedes sumar", rep, "sec-title");
      p.extra.forEach((t) => card(rep, t));
    }
    if (p.notes.length) {
      const tips = el("ul", "", rep, "tips");
      for (const t of p.notes) el("li", t, tips);
    }
    el("h3", "Cuidado diario", rep, "sec-title");
    p.care.forEach((t) => card(rep, t));
    el("h3", "No gastes en esto (pelo)", rep, "sec-title");
    const skip = el("div", "", rep, "skip");
    for (const s of p.skip) {
      const c = el("article", "", skip, "skip-card");
      el("h4", "✖ " + s.name, c);
      el("p", s.why, c);
      const list = [s.source, s.source2].filter(Boolean);
      if (list.length) sources(c, list);
    }
    el("p", "Los tratamientos con receta solo con tu médico. Calvas redondas, picor o dolor fuerte, rojez o caída muy rápida → dermatólogo.", rep, "hint");
  }

  app.quiz($("cabello-quiz"), cabello.quiz(app.profile.sexo), answers, () => app.renderPiel && app.renderPiel());
  app.on("profile", (k) => {
    if (k !== "sexo") return;
    $("cabello-quiz").replaceChildren();
    app.quiz($("cabello-quiz"), cabello.quiz(app.profile.sexo), answers, () => app.renderPiel && app.renderPiel());
  });
  app.cabello = { render };
})();
