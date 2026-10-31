import type { LocalizedText } from "@/domain/models/i18n";
import { isLearningQa } from "@/application/qa/qa-learning-scope";
import { TESTS_PER_LANGUAGE, TESTS_PER_SKILL, ADVANCED_TESTS_PER_SKILL, practiceSkills } from "@/infrastructure/data/practice-test-metadata";
import { isImmersiveLearningRoute } from "@/application/i18n/learning-locale";
import type { WrittenSimulatorStep } from "@/domain/models/written-simulator";

export type HelpContext = {
  phase?: "foundation" | "advanced";
  practice?: "production" | "questions" | "result";
  mode?: "writing" | "listening" | "speaking";
  retake?: boolean;
  introOpen?: boolean;
  written?: WrittenSimulatorStep;
  timerRunning?: boolean;
};

export type TourStep = { selector: string; title: LocalizedText; text: LocalizedText };
export type TourDefinition = { key: string; title: LocalizedText; steps: TourStep[] };

const t = (es: string, en: string, ko: string): LocalizedText => ({ es, en, ko });
const step = (selector: string, title: LocalizedText, text: LocalizedText): TourStep => ({ selector, title, text });

function baseDefinition(pathname: string): TourDefinition {
  if (/^\/tests\/(en|ko)\/.+/.test(pathname)) return {
    key: "practice", title: t("Cómo completar una práctica", "How to complete a practice", "연습 완료 방법"), steps: [
      step(".session-topbar", t("Progreso de sesión", "Session progress", "세션 진행"), t("Aquí ves el avance, el intento y el tiempo. El cronómetro solo aparece desde el segundo intento.", "See progress, attempt and time here. The timer starts from the second attempt.", "진행도, 응시 횟수와 시간을 확인합니다. 타이머는 두 번째 응시부터 시작됩니다.")),
      step(".question-stage", t("Primero produce", "Produce first", "먼저 수행하세요"), t("Escribe, escucha o graba según la habilidad. Esta evidencia es necesaria para desbloquear la siguiente prueba.", "Write, listen or record for the skill. This evidence is required to unlock the next test.", "기능에 따라 쓰고, 듣거나 녹음하세요. 다음 시험을 열려면 이 수행 증거가 필요합니다.")),
      step(".production-checklist", t("Comprueba con honestidad", "Check honestly", "솔직하게 확인하세요"), t("Marca cada criterio únicamente después de revisarlo en tu respuesta.", "Tick each criterion only after checking it in your response.", "답변에서 실제로 확인한 기준만 체크하세요.")),
      step(".session-action-bar", t("Continúa cuando esté listo", "Continue when ready", "준비되면 계속하세요"), t("El botón se activa cuando la tarea y sus comprobaciones están completas.", "The button activates when the task and its checks are complete.", "과제와 확인 항목을 완료하면 버튼이 활성화됩니다.")),
    ],
  };
  if (/^\/tests\/(en|ko)$/.test(pathname)) return {
    key: "test-path", title: t("Tu recorrido de pruebas", "Your test path", "시험 학습 경로"), steps: [
      step(".test-path-header", t("Objetivo y progreso", "Target and progress", "목표와 진행도"), t("Resume el nivel de partida, la meta, pruebas superadas e intentos realizados.", "This summarises your starting point, target, passed tests and attempts.", "시작 수준, 목표, 통과한 시험과 응시 횟수를 요약합니다.")),
      step(".test-skill-tabs", t("Seis habilidades", "Six skills", "여섯 가지 기능"), t("Elige Lectura, Gramática, Vocabulario, Escritura, Listening o Pronunciación. Trabaja una habilidad cada vez.", "Choose Reading, Grammar, Vocabulary, Writing, Listening or Pronunciation. Work on one skill at a time.", "읽기, 문법, 어휘, 쓰기, 듣기 또는 발음을 선택하고 한 번에 한 기능을 연습하세요.")),
      step(".test-skill-section", t("Avance procedural", "Procedural progress", "단계별 진행"), t("Completa la prueba disponible para abrir la siguiente. Puedes repetir cualquier etapa desbloqueada.", "Complete the available test to unlock the next one. Any unlocked stage can be repeated.", "현재 시험을 완료하면 다음 단계가 열립니다. 열린 단계는 다시 연습할 수 있습니다.")),
    ],
  };
  if (/^\/study\/(english|korean)$/.test(pathname)) return {
    key: pathname.endsWith("english") ? "english-space" : "korean-space", title: t("Tu espacio de idioma", "Your language space", "언어 학습 공간"), steps: [
      step(".language-study-hero", t("Resumen del espacio", "Space summary", "학습 공간 요약"), t("Aquí ves el objetivo, las pruebas superadas y los recursos disponibles para este idioma.", "See the target, passed tests and available resources for this language.", "이 언어의 목표, 통과한 시험과 사용 가능한 자료를 확인합니다.")),
      step(".language-study-jump-nav", t("Navegación rápida", "Quick navigation", "빠른 이동"), t("El sombreado sigue la sección visible: pruebas o materiales. También puedes cambiar de idioma.", "The highlight follows the visible section: tests or materials. You can also switch language.", "현재 보이는 시험 또는 자료 메뉴가 강조됩니다. 언어도 바꿀 수 있습니다.")),
      step(".learning-restart", t("Retoma la base primero", "Refresh the basics first", "기초부터 다시 시작"), t("Aprende tres herramientas breves de lectura, gramática y escritura. Cada una enlaza con una actividad real y su ficha reaparece al revisar tu primer borrador. El repaso es opcional y no cambia tu ruta.", "Learn three short reading, grammar and writing tools. Each links to a real activity, where the same card is available when reviewing your first draft. The refresher is optional and does not change your path.", "짧은 읽기·문법·쓰기 도구 세 개를 익히세요. 각각 실제 활동과 연결되며 첫 초안 검토 때 같은 도구를 다시 볼 수 있습니다. 선택 복습이며 기존 경로는 바뀌지 않습니다.")),
      step(".test-track-card", t("Prácticas guiadas", "Guided practice", "안내형 연습"), t(`Abre el recorrido de ${TESTS_PER_LANGUAGE} actividades: ${TESTS_PER_SKILL} por cada una de las seis habilidades. Empieza por una, sin intentar hacerlas todas de golpe.`, `Open the ${TESTS_PER_LANGUAGE}-activity path: ${TESTS_PER_SKILL} for each of six skills. Start with one, not all at once.`, `여섯 기능별 ${TESTS_PER_SKILL}개씩 총 ${TESTS_PER_LANGUAGE}개 활동 경로입니다. 한 번에 모두 하지 말고 하나부터 시작하세요.`)),
      step(".resource-library", t("Biblioteca con tareas", "Task-based library", "과제형 자료실"), t("Cada recurso indica qué hacer, cuánto tiempo reservar, si requiere cuenta y permite marcarlo como completado.", "Each resource tells you what to do, time needed, account access and lets you mark it complete.", "각 자료에는 할 일, 예상 시간, 계정 필요 여부와 완료 표시가 있습니다.")),
    ],
  };
  if (pathname === "/study/interviews") return {
    key: "interviews", title: t("Preparación de entrevistas", "Interview preparation", "면접 준비"), steps: [
      step(".interview-hero", t("Qué vas a entrenar", "What you will train", "연습할 내용"), t("La preparación cubre motivación, evidencia académica, adaptación y contribución.", "Preparation covers motivation, academic evidence, adaptation and contribution.", "동기, 학업 근거, 적응과 기여를 준비합니다.")),
      step(".interview-method", t("Estructura de respuesta", "Answer structure", "답변 구조"), t("Responde primero, demuestra con evidencia y conecta con tu objetivo GKS.", "Answer first, support it with evidence and link it to your GKS goal.", "먼저 답하고 근거를 제시한 뒤 GKS 목표와 연결하세요.")),
      step(".interview-simulator", t("Simulador personal", "Personal simulator", "개인 시뮬레이터"), t("Usa el temporizador, guarda notas por pregunta y revisa tu respuesta antes de avanzar.", "Use the timer, save notes per question and review your answer before moving on.", "타이머를 사용하고 질문별 메모를 저장한 뒤 답변을 검토하세요.")),
      step(".interview-video", t("Experiencia en video", "Video experience", "영상 경험"), t("El video se carga solo al reproducirlo. Es orientación personal, no una regla oficial.", "The video loads only when played. It is personal guidance, not an official rule.", "재생할 때만 영상이 로드됩니다. 공식 규정이 아닌 개인 경험입니다.")),
    ],
  };
  if (pathname === "/study/written-simulator") return {
    key: "written", title: t("Simulador escrito GKS", "GKS written simulator", "GKS 서면 시뮬레이터"), steps: [
      step(".written-simulator-hero", t("Práctica, no examen oficial", "Practice, not an official exam", "공식 시험이 아닌 연습"), t("Entrena elementos escritos de la candidatura; GKS-U no define una prueba escrita nacional única.", "Train written application elements; GKS-U does not define one national written exam.", "지원서 서면 요소를 연습합니다. GKS-U는 하나의 국가 필기시험을 정하지 않습니다.")),
      step(".written-official-note", t("Referencia oficial", "Official reference", "공식 참고"), t("Consulta aquí las fuentes que delimitan qué reproduce el simulador.", "Use these sources to understand what the simulator reproduces.", "시뮬레이터가 재현하는 범위를 공식 자료로 확인하세요.")),
      step(".written-stage", t("Trabajo guardado", "Saved work", "저장되는 작업"), t("El borrador se guarda en este dispositivo. Completa cada etapa y revisa la coherencia al final.", "The draft is saved on this device. Complete each stage and review consistency at the end.", "초안은 이 기기에 저장됩니다. 각 단계를 완료하고 마지막에 일관성을 검토하세요.")),
    ],
  };
  if (pathname === "/gks") return {
    key: "scholarship", title: t("Tu ruta para entender la beca", "Your path to understanding the scholarship", "장학금 이해 경로"), steps: [
      step(".page-header--gks", t("Empieza con contexto claro", "Start with clear context", "명확한 맥락부터 시작"), t("El recorrido avanza desde el estado actual hasta los requisitos y apoyos más avanzados.", "The path moves from the current status to requirements and more advanced support.", "현재 상태에서 요건과 심화 지원까지 순서대로 안내합니다.")),
      step(".gks-daily-radar", t("Radar diario", "Daily radar", "일일 레이더"), t("Prioriza el estado más reciente, la siguiente acción y las fuentes oficiales revisadas.", "It prioritises the latest status, next action and checked official sources.", "최신 상태, 다음 행동과 확인한 공식 출처를 우선 표시합니다.")),
      step(".gks-pathway", t("Tres pasos para orientarte", "Three steps to get oriented", "세 단계 안내"), t("Comprueba primero la elegibilidad, organiza documentos y después valora certificaciones.", "Check eligibility first, organise documents and then consider certifications.", "먼저 지원 자격을 확인하고 서류를 정리한 뒤 자격증을 검토하세요.")),
      step(".gks-details", t("Lo esencial antes del detalle", "Essentials before detail", "세부 정보 전 핵심"), t("Abre únicamente la elegibilidad, los datos base, las carreras o las fuentes que necesites.", "Open only the eligibility, core facts, majors or sources you need.", "필요한 지원 자격, 기본 정보, 전공 또는 출처만 펼쳐 보세요.")),
      step(".culture-entry", t("Prepara tu vida en Corea", "Prepare for life in Korea", "한국 생활 준비"), t("Abre la guía España–Corea: ocho situaciones, frases útiles, decisiones para practicar y testimonios con fuente. Las marcas guardan tu preparación local; no puntúan tu cultura ni cambian la beca. Para trámites confirma siempre la norma vigente.", "Open the Spain–Korea guide: eight situations, useful phrases, practice decisions and sourced testimonies. Checks save local preparation; they do not score your culture or change your scholarship. Confirm current rules for formal procedures.", "스페인–한국 가이드에서 여덟 상황, 유용한 표현, 선택 연습과 출처가 있는 후기를 확인하세요. 체크 표시는 기기 내 준비 기록이며 문화 점수나 장학금 변경이 아닙니다. 행정 절차는 최신 규정을 확인하세요.")),
      step(".gks-certifications-stage", t("Certificaciones bajo demanda", "Certifications on demand", "필요할 때 자격증"), t("La comparación y el catálogo dinámico se cargan solo cuando decides consultarlos.", "The comparison and dynamic catalogue load only when you choose to review them.", "비교와 동적 카탈로그는 확인할 때만 불러옵니다.")),
      step(".gks-guidance-stage", t("Orientación complementaria", "Optional guidance", "보충 안내"), t("Los videos quedan al final como apoyo y se cargan únicamente al abrir esta etapa.", "Videos stay at the end as support and load only when this stage is opened.", "영상은 보충 자료로 마지막에 있으며 이 단계를 열 때만 불러옵니다.")),
    ],
  };
  if (pathname === "/study") return {
    key: "study", title: t("Tu ruta de aprendizaje", "Your learning path", "나의 학습 경로"), steps: [
      step(".page-header--study", t("Un recorrido en orden", "A path in order", "순서가 있는 경로"), t("La pantalla empieza con la ruta inicial y deja el análisis detallado para cuando lo necesites.", "The screen starts with the starter route and leaves detailed analysis for when you need it.", "시작 경로를 먼저 보여 주고 상세 분석은 필요할 때 확인하도록 구성했습니다.")),
      step(".study-start-card", t("Empieza por aquí", "Start here", "여기서 시작하세요"), t("Sigue estas acciones iniciales para construir una base antes de simular.", "Follow these starter actions to build a foundation before simulating.", "시뮬레이션 전 기초를 만들기 위해 시작 활동을 따르세요.")),
      step(".study-language-spaces", t("Idiomas separados", "Separate language spaces", "분리된 언어 공간"), t("Inglés y coreano tienen navegación, pruebas, progreso y materiales independientes.", "English and Korean have independent navigation, tests, progress and materials.", "영어와 한국어는 각각 별도의 탐색, 시험, 진행도와 자료를 가집니다.")),
      step(".learning-quick-trigger", t("Tu aprendizaje, a mano", "Your learning, at hand", "언제든 학습 요약"), t("El botón del libro y el tulipán, encima de la entrevista, abre tu racha y siguiente recomendación cuando quieras consultarlas.", "The book and tulip button above the interview opens your streak and next recommendation whenever you want to check them.", "면접 버튼 위 책과 튤립을 누르면 연속 학습 기록과 다음 추천을 확인할 수 있습니다.")),
      step(".study-support-drawer", t("Detalle bajo demanda", "Detail on demand", "필요할 때 세부 정보"), t("El análisis y los materiales personalizados se abren solo cuando quieres consultarlos.", "Analysis and personalised materials open only when you want to review them.", "분석과 맞춤 자료는 확인하고 싶을 때만 펼쳐집니다.")),
      step(".study-practice-labs", t("Aplicación práctica", "Applied practice", "응용 연습"), t("Después de construir la base puedes pasar a la candidatura escrita y la entrevista.", "After building the foundation, move on to the written application and interview.", "기초를 만든 뒤 서면 지원과 면접 연습으로 넘어갑니다.")),
    ],
  };
  if (pathname === "/checklist") return {
    key: "documents", title: t("Tu ruta documental", "Your document path", "서류 준비 경로"), steps: [
      step(".page-header", t("Preparación sin subir archivos", "Prepare without uploading files", "파일 업로드 없이 준비"), t("Organiza el estado de cada requisito; la convocatoria vigente siempre tiene prioridad.", "Track each requirement's status; the current guidelines always take priority.", "각 요건의 상태를 정리하며 최신 모집 요강이 항상 우선합니다.")),
      step(".checklist-progress", t("Progreso local", "Local progress", "기기 내 진행도"), t("El contador cambia cuando marcas documentos y permanece únicamente en este dispositivo.", "The counter changes as documents are checked and stays only on this device.", "서류를 체크하면 수치가 바뀌며 이 기기에만 저장됩니다.")),
      step(".document-route__heading", t("De lo sencillo a lo complejo", "From simple to complex", "쉬운 것부터 복잡한 것까지"), t("Empieza con borradores propios y deja para después las solicitudes, apostillas, traducciones y pruebas externas.", "Start with your own drafts, then move to requests, apostilles, translations and external tests.", "직접 작성할 초안부터 시작하고 발급, 아포스티유, 번역과 외부 시험은 이후에 준비하세요.")),
      step(".document-stage", t("Etapas bajo demanda", "Stages on demand", "필요할 때 여는 단계"), t("Solo la etapa actual empieza abierta; las demás se despliegan cuando decides trabajarlas.", "Only the current stage starts open; expand the others when you decide to work on them.", "현재 단계만 먼저 열리며 다른 단계는 필요할 때 펼칠 수 있습니다.")),
    ],
  };
  if (pathname === "/profile") return {
    key: "profile", title: t("Tu perfil de preparación", "Your preparation profile", "준비 프로필"), steps: [
      step(".profile-hero", t("Datos base", "Core details", "기본 정보"), t("Nacionalidad y carreras objetivo orientan la ruta personalizada.", "Citizenship and target majors guide the personalised route.", "국적과 목표 전공이 개인화된 경로를 안내합니다.")),
      step(".profile-score", t("Preparación actual", "Current preparation", "현재 준비도"), t("Este avance resume acciones completadas; no predice la selección GKS.", "This progress summarises completed actions; it does not predict GKS selection.", "완료한 행동을 요약하며 GKS 선발을 예측하지 않습니다.")),
      step(".profile-fields", t("Datos base y niveles orientativos", "Core details and indicative levels", "기본 정보와 참고 수준"), t("Nacionalidad y carreras son datos base predefinidos. B1/B2 y TOPIK I son puntos de partida previstos; con resultados, los niveles se estiman mediante las prácticas internas y no son certificaciones.", "Citizenship and majors are preset core details. B1/B2 and TOPIK I are planned starting points; results provide internal practice estimates, not certifications.", "국적과 전공은 사전 설정된 기본 정보입니다. B1/B2와 TOPIK I은 예정된 출발점이며 이후 수준은 내부 연습 결과에 따른 참고값으로 공인 인증이 아닙니다.")),
      step(".profile-cycle", t("Ciclo objetivo", "Target cycle", "목표 연도"), t("Mantén visible el ciclo previsto y consulta el radar oficial antes de aplicar.", "Keep the intended cycle visible and check the official radar before applying.", "목표 연도를 확인하고 지원 전 공식 레이더를 확인하세요.")),
    ],
  };
  return {
    key: "home", title: t("Bienvenida a LearnV", "Welcome to LearnV", "LearnV에 오신 것을 환영합니다"), steps: [
      step(".hero-grid", t("Tu punto de partida", "Your starting point", "시작점"), t("Resume la ruta GKS y te lleva directamente a una sesión educativa.", "It summarises the GKS route and takes you directly to a learning session.", "GKS 경로를 요약하고 바로 학습 세션으로 안내합니다.")),
      step(".home-today", t("Tu siguiente paso", "Your next step", "다음 단계"), t("La primera tarea pendiente aparece destacada y el resto del plan queda disponible. Si terminas todas, verás el plan completado y podrás seguir practicando.", "Your first unfinished task is highlighted and the rest of the plan stays available. When all are done, the completed plan offers further practice.", "첫 미완료 과제를 강조하고 나머지 계획도 확인할 수 있습니다. 모두 마치면 완료 상태와 추가 연습을 안내합니다.")),
      step(".learning-journey", t("Avance y recomendación", "Progress and recommendation", "진행 상황과 추천"), t("Después de la acción principal verás tu constancia y la recomendación que mejor encaja con tu progreso.", "After the main action, you will see your consistency and the recommendation that best fits your progress.", "주요 활동 다음에는 학습 지속 기록과 진행 상황에 맞는 추천을 확인할 수 있습니다.")),
      step(".alert-card", t("Estado de la beca", "Scholarship status", "장학금 상태"), t("Abre el radar para distinguir información vigente de referencias históricas.", "Open the radar to separate current information from historical reference.", "레이더에서 최신 정보와 과거 참고 자료를 구분하세요.")),
      step(".bottom-nav", t("Menú siempre disponible", "Always-available menu", "항상 보이는 메뉴"), isLearningQa ? t("Esta versión QA permite navegar entre Inicio y Estudio. Incluye las prácticas, los materiales y el chatbot de entrevista.", "This QA version includes Home and Study, with practice, materials and the interview chatbot.", "QA 버전에서는 홈과 학습, 연습 문제, 자료와 면접 챗봇을 사용할 수 있습니다.") : t("Cambia entre Inicio, Beca, Estudiar, Documentos y Perfil desde cualquier punto.", "Move among Home, Scholarship, Study, Documents and Profile from anywhere.", "어디서든 홈, 장학금, 학습, 서류와 프로필로 이동합니다.")),
    ],
  };
}

