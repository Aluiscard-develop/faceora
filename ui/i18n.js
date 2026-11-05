// Idiomas de la interfaz (D-33): español (original) e inglés.
// La UI se escribe en español en el HTML y en app/ui/*.js; este módulo traduce lo que llega al DOM.
// - `es` y `en` (en i18n-dict.js) tienen las mismas claves; es[k] es el texto tal cual sale en pantalla.
//   Una clave con {a}, {b}… es un patrón: lo que va en cada hueco se traduce también (nombres del core).
// - Los textos del core (recomendaciones, estaciones, rutinas…) se buscan en FA.contentEn (app/i18n/content-en.js).
// - Lo que no está en ninguna tabla se queda en español.
// La parte pura (translate) se prueba en Node; la parte DOM solo corre en el navegador.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else (root.FA = root.FA || {}).i18n = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Pieza de una lista de productos que es solo un nombre de marca (sin acentos ni palabras españolas):
  // se deja igual en los dos idiomas.
  const BRAND = /^(?![\s\S]*\b(?:de|del|con|para|sin|y|en|la|el|los|las|o)\b)[A-Za-z0-9 '’.+%\-/&]+$/;
  const norm = (s) => String(s).replace(/\s+/g, " ").trim();
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /**
   * @param {{es:Object<string,string>, en:Object<string,string>}} dict
   * @param {Object<string,string>} [content]  texto del core en español → inglés
   */
  function createTranslator(dict, content = {}) {
    const exact = new Map(), patterns = [];
    for (const k of Object.keys(dict.es)) {
      const src = norm(dict.es[k]), dst = dict.en[k];
      if (dst === undefined) continue;
      if (/\{[a-z]\}/.test(src)) {
        const names = [];
        const re = new RegExp("^" + src.split(/(\{[a-z]\})/).map((part) => {
          const m = /^\{([a-z])\}$/.exec(part);
          if (!m) return escRe(part);
          names.push(m[1]);
          return "(.*?)";
        }).join("") + "$", "s");
        patterns.push({ re, names, dst, fixed: src.replace(/\{[a-z]\}/g, "").length });
        // misma plantilla con huecos codiciosos: «X (BHA) (B)» encaja en «{a} ({b})» como X (BHA) + B
        patterns.push({ re: new RegExp(re.source.replace(/\(\.\*\?\)/g, "(.*)"), "s"), names, dst, fixed: src.replace(/\{[a-z]\}/g, "").length });
      } else exact.set(src, dst);
    }
    for (const [k, v] of Object.entries(content)) if (!exact.has(norm(k))) exact.set(norm(k), v);
    // los patrones más específicos (más texto fijo) primero
    patterns.sort((a, b) => b.fixed - a.fixed);

    /** Traduce un texto al inglés; null si no sabe. */
    function lookup(text, depth = 0) {
      const t = norm(text);
      if (!t) return null;
      if (exact.has(t)) return exact.get(t);
      if (depth > 3) return null;
      for (const p of patterns) {
        const m = p.re.exec(t);
        if (!m) continue;
        let out = p.dst, hit = false;
        p.names.forEach((n, i) => {
          const v = m[i + 1], r = lookup(v, depth + 1) ?? lowerLookup(v.trim(), depth);
          if (r != null || /^[\s\d.,%–-]*$/.test(v)) hit = true;
          out = out.split(`{${n}}`).join(r == null ? v : /^\s*/.exec(v)[0] + r + /\s*$/.exec(v)[0]);
        });
        // un patrón genérico («{a} ({b})») no vale si no reconoce ninguna pieza: se prueba el siguiente
        if (hit || !p.names.length) return out;
      }
      return composite(t, depth);
    }
    // Textos que la UI arma juntando piezas del core: «★ X», «A · B», «A, B», «Frase. Frase.», «Título: texto».
    // Se traducen por piezas solo si se conocen todas (si no, mejor entero en español que a medias).
    function composite(t, depth) {
      const sym = /^([★✔✖↺→•]\s*)(.+)$/s.exec(t);
      if (sym) { const r = lookup(sym[2], depth + 1); return r == null ? null : sym[1] + r; }
      for (const sep of [" · ", ", "]) {
        if (!t.includes(sep)) continue;
        const parts = t.split(sep).map((p) => lookup(p, depth + 1) ?? lowerLookup(p, depth) ?? (/^[\d\s.,%–-]+$/.test(p) || (sep === " · " && BRAND.test(p)) ? p : null));
        if (parts.every((p) => p != null)) return parts.join(sep);
      }
      const colon = t.indexOf(": ");
      if (colon > 0) {
        const a = lookup(t.slice(0, colon), depth + 1), b = lookup(t.slice(colon + 2), depth + 1);
        if (a != null && b != null) return `${a}: ${b}`;
      }
      const sentences = t.split(/(?<=[.!?:])\s+(?=[A-ZÁÉÍÓÚÑ¿¡«(])/);
      if (sentences.length > 1) {
        const parts = sentences.map((p) => lookup(p, depth + 1) ?? lookup(p.replace(/\.$/, ""), depth + 1));
        if (parts.every((p) => p != null)) return parts.join(" ");
      }
      if (/\.$/.test(t)) {
        const r = exact.get(t.slice(0, -1));
        if (r != null) return r + ".";
      }
      return null;
    }
    // «subtono frío» usa el rasgo en minúscula: se prueba con mayúscula inicial y se devuelve en minúscula
    function lowerLookup(v, depth) {
      if (!v || v[0] !== v[0].toLowerCase()) return null;
      const up = lookup(v[0].toUpperCase() + v.slice(1), depth + 1);
      return up == null ? null : up[0].toLowerCase() + up.slice(1);
    }

    /** Traduce conservando los espacios de los extremos (nodos de texto entre etiquetas). */
    function translate(text, lang) {
      if (lang !== "en" || text == null) return text;
      const r = lookup(text);
      if (r == null) return text;
      const lead = /^\s*/.exec(text)[0], tail = /\s*$/.exec(text)[0];
      return lead + r + tail;
    }
    return { translate, lookup, has: (t) => lookup(t) != null };
  }

  /** Idioma inicial: el guardado (solo con «Recordar») o el del navegador. */
  function pickLang(saved, navLangs) {
    if (saved === "en" || saved === "es") return saved;
    for (const l of navLangs || []) {
      const c = String(l).slice(0, 2).toLowerCase();
      if (c === "es") return "es";
      if (c === "en") return "en";
    }
    return "en";
  }

  // ---------------- parte DOM ----------------
  const ATTRS = ["aria-label", "title", "placeholder", "alt"];
  const SKIP = new Set(["SCRIPT", "STYLE", "CODE", "svg", "SVG", "TEXTAREA"]);

  function attachDom(doc, tr, initial) {
    let lang = initial;
    const texts = new WeakMap(); // nodo de texto → { orig, shown }
    const attrs = new WeakMap(); // elemento → { [attr]: { orig, shown } }

    function doText(n) {
      let rec = texts.get(n);
      if (!rec || n.data !== rec.shown) rec = { orig: n.data };
      const out = tr.translate(rec.orig, lang);
      rec.shown = out;
      texts.set(n, rec);
      if (n.data !== out) n.data = out;
    }
    function doAttrs(e) {
      let all = attrs.get(e);
      for (const a of ATTRS) {
        if (!e.hasAttribute(a)) continue;
        all = all || {};
        const v = e.getAttribute(a);
        let rec = all[a];
        if (!rec || v !== rec.shown) rec = { orig: v };
        rec.shown = tr.translate(rec.orig, lang);
        all[a] = rec;
        if (v !== rec.shown) e.setAttribute(a, rec.shown);
      }
      if (all) attrs.set(e, all);
    }
    function walk(node) {
      if (node.nodeType === 3) {
        const p = node.parentNode;
        if (p && !SKIP.has(p.nodeName) && !(p.closest && p.closest("svg,code"))) doText(node);
        return;
      }
      if (node.nodeType !== 1 || SKIP.has(node.nodeName)) {
        if (node.nodeType === 1 && (node.nodeName === "svg" || node.nodeName === "SVG")) doAttrs(node);
        return;
      }
      doAttrs(node);
      for (let c = node.firstChild; c; c = c.nextSibling) walk(c);
    }

    let busy = false;
    const obs = new MutationObserver((list) => {
      if (busy) return;
      busy = true;
      for (const m of list) {
        if (m.type === "childList") m.addedNodes.forEach(walk);
        else if (m.type === "characterData") walk(m.target);
        else if (m.type === "attributes") doAttrs(m.target);
      }
      obs.takeRecords();
      busy = false;
    });

    function apply() {
      busy = true;
      doc.documentElement.lang = lang;
      walk(doc.body);
      doc.title = "Faceora";
      obs.takeRecords();
      busy = false;
    }
    obs.observe(doc.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    apply();
    return {
      get lang() { return lang; },
      set(l) { lang = l === "en" ? "en" : "es"; apply(); },
      apply,
    };
  }

  return { norm, createTranslator, pickLang, attachDom };
});
