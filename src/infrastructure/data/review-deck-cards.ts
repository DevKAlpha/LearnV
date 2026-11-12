import type { Localized, ReviewCard, ReviewLanguage } from "@/domain/models/review-deck";

/*
 * Core review deck. Items are real language (not questions about the task) and target
 * the errors Spanish speakers make most: false friends and prepositions in English;
 * 은/는 vs 이/가, 에 vs 에서, 이다 vs 있다 and verb-final order in Korean.
 * IDs are permanent: renaming one resets that card's schedule.
 */
const l = (es: string, en: string): Localized => ({ es, en });

function vocab(language: ReviewLanguage, word: string, meaning: Localized, note: Localized = l("", "")): ReviewCard {
  return { id: `${language}:v:${word}`, language, group: "vocabulary", exercise: "recall", prompt: word, answer: word, meaning, note, audio: word };
}

function cloze(language: ReviewLanguage, key: string, sentence: string, answer: string, meaning: Localized, note: Localized, accept?: string[]): ReviewCard {
  return { id: `${language}:c:${key}`, language, group: "grammar", exercise: "cloze", prompt: sentence, answer, accept, meaning, note, audio: sentence.replace("___", answer) };
}

function order(language: ReviewLanguage, key: string, tokens: string[], meaning: Localized, note: Localized): ReviewCard {
  const sentence = tokens.join(" ");
  return { id: `${language}:o:${key}`, language, group: "word-order", exercise: "order", prompt: "", answer: sentence, tokens, meaning, note, audio: sentence };
}

function dictation(language: ReviewLanguage, key: string, sentence: string, meaning: Localized, accept?: string[]): ReviewCard {
  return { id: `${language}:d:${key}`, language, group: "listening", exercise: "dictation", prompt: "", answer: sentence, accept, meaning, note: l("", ""), audio: sentence };
}

const PARTICLE_TOPIC = l("은 tras consonante, 는 tras vocal. Marca el tema: «en cuanto a mí…».", "은 after a consonant, 는 after a vowel. It marks the topic: “as for me…”.");
const PARTICLE_SUBJECT = l("이 tras consonante, 가 tras vocal. Presenta información nueva o el sujeto de 있다/없다.", "이 after a consonant, 가 after a vowel. It introduces new information or the subject of 있다/없다.");
const PLACE_E = l("에 = destino o lugar donde algo está. En español ambos son «en/a», pero en coreano no se mezclan con 에서.", "에 = destination, or where something is. Spanish uses “en/a” for both, but Korean keeps it apart from 에서.");
const PLACE_ESEO = l("에서 = lugar donde ocurre una acción (estudiar, comer, trabajar).", "에서 = place where an action happens (study, eat, work).");
const OBJECT = l("을 tras consonante, 를 tras vocal: marca el complemento directo.", "을 after a consonant, 를 after a vowel: it marks the direct object.");
const VERB_LAST = l("El verbo va siempre al final (Sujeto-Objeto-Verbo); el tiempo y el lugar suelen ir delante.", "The verb always comes last (Subject-Object-Verb); time and place usually come first.");