const learningAccess = step(".learning-quick-trigger", t("Tu aprendizaje, a mano", "Your learning, at hand", "언제든 학습 요약"), t("El libro y el tulipán abren tu racha, sesiones, minutos y siguiente recomendación. Se cierra con X, Escape o al pulsar fuera; no modifica tus resultados.", "The book and tulip open your streak, sessions, minutes and next recommendation. Close with X, Escape or an outside click; results stay unchanged.", "책과 튤립에서 연속 학습, 세션, 시간과 다음 추천을 확인하세요. X, Esc 또는 바깥 클릭으로 닫으며 결과는 바뀌지 않습니다."));
const interviewAccess = step(".interview-chat-launcher", t("Entrevista a petición", "Interview on demand", "필요할 때 면접 연습"), t("El bocadillo abre el chat de entrevista. Elige idioma, responde y revisa el informe. Sus preguntas, tiempo y puntuación son práctica de LearnV, no criterios oficiales de GKS.", "The speech bubble opens interview chat. Choose a language, answer and review the report. Questions, timing and scores are LearnV practice, not official GKS criteria.", "말풍선에서 면접 채팅을 여세요. 언어를 고르고 답한 뒤 보고서를 보세요. 질문, 시간과 점수는 LearnV 연습이며 GKS 공식 기준이 아닙니다."));

