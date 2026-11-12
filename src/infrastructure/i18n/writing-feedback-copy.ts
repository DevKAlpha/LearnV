import type { WritingAnalysis, WritingCheck } from "@/domain/models/writing-feedback";

type Context = { analysis: WritingAnalysis; minimum?: number; maximum?: number; missingGrammar: string[] };
type Messages = Record<WritingCheck["id"], (check: WritingCheck, context: Context) => string>;

const list = (items?: string[]) => (items ?? []).join(", ");

const es: Messages = {
  length: (check, { analysis, minimum, maximum }) => {
    const unit = analysis.unit === "words" ? "palabras" : "caracteres";
    if (check.status === "missing") return `Te faltan ${(minimum ?? 0) - analysis.units} ${unit} (llevas ${analysis.units} de un mínimo de ${minimum}).`;
    if (check.status === "warn") return `Te pasas del máximo: ${analysis.units} de ${maximum} ${unit}. Recorta lo que repite ideas.`;
    return `Longitud correcta: ${analysis.units} ${unit}.`;
  },
  paragraphs: (check) => check.status === "ok" ? `${check.value} párrafos: la estructura se ve.` : `Solo ${check.value} párrafo(s). Separa introducción, desarrollo y conclusión con una línea en blanco.`,
  connectors: (check) => check.status === "ok" ? `Conectores variados: ${list(check.items)}.` : check.status === "warn" ? `Pocos conectores (${list(check.items)}). Añade otro para relacionar causa, contraste o ejemplo.` : "Sin conectores. Une las ideas con however, therefore, for example / 그러나, 따라서, 예를 들어…",
  variety: (check) => check.status === "ok" ? `Vocabulario variado (${check.value} % de palabras distintas).` : `Vocabulario repetitivo (${check.value} % de palabras distintas). Usa sinónimos o reformula.`,
  repetition: (check) => check.status === "ok" ? "Sin repeticiones llamativas." : `Repites mucho: ${list(check.items)}. Sustituye alguna aparición.`,
  sentences: (check) => check.status === "ok" ? `Frases de ${check.value} palabras de media: buen ritmo.` : `Frases de ${check.value} palabras de media: divide las muy largas o une las muy cortas.`,
  register: (check, { analysis }) => analysis.language === "en"
    ? (check.status === "ok" ? "Registro formal: sin contracciones." : `Evita contracciones y coloquialismos: ${list(check.items)}.`)
    : (check.status === "ok" ? "Estilo escrito -(ㄴ/는)다 constante." : `En TOPIK 52–54 escribe con -(ㄴ/는)다, no con -요/-습니다: ${list(check.items)}.`),
  grammar: (check, { missingGrammar }) => check.status === "ok" ? `Usas la gramática objetivo: ${list(check.items)}.` : `Falta la gramática objetivo: ${missingGrammar.join(", ")}.`,
  data: (check) => check.status === "ok" ? `Citas ${check.value} datos concretos.` : check.status === "warn" ? "Pocos datos: cita cifras y años del gráfico." : "No citas ningún dato del gráfico.",
  overview: (check) => check.status === "ok" ? "Incluye una visión general de la tendencia." : "Falta la visión general: una frase con la tendencia principal (Overall, …).",
  position: (check) => check.status === "ok" ? "Tu postura está clara." : "No se ve tu opinión: dila explícitamente (In my opinion…, I believe…).",
  conclusion: (check) => check.status === "ok" ? "Tiene un cierre que resume la postura." : "Falta el cierre: resume tu postura (In conclusion… / 따라서, 결론적으로…).",
};

const en: Messages = {
  length: (check, { analysis, minimum, maximum }) => {
    const unit = analysis.unit;
    if (check.status === "missing") return `${(minimum ?? 0) - analysis.units} more ${unit} needed (${analysis.units} of at least ${minimum}).`;
    if (check.status === "warn") return `Over the limit: ${analysis.units} of ${maximum} ${unit}. Cut what repeats ideas.`;
    return `Length is right: ${analysis.units} ${unit}.`;
  },
  paragraphs: (check) => check.status === "ok" ? `${check.value} paragraphs: the structure is visible.` : `Only ${check.value} paragraph(s). Separate introduction, body and conclusion with a blank line.`,
  connectors: (check) => check.status === "ok" ? `Varied linking words: ${list(check.items)}.` : check.status === "warn" ? `Few linking words (${list(check.items)}). Add one for cause, contrast or example.` : "No linking words. Join ideas with however, therefore, for example / 그러나, 따라서, 예를 들어…",
  variety: (check) => check.status === "ok" ? `Varied vocabulary (${check.value}% different words).` : `Repetitive vocabulary (${check.value}% different words). Use synonyms or rephrase.`,
  repetition: (check) => check.status === "ok" ? "No noticeable repetition." : `Repeated a lot: ${list(check.items)}. Replace some of them.`,
  sentences: (check) => check.status === "ok" ? `Sentences average ${check.value} words: good rhythm.` : `Sentences average ${check.value} words: split very long ones or join very short ones.`,
  register: (check, { analysis }) => analysis.language === "en"
    ? (check.status === "ok" ? "Formal register: no contractions." : `Avoid contractions and informal forms: ${list(check.items)}.`)
    : (check.status === "ok" ? "Consistent written -(ㄴ/는)다 style." : `TOPIK 52–54 expect -(ㄴ/는)다, not -요/-습니다: ${list(check.items)}.`),
  grammar: (check, { missingGrammar }) => check.status === "ok" ? `Target grammar used: ${list(check.items)}.` : `Target grammar missing: ${missingGrammar.join(", ")}.`,
  data: (check) => check.status === "ok" ? `${check.value} specific figures quoted.` : check.status === "warn" ? "Few figures: quote numbers and years from the chart." : "No figures from the chart are quoted.",
  overview: (check) => check.status === "ok" ? "It includes an overview of the main trend." : "No overview: add one sentence with the main trend (Overall, …).",
  position: (check) => check.status === "ok" ? "Your position is clear." : "Your opinion is not visible: state it (In my opinion…, I believe…).",
  conclusion: (check) => check.status === "ok" ? "It ends with a conclusion that sums up the position." : "No conclusion: sum up your position (In conclusion… / 따라서, 결론적으로…).",
};

