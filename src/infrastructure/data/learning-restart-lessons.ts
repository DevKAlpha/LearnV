import type { TestLanguage, TestSkill } from "@/domain/models/language-test";
import type { RestartLessonId } from "@/domain/models/learning-restart";
import type { Locale } from "@/domain/models/i18n";

type Help = { title: string; lesson: string; question: string; feedback: string; transfer: string; tool: string };
export type RestartLesson = {
  id: RestartLessonId; skill: TestSkill; targetTitle: string; example: string;
  options: readonly string[]; correctIndex: number; frame: string; help: Record<Locale, Help>;
};

/** Original short contexts; tools, not exercise answers, carry into the real first activities. */
export const restartLessons: Record<TestLanguage, readonly RestartLesson[]> = {
  en: [
    { id: "meaning", skill: "reading", targetTitle: "Read a campus notice",
      example: "STUDY ROOM: Bring your student card to reception before 16:00 on Tuesday.",
      options: ["Bring a card to reception before 16:00 on Tuesday.", "Collect a new card on Wednesday.", "Leave your card in any classroom after 16:00."], correctIndex: 0,
      frame: "Who? → Action? → Place? → Deadline?\nThe notice asks … . The two clues are “…” and “…” .",
      help: {
        es: { title: "Encontrar acción y pistas", lesson: "Localiza quién, qué debe hacer, dónde y cuándo. «Bring» pide llevar algo; «before» marca un límite. Une dos pistas, no solo una palabra conocida.", question: "¿Qué debes hacer según el aviso?", feedback: "Lleva el carnet a recepción antes de las 16:00 del martes. «Bring your student card» indica la acción; «before 16:00 on Tuesday», el límite.", transfer: "En «Read a campus notice» usarás esta ficha para localizar la obligación y resumir con dos pistas del texto.", tool: "Completa las cuatro casillas. Escribe la idea principal y cita dos expresiones; no añadas datos que el aviso no da." },
        en: { title: "Find the action and its clues", lesson: "Find who, required action, place and time. «Bring» requests an action; «before» sets a deadline. Combine two clues, not one familiar word.", question: "What must you do according to the notice?", feedback: "Bring the card to reception before 16:00 on Tuesday. «Bring your student card» gives the action; «before 16:00 on Tuesday» gives the deadline.", transfer: "In «Read a campus notice», use this grid to identify the obligation and write a summary with two textual clues.", tool: "Fill the four slots, state the main point and cite two phrases. Do not add information the notice does not provide." },
        ko: { title: "행동과 근거 찾기", lesson: "누가, 무엇을, 어디서, 언제까지 해야 하는지 찾습니다. Bring은 행동, before는 기한입니다. 아는 단어 하나가 아닌 두 근거를 연결하세요.", question: "안내문에 따라 무엇을 해야 하나요?", feedback: "화요일 16시 전까지 학생증을 안내 데스크에 가져가야 합니다. Bring your student card는 행동, before 16:00 on Tuesday는 기한입니다.", transfer: "Read a campus notice에서 이 표로 의무를 찾고 두 근거를 넣어 요약하게 됩니다.", tool: "네 칸을 채우고 중심 내용과 근거 표현 두 개를 적으세요. 안내문에 없는 정보는 추가하지 마세요." },
      } },
    { id: "form", skill: "grammar", targetTitle: "Routine or action now",
      example: "Leo usually works at the café, but today he ___ at home.",
      options: ["work", "is working", "has work"], correctIndex: 1,
      frame: "Usually, I … . Today, I am … because … . This change … .",
      help: {
        es: { title: "Elegir la forma por el contexto", lesson: "«Usually» señala rutina: presente simple. «Today» contrasta un cambio temporal: am/is/are + verbo en -ing. Con he/she usa is; con I, am.", question: "¿Qué forma completa el cambio temporal de Leo?", feedback: "«He is working» describe lo temporal de hoy. «Usually works» ya da la rutina; «work» no concuerda con he y «has work» no forma este tiempo.", transfer: "En «Routine or action now» crearás tres frases conectadas: rutina → cambio actual → razón, con un contexto propio.", tool: "Subraya la pista temporal, elige la forma y comprueba el sujeto. Expande la plantilla con ideas propias, sin copiar el modelo." },
        en: { title: "Choose form from context", lesson: "«Usually» signals a routine: present simple. «Today» contrasts a temporary change: am/is/are + verb-ing. Use is with he/she and am with I.", question: "Which form completes Leo's temporary change?", feedback: "«He is working» describes today's temporary action. «Usually works» gives the routine; «work» does not agree with he and «has work» does not form this tense.", transfer: "«Routine or action now» asks for three connected sentences: routine → current change → reason in your own context.", tool: "Underline the time signal, choose the form and check the subject. Expand the frame with your own ideas rather than copying the model." },
        ko: { title: "문맥에 맞는 시제 고르기", lesson: "Usually는 습관이므로 현재형, today는 일시적 변화이므로 am/is/are + -ing를 씁니다. he/she에는 is, I에는 am을 씁니다.", question: "레오의 일시적인 변화를 나타내는 형태는 무엇인가요?", feedback: "He is working은 오늘의 일시적인 행동입니다. Usually works는 습관이며 work는 he와 일치하지 않고 has work는 이 시제를 만들지 못합니다.", transfer: "Routine or action now에서는 자신의 상황으로 습관 → 현재 변화 → 이유를 연결한 세 문장을 씁니다.", tool: "시간 단서를 표시하고 시제를 고른 뒤 주어를 확인하세요. 틀을 베끼지 말고 자신의 내용으로 확장하세요." },
      } },
    { id: "use", skill: "writing", targetTitle: "A focused paragraph",
      example: "I want to study languages because I help visitors at a local museum. Last week, I explained two exhibits in English.",
      options: ["Languages are the best subject for everyone.", "I explained two exhibits in English last week.", "Every visitor speaks English perfectly."], correctIndex: 1,
      frame: "I want to study … because … . For example, … . This would help me … .",
      help: {
        es: { title: "Sostener una idea con un ejemplo", lesson: "Combina idea, razón y ejemplo concreto. «Because» une idea y motivo; «for example» introduce evidencia. «Es genial» no demuestra una razón.", question: "¿Qué dato respalda el motivo para estudiar idiomas?", feedback: "Explicar dos exposiciones en inglés es una experiencia concreta conectada con el objetivo. Las otras opciones generalizan sin evidencia del texto.", transfer: "En «A focused paragraph» defenderás un motivo académico. Planifica con esta plantilla y amplía hasta la longitud indicada allí.", tool: "Antes de escribir: idea → motivo → ejemplo. Al revisar: ¿respondí toda la consigna y el ejemplo realmente apoya mi idea?" },
        en: { title: "Support one idea with an example", lesson: "Combine an idea, a reason and a concrete example. «Because» connects a reason; «for example» introduces evidence. «It is great» does not demonstrate a reason.", question: "Which detail supports the reason for studying languages?", feedback: "Explaining two exhibits in English is a concrete experience connected to the goal. The other options generalise without evidence from the text.", transfer: "In «A focused paragraph», support an academic reason. Plan with this frame, then expand to the length stated in that activity.", tool: "Before writing: idea → reason → example. When reviewing: did I answer the entire task, and does the example actually support my idea?" },
        ko: { title: "구체적인 예로 생각 뒷받침하기", lesson: "생각, 이유, 구체적인 예를 연결하세요. Because는 이유를, for example은 근거를 연결합니다. 좋다는 감상만으로는 이유가 증명되지 않습니다.", question: "언어를 공부하려는 이유를 뒷받침하는 정보는 무엇인가요?", feedback: "영어로 전시 두 개를 설명한 경험은 목표와 연결되는 구체적 근거입니다. 다른 선택지는 글의 근거 없이 일반화합니다.", transfer: "A focused paragraph에서 학업 동기를 설명합니다. 이 틀로 계획하고 해당 활동의 분량까지 확장하세요.", tool: "쓰기 전에는 생각 → 이유 → 예를 정리하세요. 과제 전체에 답했는지, 예가 생각을 뒷받침하는지 확인하세요." },
      } },
  ],
  ko: [
    { id: "meaning", skill: "reading", targetTitle: "표지판 읽기",
      example: "수업 안내: 월요일 아침 아홉 시까지 2층 교실로 오세요. 학생증을 가져오세요.",
      options: ["학생증을 가지고 2층 교실로 오세요.", "화요일에 도서관으로 오세요.", "학생증은 집에 두세요."], correctIndex: 0,
      frame: "장소: … / 요청: … / 시간: …\n안내문은 …을/를 요청해요. 근거: “…” + “…” .",
      help: {
        es: { title: "Leer una indicación y sus pistas", lesson: "Busca lugar y petición. 오세요 = ven; 가져오세요 = trae; 까지 = hasta. 교실 = aula; 학생증 = carnet. No conviertas una petición en una prohibición.", question: "¿Qué pide el aviso?", feedback: "Pide ir al aula del segundo piso con el carnet. «2층 교실로 오세요» da el lugar y «학생증을 가져오세요» indica qué llevar.", transfer: "En «표지판 읽기» identificarás una petición de biblioteca. Usa lugar + acción y dos expresiones del aviso para resumir.", tool: "Anota lugar, petición y hora si la hay. Deja en blanco lo que el texto no dice; no lo inventes. Conserva dos pistas literales." },
        en: { title: "Read a request and its clues", lesson: "Find the place and request. 오세요 = come; 가져오세요 = bring; 까지 = until. 교실 = classroom; 학생증 = student card. Do not turn a request into a prohibition.", question: "What does the notice ask you to do?", feedback: "Come to the second-floor classroom with your student card. 2층 교실로 오세요 gives the place; 학생증을 가져오세요 says what to bring.", transfer: "In «표지판 읽기», identify a library request. Use place + action and two phrases from the notice to prepare your summary.", tool: "Note the place, request and time if stated. Leave missing information blank rather than inventing it. Keep two exact textual clues." },
        ko: { title: "요청과 근거 읽기", lesson: "장소와 요청 행동을 찾으세요. 오세요는 방문 요청, 가져오세요는 준비물 요청이고 까지는 기한입니다. 요청을 금지로 바꾸어 해석하지 마세요.", question: "안내문은 무엇을 요청하나요?", feedback: "학생증을 가지고 2층 교실로 오라는 요청입니다. 2층 교실로 오세요는 장소, 학생증을 가져오세요는 준비물의 근거입니다.", transfer: "표지판 읽기에서는 도서관의 요청을 찾습니다. 장소와 행동, 안내문의 두 근거를 이용해 요약을 준비하세요.", tool: "장소, 요청, 제시된 시간을 적으세요. 없는 정보는 만들어 넣지 말고 비워 두세요. 근거 표현 두 개를 남기세요." },
      } },
    { id: "form", skill: "grammar", targetTitle: "이에요/예요 선택",
      example: "저는 학생이에요. 제 친구는 의사예요.",
      options: ["예요", "에서", "이에요"], correctIndex: 2,
      frame: "저는 [받침 있는 명사]이에요. 친구는 [받침 없는 명사]예요. 우리는 … .",
      help: {
        es: { title: "Presentarte con 이에요 / 예요", lesson: "Mira el final del sustantivo: con consonante final (받침), 이에요; tras vocal, 예요. 학생 termina en consonante; 의사, en vocal. Ambas formas significan «soy/es» en trato cortés.", question: "Completa: 저는 학생___.", feedback: "학생 tiene consonante final ㄱ: 학생이에요. 의사 termina en vocal: 의사예요. 에서 marca un lugar de acción, no significa «soy».", transfer: "En «이에요/예요 선택» producirás tres frases conectadas. Comprueba cada nombre y crea un contexto nuevo, no solo el ejemplo.", tool: "Sustantivo → última sílaba → ¿hay consonante final? → 이에요 / 예요. Revisa cada sustantivo por separado." },
        en: { title: "Introduce yourself with 이에요 / 예요", lesson: "Check the noun ending: after a final consonant (받침), use 이에요; after a vowel, 예요. 학생 ends in a consonant; 의사 in a vowel. Both mean am/is in polite speech.", question: "Complete: 저는 학생___.", feedback: "학생 has final ㄱ, so 학생이에요. 의사 ends in a vowel, so 의사예요. 에서 marks the place of an action, not am/is.", transfer: "«이에요/예요 선택» asks for three connected sentences. Check each noun ending and create your own context rather than copying the example.", tool: "Noun → last syllable → final consonant? → 이에요 / 예요. Check each noun separately." },
        ko: { title: "이에요와 예요로 소개하기", lesson: "명사의 끝을 확인하세요. 받침이 있으면 이에요, 모음으로 끝나면 예요입니다. 학생에는 받침이 있고 의사에는 없습니다. 둘 다 일상의 정중한 표현입니다.", question: "저는 학생___. 빈칸에 알맞은 것은 무엇인가요?", feedback: "학생은 ㄱ 받침이 있으므로 학생이에요입니다. 의사는 모음으로 끝나므로 의사예요입니다. 에서는 행동 장소를 나타냅니다.", transfer: "이에요/예요 선택에서는 연결된 세 문장을 만듭니다. 명사의 끝을 확인하고 예문과 다른 자신의 상황을 쓰세요.", tool: "명사 → 마지막 음절 → 받침 확인 → 이에요 / 예요. 명사마다 따로 확인하세요." },
      } },
    { id: "use", skill: "writing", targetTitle: "TOPIK I 문장 연결",
      example: "저는 한국어를 잘하고 싶어요. 그래서 매일 단어를 복습해요. 예를 들어, 아침에 단어 다섯 개를 읽어요.",
      options: ["한국어를 잘하고 싶어서 매일 복습해요.", "한국어는 언어예요. 오늘은 월요일이에요.", "공부해요. 공부해요. 공부해요."], correctIndex: 0,
      frame: "저는 …고 싶어요. 그래서 매일 …해요. 예를 들어, … .",
      help: {
        es: { title: "Unir objetivo, hábito y ejemplo", lesson: "Evita frases sueltas: …고 싶어요 = quiero; 그래서 = por eso; 예를 들어 = por ejemplo. …고 싶어서 une lo que quieres con el motivo para actuar.", question: "¿Qué frase conecta el objetivo con el hábito de estudio?", feedback: "La primera une «quiero mejorar en coreano» con «repaso a diario». Las otras no explican esa relación ni aportan una práctica concreta.", transfer: "En «TOPIK I 문장 연결» escribirás sobre hábitos de estudio. Planifica objetivo → acción → ejemplo y amplía hasta la longitud de la tarea.", tool: "Escribe un objetivo, un hábito que lo apoye y un ejemplo real. Revisa que 그래서 conecte ideas relacionadas; no repitas la misma frase." },
        en: { title: "Link a goal, a habit and an example", lesson: "Avoid unrelated sentences: …고 싶어요 = I want; 그래서 = so; 예를 들어 = for example. …고 싶어서 connects wanting something to the action taken for it.", question: "Which sentence connects the goal to the study habit?", feedback: "The first connects wanting to improve Korean with daily review. The other answers do not explain that relationship or give concrete practice.", transfer: "In «TOPIK I 문장 연결», write about study habits. Plan goal → action → example, then expand to the length stated in the task.", tool: "Write a goal, a supporting habit and a real example. Check that 그래서 connects related ideas; do not just repeat the same sentence." },
        ko: { title: "목표와 습관을 예로 연결하기", lesson: "관계없는 문장을 나열하지 마세요. …고 싶어요는 희망, 그래서는 결과, 예를 들어는 예시입니다. …고 싶어서는 원하는 목표와 행동의 이유를 연결합니다.", question: "목표와 학습 습관을 연결한 문장은 무엇인가요?", feedback: "첫 문장은 한국어를 잘하고 싶은 목표와 매일 복습하는 행동을 연결합니다. 다른 답에는 그 관계나 구체적인 실천이 없습니다.", transfer: "TOPIK I 문장 연결에서 학습 습관을 씁니다. 목표 → 행동 → 예를 계획한 뒤 해당 과제의 분량까지 확장하세요.", tool: "목표, 목표를 돕는 습관, 실제 예를 쓰세요. 그래서가 관련된 생각을 잇는지 확인하고 같은 문장을 반복하지 마세요." },
      } },
  ],
};

export const restartTargetId = (language: TestLanguage, lesson: RestartLesson) => `${language}-${lesson.skill}-01`;
export function getRestartLessonForStage(language: TestLanguage, stageId: string) {
  return restartLessons[language].find((lesson) => restartTargetId(language, lesson) === stageId);
}