const writingHelp = t("Escribe tu respuesta según las instrucciones y el mínimo indicado. Revisa el borrador y marca solo los criterios que cumple; no se guarda al salir de esta práctica.", "Write to the instructions and stated minimum. Review the draft and tick only criteria it meets; it is not saved when leaving this practice.", "지시와 표시된 최소 분량에 맞게 쓰세요. 초안을 검토하고 충족한 기준만 체크하세요. 이 연습을 나가면 초안은 저장되지 않습니다.");
const listeningHelp = t("Escucha el audio o el tramo indicado y comprueba las evidencias. La transcripción sirve de apoyo: leerla sin escuchar permite practicar, pero no verifica comprensión auditiva para desbloquear la ruta.", "Listen to the audio or stated excerpt and check evidence. The transcript supports practice; reading it without listening does not verify listening for path unlocks.", "오디오나 지정 구간을 듣고 근거를 확인하세요. 대본만 읽어 연습할 수 있지만 듣기 수행 확인이나 경로 잠금 해제에는 충분하지 않습니다.");
const speakingHelp = t("Graba, detén y escucha tu voz antes de confirmar la revisión. Practicar sin grabar permite continuar las preguntas, pero no verifica la producción necesaria para desbloquear la siguiente actividad.", "Record, stop and listen back before confirming review. Practising without recording allows questions but does not verify production needed to unlock the next activity.", "녹음하고 정지한 뒤 다시 들어 검토를 확인하세요. 녹음 없이 문항 연습은 가능하지만 다음 활동을 여는 수행 확인은 되지 않습니다.");

