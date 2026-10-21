import type { TestLanguage } from "@/domain/models/language-test";
import type { RestartLessonId } from "@/domain/models/learning-restart";
import type { Locale } from "@/domain/models/i18n";

type Help = { title: string; lesson: string; question: string; feedback: string; transfer: string };
export type RestartLesson = {
  id: RestartLessonId; example: string; options: readonly string[]; correctIndex: number;
  help: Record<Locale, Help>;
};

/** Original short refreshers, not a complete B1 course or an official TOPIK assessment. */
export const restartLessons: Record<TestLanguage, readonly RestartLesson[]> = {
  en: [
    { id: "meaning", example: "Hi Maya, I used to drive to work, but now I cycle because it is cheaper. Would you like to join me tomorrow? — Alex",
      options: ["Alex has always cycled to work.", "Alex cycles now to save money.", "Alex wants to buy a car tomorrow."], correctIndex: 1,
      help: {
        es: { title: "Comprender un mensaje cotidiano", lesson: "En B1 identificamos la idea principal y su motivo. «Used to» describe un hábito pasado que contrasta con «now»; «because» introduce la razón.", question: "¿Qué afirmación resume correctamente el cambio de Alex?", feedback: "Alex antes conducía y ahora va en bicicleta porque es más barato. «Now I cycle» y «because it is cheaper» son las dos pistas.", transfer: "En tu cuaderno, escribe dos frases sobre un hábito que cambiaste y explica por qué con «because»." },
        en: { title: "Understand an everyday message", lesson: "At B1, identify the main idea and its reason. «Used to» describes a past habit contrasting with «now»; «because» introduces the reason.", question: "Which statement correctly summarises Alex's change?", feedback: "Alex drove before and cycles now to save money. «Now I cycle» and «because it is cheaper» provide the evidence.", transfer: "In your notebook, write two sentences about a habit you changed and give a reason using «because»." },
        ko: { title: "일상 메시지 이해하기", lesson: "B1에서는 중심 내용과 이유를 찾습니다. used to는 과거 습관, now는 현재, because는 이유를 나타냅니다.", question: "알렉스의 변화를 올바르게 요약한 문장은 무엇인가요?", feedback: "전에는 운전했지만 지금은 비용을 줄이려고 자전거를 탑니다. now I cycle과 because it is cheaper가 근거입니다.", transfer: "공책에 바뀐 습관을 두 문장으로 쓰고 because로 이유를 설명하세요." },
      } },
    { id: "form", example: "I have lived in this town since 2022. I moved here in September 2022.",
      options: ["I live here since 2022.", "I have lived here since 2022.", "I have lived here yesterday."], correctIndex: 1,
      help: {
        es: { title: "Conectar pasado y presente", lesson: "Usa present perfect (have/has + participio) para una situación que empezó antes y continúa. «Since» indica el inicio; «for», la duración. Un momento pasado terminado, como «yesterday», normalmente lleva past simple.", question: "Todavía vives allí. ¿Qué frase expresa esa continuidad?", feedback: "«Have lived … since 2022» conecta el comienzo con el presente. «Yesterday» es un momento terminado y no se combina así con present perfect.", transfer: "Escribe cuánto tiempo llevas estudiando inglés: una frase con «since» y otra con «for»." },
        en: { title: "Connect past and present", lesson: "Use present perfect (have/has + past participle) for a situation that began earlier and continues now. «Since» gives a starting point; «for» gives a duration. A finished past time such as «yesterday» normally takes past simple.", question: "You still live there. Which sentence expresses that continuity?", feedback: "«Have lived … since 2022» links the starting point to now. «Yesterday» is a finished time and does not fit this present-perfect sentence.", transfer: "Write how long you have studied English: one sentence with «since» and another with «for»." },
        ko: { title: "과거와 현재 연결하기", lesson: "과거에 시작해 지금도 계속되는 상황에는 현재완료(have/has + 과거분사)를 씁니다. since는 시작점, for는 기간입니다. yesterday처럼 끝난 과거 시점에는 보통 과거형을 씁니다.", question: "지금도 그곳에 산다면 어떤 문장이 맞나요?", feedback: "have lived … since 2022는 시작부터 현재까지 이어집니다. yesterday는 끝난 과거 시점이므로 이 현재완료 문장에 맞지 않습니다.", transfer: "영어를 공부한 기간을 since와 for로 각각 한 문장씩 써 보세요." },
      } },
    { id: "use", example: "You want to change your class time. Your teacher asks you to explain the problem and suggest another time.",
      options: ["Change it. I don't like it.", "I cannot come on Monday because I work. Could we meet on Tuesday instead?", "Tuesday is a day of the week."], correctIndex: 1,
      help: {
        es: { title: "Dar una razón y proponer", lesson: "Una respuesta útil combina problema + razón + propuesta. «Could we …?» permite pedir un cambio con cortesía. En las pruebas largas primero producirás tu propia respuesta y después revisarás criterios y preguntas.", question: "¿Qué respuesta cumple la tarea con claridad y cortesía?", feedback: "La segunda opción explica el problema, aporta una razón y propone el martes con «Could we …?». Las otras omiten información necesaria.", transfer: "Escribe tu propia petición para cambiar una cita, con motivo y propuesta. Compárala con esos tres criterios antes de pasar a la ruta completa." },
        en: { title: "Give a reason and make a suggestion", lesson: "A useful reply combines problem + reason + suggestion. «Could we …?» makes a polite request. In the full path, you first produce your own response, then review criteria and questions.", question: "Which reply completes the task clearly and politely?", feedback: "The second option states the problem, gives a reason and proposes Tuesday using «Could we …?». The other replies omit necessary information.", transfer: "Write your own request to change an appointment, with a reason and an alternative. Check those three criteria before moving to the full path." },
        ko: { title: "이유와 대안 제시하기", lesson: "문제 + 이유 + 대안을 담으면 유용한 답변이 됩니다. Could we …?로 정중하게 요청할 수 있습니다. 전체 경로에서는 먼저 직접 답한 후 기준과 문항을 검토합니다.", question: "과제를 명확하고 정중하게 수행한 답변은 무엇인가요?", feedback: "두 번째 답변은 문제와 이유를 밝히고 Could we …?로 화요일을 제안합니다. 다른 답변에는 필요한 정보가 빠져 있습니다.", transfer: "약속을 바꾸는 요청을 이유와 대안과 함께 직접 써 보세요. 전체 경로로 가기 전에 세 기준으로 검토하세요." },
      } },
  ],
  ko: [
    { id: "meaning", example: "안녕하세요. 저는 민수예요. 학생이에요. 만나서 반가워요.",
      options: ["학생이에요.", "선생님이에요.", "의사예요."], correctIndex: 0,
      help: {
        es: { title: "Leer una presentación sencilla", lesson: "TOPIK I es el examen inicial (niveles 1 y 2). Si ya lees Hangul, retoma frases cortas: 저 = yo, 학생 = estudiante. «저는» presenta el tema y «이에요/예요» significa «soy/es» en un registro cortés cotidiano. Si aún no lees Hangul, practica primero sus letras y bloques silábicos.", question: "¿Cómo describe Minsu su ocupación?", feedback: "«학생이에요» significa «soy estudiante». «선생님» es docente y «의사» es médico; no aparecen como ocupación de Minsu.", transfer: "En tu cuaderno escribe «안녕하세요. 저는 …예요/이에요.» y añade tu ocupación. Usa 이에요 tras consonante final y 예요 tras vocal." },
        en: { title: "Read a simple introduction", lesson: "TOPIK I is the beginner exam (levels 1 and 2). If you read Hangul, restart with short sentences: 저 = I, 학생 = student. 저는 marks the topic; 이에요/예요 means am/is in everyday polite speech. If Hangul is still new, practise letters and syllable blocks first.", question: "How does Minsu describe his occupation?", feedback: "학생이에요 means «I am a student». 선생님 means teacher and 의사 means doctor; neither is Minsu's stated occupation.", transfer: "In your notebook, write 안녕하세요. 저는 …예요/이에요. and add your occupation. Use 이에요 after a final consonant and 예요 after a vowel." },
        ko: { title: "간단한 자기소개 읽기", lesson: "TOPIK I은 초급 시험(1·2급)입니다. 한글을 읽을 수 있다면 짧은 문장부터 복습하세요. 저는은 화제를, 이에요/예요는 정중한 일상 표현을 나타냅니다. 한글이 낯설다면 글자와 음절부터 연습하세요.", question: "민수의 직업은 무엇인가요?", feedback: "학생이에요라고 했습니다. 선생님이나 의사라는 정보는 없습니다.", transfer: "공책에 안녕하세요. 저는 …예요/이에요.와 직업을 써 보세요. 받침 뒤에는 이에요, 모음 뒤에는 예요를 씁니다." },
      } },
    { id: "form", example: "저는 도서관에 가요. 도서관에서 책을 읽어요.",
      options: ["에", "을", "에서"], correctIndex: 2,
      help: {
        es: { title: "Ubicar acciones con partículas", lesson: "En estas frases, «에» indica destino con 가요 (voy); «에서» indica dónde ocurre una acción. «책을» marca el objeto: leo un libro. No traduzcas cada partícula de forma aislada: observa el verbo.", question: "Completa: 도서관___ 책을 읽어요. (Leo un libro en la biblioteca.)", feedback: "Se lee en la biblioteca: 도서관에서 책을 읽어요. Para ir hacia ella: 도서관에 가요. 을 marca un objeto, no el lugar de esta acción.", transfer: "Forma dos frases: vas a la escuela (학교) y estudias allí (공부해요). Compara 학교에 가요 con 학교에서 공부해요." },
        en: { title: "Place actions with particles", lesson: "Here, 에 marks a destination with 가요 (go); 에서 marks where an action happens. 책을 marks the object: a book. Look at the verb rather than translating each particle alone.", question: "Complete: 도서관___ 책을 읽어요. (I read a book at the library.)", feedback: "Reading happens at the library: 도서관에서 책을 읽어요. Going there is 도서관에 가요. 을 marks an object, not the place of this action.", transfer: "Make two sentences: go to school (학교) and study there (공부해요). Compare 학교에 가요 with 학교에서 공부해요." },
        ko: { title: "조사로 행동의 장소 표현하기", lesson: "가요와 함께 쓰는 에는 목적지, 에서는 행동이 일어나는 장소를 나타냅니다. 책을의 을은 목적어를 표시합니다. 조사와 동사를 함께 보세요.", question: "도서관___ 책을 읽어요. 빈칸에 알맞은 조사는 무엇인가요?", feedback: "책을 읽는 장소이므로 도서관에서 책을 읽어요가 맞습니다. 목적지라면 도서관에 가요입니다. 을은 이 문장에서 장소를 표시하지 않습니다.", transfer: "학교에 가요와 학교에서 공부해요를 비교하고 다른 장소로 두 문장을 만들어 보세요." },
      } },
    { id: "use", example: "가: 토요일에 뭐 해요?\n나: 오전에는 집에서 쉬어요. 오후 세 시에 친구를 만나요.",
      options: ["토요일 오후 세 시에 만나요.", "금요일 오후 세 시에 만나요.", "토요일 오전 세 시에 만나요."], correctIndex: 0,
      help: {
        es: { title: "Entender un plan cotidiano", lesson: "토요일 = sábado, 오전 = mañana, 오후 = tarde. «세 시» son las tres; «에» también puede marcar una hora. TOPIK I evalúa comprensión lectora y auditiva; la escritura y pronunciación de LearnV son práctica adicional, no partes de ese examen.", question: "¿Cuándo se encuentra con su amistad?", feedback: "«오후 세 시에 친구를 만나요» indica a las tres de la tarde, el sábado según la pregunta. No dice viernes ni tres de la mañana.", transfer: "Escribe tu plan del sábado con una hora y un lugar. Léelo en voz alta. En la ruta completa practicarás también escucha; no es necesario grabarte para completar este repaso." },
        en: { title: "Understand an everyday plan", lesson: "토요일 = Saturday, 오전 = morning, 오후 = afternoon. 세 시 means three o'clock; 에 can also mark a time. TOPIK I assesses reading and listening; LearnV writing and pronunciation are extra practice, not parts of that exam.", question: "When do they meet their friend?", feedback: "오후 세 시에 친구를 만나요 means meeting a friend at 3 p.m., on Saturday from the question. It does not say Friday or 3 a.m.", transfer: "Write your Saturday plan with a time and a place, then read it aloud. The full path also includes listening; no recording is needed for this refresher." },
        ko: { title: "일상 계획 이해하기", lesson: "오전과 오후를 구별하고 세 시에처럼 시간 뒤에 에를 씁니다. TOPIK I은 읽기와 듣기를 평가합니다. LearnV의 쓰기와 발음은 추가 연습이며 TOPIK I 시험 영역은 아닙니다.", question: "언제 친구를 만나요?", feedback: "질문은 토요일의 계획이고, 답변은 오후 세 시에 친구를 만나요입니다. 금요일이나 오전 세 시가 아닙니다.", transfer: "시간과 장소를 넣어 토요일 계획을 쓰고 소리 내어 읽으세요. 전체 경로에서는 듣기도 연습합니다. 이 복습에는 녹음이 필요하지 않습니다." },
      } },
  ],
};
