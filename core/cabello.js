// Cuidado y crecimiento del pelo con evidencia (D-34): test → plan. Mismo criterio que piel.js: cada
// tratamiento lleva nivel de evidencia, fuente verificada y ejemplos de producto. No es consejo médico:
// lo que pide receta o lo que puede ser otra enfermedad se manda al dermatólogo.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else (root.FA = root.FA || {}).cabello = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Mismos niveles que piel.js.
  const LEVELS = {
    A: { label: "Evidencia fuerte", desc: "Varios ensayos aleatorizados o revisiones sistemáticas coinciden." },
    B: { label: "Evidencia moderada", desc: "Ensayos pequeños, de calidad baja o consenso de dermatólogos." },
    C: { label: "Evidencia débil", desc: "Casi no hay estudios en personas; no merece tu dinero." },
  };

  const SOURCES = {
    olsen2002: { cite: "Olsen EA et al. A randomized clinical trial of 5% topical minoxidil versus 2% topical minoxidil and placebo in the treatment of androgenetic alopecia in men. J Am Acad Dermatol. 2002;47(3):377-85.", url: "https://doi.org/10.1067/mjd.2002.124088",
      finding: "393 hombres durante 48 semanas: el minoxidil 5 % hizo crecer un 45 % más pelo que el 2 % y los dos más que el placebo. El 5 % picó e irritó algo más." },
    adil2017: { cite: "Adil A, Godwin M. The effectiveness of treatments for androgenetic alopecia: a systematic review and meta-analysis. J Am Acad Dermatol. 2017;77(1):136-141.e5.", url: "https://doi.org/10.1016/j.jaad.2017.02.054",
      finding: "Metaanálisis de ensayos: minoxidil, finasterida y láser de baja potencia superan al placebo en hombres; el minoxidil, también en mujeres." },
    cochrane2016: { cite: "van Zuuren EJ, Fedorowicz Z, Schoones J. Interventions for female pattern hair loss. Cochrane Database Syst Rev. 2016;(5):CD007628.", url: "https://doi.org/10.1002/14651858.CD007628.pub4",
      finding: "47 ensayos con 5290 mujeres: el minoxidil tópico funciona mejor que el placebo. No usar en embarazo ni lactancia." },
    kaufman1998: { cite: "Kaufman KD et al. Finasteride in the treatment of men with androgenetic alopecia. J Am Acad Dermatol. 1998;39(4 Pt 1):578-89.", url: "https://doi.org/10.1016/s0190-9622(98)70007-6",
      finding: "1553 hombres: con finasterida 1 mg hubo 107 y 138 pelos más que con placebo al año y a los 2 años (en un círculo de 5 cm² de la coronilla); con placebo el pelo siguió cayendo." },
    lee2019: { cite: "Lee S et al. Adverse sexual effects of treatment with finasteride or dutasteride for male androgenetic alopecia: a systematic review and meta-analysis. Acta Derm Venereol. 2019;99(1):12-17.", url: "https://doi.org/10.2340/00015555-3035",
      finding: "15 ensayos (4495 hombres): con finasterida el riesgo de efectos sexuales fue 1,66 veces el del placebo; con dutasterida la diferencia no fue significativa." },
    gupta2022: { cite: "Gupta AK et al. Relative efficacy of minoxidil and the 5-α reductase inhibitors in androgenetic alopecia treatment of male patients: a network meta-analysis. JAMA Dermatol. 2022;158(3):266-274.", url: "https://doi.org/10.1001/jamadermatol.2021.5743",
      finding: "Comparando todos los ensayos, la dutasterida 0,5 mg fue la más eficaz, por delante de la finasterida 1 mg; el minoxidil oral 5 mg también superó a la finasterida 1 mg." },
    sharma2020: { cite: "Sharma AN et al. Low-dose oral minoxidil as treatment for non-scarring alopecia: a systematic review. Int J Dermatol. 2020;59(8):1013-1019.", url: "https://pubmed.ncbi.nlm.nih.gov/32516434/",
      finding: "10 estudios: con minoxidil oral a dosis bajas mejoró entre el 61 y el 100 % de las personas con alopecia androgénica. Casi todo son estudios sin grupo placebo." },
    aleissa2023: { cite: "Aleissa M. The efficacy and safety of oral spironolactone in the treatment of female pattern hair loss: a systematic review and meta-analysis. Cureus. 2023;15(8):e43559.", url: "https://doi.org/10.7759/cureus.43559",
      finding: "La espironolactona oral ayuda a parte de las mujeres, sobre todo combinada con minoxidil; los resultados varían mucho entre estudios y los efectos adversos fueron poco frecuentes (3,7 %)." },
    pierard1998: { cite: "Piérard-Franchimont C et al. Ketoconazole shampoo: effect of long-term use in androgenic alopecia. Dermatology. 1998;196(4):474-7.", url: "https://doi.org/10.1159/000017954",
      finding: "39 hombres durante 21 meses: con champú de ketoconazol 2 % la densidad de pelo subió, y con un champú normal bajó. Estudio pequeño." },
    dhurat2013: { cite: "Dhurat R et al. A randomized evaluator blinded study of effect of microneedling in androgenetic alopecia: a pilot study. Int J Trichology. 2013;5(1):6-11.", url: "https://doi.org/10.4103/0974-7753.114700",
      finding: "100 hombres durante 12 semanas: microagujas semanales de 1,5 mm + minoxidil 5 % sumaron 91 pelos, frente a 22 con minoxidil solo. Un ensayo posterior encontró un efecto mucho menor." },
    lllt2019: { cite: "Liu KH et al. Comparative effectiveness of low-level laser therapy for adult androgenic alopecia: a system review and meta-analysis of randomized controlled trials. Lasers Med Sci. 2019;34(6):1063-1069.", url: "https://doi.org/10.1007/s10103-019-02723-6",
      finding: "11 ensayos doble ciego frente a aparatos falsos: el láser aumentó la densidad de pelo en hombres y mujeres, con peine o con casco." },
    prp2023: { cite: "Zhang X et al. Platelet-rich plasma for androgenetic alopecia: a systematic review and meta-analysis of randomized controlled trials. J Cutan Med Surg. 2023;27(5):504-508.", url: "https://doi.org/10.1177/12034754231191461",
      finding: "9 ensayos (238 personas): el PRP subió la densidad de pelo a los 3 y 6 meses frente a placebo, pero no el número ni el grosor del pelo. Ensayos pequeños y muy distintos entre sí." },
    panahi2015: { cite: "Panahi Y et al. Rosemary oil vs minoxidil 2% for the treatment of androgenetic alopecia: a randomized comparative trial. Skinmed. 2015;13(1):15-21.", url: "https://pubmed.ncbi.nlm.nih.gov/25842469/",
      finding: "100 personas durante 6 meses: el aceite de romero dio un resultado parecido al minoxidil 2 % (la dosis floja). Un solo ensayo, sin grupo placebo." },
    cho2014: { cite: "Cho YH et al. Effect of pumpkin seed oil on hair growth in men with androgenetic alopecia: a randomized, double-blind, placebo-controlled trial. Evid Based Complement Alternat Med. 2014;2014:549721.", url: "https://doi.org/10.1155/2014/549721",
      finding: "76 hombres durante 24 semanas: con 400 mg al día de aceite de semilla de calabaza el recuento subió un 40 %, frente al 10 % con placebo. Un solo ensayo; la cápsula llevaba también otras plantas." },
    dhurat2017: { cite: "Dhurat R et al. An open-label randomized multicenter study assessing the noninferiority of a caffeine-based topical liquid 0.2% versus minoxidil 5% solution in male androgenetic alopecia. Skin Pharmacol Physiol. 2017;30(6):298-305.", url: "https://pubmed.ncbi.nlm.nih.gov/29055953/",
      finding: "210 hombres: la loción de cafeína y el minoxidil 5 % mejoraron parecido a los 6 meses. Sin placebo ni cegamiento, y hecho con el fabricante de la loción." },
    patel2017: { cite: "Patel DP, Swink SM, Castelo-Soccio L. A review of the use of biotin for hair loss. Skin Appendage Disord. 2017;3(3):166-169.", url: "https://doi.org/10.1159/000462981",
      finding: "Los 18 casos en que la biotina ayudó tenían una carencia o una enfermedad de base; no hay pruebas de que sirva a personas sanas." },
    fda2019: { cite: "FDA. Biotin (vitamin B7): safety communication — may interfere with lab tests. 2017, actualizado 2019.", url: "https://www.fda.gov/medical-devices/safety-communications/update-fda-warns-biotin-may-interfere-lab-tests-fda-safety-communication",
      finding: "Las dosis altas de biotina falsean análisis de sangre (hormonas, troponina del infarto); la FDA registró una muerte por un resultado falso." },
    almohanna2019: { cite: "Almohanna HM et al. The role of vitamins and minerals in hair loss: a review. Dermatol Ther (Heidelb). 2019;9(1):51-70.", url: "https://doi.org/10.1007/s13555-018-0278-6",
      finding: "Se recomienda medir hierro (ferritina) y vitamina D si se cae el pelo, y suplementar solo si faltan; sin carencia no hay pruebas de que ayuden." },
    lee2011: { cite: "Lee Y et al. Hair shaft damage from heat and drying time of hair dryer. Ann Dermatol. 2011;23(4):455-62.", url: "https://doi.org/10.5021/ad.2011.23.4.455",
      finding: "El calor estropea la superficie del pelo, pero secar con secador a 15 cm y en movimiento lo dañó menos que dejarlo secar solo durante mucho tiempo." },
    billero2018: { cite: "Billero V, Miteva M. Traction alopecia: the root of the problem. Clin Cosmet Investig Dermatol. 2018;11:149-159.", url: "https://doi.org/10.2147/CCID.S137296",
      finding: "Los peinados tirantes (coletas y moños apretados, trenzas pegadas, extensiones) causan alopecia por tracción; si se mantienen años, la pérdida puede ser permanente." },
    dias2015: { cite: "Gavazzoni Dias MF. Hair cosmetics: an overview. Int J Trichology. 2015;7(1):2-15.", url: "https://doi.org/10.4103/0974-7753.153450",
      finding: "El acondicionador neutraliza la carga del pelo tras el champú, reduce el encrespado y la fricción; los alisados alcalinos abren la cutícula y lo debilitan." },
  };

  const TREATMENTS = {
    minoxidil: { name: "Minoxidil tópico 5 %", level: "A", sources: ["olsen2002", "adil2017", "cochrane2016"],
      what: "Alarga la fase de crecimiento del pelo. Frena la caída y hace crecer pelo, sobre todo en la coronilla.",
      when: "Los primeros 2–3 meses puede caerse más (es normal). Se ve a los 4–6 meses; si lo dejas, en meses se pierde lo ganado.",
      how: "1 ml de solución dos veces al día, o espuma, con el cuero cabelludo seco. En mujeres basta la espuma 5 % una vez al día.",
      caution: "Puede picar o irritar (más la solución que la espuma) y salir vello en la cara si gotea. No en embarazo ni lactancia.",
      products: ["Minoxidil 5 % de farmacia (cualquier marca: el principio activo es el mismo)", "Espuma de minoxidil 5 % (irrita menos)"],
      market: { us: { products: ["Rogaine Men's 5% Minoxidil Foam", "Women's Rogaine 5% Minoxidil Foam (una vez al día)", "Kirkland Signature Minoxidil 5% (solución)"] } } },
    finasterida: { name: "Finasterida 1 mg oral (con receta)", level: "A", sources: ["kaufman1998", "adil2017", "lee2019"], rx: true, sexo: "hombre",
      what: "Baja la hormona (DHT) que miniaturiza el pelo. Frena la caída en la mayoría de hombres y suele recuperar algo.",
      when: "Se nota a los 3–6 meses; el máximo, al año. Hay que tomarla de forma continua.",
      how: "Un comprimido al día, recetado por un médico.",
      caution: "Una minoría nota bajada de deseo o erección (en los ensayos, 1,66 veces más que con placebo). Coméntalo con tu médico antes de empezar.",
      products: ["Finasterida 1 mg genérica (con receta)"] },
    dutasterida: { name: "Dutasterida 0,5 mg oral (con receta, uso fuera de ficha)", level: "B", sources: ["gupta2022", "lee2019"], rx: true, sexo: "hombre",
      what: "Bloquea la DHT con más fuerza que la finasterida; en la comparación de todos los ensayos fue la más eficaz.",
      when: "3–6 meses.", how: "Solo si la receta tu dermatólogo; para el pelo se usa fuera de ficha en muchos países.",
      caution: "Mismos efectos posibles que la finasterida y dura más en el cuerpo. No dones sangre mientras la tomas.",
      products: ["Dutasterida 0,5 mg (con receta)"] },
    minoxidilOral: { name: "Minoxidil oral a dosis baja (con receta)", level: "B", sources: ["sharma2020", "gupta2022"], rx: true,
      what: "La misma molécula en pastilla, a una fracción de la dosis para la tensión. Cómodo y eficaz si el tópico te irrita o no eres constante.",
      when: "3–6 meses.", how: "Solo con receta y control de tu médico (tensión y pulso).",
      caution: "Puede salir más vello en cara y cuerpo; a veces mareo o hinchazón de tobillos. No en embarazo.",
      products: ["Minoxidil oral 2,5 mg partido según la dosis que indique el médico (con receta)"] },
    espironolactona: { name: "Espironolactona oral (con receta)", level: "B", sources: ["aleissa2023"], rx: true, sexo: "mujer",
      what: "Bloquea el efecto de los andrógenos. Ayuda a parte de las mujeres, sobre todo junto al minoxidil.",
      when: "6 meses o más.", how: "Solo con receta; el médico controla la tensión y el potasio.",
      caution: "No en embarazo: hace falta anticoncepción. Puede bajar la tensión o alterar la regla.",
      products: ["Espironolactona (con receta)"] },
    ketoconazol: { name: "Champú de ketoconazol 2 %", level: "B", sources: ["pierard1998"],
      what: "Antifúngico y antiinflamatorio del cuero cabelludo. Como complemento, en un estudio pequeño subió la densidad de pelo.",
      when: "Meses.", how: "2–3 veces por semana en lugar de tu champú: deja la espuma 3–5 minutos y aclara.",
      caution: "Puede resecar el pelo: usa acondicionador en medios y puntas.",
      products: ["Nizoral 2 % (o ketoconazol 2 % genérico)"],
      market: { us: { products: ["Nizoral A-D (1 %)"], note: "En EE. UU. sin receta solo se vende al 1 %; el 2 % del estudio es con receta." } } },
    microagujas: { name: "Microagujas (microneedling) junto al minoxidil", level: "B", sources: ["dhurat2013"],
      what: "Pequeñas punciones en el cuero cabelludo que, sumadas al minoxidil, dieron más pelo que el minoxidil solo.",
      when: "3 meses.", how: "Mejor en consulta (agujas de 1,5 mm, una vez por semana). En casa, rodillo de 0,5 mm limpio y sin apretar.",
      caution: "Ese día no te pongas minoxidil (absorbe de más e irrita). No sobre heridas, granos ni psoriasis. Desinfecta el rodillo.",
      products: ["Sesiones en clínica dermatológica", "Rodillo dermaroller 0,5 mm (uso en casa)"] },
    laser: { name: "Láser de baja potencia (peine o casco)", level: "B", sources: ["lllt2019", "adil2017"],
      what: "Aparatos de luz roja que aumentaron la densidad de pelo frente a aparatos falsos en hombres y mujeres.",
      when: "4–6 meses de uso constante.", how: "Según el aparato, 3 veces por semana unos minutos.",
      caution: "Caro y con ensayos casi siempre pagados por los fabricantes. Complemento, no sustituto del minoxidil.",
      products: ["Aparatos con autorización de la FDA: HairMax, iRestore, Capillus"] },
    prp: { name: "Plasma rico en plaquetas (PRP)", level: "B", sources: ["prp2023"],
      what: "Inyecciones de tu propio plasma en el cuero cabelludo. Subió la densidad de pelo frente a placebo, en ensayos pequeños.",
      when: "3–6 meses, con 3–4 sesiones y repasos.", how: "Solo en clínica.",
      caution: "Caro y sin un protocolo estándar; no es el primer paso.",
      products: ["Clínica dermatológica"] },
    hierro: { name: "Análisis de hierro (ferritina) y vitamina D", level: "B", sources: ["almohanna2019"],
      what: "Si se te cae mucho pelo de toda la cabeza, una carencia de hierro o vitamina D puede influir.",
      when: "Corregir una carencia lleva meses.", how: "Pide a tu médico un análisis. Suplementa solo si sale bajo.",
      caution: "No tomes hierro «por si acaso»: en exceso hace daño.",
      products: ["Análisis de sangre (tu médico)"] },
  };

  // Cuidado diario del pelo (rotura, encrespado), con el mismo criterio de fuentes.
  const CARE = [
    { name: "Secador a unos 15 cm y en movimiento", level: "B", sources: ["lee2011"],
      what: "Con el calor la superficie del pelo se daña, pero dejarlo mojado mucho tiempo también: secar a distancia y moviendo el secador fue lo que menos lo estropeó." },
    { name: "Acondicionador en medios y puntas tras cada lavado", level: "B", sources: ["dias2015"],
      what: "Neutraliza la carga del pelo tras el champú: menos encrespado, menos fricción al peinar y menos rotura." },
    { name: "Peinados sin tensión", level: "B", sources: ["billero2018"],
      what: "Alterna coletas, moños y trenzas con el pelo suelto, y no los lleves apretados. Si duele o tira, está demasiado tenso." },
  ];

  const SKIP = [
    { name: "Biotina en pastillas (si no tienes carencia)", why: "No hay pruebas de que ayude a personas sanas, y en dosis altas falsea análisis de sangre, incluido el del infarto.", source: "patel2017", source2: "fda2019" },
    { name: "Aceite de romero como sustituto del minoxidil", why: "Un solo ensayo, sin placebo y comparado con la dosis floja de minoxidil (2 %). Si te gusta, como complemento.", source: "panahi2015" },
    { name: "Aceite de semilla de calabaza como tratamiento principal", why: "Un solo ensayo con una cápsula que llevaba más plantas: prometedor, no demostrado.", source: "cho2014" },
    { name: "Champús y lociones de cafeína como tratamiento principal", why: "El único ensayo no tenía placebo ni cegamiento y lo hizo el fabricante.", source: "dhurat2017" },
    { name: "Champús «anticaída» sin minoxidil ni ketoconazol", why: "Un champú está pocos minutos en la cabeza; salvo el ketoconazol, no hay ensayos que muestren que hagan crecer pelo." },
  ];

  const QUIZ = [
    { id: "pais", q: "¿Dónde compras?", options: [{ v: "cr", label: "Costa Rica" }, { v: "us", label: "EE. UU." }] },
    { id: "patron", q: "¿Qué le pasa a tu pelo?", options: [
      { v: "entradas", label: "Entradas o coronilla más clara" },
      { v: "raya", label: "La raya se ensancha / menos volumen arriba" },
      { v: "difusa", label: "Se me cae mucho de toda la cabeza desde hace poco" },
      { v: "calvas", label: "Calvas redondas o zonas sin pelo" },
      { v: "rotura", label: "No se cae: se rompe, se abre o se encrespa" }] },
    { id: "receta", q: "¿Estarías dispuesto a ir al dermatólogo por un tratamiento con receta (lo más eficaz)?", options: [
      { v: "si", label: "Sí" }, { v: "no", label: "Prefiero solo productos de farmacia" }] },
    { id: "embarazo", q: "¿Embarazo, lactancia o buscando embarazo?", options: [{ v: "si", label: "Sí" }, { v: "no", label: "No" }], sexo: "mujer" },
    { id: "extra", q: "¿Quieres sumar algo más al tratamiento principal?", options: [
      { v: "no", label: "No, lo básico" }, { v: "clinica", label: "Sí, en clínica (microagujas, PRP)" }, { v: "casa", label: "Sí, en casa (láser, rodillo)" }] },
  ];

  const quiz = (sexo = "hombre") => QUIZ.filter((q) => !q.sexo || q.sexo === sexo);

  const withSources = (x) => ({ ...x, sources: x.sources.map((s) => ({ id: s, ...SOURCES[s] })) });
  function treatment(id, pais) {
    const t = TREATMENTS[id], m = (t.market && t.market[pais]) || {};
    const { market, ...rest } = t;
    return withSources({ id, ...rest, products: m.products || t.products, marketNote: m.note || null });
  }

  /**
   * Plan a partir del test.
   * @param {{pais?:string, patron?:string, receta?:string, embarazo?:string, extra?:string}} a
   * @param {"hombre"|"mujer"} [sexo]
   * @returns {{main:object[], extra:object[], care:object[], skip:object[], alerts:string[], notes:string[]}}
   */
  function plan(a = {}, sexo = "hombre") {
    const fem = sexo === "mujer", pregnant = fem && a.embarazo === "si", rx = a.receta === "si", pais = a.pais || null;
    const patron = a.patron || (fem ? "raya" : "entradas");
    const main = [], extra = [], alerts = [], notes = [];
    if (patron === "calvas") {
      alerts.push("Las calvas redondas suelen ser alopecia areata u otra causa que no es la hereditaria: ve al dermatólogo antes de tratarte por tu cuenta.");
    } else if (patron === "rotura") {
      notes.push("Si el pelo se rompe pero no se cae de raíz, el problema está en la fibra, no en el folículo: el cuidado diario es lo que funciona.");
    } else if (patron === "difusa") {
      main.push("hierro");
      notes.push("Una caída fuerte de toda la cabeza 2–3 meses después de una enfermedad, un parto, una dieta o un estrés grande suele parar sola en unos 6 meses.");
      if (!pregnant) extra.push("minoxidil");
    } else if (pregnant) {
      alerts.push("En embarazo y lactancia no se recomienda minoxidil ni tratamientos hormonales: consulta a tu médico y retómalo después.");
    } else {
      main.push("minoxidil");
      if (rx) main.push(fem ? "espironolactona" : "finasterida");
      if (rx) extra.push("minoxidilOral");
      if (rx && !fem) extra.push("dutasterida");
      extra.push("ketoconazol");
      if (a.extra === "clinica") extra.push("microagujas", "prp");
      if (a.extra === "casa") extra.push("laser", "microagujas");
      if (fem) notes.push("Si además tienes reglas irregulares, acné o vello de más, coméntalo al médico: puede haber un exceso de andrógenos que se trata aparte.");
      notes.push("La alopecia hereditaria avanza: lo que mejor funciona es empezar pronto y no dejarlo. Haz una foto con la misma luz cada 3 meses para ver el progreso.");
    }
    if (!fem && patron !== "rotura" && patron !== "calvas" && !rx) notes.push("Los tratamientos con receta (finasterida, dutasterida, minoxidil oral) son los más eficaces: si cambias de idea, pregunta al dermatólogo.");
    const unique = (l) => [...new Set(l)].filter((id) => !(TREATMENTS[id].sexo && TREATMENTS[id].sexo !== sexo));
    return {
      main: unique(main).map((id) => treatment(id, pais)),
      extra: unique(extra).filter((id) => !main.includes(id)).map((id) => treatment(id, pais)),
      care: CARE.map(withSources),
      skip: SKIP.map((s) => ({ ...s, source: s.source ? SOURCES[s.source] : null, source2: s.source2 ? SOURCES[s.source2] : null })),
      alerts, notes,
    };
  }

  return { LEVELS, SOURCES, TREATMENTS, CARE, SKIP, QUIZ, quiz, plan };
});