/** The same catalogue powers the help summary and the highlighted tour. */
export function getDefinition(pathname: string, context: HelpContext = {}): TourDefinition {
  const base = baseDefinition(pathname);
  let steps = [...base.steps];
  if (/^\/tests\/(en|ko)\/.+/.test(pathname)) {
    if (context.practice === "result") {
      steps = [
        step(".result-hero", t("Resultado de práctica", "Practice result", "연습 결과"), t("La puntuación y la producción verificada determinan la aprobación. No es una certificación de idioma ni una predicción de admisión.", "Score and verified production determine passing. This is not language certification or an admission prediction.", "점수와 수행 확인으로 통과를 판단합니다. 공인 어학 인증이나 합격 예측이 아닙니다.")),
        step(".production-review", t("Revisa tu producción", "Review your production", "수행 검토"), t("Contrasta tu evidencia con la tarea y las comprobaciones que marcaste. No se suben grabaciones ni respuestas personales.", "Compare your evidence with the task and checked criteria. Recordings and personal answers are not uploaded.", "수행 증거를 과제와 체크한 기준에 대조하세요. 녹음과 개인 답변은 업로드되지 않습니다.")),
        step(".answer-review", t("Aprende del feedback", "Learn from feedback", "피드백으로 학습"), t("Abre cada respuesta para revisar explicación, ejemplo y mejora. El resultado conservado es el mejor de tus intentos.", "Expand answers for explanations, examples and improvements. Your best attempt result is kept.", "각 답을 펼쳐 설명, 예시와 개선점을 보세요. 응시 중 최고 결과를 보존합니다.")),
        step(".result-actions", t("Decide el siguiente paso", "Choose the next step", "다음 단계 선택"), t("Repite para mejorar, vuelve al mapa o abre la siguiente actividad si se ha desbloqueado. El reintento no borra tu mejor resultado.", "Repeat, return to the map or open the next activity if unlocked. Retaking does not erase your best result.", "재응시하거나 지도로 돌아가세요. 열렸다면 다음 활동을 시작하세요. 재응시는 최고 결과를 지우지 않습니다.")),
      ];
    } else if (context.practice === "questions") {
      steps = [
        step(".session-topbar", t("Avance y tiempo", "Progress and time", "진행과 시간"), context.retake
          ? t("Estás en un reintento: el tiempo corre durante las preguntas y sigue corriendo mientras consultas la ayuda. Si llega a cero, se evalúa lo respondido.", "This is a retake: time runs during questions and keeps running while help is open. At zero, submitted answers are graded.", "재응시 문항의 시간은 도움말을 열어도 계속 흐릅니다. 0이 되면 응답한 내용으로 채점합니다.")
          : t("El primer intento no tiene cronómetro. Avanza a tu ritmo; el resultado se registra al terminar.", "The first attempt is untimed. Work at your pace; the result is recorded at the end.", "첫 응시는 시간제한이 없습니다. 내 속도로 풀고 마지막에 결과를 기록합니다.")),
        step(".question-stage", t("Responde y revisa", "Answer and review", "답하고 검토하기"), t("Elige una opción: después queda bloqueada y aparece feedback con explicación, ejemplo y una transferencia. Revisa antes de seguir.", "Choose an option: it then locks and feedback shows an explanation, example and transfer task. Review before continuing.", "선택하면 답이 잠기고 설명, 예시와 응용 과제가 나타납니다. 검토한 뒤 계속하세요.")),
        step(".session-action-bar", t("Continúa o termina", "Continue or finish", "계속 또는 완료"), t("Selecciona una respuesta para activar el botón. La última pregunta muestra el resultado; no basta acertar si la producción no quedó verificada.", "Select an answer to enable the button. The last question opens results; correct answers alone do not replace verified production.", "답을 선택하면 버튼이 켜집니다. 마지막 문항 후 결과를 보며 정답만으로 수행 확인을 대체할 수 없습니다.")),
      ];
    } else {
      steps[0] = step(".session-topbar", t("Intento y cronómetro", "Attempt and timer", "응시와 타이머"), t("El primer intento es sin tiempo. Desde el segundo, el cronómetro empieza al pasar de la tarea a las preguntas, no mientras preparas la producción.", "The first attempt is untimed. From the second, timing starts when moving from the task to questions, not during production preparation.", "첫 응시는 시간제한이 없습니다. 두 번째부터 수행 과제를 마치고 문항으로 넘어갈 때 시간이 시작됩니다."));
      steps[1] = step(".production-stage", t("Prepara la evidencia", "Prepare your evidence", "수행 근거 준비"), context.mode === "listening" ? listeningHelp : context.mode === "speaking" ? speakingHelp : writingHelp);
    }
  }
  if (/^\/study\/(english|korean)$/.test(pathname)) {
    if (context.phase === "advanced") {
      const total = ADVANCED_TESTS_PER_SKILL * practiceSkills.length;
      steps = steps.map((item) => item.selector === ".test-track-card" ? step(item.selector, t("Reto avanzado", "Advanced challenge", "심화 도전"), t(`Esta tarjeta abre ${total} actividades avanzadas: ${ADVANCED_TESTS_PER_SKILL} por habilidad. Es práctica interna; no certifica C1 ni equivale a un grado TOPIK.`, `This card opens ${total} advanced activities: ${ADVANCED_TESTS_PER_SKILL} per skill. It is internal practice, not C1 certification or a TOPIK grade.`, `이 카드는 기능별 ${ADVANCED_TESTS_PER_SKILL}개씩 총 ${total}개 심화 활동을 엽니다. 내부 연습이며 C1 인증이나 TOPIK 등급이 아닙니다.`)) : item);
    }
    if (context.introOpen) {
      const index = steps.findIndex((item) => item.selector === ".learning-restart") + 1;
      steps.splice(index, 0,
        step(".learning-restart__toolbar", t("Ayudas y avance separados", "Separate help and progress", "별도의 도움말과 진도"), t("Elige español, inglés o coreano para las ayudas. El 0/3 corresponde al repaso y no aprueba pruebas de la ruta.", "Choose Spanish, English or Korean for help. The refresher's 0/3 does not pass path tests.", "도움말을 스페인어, 영어 또는 한국어로 고르세요. 복습의 0/3은 경로 시험 통과와 별도입니다.")),
        step(".learning-restart__exercise", t("Aprende, prueba y aplica", "Learn, try and apply", "익히고 연습해 적용하기"), t("Lee la ficha y el ejemplo, elige una respuesta y compruébala. Al acertar aparece el enlace a la actividad real donde volverás a usar esa herramienta.", "Read the tool and example, choose an answer and check it. A correct answer reveals a link to the real activity that reuses the tool.", "도구와 예시를 읽고 답을 고른 뒤 확인하세요. 정답이면 같은 도구를 쓰는 실제 활동 링크가 나타납니다.")));
    }
  }
  if (/^\/tests\/(en|ko)$/.test(pathname)) {
    steps.push(step(".advanced-path-notice", t("Etapa y requisitos", "Phase and requirements", "단계와 요건"), context.phase === "advanced"
      ? t("El reto avanzado tiene 18 actividades y pide 80 % más producción verificada. Puedes volver a repasar la ruta inicial. En coreano, C1 es una dificultad interna, no un grado TOPIK.", "Advanced practice has 18 activities and requires 80% plus verified production. You can revisit foundation practice. Korean C1 is an internal difficulty, not a TOPIK grade.", "심화 단계는 18개 활동이며 80%와 수행 확인이 필요합니다. 기초 경로를 다시 볼 수 있습니다. 한국어 C1은 내부 난도이며 TOPIK 등급이 아닙니다.")
      : t("La ruta inicial pide 70 % más producción verificada. Al aprobarla completa se activa el reto avanzado; cambiar de habilidad no salta los bloqueos.", "Foundation practice requires 70% plus verified production. Passing the entire path activates advanced practice; changing skills does not bypass locks.", "기초 단계는 70%와 수행 확인이 필요합니다. 전체 통과 후 심화 단계가 열리며 기능 변경으로 잠금을 건너뛸 수 없습니다.")));
  }
  if (pathname === "/study/interviews") {
    steps.splice(1,0,
      step(".interview-learning-bridge", t("Conecta materiales y chat", "Connect materials and chat", "자료와 채팅 연결"), t("Usa las dos acciones para repasar el foco recomendado o practicarlo con el entrevistador del chat.", "Use the two actions to review the recommended focus or practise it with the chat interviewer.", "두 버튼으로 추천 주제를 복습하거나 면접 채팅에서 연습하세요.")),
      step(".interview-preparation", t("Material 2027 y alcance", "2027 material and scope", "2027 자료와 범위"), t("Las fichas conectan tu experiencia con Personal Statement, Study Plan y University Information 2027. Revisa sus fuentes; las preguntas y los tiempos de LearnV no son oficiales.", "Cards connect your experience with the 2027 Personal Statement, Study Plan and University Information. Check the sources; LearnV questions and timings are not official.", "카드에서 경험을 2027 자기소개서, 학업계획서와 대학 정보에 연결하세요. 출처를 확인하며 LearnV 질문과 시간은 공식 기준이 아닙니다.")));
    steps[steps.findIndex((item) => item.selector === ".interview-simulator")] = step(".interview-simulator", t("Notas y práctica personal", "Notes and personal practice", "메모와 개인 연습"), t("Filtra las 12 preguntas, activa si quieres el apoyo de 75 segundos, escribe notas y marca tu autoevaluación. Las notas se guardan localmente por pregunta; este apoyo no es el chat flotante de 90 segundos.", "Filter the 12 questions, optionally use the 75-second aid, write notes and self-assess. Notes save locally per question; this is separate from the floating chat's 90-second aid.", "12개 질문을 필터하고 필요하면 75초 도구로 연습하세요. 질문별 메모와 자기 점검은 기기에 저장하며, 90초 면접 채팅과 별개입니다."));
  }
  if (pathname === "/study/written-simulator") {
    const stage = context.written ?? "intro";
    const content: Record<WrittenSimulatorStep, [LocalizedText, LocalizedText]> = {
      intro: [t("Elige idioma y empieza", "Choose a language and start", "언어 선택 후 시작"), t("Elige inglés o coreano. Al empezar se activa un apoyo de 45 minutos; no es un tiempo oficial de GKS. Los borradores se guardan en este navegador.", "Choose English or Korean. Starting activates a 45-minute aid, not an official GKS limit. Drafts save in this browser.", "영어나 한국어를 고르세요. 시작하면 공식 GKS 시간이 아닌 45분 연습 시간이 켜집니다. 초안은 이 브라우저에 저장합니다.")],
      knowledge: [t("Criterios de candidatura", "Application criteria", "지원 기준"), t("Responde las cinco decisiones y lee la explicación de cada una. Contesta todas para continuar a la redacción.", "Answer the five decisions and read each explanation. Answer all to continue to writing.", "다섯 판단 문항과 설명을 확인하세요. 모두 답해야 작성 단계로 이동합니다.")],
      personal: [t("Personal Statement", "Personal Statement", "자기소개서"), t("Escribe el borrador siguiendo la consigna y el contador de caracteres visible. Puedes volver a la etapa anterior; el límite del simulador no sustituye comprobar el formulario vigente.", "Follow the prompt and visible character counter. You can return to the previous step; the simulator limit does not replace checking the current form.", "지시와 글자 수를 확인해 초안을 쓰세요. 이전 단계로 돌아갈 수 있으며 실제 지원에는 최신 서식을 확인해야 합니다.")],
      plan: [t("Study Plan", "Study Plan", "학업계획서"), t("Conecta idiomas, objetivo académico y plan futuro. Revisa el contador y la coherencia con tu Personal Statement antes de seguir.", "Connect languages, academic goals and future plans. Check the counter and consistency with your Personal Statement before continuing.", "언어, 학업 목표와 향후 계획을 연결하세요. 글자 수와 자기소개서의 일관성을 확인한 뒤 계속하세요.")],
      review: [t("Revisión antes del resultado", "Review before results", "결과 전 검토"), t("Marca solo los criterios que has comprobado en tus borradores. Finalizar calcula una puntuación interna y conserva el trabajo en este dispositivo; no envía una solicitud.", "Tick only criteria checked in your drafts. Finishing calculates an internal score and keeps work on this device; it does not submit an application.", "초안에서 확인한 기준만 체크하세요. 완료는 내부 점수를 계산하고 이 기기에 보존하며 지원서를 제출하지 않습니다.")],
      result: [t("Informe y nueva práctica", "Report and new practice", "보고서와 다음 연습"), t("Revisa el desglose, la coherencia y tus borradores. Volver a intentar borra el trabajo del simulador; no borra tus otras rutas. La puntuación no predice una selección GKS.", "Review the breakdown, consistency and drafts. Retry clears simulator work, not other paths. The score does not predict GKS selection.", "세부 점수, 일관성과 초안을 보세요. 다시 시도하면 시뮬레이터 작업만 지우며 다른 경로는 유지합니다. GKS 선발을 예측하지 않습니다.")],
    };
    steps = [base.steps[0],base.steps[1],step(stage === "result" ? ".written-result" : ".written-stage", ...content[stage])];
    if (context.timerRunning) steps.splice(2,0,step(".written-session-bar", t("El tiempo sigue activo", "Timing remains active", "시간은 계속 진행"), t("El apoyo de 45 minutos sigue corriendo al abrir esta ayuda o cambiar de pantalla. No se pausa automáticamente.", "The 45-minute aid keeps running when help is opened or you change screens. It does not automatically pause.", "도움말을 열거나 화면을 바꿔도 45분 연습 시간은 자동으로 멈추지 않습니다.")));
  }
  if (pathname === "/profile") steps.splice(3,0,step(".profile-page .learning-journey", t("Tu aprendizaje completo", "Your complete learning summary", "전체 학습 요약"), t("Conserva racha, sesiones, minutos, habilidades trabajadas y siguiente recomendación. Comparte los datos locales con el acceso flotante; no es una evaluación oficial.", "See streaks, sessions, minutes, practised skills and the next recommendation. This shares local data with the floating access and is not an official assessment.", "연속 학습, 세션, 시간, 연습한 기능과 다음 추천을 보세요. 플로팅 버튼과 기기 내 데이터를 공유하며 공식 평가가 아닙니다.")));
  if (pathname === "/") steps.splice(2,0,step(".story-shelf", t("Tus dos espacios de idioma", "Your two language spaces", "두 언어 학습 공간"), t("Los libros abren inglés y coreano. Dentro de cada espacio encontrarás primero el repaso breve B1 o TOPIK I y después tu ruta de actividades.", "The books open English and Korean. Each space starts with the short B1 or TOPIK I refresher, followed by your activity path.", "책에서 영어와 한국어 공간을 여세요. 각 공간에는 B1 또는 TOPIK I 짧은 복습과 활동 경로가 있습니다.")));
  steps = steps.filter((item) => !(isLearningQa && item.selector === ".alert-card"));
  steps = steps.map((item) => item.selector === learningAccess.selector ? learningAccess : item);
  if (!steps.some((item) => item.selector === learningAccess.selector)) steps.push(learningAccess);
  steps.push(step(".library-quick-trigger", t("Tu biblioteca de lectura", "Your reading library", "나의 읽기 도서관"), t("El botón de los libros, entre el resumen de aprendizaje y la entrevista, abre lecturas en inglés y coreano. Busca o filtra por tema. Cada portada abre directamente el texto en otra pestaña y conserva tu sesión aquí.", "The books button between your learning summary and interview opens English and Korean readings. Search or filter by topic. Each cover opens the text directly in another tab while keeping this session.", "학습 요약과 면접 사이 책 버튼에서 영어·한국어 자료를 여세요. 제목 검색과 주제 필터를 사용할 수 있습니다. 표지를 누르면 새 탭에서 원문을 열며 현재 학습 세션은 유지됩니다.")));
  if (!isImmersiveLearningRoute(pathname)) steps.push(interviewAccess);
  return { ...base, steps };
}
