import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import type { Locale, LocalizedText } from "@/domain/models/i18n";
import { localize } from "@/domain/models/i18n";

type TourStep = { selector: string; title: LocalizedText; text: LocalizedText };
type TourDefinition = { key: string; title: LocalizedText; steps: TourStep[] };
type HighlightRect = { top: number; left: number; width: number; height: number };

const t = (es: string, en: string, ko: string): LocalizedText => ({ es, en, ko });
const step = (selector: string, title: LocalizedText, text: LocalizedText): TourStep => ({ selector, title, text });
const STORAGE_KEY = "learnv-section-tours-v1";

function getDefinition(pathname: string): TourDefinition {
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
      step(".test-skill-tabs", t("Tres habilidades", "Three skills", "세 가지 기능"), t("Cambia entre Escritura, Listening y Pronunciación sin recorrer una página interminable.", "Switch between Writing, Listening and Pronunciation without a very long page.", "긴 페이지를 이동하지 않고 쓰기, 듣기와 발음을 전환합니다.")),
      step(".test-skill-section", t("Avance procedural", "Procedural progress", "단계별 진행"), t("Completa la prueba disponible para abrir la siguiente. Puedes repetir cualquier etapa desbloqueada.", "Complete the available test to unlock the next one. Any unlocked stage can be repeated.", "현재 시험을 완료하면 다음 단계가 열립니다. 열린 단계는 다시 연습할 수 있습니다.")),
    ],
  };
  if (/^\/study\/(english|korean)$/.test(pathname)) return {
    key: pathname.endsWith("english") ? "english-space" : "korean-space", title: t("Tu espacio de idioma", "Your language space", "언어 학습 공간"), steps: [
      step(".language-study-hero", t("Resumen del espacio", "Space summary", "학습 공간 요약"), t("Aquí ves el objetivo, las pruebas superadas y los recursos disponibles para este idioma.", "See the target, passed tests and available resources for this language.", "이 언어의 목표, 통과한 시험과 사용 가능한 자료를 확인합니다.")),
      step(".language-study-jump-nav", t("Navegación rápida", "Quick navigation", "빠른 이동"), t("El sombreado sigue la sección visible: pruebas o materiales. También puedes cambiar de idioma.", "The highlight follows the visible section: tests or materials. You can also switch language.", "현재 보이는 시험 또는 자료 메뉴가 강조됩니다. 언어도 바꿀 수 있습니다.")),
      step(".test-hub", t("Prácticas guiadas", "Guided practice", "안내형 연습"), t("Abre el recorrido de 60 actividades: veinte por cada habilidad.", "Open the 60-activity path: twenty for each skill.", "기능별 20개씩 총 60개 활동 경로를 엽니다.")),
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
    key: "scholarship", title: t("Entender el apartado Beca", "Understanding Scholarship", "장학금 메뉴 이해"), steps: [
      step(".page-header--gks", t("Información sin rumores", "Information without rumours", "소문 없는 정보"), t("Este apartado separa convocatoria, país y ruta de aplicación para España.", "This area separates call, country and application route information for Spain.", "스페인 지원자를 위해 모집, 국가와 지원 경로 정보를 구분합니다.")),
      step(".gks-daily-radar", t("Radar diario", "Daily radar", "일일 레이더"), t("Prioriza el estado más reciente, la siguiente acción y las fuentes oficiales revisadas.", "It prioritises the latest status, next action and checked official sources.", "최신 상태, 다음 행동과 확인한 공식 출처를 우선 표시합니다.")),
      step(".gks-video-slider", t("Videos de orientación", "Guidance videos", "안내 영상"), t("Elige entre tres videos relacionados. YouTube solo se carga cuando pulsas reproducir.", "Choose among three related videos. YouTube loads only when you press play.", "관련 영상 세 개 중 선택하세요. 재생할 때만 YouTube가 로드됩니다.")),
      step(".gks-details", t("Detalles bajo demanda", "Details on demand", "필요할 때 세부 정보"), t("Despliega únicamente requisitos, programas o fuentes que necesites consultar.", "Expand only the requirements, programmes or sources you need.", "필요한 요건, 프로그램이나 출처만 펼쳐 보세요.")),
    ],
  };
  if (pathname === "/study") return {
    key: "study", title: t("Todo lo que puedes estudiar", "Everything you can study", "학습할 수 있는 모든 것"), steps: [
      step(".page-header--study", t("Centro de preparación", "Preparation centre", "준비 센터"), t("Reúne idiomas, recursos, entrevistas y simulación escrita en una sola ruta.", "It brings languages, resources, interviews and written simulation into one route.", "언어, 자료, 면접과 서면 시뮬레이션을 한 경로에 모았습니다.")),
      step(".study-start-card", t("Empieza por aquí", "Start here", "여기서 시작하세요"), t("Sigue estas tres acciones iniciales para construir una base antes de simular.", "Follow these three starter actions to build a foundation before simulating.", "시뮬레이션 전 기초를 만들기 위해 세 가지 시작 활동을 따르세요.")),
      step(".study-language-spaces", t("Idiomas separados", "Separate language spaces", "분리된 언어 공간"), t("Inglés y coreano tienen navegación, pruebas, progreso y materiales independientes.", "English and Korean have independent navigation, tests, progress and materials.", "영어와 한국어는 각각 별도의 탐색, 시험, 진행도와 자료를 가집니다.")),
      step(".written-entry", t("Candidatura escrita", "Written application", "서면 지원"), t("Practica Personal Statement y Study Plan sin confundirlo con un examen oficial.", "Practise the Personal Statement and Study Plan without treating it as an official exam.", "공식 시험과 혼동하지 않고 자기소개서와 학업계획서를 연습합니다.")),
      step(".interview-entry", t("Entrevistas", "Interviews", "면접"), t("Entrena respuestas con tiempo, evidencia, repreguntas y autoevaluación.", "Train timed, evidence-based answers, follow-ups and self-review.", "시간, 근거, 추가 질문과 자기 검토로 답변을 연습합니다.")),
    ],
  };
  if (pathname === "/checklist") return {
    key: "documents", title: t("Preparar documentos", "Preparing documents", "서류 준비"), steps: [
      step(".page-header", t("Checklist de referencia", "Reference checklist", "참고 체크리스트"), t("Organiza documentos habituales; siempre prevalece la convocatoria vigente.", "It organises common documents; the current call always takes precedence.", "일반적인 서류를 정리하며 최신 모집 요강이 항상 우선합니다.")),
      step(".checklist-progress", t("Progreso local", "Local progress", "기기 내 진행도"), t("El contador cambia cuando marcas documentos y permanece únicamente en este dispositivo.", "The counter changes as documents are checked and stays only on this device.", "서류를 체크하면 수치가 바뀌며 이 기기에만 저장됩니다.")),
      step(".document-list", t("Qué preparar", "What to prepare", "준비할 내용"), t("Cada tarjeta explica el documento, su prioridad y las acciones relacionadas.", "Each card explains the document, priority and related actions.", "각 카드에 서류, 우선순위와 관련 행동이 설명되어 있습니다.")),
    ],
  };
  if (pathname === "/profile") return {
    key: "profile", title: t("Tu perfil de preparación", "Your preparation profile", "준비 프로필"), steps: [
      step(".profile-hero", t("Datos base", "Core details", "기본 정보"), t("Nacionalidad y carreras objetivo orientan la ruta personalizada.", "Citizenship and target majors guide the personalised route.", "국적과 목표 전공이 개인화된 경로를 안내합니다.")),
      step(".profile-score", t("Preparación actual", "Current preparation", "현재 준비도"), t("Este avance resume acciones completadas; no predice la selección GKS.", "This progress summarises completed actions; it does not predict GKS selection.", "완료한 행동을 요약하며 GKS 선발을 예측하지 않습니다.")),
      step(".profile-fields", t("Información validada", "Validated information", "확인된 정보"), t("Los niveles de idioma se actualizan con evidencia de práctica, no con una etiqueta automática.", "Language levels update from practice evidence, not an automatic label.", "언어 수준은 자동 라벨이 아니라 연습 근거로 갱신됩니다.")),
      step(".profile-cycle", t("Ciclo objetivo", "Target cycle", "목표 연도"), t("Mantén visible el ciclo previsto y consulta el radar oficial antes de aplicar.", "Keep the intended cycle visible and check the official radar before applying.", "목표 연도를 확인하고 지원 전 공식 레이더를 확인하세요.")),
    ],
  };
  return {
    key: "home", title: t("Bienvenida a LearnV", "Welcome to LearnV", "LearnV에 오신 것을 환영합니다"), steps: [
      step(".hero-grid", t("Tu punto de partida", "Your starting point", "시작점"), t("Resume la ruta GKS y te lleva directamente a una sesión educativa.", "It summarises the GKS route and takes you directly to a learning session.", "GKS 경로를 요약하고 바로 학습 세션으로 안내합니다.")),
      step(".alert-card", t("Estado de la beca", "Scholarship status", "장학금 상태"), t("Abre el radar para distinguir información vigente de referencias históricas.", "Open the radar to separate current information from historical reference.", "레이더에서 최신 정보와 과거 참고 자료를 구분하세요.")),
      step(".section-block", t("Plan de hoy", "Today's plan", "오늘의 계획"), t("Tres tareas breves conectan directamente con materiales y prácticas. Márcalas al terminar.", "Three short tasks link directly to materials and practice. Check them when finished.", "짧은 세 과제가 자료와 연습으로 연결됩니다. 완료 후 체크하세요.")),
      step(".bottom-nav", t("Menú siempre disponible", "Always-available menu", "항상 보이는 메뉴"), t("Cambia entre Inicio, Beca, Estudiar, Documentos y Perfil desde cualquier punto.", "Move among Home, Scholarship, Study, Documents and Profile from anywhere.", "어디서든 홈, 장학금, 학습, 서류와 프로필로 이동합니다.")),
    ],
  };
}

