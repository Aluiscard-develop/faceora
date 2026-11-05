// Selector EN/ES (D-33). Va el último: traduce lo que ya pintaron las pestañas y, con un observador,
// todo lo que pinten después. El idioma solo se guarda si «Recordar» está activo (D-20).
(function () {
  "use strict";
  const { i18n, i18nDict, contentEn, app } = window.FA;
  const tr = i18n.createTranslator(i18nDict, contentEn || {});
  const lang = i18n.pickLang(app.memory.load("lang"), navigator.languages || [navigator.language]);
  const dom = i18n.attachDom(document, tr, lang);
  const btns = [...document.querySelectorAll("[data-lang]")];

  function mark() { for (const b of btns) b.setAttribute("aria-checked", String(b.dataset.lang === dom.lang)); }
  app.lang = () => dom.lang;
  /** Texto para lo que no pasa por el DOM (ficha PNG, nombres de archivo). */
  app.t = (s) => tr.translate(s, dom.lang);
  for (const b of btns) b.addEventListener("click", () => {
    dom.set(b.dataset.lang);
    mark();
    app.memory.save("lang", dom.lang);
  });
  app.on("remember", () => app.memory.save("lang", dom.lang));
  mark();
})();
