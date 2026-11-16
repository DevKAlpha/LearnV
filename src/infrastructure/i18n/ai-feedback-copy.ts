import type { Locale } from "@/domain/models/i18n";

type Criteria = Record<string, string>;

export type AiFeedbackCopy = {
  kicker: string;
  title: string;
  intro: string;
  signIn: string;
  openProfile: string;
  consentTitle: string;
  consentPoints: string[];
  consentCheck: string;
  accept: string;
  ask: string;
  asking: string;
  quota: (used: number, limit: number) => string;
  tooShort: string;
  total: (score: number, max: number, kind: "points" | "band") => string;
  criteria: Criteria;
  strengths: string;
  corrections: string;
  original: string;
  suggestion: string;
  nextStep: string;
  disclaimer: string;
  stale: string;
  withdraw: string;
  withdrawn: string;
  outdated: string;
  errors: Record<string, string>;
};

const criteria = {
  es: { "gap-1": "Hueco ㉠", "gap-2": "Hueco ㉡", content: "Contenido y tarea", organisation: "Organización", language: "Uso de la lengua", "task-achievement": "Task Achievement", "task-response": "Task Response", coherence: "Coherence & Cohesion", lexical: "Lexical Resource", grammar: "Grammatical Range & Accuracy", relevance: "Responde a la pregunta", evidence: "Ejemplos concretos", structure: "Estructura" },
  en: { "gap-1": "Gap ㉠", "gap-2": "Gap ㉡", content: "Content and task", organisation: "Organisation", language: "Language use", "task-achievement": "Task Achievement", "task-response": "Task Response", coherence: "Coherence & Cohesion", lexical: "Lexical Resource", grammar: "Grammatical Range & Accuracy", relevance: "Answers the question", evidence: "Concrete evidence", structure: "Structure" },
  ko: { "gap-1": "빈칸 ㉠", "gap-2": "빈칸 ㉡", content: "내용 및 과제 수행", organisation: "글의 전개 구조", language: "언어 사용", "task-achievement": "Task Achievement", "task-response": "Task Response", coherence: "Coherence & Cohesion", lexical: "Lexical Resource", grammar: "Grammatical Range & Accuracy", relevance: "질문에 대한 답", evidence: "구체적인 근거", structure: "구성" },
};