const korean: ReviewCard[] = [
  vocab("ko", "학교", l("escuela", "school")),
  vocab("ko", "학생", l("estudiante", "student"), l("Su 받침 es ㅇ (생): suena «-saeng».", "Its final consonant is ㅇ (생): it sounds “-saeng”.")),
  vocab("ko", "선생님", l("profesor/a", "teacher"), l("님 añade respeto; no se usa para hablar de uno mismo.", "님 adds respect; never use it about yourself.")),
  vocab("ko", "친구", l("amigo/a", "friend")),
  vocab("ko", "가족", l("familia", "family")),
  vocab("ko", "대학교", l("universidad", "university")),
  vocab("ko", "장학금", l("beca", "scholarship")),
  vocab("ko", "유학", l("estudiar en el extranjero", "studying abroad"), l("유학생 = estudiante internacional.", "유학생 = international student.")),
  vocab("ko", "기숙사", l("residencia de estudiantes", "dormitory")),
  vocab("ko", "전공", l("especialidad, carrera", "major (field of study)")),
  vocab("ko", "면접", l("entrevista", "interview")),
  vocab("ko", "서류", l("documentos, papeles", "documents, paperwork")),
  vocab("ko", "경험", l("experiencia", "experience")),
  vocab("ko", "목표", l("objetivo, meta", "goal")),
  vocab("ko", "계획", l("plan", "plan")),
  vocab("ko", "문화", l("cultura", "culture")),
  vocab("ko", "연구", l("investigación", "research")),
  vocab("ko", "발표", l("presentación, exposición", "presentation")),
  vocab("ko", "공부하다", l("estudiar", "to study")),
  vocab("ko", "준비하다", l("preparar(se)", "to prepare")),
  vocab("ko", "노력하다", l("esforzarse", "to make an effort")),
  vocab("ko", "졸업하다", l("graduarse", "to graduate")),
  vocab("ko", "어렵다", l("ser difícil", "to be difficult"), l("En coreano los adjetivos se conjugan como verbos: 어려워요 = es difícil.", "Korean adjectives conjugate like verbs: 어려워요 = it is difficult.")),
  vocab("ko", "중요하다", l("ser importante", "to be important")),
  vocab("ko", "반갑다", l("alegrarse de ver/conocer a alguien", "to be glad to meet someone")),

  cloze("ko", "topic-vowel", "저___ 학생이에요.", "는", l("Yo soy estudiante.", "I am a student."), PARTICLE_TOPIC),
  cloze("ko", "topic-consonant", "선생님___ 한국 사람이에요.", "은", l("El profesor es coreano.", "The teacher is Korean."), PARTICLE_TOPIC),
  cloze("ko", "subject-consonant", "책상 위에 책___ 있어요.", "이", l("Hay un libro sobre la mesa.", "There is a book on the desk."), PARTICLE_SUBJECT),
  cloze("ko", "subject-vowel", "친구___ 와요.", "가", l("Viene un amigo.", "A friend is coming."), PARTICLE_SUBJECT),
  cloze("ko", "e-destination", "내일 학교___ 가요.", "에", l("Mañana voy a la escuela.", "Tomorrow I go to school."), PLACE_E),
  cloze("ko", "eseo-action", "도서관___ 공부해요.", "에서", l("Estudio en la biblioteca.", "I study at the library."), PLACE_ESEO),
  cloze("ko", "object-consonant", "물___ 마셔요.", "을", l("Bebo agua.", "I drink water."), OBJECT),
  cloze("ko", "object-vowel", "커피___ 마셔요.", "를", l("Bebo café.", "I drink coffee."), OBJECT),
  cloze("ko", "ida-consonant", "저는 학생___.", "이에요", l("Soy estudiante.", "I am a student."), l("이에요 tras consonante, 예요 tras vocal. Identifica: «ser».", "이에요 after a consonant, 예요 after a vowel. It identifies: “to be”.")),
  cloze("ko", "ida-vowel", "제 친구는 의사___.", "예요", l("Mi amigo es médico.", "My friend is a doctor."), l("의사 acaba en vocal, así que va 예요.", "의사 ends in a vowel, so it takes 예요.")),
  cloze("ko", "itda-location", "친구가 지금 기숙사에 ___.", "있어요", l("Mi amigo está ahora en la residencia.", "My friend is in the dormitory now."), l("«Estar en un lugar» es 있다, no 이다. Error típico: «기숙사예요» para decir dónde está alguien.", "“To be somewhere” is 있다, not 이다. A typical error is “기숙사예요” to say where someone is.")),
  cloze("ko", "go-sipda", "한국에서 공부하___ 싶어요.", "고", l("Quiero estudiar en Corea.", "I want to study in Korea."), l("-고 싶다 = querer hacer algo (yo / tú en preguntas).", "-고 싶다 = to want to do something (I / you in questions).")),
  cloze("ko", "jiman", "서울은 비싸___ 기회가 많아요.", "지만", l("Seúl es caro, pero hay muchas oportunidades.", "Seoul is expensive, but there are many opportunities."), l("-지만 = «pero», une dos ideas opuestas en una frase.", "-지만 = “but”, joining two opposing ideas in one sentence.")),
  cloze("ko", "nikka", "비가 오___ 우산을 가져가세요.", "니까", l("Como llueve, llévate el paraguas.", "It is raining, so take an umbrella."), l("Con órdenes o propuestas se usa -(으)니까, no -아/어서.", "With commands or suggestions use -(으)니까, not -아/어서.")),
  cloze("ko", "past", "어제 친구를 만났___.", "어요", l("Ayer vi a un amigo.", "I met a friend yesterday."), l("Pasado: -았/었어요. 만나다 → 만났어요.", "Past tense: -았/었어요. 만나다 → 만났어요.")),
  cloze("ko", "experience", "한국에 가 본 적이 ___.", "있어요", l("He estado en Corea alguna vez.", "I have been to Korea before."), l("-아/어 본 적이 있다 = haber hecho algo alguna vez.", "-아/어 본 적이 있다 = to have done something before."), ["없어요"]),
  cloze("ko", "future", "졸업 후에 연구를 계속할 ___예요.", "거", l("Después de graduarme seguiré investigando.", "After graduating I will keep doing research."), l("-(으)ㄹ 거예요 = futuro o plan.", "-(으)ㄹ 거예요 = future or plan.")),

  order("ko", "study-wish", ["저는", "한국", "대학교에서", "공학을", "공부하고", "싶어요"], l("Quiero estudiar ingeniería en una universidad coreana.", "I want to study engineering at a Korean university."), VERB_LAST),
  order("ko", "met-friend", ["어제", "도서관에서", "친구를", "만났어요"], l("Ayer vi a un amigo en la biblioteca.", "I met a friend at the library yesterday."), VERB_LAST),
  order("ko", "scholarship-plan", ["장학금을", "받으면", "열심히", "공부할", "거예요"], l("Si consigo la beca, estudiaré mucho.", "If I get the scholarship, I will study hard."), l("La condición (-(으)면) va antes de la acción principal.", "The condition (-(으)면) comes before the main action.")),
  order("ko", "culture", ["한국", "문화에", "관심이", "많아요"], l("Me interesa mucho la cultura coreana.", "I am very interested in Korean culture."), l("관심이 있다/많다 = tener interés; lo que interesa lleva 에.", "관심이 있다/많다 = to be interested; the topic takes 에.")),

  dictation("ko", "hello", "안녕하세요", l("Hola (formal)", "Hello (polite)")),
  dictation("ko", "thanks", "감사합니다", l("Gracias", "Thank you")),
  dictation("ko", "nice-to-meet", "만나서 반갑습니다", l("Encantado/a de conocerte", "Nice to meet you")),
  dictation("ko", "study-korean", "한국어를 공부해요", l("Estudio coreano", "I study Korean")),
  dictation("ko", "please", "잘 부탁드립니다", l("Cuento contigo / Encantado de trabajar juntos", "I look forward to working with you")),
];

