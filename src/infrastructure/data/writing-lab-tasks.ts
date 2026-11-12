import type { Localized } from "@/domain/models/review-deck";
import type { WritingFormat, WritingLanguage } from "@/domain/models/writing-feedback";

export type ChartData = { title: string; unit: string; series: { label: string; values: number[] }[]; categories: string[]; note: Localized };

export type WritingLabTask = {
  id: string;
  language: WritingLanguage;
  format: Exclude<WritingFormat, "free">;
  exam: string;
  title: Localized;
  /** The instruction, in the exam language and wording style. */
  prompt: string;
  /** Text with gaps (TOPIK 51–52) or the points the essay must cover. */
  context?: string;
  chart?: ChartData;
  minimum: number;
  maximum: number;
  minutes: number;
  targetGrammar?: string[];
  /** How a strong answer is organised. */
  outline: Localized[];
  /** Sample answer for the short gap-fill formats only. */
  model?: string;
};

const l = (es: string, en: string): Localized => ({ es, en });

/*
 * Formats follow the official TOPIK II writing section (questions 51–54) and IELTS Academic
 * Writing (Task 1 and Task 2). Topics and figures are written for practice: they are not
 * past papers, and chart figures are simplified.
 */
export const writingLabTasks: WritingLabTask[] = [
  {
    id: "topik-51-club",
    language: "ko", format: "topik-51", exam: "TOPIK II · 51", minutes: 7, minimum: 10, maximum: 80,
    title: l("Texto práctico: aviso con dos huecos", "Practical text: notice with two gaps"),
    prompt: "다음 글의 ㉠과 ㉡에 알맞은 말을 각각 한 문장으로 쓰십시오.",
    context: "제목: 한국어 동아리 모임 안내\n\n안녕하세요. 한국어 동아리입니다. 이번 주 금요일 오후 6시에 모임이 있습니다. 그런데 이번에는 모임 장소가 ( ㉠ ). 학생회관 201호가 공사 중이어서 도서관 3층 세미나실에서 모입니다. 참석하실 분은 목요일까지 이메일로 ( ㉡ ).",
    outline: [
      l("Lee la frase de antes y la de después de cada hueco: la respuesta debe encajar con las dos.", "Read the sentences before and after each gap: the answer must fit both."),
      l("Un aviso o correo usa estilo formal -습니다 / -(으)십시오.", "A notice or email uses the formal -습니다 / -(으)십시오 style."),
      l("Escribe ㉠ y ㉡ en líneas separadas.", "Write ㉠ and ㉡ on separate lines."),
    ],
    model: "㉠ 바뀌었습니다\n㉡ 신청해 주십시오",
  },
  {
    id: "topik-52-sweets",
    language: "ko", format: "topik-52", exam: "TOPIK II · 52", minutes: 7, minimum: 10, maximum: 80,
    title: l("Texto explicativo con dos huecos", "Explanatory text with two gaps"),
    prompt: "다음 글의 ㉠과 ㉡에 알맞은 말을 각각 한 문장으로 쓰십시오.",
    context: "사람들은 보통 스트레스를 받으면 단 음식을 찾는다. 단 음식을 먹으면 기분이 잠시 ( ㉠ ). 그러나 단 음식을 너무 많이 먹으면 건강에 좋지 않다. 따라서 스트레스를 풀 때에는 단 음식보다 운동이나 산책처럼 ( ㉡ ).",
    outline: [
      l("El 52 exige estilo escrito -(ㄴ/는)다: nada de -요 ni -습니다.", "Question 52 requires the written -(ㄴ/는)다 style: no -요 or -습니다."),
      l("㉠ suele explicar una causa (-기 때문이다); ㉡ suele dar una conclusión o consejo (-는 것이 좋다).", "㉠ often explains a cause (-기 때문이다); ㉡ often gives a conclusion or advice (-는 것이 좋다)."),
    ],
    model: "㉠ 좋아지기 때문이다\n㉡ 건강에 좋은 방법을 찾는 것이 좋다",
  },
  {
    id: "topik-53-students",
    language: "ko", format: "topik-53", exam: "TOPIK II · 53", minutes: 15, minimum: 200, maximum: 300,
    title: l("Describir un gráfico (200–300 caracteres)", "Describe a chart (200–300 characters)"),
    prompt: "다음을 참고하여 '한국의 외국인 유학생 수 변화'에 대한 글을 200~300자로 쓰십시오. 단, 글의 제목은 쓰지 마십시오.",
    context: "증가 원인: 한국 문화에 대한 관심 증가, 정부 장학금 확대",
    chart: {
      title: "외국인 유학생 수", unit: "만 명", categories: ["2015", "2020", "2025"],
      series: [{ label: "유학생", values: [9, 15, 20] }],
      note: l("Cifras redondeadas para practicar.", "Rounded figures for practice."),
    },
    targetGrammar: ["증가", "나타났다"],
    outline: [
      l("1) Qué muestra el gráfico y la tendencia general (…에 따르면 …것으로 나타났다).", "1) What the chart shows and the overall trend (…에 따르면 …것으로 나타났다)."),
      l("2) Las cifras clave con años: 2015년 9만 명에서 2025년 20만 명으로 증가하였다.", "2) Key figures with years: 2015년 9만 명에서 2025년 20만 명으로 증가하였다."),
      l("3) Las causas del cuadro, con -기 때문이다 o 원인은 …이다.", "3) The causes given, with -기 때문이다 or 원인은 …이다."),
      l("Estilo -다, sin opinión personal y sin título.", "-다 style, no personal opinion and no title."),
    ],
  },
  {
    id: "topik-54-languages",
    language: "ko", format: "topik-54", exam: "TOPIK II · 54", minutes: 50, minimum: 600, maximum: 700,
    title: l("Ensayo argumentativo (600–700 caracteres)", "Argumentative essay (600–700 characters)"),
    prompt: "다음을 주제로 하여 자신의 생각을 600~700자로 글을 쓰십시오. 단, 문제를 그대로 옮겨 쓰지 마십시오.",
    context: "현대 사회에서 외국어 능력은 점점 더 중요해지고 있다. 아래의 내용을 중심으로 외국어 능력에 대한 자신의 생각을 쓰라.\n· 외국어 능력이 중요한 이유는 무엇인가?\n· 외국어 능력을 기르기 위해 어떤 노력이 필요한가?\n· 외국어를 배울 때 주의할 점은 무엇인가?",
    targetGrammar: ["때문이다", "따라서"],
    outline: [
      l("Introducción: plantea el tema y tu postura en 2–3 frases.", "Introduction: present the topic and your position in 2–3 sentences."),
      l("Un párrafo por pregunta, en el mismo orden, con un ejemplo concreto en cada uno.", "One paragraph per question, in the same order, each with a concrete example."),
      l("Conclusión con 따라서 / 결론적으로 / 이처럼.", "Conclusion with 따라서 / 결론적으로 / 이처럼."),
      l("Estilo -(ㄴ/는)다 en todo el texto: mezclar con -요 baja la nota.", "-(ㄴ/는)다 style throughout: mixing in -요 lowers the score."),
    ],
  },
  {
    id: "ielts-task1-destinations",
    language: "en", format: "ielts-task1", exam: "IELTS Academic · Task 1", minutes: 20, minimum: 150, maximum: 220,
    title: l("Describir un gráfico (150+ palabras)", "Describe a chart (150+ words)"),
    prompt: "The chart below shows the percentage of international students from one country who chose each destination in 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    chart: {
      title: "Study destinations", unit: "%", categories: ["UK", "USA", "South Korea", "Germany", "Other"],
      series: [{ label: "2010", values: [30, 35, 5, 10, 20] }, { label: "2020", values: [25, 28, 15, 14, 18] }],
      note: l("Datos inventados para practicar.", "Invented data for practice."),
    },
    outline: [
      l("Introducción: parafrasea el enunciado (no lo copies).", "Introduction: paraphrase the prompt (do not copy it)."),
      l("Visión general: 1–2 tendencias principales, sin cifras (Overall, …).", "Overview: 1–2 main trends, without figures (Overall, …)."),
      l("Dos párrafos de detalle agrupando datos, con cifras y comparaciones (rose from … to …, twice as …).", "Two detail paragraphs grouping data, with figures and comparisons (rose from … to …, twice as …)."),
      l("Sin opinión personal ni conclusión de ensayo.", "No personal opinion or essay-style conclusion."),
    ],
  },
  {
    id: "ielts-task2-abroad",
    language: "en", format: "ielts-task2", exam: "IELTS Academic · Task 2", minutes: 40, minimum: 250, maximum: 330,
    title: l("Ensayo de opinión (250+ palabras)", "Opinion essay (250+ words)"),
    prompt: "Some people believe that studying abroad is the best way to learn a foreign language, while others think it can be learned just as well at home. Discuss both views and give your own opinion. Write at least 250 words.",
    outline: [
      l("Introducción: parafrasea el debate y adelanta tu postura.", "Introduction: paraphrase the debate and state your position."),
      l("Párrafo 1: la primera opinión con razón + ejemplo.", "Paragraph 1: the first view with a reason + example."),
      l("Párrafo 2: la segunda opinión con razón + ejemplo.", "Paragraph 2: the second view with a reason + example."),
      l("Conclusión: tu opinión, coherente con la introducción (In conclusion, …).", "Conclusion: your opinion, consistent with the introduction (In conclusion, …)."),
    ],
  },
];