function readSeenTours(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function SectionTour() {
  const { pathname } = useLocation();
  const definition = useMemo(() => getDefinition(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [rect, setRect] = useState<HighlightRect | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const [tourLocale, setTourLocale] = useState<Locale>("es");
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const frozenScrollRef = useRef({ x: 0, y: 0 });
  const contentHeightRef = useRef(0);

  const startTour = useCallback(() => {
    const available = definition.steps.filter((item) => document.querySelector(item.selector));
    if (available.length === 0) return;
    setSteps(available);
    setStepIndex(0);
    setTargetReady(false);
    setTourLocale("es");
    setOpen(true);
  }, [definition]);

  const closeTour = useCallback(() => {
    const seen = readSeenTours();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...seen, [definition.key]: true }));
    setOpen(false);
    setRect(null);
    setTargetReady(false);
  }, [definition.key]);

  useEffect(() => {
    setOpen(false);
    setRect(null);
    setTargetReady(false);
    const timer = window.setTimeout(() => {
      if (!readSeenTours()[definition.key]) startTour();
    }, 950);
    return () => window.clearTimeout(timer);
  }, [definition.key, startTour]);

  useEffect(() => {
    const restart = () => startTour();
    window.addEventListener("learnv:start-tour", restart);
    return () => window.removeEventListener("learnv:start-tour", restart);
  }, [startTour]);

  useLayoutEffect(() => {
    if (!open) return;
    const appRoot = document.getElementById("root");
    const lockedScrollX = window.scrollX;
    const lockedScrollY = window.scrollY;
    frozenScrollRef.current = { x: lockedScrollX, y: lockedScrollY };
    contentHeightRef.current = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const previousHtmlStyles = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
      touchAction: document.documentElement.style.touchAction,
      height: document.documentElement.style.height,
    };
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      right: document.body.style.right,
      left: document.body.style.left,
      width: document.body.style.width,
      height: document.body.style.height,
      overflow: document.body.style.overflow,
      overscrollBehavior: document.body.style.overscrollBehavior,
      touchAction: document.body.style.touchAction,
    };
    document.documentElement.classList.add("section-tour-lock");
    document.body.classList.add("section-tour-lock");
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.documentElement.style.touchAction = "none";
    document.documentElement.style.height = "100%";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.right = "0";
    document.body.style.left = "0";
    document.body.style.width = "100%";
    document.body.style.height = "auto";
    document.body.style.overflow = "visible";
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "none";
    appRoot?.setAttribute("inert", "");
    nextButtonRef.current?.focus();

    const blockBackgroundMovement = (event: Event) => {
      event.preventDefault();
    };
    const blockBackgroundPointer = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".section-tour__card")) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const blockTouchPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") blockBackgroundMovement(event);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const activatesControl = event.key === " " && event.target instanceof HTMLElement && event.target.matches("button, a");
      if (!activatesControl && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) event.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("wheel", blockBackgroundMovement, { capture: true, passive: false });
    document.addEventListener("touchmove", blockBackgroundMovement, { capture: true, passive: false });
    document.addEventListener("pointermove", blockTouchPointerMove, { capture: true, passive: false });
    document.addEventListener("pointerdown", blockBackgroundPointer, true);
    document.addEventListener("click", blockBackgroundPointer, true);
    document.addEventListener("dragstart", blockBackgroundMovement, true);
    document.addEventListener("gesturestart", blockBackgroundMovement, { capture: true, passive: false });
    document.addEventListener("gesturechange", blockBackgroundMovement, { capture: true, passive: false });
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("wheel", blockBackgroundMovement, true);
      document.removeEventListener("touchmove", blockBackgroundMovement, true);
      document.removeEventListener("pointermove", blockTouchPointerMove, true);
      document.removeEventListener("pointerdown", blockBackgroundPointer, true);
      document.removeEventListener("click", blockBackgroundPointer, true);
      document.removeEventListener("dragstart", blockBackgroundMovement, true);
      document.removeEventListener("gesturestart", blockBackgroundMovement, true);
      document.removeEventListener("gesturechange", blockBackgroundMovement, true);
      document.documentElement.classList.remove("section-tour-lock");
      document.body.classList.remove("section-tour-lock");
      document.documentElement.style.overflow = previousHtmlStyles.overflow;
      document.documentElement.style.overscrollBehavior = previousHtmlStyles.overscrollBehavior;
      document.documentElement.style.touchAction = previousHtmlStyles.touchAction;
      document.documentElement.style.height = previousHtmlStyles.height;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.height = previousBodyStyles.height;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior;
      document.body.style.touchAction = previousBodyStyles.touchAction;
      window.scrollTo(lockedScrollX, lockedScrollY);
      appRoot?.removeAttribute("inert");
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !steps[stepIndex]) return;
    const target = document.querySelector<HTMLElement>(steps[stepIndex].selector);
    if (!target) return;
    let cancelled = false;
    let settleTimer = 0;
    setRect(null);
    setTargetReady(false);

    const forcedElements = new Set<HTMLElement>([
      target,
      ...Array.from(target.querySelectorAll<HTMLElement>(".route-reveal-item")),
    ]);
    const revealParent = target.closest<HTMLElement>(".route-reveal-item");
    if (revealParent) forcedElements.add(revealParent);
    forcedElements.forEach((element) => {
      element.classList.add("section-tour-active-target", "is-revealed");
    });

    const nextFrame = () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    const positionTarget = async () => {
      const initialRect = target.getBoundingClientRect();
      const currentY = frozenScrollRef.current.y;
      const targetDocumentTop = currentY + initialRect.top;
      const anchoredToViewport = getComputedStyle(target).position === "fixed";
      const maxScroll = Math.max(0, contentHeightRef.current - window.innerHeight);
      const cardHeight = document.querySelector<HTMLElement>(".section-tour__card")?.getBoundingClientRect().height ?? 230;
      const centeredTop = (window.innerHeight - initialRect.height) / 2;
      const cardWillBeAtTop = centeredTop + initialRect.height > window.innerHeight * 0.58;
      const targetViewportTop = cardWillBeAtTop
        ? Math.max(cardHeight + 28, centeredTop)
        : Math.max(12, Math.min(centeredTop, window.innerHeight - cardHeight - initialRect.height - 28));
      const desiredY = anchoredToViewport
        ? currentY
        : Math.max(0, Math.min(maxScroll, targetDocumentTop - targetViewportTop));

      frozenScrollRef.current = { x: frozenScrollRef.current.x, y: desiredY };
      document.body.style.top = `-${desiredY}px`;

      await nextFrame();
      if (cancelled) return;

      const targetRect = target.getBoundingClientRect();
      const padding = 7;
      const top = Math.max(5, targetRect.top - padding);
      const left = Math.max(5, targetRect.left - padding);
      setRect({
        top,
        left,
        width: Math.min(window.innerWidth - left - 5, targetRect.width + padding * 2),
        height: Math.min(window.innerHeight - top - 5, targetRect.height + padding * 2),
      });
    };

    const waitForVisualTarget = async () => {
      const images = Array.from(target.querySelectorAll<HTMLImageElement>("img"));
      const imagePromises = images.map((image) => {
        if (image.complete) return image.decode?.().catch(() => undefined) ?? Promise.resolve();
        return new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      });
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      await Promise.race([
        Promise.all([fontsReady, ...imagePromises]),
        new Promise<void>((resolve) => { settleTimer = window.setTimeout(resolve, 1500); }),
      ]);
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
      if (cancelled) return;
      await positionTarget();
      await nextFrame();
      if (cancelled) return;
      setTargetReady(true);
      window.requestAnimationFrame(() => nextButtonRef.current?.focus());
    };

    void waitForVisualTarget();
    const handleResize = () => { void positionTarget(); };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelled = true;
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", handleResize);
      forcedElements.forEach((element) => element.classList.remove("section-tour-active-target"));
    };
  }, [open, stepIndex, steps]);

  if (!open || !steps[stepIndex]) return null;
  const current = steps[stepIndex];
  const cardAtTop = Boolean(rect && rect.top + rect.height > window.innerHeight * 0.58);
  const labels = tourLocale === "ko"
    ? { guide: "빠른 안내", language: "설명 언어", skip: "모두 건너뛰기", previous: "이전", next: "다음", finish: "완료", preparing: "화면 준비 중" }
    : tourLocale === "en"
      ? { guide: "Quick tour", language: "Explanation language", skip: "Skip all", previous: "Previous", next: "Next", finish: "Finish", preparing: "Preparing view" }
      : { guide: "Recorrido rápido", language: "Idioma de las explicaciones", skip: "Omitir todo", previous: "Anterior", next: "Siguiente", finish: "Finalizar", preparing: "Preparando vista" };

  return createPortal(
    <div className="section-tour" role="dialog" aria-modal="true" aria-labelledby="section-tour-title">
      {rect && <div key={`${definition.key}-${stepIndex}`} className="section-tour__highlight" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height } as CSSProperties} />}
      <section className={cardAtTop ? "section-tour__card section-tour__card--top" : "section-tour__card"} aria-busy={!targetReady}>
        <div className="section-tour__meta">
          <span>{labels.guide}</span>
          <div className="section-tour__languages" role="group" aria-label={labels.language}>
            {(["es", "en", "ko"] as const).map((language) => <button key={language} type="button" aria-pressed={tourLocale === language} aria-label={language === "es" ? "Español" : language === "en" ? "English" : "한국어"} onClick={() => setTourLocale(language)}>{language === "ko" ? "한" : language.toUpperCase()}</button>)}
          </div>
          <strong>{stepIndex + 1}/{steps.length}</strong>
        </div>
        <div className="section-tour__progress"><i style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
        <small>{localize(definition.title, tourLocale)}</small>
        <h2 id="section-tour-title">{localize(current.title, tourLocale)}</h2>
        <p>{localize(current.text, tourLocale)}</p>
        <div className="section-tour__actions">
          <button type="button" className="section-tour__skip" onClick={closeTour}>{labels.skip}</button>
          {stepIndex > 0 && <button type="button" disabled={!targetReady} onClick={() => setStepIndex((value) => value - 1)}>← {labels.previous}</button>}
          <button ref={nextButtonRef} type="button" className="section-tour__next" disabled={!targetReady} onClick={() => {
            if (!targetReady) return;
            if (stepIndex === steps.length - 1) closeTour();
            else setStepIndex((value) => value + 1);
          }}>{targetReady ? `${stepIndex === steps.length - 1 ? labels.finish : labels.next} →` : `${labels.preparing}…`}</button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