const ko: Messages = {
  length: (check, { analysis, minimum, maximum }) => {
    const unit = analysis.unit === "words" ? "단어" : "자";
    if (check.status === "missing") return `${(minimum ?? 0) - analysis.units}${unit} 더 필요합니다 (최소 ${minimum}${unit} 중 ${analysis.units}${unit}).`;
    if (check.status === "warn") return `최대 분량을 넘었습니다: ${analysis.units}/${maximum}${unit}. 반복되는 내용을 줄이세요.`;
    return `분량이 적절합니다: ${analysis.units}${unit}.`;
  },
  paragraphs: (check) => check.status === "ok" ? `${check.value}개 문단으로 구조가 보입니다.` : `문단이 ${check.value}개뿐입니다. 서론, 본론, 결론을 빈 줄로 나누세요.`,
  connectors: (check) => check.status === "ok" ? `다양한 연결 표현: ${list(check.items)}.` : check.status === "warn" ? `연결 표현이 적습니다(${list(check.items)}). 원인, 대조, 예시 표현을 더하세요.` : "연결 표현이 없습니다. 그러나, 따라서, 예를 들어 등으로 생각을 연결하세요.",
  variety: (check) => check.status === "ok" ? `어휘가 다양합니다(서로 다른 어휘 ${check.value}%).` : `어휘가 반복됩니다(서로 다른 어휘 ${check.value}%). 유의어를 쓰거나 바꿔 표현하세요.`,
  repetition: (check) => check.status === "ok" ? "눈에 띄는 반복이 없습니다." : `자주 반복됨: ${list(check.items)}. 일부를 바꾸세요.`,
  sentences: (check) => check.status === "ok" ? `문장 평균 ${check.value}단어로 적절합니다.` : `문장 평균 ${check.value}단어입니다. 너무 긴 문장은 나누고 짧은 문장은 연결하세요.`,
  register: (check, { analysis }) => analysis.language === "en"
    ? (check.status === "ok" ? "격식체를 유지했습니다." : `축약형과 구어체를 피하세요: ${list(check.items)}.`)
    : (check.status === "ok" ? "-(ㄴ/는)다 문어체를 일관되게 썼습니다." : `TOPIK 52~54번은 -요/-습니다 대신 -(ㄴ/는)다로 쓰세요: ${list(check.items)}.`),
  grammar: (check, { missingGrammar }) => check.status === "ok" ? `목표 문법 사용: ${list(check.items)}.` : `목표 문법이 빠졌습니다: ${missingGrammar.join(", ")}.`,
  data: (check) => check.status === "ok" ? `구체적인 수치 ${check.value}개를 인용했습니다.` : check.status === "warn" ? "수치가 부족합니다. 그래프의 숫자와 연도를 인용하세요." : "그래프의 수치를 인용하지 않았습니다.",
  overview: (check) => check.status === "ok" ? "전체 경향을 요약했습니다." : "전체 경향을 요약하는 문장이 없습니다 (Overall, …).",
  position: (check) => check.status === "ok" ? "자신의 입장이 분명합니다." : "의견이 드러나지 않습니다. 분명히 밝히세요 (In my opinion…, I believe…).",
  conclusion: (check) => check.status === "ok" ? "입장을 정리하는 결론이 있습니다." : "결론이 없습니다. 입장을 정리하세요 (따라서, 결론적으로…).",
};

export const writingFeedbackMessages = { es, en, ko } as const;

export const writingFeedbackCopy = {
  es: { title: "Revisión de tu borrador", intro: "Comprobaciones objetivas, no una nota: cada punto es una revisión concreta.", analyze: "Revisar borrador", passed: (passed: number, total: number) => `${passed} de ${total} puntos cumplidos`, improved: "Mejorado respecto a la versión anterior", ok: "Cumplido", warn: "Mejorable", missing: "Pendiente" },
  en: { title: "Draft review", intro: "Objective checks, not a grade: each point is a concrete revision.", analyze: "Review draft", passed: (passed: number, total: number) => `${passed} of ${total} checks met`, improved: "Improved since the previous version", ok: "Met", warn: "Could improve", missing: "Missing" },
  ko: { title: "초안 점검", intro: "점수가 아니라 객관적인 점검입니다. 항목마다 구체적으로 고칠 점을 알려 줍니다.", analyze: "초안 점검", passed: (passed: number, total: number) => `${total}개 중 ${passed}개 충족`, improved: "이전 버전보다 좋아진 점", ok: "충족", warn: "보완 필요", missing: "미충족" },
} as const;