export const aiFeedbackCopy: Record<Locale, AiFeedbackCopy> = {
  es: {
    kicker: "Opcional",
    title: "Comentario con IA",
    intro: "Una segunda opinión con la rúbrica oficial. Complementa el análisis automático de arriba; no lo sustituye.",
    signIn: "Inicia sesión en tu cuenta para pedir un comentario con IA.",
    openProfile: "Ir a Perfil",
    consentTitle: "Antes de activarlo",
    consentPoints: [
      "Cada vez que lo pidas, el enunciado y tu texto se envían a Anthropic, el proveedor de IA, solo para generar el comentario.",
      "LearnV no guarda tu texto ni el comentario: solo cuenta cuántas peticiones haces al día, para el límite diario.",
      "Es orientativo y puede equivocarse. No es la nota de un examen oficial.",
      "Puedes retirar el permiso cuando quieras, aquí mismo. Si tienes menos de 14 años, tu madre, padre o tutor tiene que estar de acuerdo.",
    ],
    consentCheck: "He leído lo anterior y quiero activar el comentario con IA.",
    accept: "Activar",
    ask: "Pedir comentario",
    asking: "Analizando tu texto… puede tardar hasta un minuto.",
    quota: (used, limit) => `${used} de ${limit} peticiones hoy`,
    tooShort: "Escribe un poco más antes de pedir el comentario.",
    total: (score, max, kind) => kind === "band" ? `Banda orientativa: ${score} / ${max}` : `Puntuación orientativa: ${score} / ${max}`,
    criteria: criteria.es,
    strengths: "Lo que funciona",
    corrections: "Correcciones",
    original: "Tu texto",
    suggestion: "Propuesta",
    nextStep: "Siguiente paso",
    disclaimer: "Comentario generado por IA con la rúbrica oficial. Es orientativo y puede contener errores.",
    stale: "Has cambiado el texto desde este comentario.",
    withdraw: "Retirar permiso",
    withdrawn: "Permiso retirado. Ya no se enviará ningún texto.",
    outdated: "El aviso ha cambiado desde que lo aceptaste. Léelo de nuevo para seguir.",
    errors: {
      "ai-quota": "Has usado todas las peticiones de hoy. Mañana tendrás más.",
      "ai-busy": "El servicio está ocupado ahora mismo. Prueba en unos minutos.",
      "ai-unavailable": "El servicio de IA no responde. Prueba más tarde.",
      "ai-disabled": "El comentario con IA no está disponible en este servidor.",
      "ai-declined": "La IA no ha podido comentar este texto. Revisa que sea una respuesta a la tarea.",
      "ai-invalid": "La respuesta de la IA no era válida. No se ha descontado la petición; inténtalo de nuevo.",
      "ai-consent-required": "Activa el comentario con IA para continuar.",
      "rate-limited": "Demasiadas peticiones seguidas. Espera unos minutos.",
      "signed-out": "Tu sesión ha terminado. Vuelve a iniciarla en Perfil.",
      offline: "Sin conexión. Inténtalo cuando vuelvas a estar en línea.",
      unknown: "No se ha podido completar. Inténtalo de nuevo.",
    },
  },
  en: {
    kicker: "Optional",
    title: "AI feedback",
    intro: "A second opinion using the official rubric. It adds to the automatic analysis above; it does not replace it.",
    signIn: "Sign in to your account to ask for AI feedback.",
    openProfile: "Go to Profile",
    consentTitle: "Before you turn it on",
    consentPoints: [
      "Each time you ask, the task and your text are sent to Anthropic, the AI provider, only to produce the feedback.",
      "LearnV does not keep your text or the feedback: it only counts how many requests you make per day, for the daily limit.",
      "It is a guide and can be wrong. It is not an official exam score.",
      "You can withdraw permission at any time, right here. If you are under 14, a parent or guardian must agree.",
    ],
    consentCheck: "I have read the above and want to turn on AI feedback.",
    accept: "Turn on",
    ask: "Ask for feedback",
    asking: "Reading your text… this can take up to a minute.",
    quota: (used, limit) => `${used} of ${limit} requests today`,
    tooShort: "Write a little more before asking for feedback.",
    total: (score, max, kind) => kind === "band" ? `Estimated band: ${score} / ${max}` : `Estimated score: ${score} / ${max}`,
    criteria: criteria.en,
    strengths: "What works",
    corrections: "Corrections",
    original: "Your text",
    suggestion: "Suggestion",
    nextStep: "Next step",
    disclaimer: "AI-generated feedback using the official rubric. It is a guide and may contain mistakes.",
    stale: "You changed the text since this feedback.",
    withdraw: "Withdraw permission",
    withdrawn: "Permission withdrawn. No text will be sent.",
    outdated: "The notice changed since you accepted it. Read it again to continue.",
    errors: {
      "ai-quota": "You have used all of today's requests. You will have more tomorrow.",
      "ai-busy": "The service is busy right now. Try again in a few minutes.",
      "ai-unavailable": "The AI service is not responding. Try again later.",
      "ai-disabled": "AI feedback is not available on this server.",
      "ai-declined": "The AI could not comment on this text. Check that it answers the task.",
      "ai-invalid": "The AI's answer was not valid. The request was not counted; try again.",
      "ai-consent-required": "Turn on AI feedback to continue.",
      "rate-limited": "Too many requests in a row. Wait a few minutes.",
      "signed-out": "Your session ended. Sign in again from Profile.",
      offline: "You are offline. Try again when you are back online.",
      unknown: "That did not work. Please try again.",
    },
  },
  ko: {
    kicker: "선택",
    title: "AI 피드백",
    intro: "공식 채점 기준으로 받는 두 번째 의견입니다. 위의 자동 분석을 보완할 뿐, 대신하지 않습니다.",
    signIn: "AI 피드백을 받으려면 계정에 로그인하세요.",
    openProfile: "프로필로 가기",
    consentTitle: "켜기 전에 확인하세요",
    consentPoints: [
      "요청할 때마다 문제와 내 글이 피드백을 만들기 위해서만 AI 제공업체 Anthropic에 전송됩니다.",
      "LearnV는 글과 피드백을 저장하지 않습니다. 하루 한도를 위해 요청 횟수만 셉니다.",
      "참고용이며 틀릴 수 있습니다. 공식 시험 점수가 아닙니다.",
      "언제든지 여기에서 동의를 철회할 수 있습니다. 14세 미만이라면 보호자가 동의해야 합니다.",
    ],
    consentCheck: "위 내용을 읽었고 AI 피드백을 켜겠습니다.",
    accept: "켜기",
    ask: "피드백 받기",
    asking: "글을 읽는 중입니다… 최대 1분 정도 걸릴 수 있어요.",
    quota: (used, limit) => `오늘 ${limit}회 중 ${used}회 사용`,
    tooShort: "피드백을 받기 전에 조금 더 써 보세요.",
    total: (score, max, kind) => kind === "band" ? `예상 밴드: ${score} / ${max}` : `예상 점수: ${score} / ${max}`,
    criteria: criteria.ko,
    strengths: "잘한 점",
    corrections: "고칠 점",
    original: "내 글",
    suggestion: "제안",
    nextStep: "다음 단계",
    disclaimer: "공식 채점 기준을 바탕으로 AI가 만든 피드백입니다. 참고용이며 오류가 있을 수 있습니다.",
    stale: "이 피드백 이후에 글을 수정했어요.",
    withdraw: "동의 철회",
    withdrawn: "동의를 철회했습니다. 더 이상 글을 보내지 않습니다.",
    outdated: "동의한 뒤 안내가 바뀌었습니다. 계속하려면 다시 읽어 주세요.",
    errors: {
      "ai-quota": "오늘 요청을 모두 사용했어요. 내일 다시 받을 수 있어요.",
      "ai-busy": "지금은 서비스가 바쁩니다. 몇 분 뒤에 다시 시도하세요.",
      "ai-unavailable": "AI 서비스가 응답하지 않습니다. 나중에 다시 시도하세요.",
      "ai-disabled": "이 서버에서는 AI 피드백을 사용할 수 없습니다.",
      "ai-declined": "AI가 이 글에 대해 피드백을 줄 수 없었습니다. 과제에 맞는 답인지 확인하세요.",
      "ai-invalid": "AI 응답이 올바르지 않았습니다. 요청 횟수는 차감되지 않았으니 다시 시도하세요.",
      "ai-consent-required": "계속하려면 AI 피드백을 켜세요.",
      "rate-limited": "요청이 너무 많습니다. 몇 분 기다려 주세요.",
      "signed-out": "세션이 끝났습니다. 프로필에서 다시 로그인하세요.",
      offline: "오프라인 상태입니다. 다시 연결되면 시도하세요.",
      unknown: "완료하지 못했습니다. 다시 시도하세요.",
    },
  },
};