const FALSE_FRIEND = (es: string, en: string) => l(`Falso amigo: ${es}`, en);

const english: ReviewCard[] = [
  vocab("en", "actually", l("en realidad", "in fact"), FALSE_FRIEND("no significa «actualmente» (= currently).", "Spanish speakers confuse it with “actualmente”, which means currently.")),
  vocab("en", "eventually", l("con el tiempo, al final", "in the end, after some time"), FALSE_FRIEND("no es «eventualmente» (= possibly, occasionally).", "Not “eventualmente”, which means possibly or occasionally.")),
  vocab("en", "sensible", l("sensato", "reasonable, practical"), FALSE_FRIEND("«sensible» en español es sensitive.", "Spanish “sensible” means sensitive.")),
  vocab("en", "embarrassed", l("avergonzado/a", "ashamed, self-conscious"), FALSE_FRIEND("«embarazada» es pregnant.", "Spanish “embarazada” means pregnant.")),
  vocab("en", "library", l("biblioteca", "place to borrow books"), FALSE_FRIEND("«librería» es bookshop.", "Spanish “librería” is a bookshop.")),
  vocab("en", "attend", l("asistir a (clase, reunión)", "to be present at"), l("«Asistir a» es attend; assist significa ayudar.", "“Asistir a” is attend; assist means to help.")),
  vocab("en", "assist", l("ayudar", "to help"), FALSE_FRIEND("no significa «asistir a» (= attend).", "Not “asistir a”, which is attend.")),
  vocab("en", "realise", l("darse cuenta", "to become aware"), FALSE_FRIEND("«realizar» es carry out.", "Spanish “realizar” means carry out.")),
  vocab("en", "carry out", l("realizar, llevar a cabo", "to perform a task")),
  vocab("en", "career", l("trayectoria profesional", "professional path over time"), l("La «carrera» universitaria es degree o course.", "A university “carrera” is a degree or course.")),
  vocab("en", "degree", l("título universitario, carrera", "university qualification")),
  vocab("en", "scholarship", l("beca", "funding for study")),
  vocab("en", "commitment", l("compromiso, dedicación", "dedication to a cause or duty"), l("Compromise es un acuerdo con concesiones mutuas.", "Compromise means an agreement with mutual concessions.")),
  vocab("en", "deadline", l("fecha límite", "latest time to finish something")),
  vocab("en", "outstanding", l("excepcional; también «pendiente»", "excellent; also “still unpaid or unresolved”")),
  vocab("en", "thorough", l("minucioso/a", "careful and complete")),
  vocab("en", "fabric", l("tela", "cloth, material"), FALSE_FRIEND("«fábrica» es factory.", "Spanish “fábrica” is a factory.")),
  vocab("en", "exit", l("salida", "way out"), FALSE_FRIEND("«éxito» es success.", "Spanish “éxito” is success.")),
  vocab("en", "achievement", l("logro", "something done successfully")),
  vocab("en", "approach", l("enfoque; acercarse", "a way of dealing with something")),

  cloze("en", "since", "I have lived in Madrid ___ 2019.", "since", l("Vivo en Madrid desde 2019.", "Since + a point in time."), l("since + momento (2019); for + duración (three years).", "since + a point in time (2019); for + a duration (three years).")),
  cloze("en", "for", "I have studied Korean ___ three years.", "for", l("Estudio coreano desde hace tres años.", "For + a duration."), l("«Desde hace» + duración = for, con present perfect.", "“Desde hace” + duration = for, with the present perfect.")),
  cloze("en", "good-at", "She is very good ___ maths.", "at", l("Se le dan muy bien las matemáticas.", "Good + preposition."), l("good at, no «good in».", "good at, not “good in”.")),
  cloze("en", "depend-on", "It depends ___ the funding.", "on", l("Depende de la financiación.", "Depend + preposition."), l("depend on, no «depend of».", "depend on, not “depend of”.")),
  cloze("en", "interested-in", "I am interested ___ public policy.", "in", l("Me interesa la política pública.", "Interested + preposition."), l("interested in, no «interested on».", "interested in, not “interested on”.")),
  cloze("en", "looking-forward", "I am looking forward to ___ you.", "meeting", l("Tengo ganas de conocerte.", "Looking forward to + -ing."), l("Aquí «to» es preposición: va seguido de -ing.", "Here “to” is a preposition, so it takes -ing."), ["seeing", "hearing from"]),
  cloze("en", "want-to", "My tutor wants me ___ apply early.", "to", l("Mi tutor quiere que presente la solicitud pronto.", "Want + object + to."), l("«Quiere que yo…» = wants me to…, nunca «wants that I…».", "“Quiere que yo…” = wants me to…, never “wants that I…”.")),
  cloze("en", "age", "He ___ twenty-one years old.", "is", l("Tiene veintiún años.", "Age uses be."), l("La edad se dice con be, no con have.", "Age uses be, not have.")),
  cloze("en", "information", "The information ___ very useful.", "is", l("La información es muy útil.", "Uncountable noun."), l("information es incontable: nunca «informations are».", "information is uncountable: never “informations are”.")),
  cloze("en", "explain-to", "She explained ___ me how to apply.", "to", l("Me explicó cómo solicitarla.", "Explain + to + person."), l("explain something to someone, no «explained me».", "explain something to someone, not “explained me”.")),
  cloze("en", "first-conditional", "If I ___ the scholarship, I will study engineering.", "get", l("Si consigo la beca, estudiaré ingeniería.", "First conditional."), l("Tras if va presente, aunque se hable del futuro.", "After if, use the present even for the future."), ["win", "receive", "obtain"]),
  cloze("en", "second-conditional", "If I had more time, I ___ learn Japanese too.", "would", l("Si tuviera más tiempo, también aprendería japonés.", "Second conditional."), l("Hipótesis: if + pasado, would + infinitivo.", "Hypothesis: if + past, would + base verb."), ["could", "might"]),
  cloze("en", "despite", "Despite ___ tired, she finished the essay.", "being", l("A pesar de estar cansada, terminó el ensayo.", "Despite + -ing."), l("despite + sustantivo o -ing; although + frase completa.", "despite + noun or -ing; although + full clause.")),
  cloze("en", "although", "___ the cost was high, she applied.", "Although", l("Aunque el coste era alto, presentó la solicitud.", "Concession + clause."), l("although + frase completa; despite + sustantivo.", "although + full clause; despite + noun."), ["though", "even though"]),
  cloze("en", "make-decision", "I need to ___ a decision before Friday.", "make", l("Tengo que tomar una decisión antes del viernes.", "Collocation."), l("make a decision (en inglés británico también take); nunca «do a decision».", "make a decision (British English also allows take); never “do a decision”."), ["take"]),

  order("en", "present-perfect", ["I", "have", "been", "studying", "Korean", "for", "two", "years"], l("Llevo dos años estudiando coreano.", "Duration up to now: present perfect continuous."), l("«Llevo X haciendo…» = have been + -ing + for.", "“Llevo X haciendo…” = have been + -ing + for.")),
  order("en", "question", ["Why", "do", "you", "want", "to", "study", "in", "Korea?"], l("¿Por qué quieres estudiar en Corea?", "Questions need an auxiliary."), l("Las preguntas necesitan auxiliar (do/does/did) antes del sujeto.", "Questions need an auxiliary (do/does/did) before the subject.")),
  order("en", "adverb", ["I", "always", "review", "my", "notes", "before", "class"], l("Siempre repaso mis apuntes antes de clase.", "Frequency adverbs go before the main verb."), l("always/never/often van antes del verbo principal: «I review always» es incorrecto.", "always/never/often go before the main verb: “I review always” is wrong.")),
  order("en", "never-visited", ["She", "has", "never", "visited", "Seoul"], l("Nunca ha visitado Seúl.", "Never between auxiliary and verb."), l("never va entre el auxiliar y el participio.", "never goes between the auxiliary and the participle.")),

  dictation("en", "study-engineering", "I would like to study engineering in Korea.", l("Me gustaría estudiar ingeniería en Corea.", "Polite wish.")),
  dictation("en", "research-interest", "My research interest is renewable energy.", l("Mi interés de investigación es la energía renovable.", "Research focus.")),
  dictation("en", "opportunity", "Thank you for the opportunity.", l("Gracias por la oportunidad.", "Closing an interview.")),
  dictation("en", "hearing-from-you", "I look forward to hearing from you.", l("Quedo a la espera de su respuesta.", "Formal email closing."), ["I am looking forward to hearing from you."]),
];

export const reviewDeck: readonly ReviewCard[] = [...korean, ...english];
