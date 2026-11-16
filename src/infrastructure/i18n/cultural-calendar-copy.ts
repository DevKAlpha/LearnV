import type { FestivalId } from "@/domain/models/cultural-calendar";
import type { Locale } from "@/domain/models/i18n";

type Text = Record<Locale, string>;
export type FestivalPhrase = { ko: string; meaning: Text };
export type FestivalLesson = { hangul: string; name: Text; about: Text; phrases: readonly FestivalPhrase[] };

const t = (es: string, en: string, ko: string): Text => ({ es, en, ko });

/** One mini-lesson per festival: what it is and three expressions to say or recognise that day. */
export const festivalLessons: Record<FestivalId, FestivalLesson> = {
  seollal: {
    hangul: "설날",
    name: t("Año Nuevo lunar", "Lunar New Year", "설날"),
    about: t(
      "La fiesta familiar más importante: tres días de vacaciones, reverencia de año nuevo a los mayores y sopa de pasteles de arroz.",
      "The biggest family holiday: three days off, a New Year bow to the elders and rice cake soup.",
      "가장 큰 명절입니다. 사흘 동안 쉬며 어른께 세배를 드리고 떡국을 먹습니다.",
    ),
    phrases: [
      { ko: "새해 복 많이 받으세요", meaning: t("Feliz año nuevo (literalmente: «recibe mucha suerte»).", "Happy New Year (literally “receive lots of luck”).", "새해 인사로 가장 많이 쓰는 표현") },
      { ko: "세배", meaning: t("Reverencia de año nuevo ante los mayores.", "The New Year bow to one's elders.", "어른께 드리는 새해 절") },
      { ko: "떡국", meaning: t("Sopa de pasteles de arroz: se dice que comerla te hace un año mayor.", "Rice cake soup: eating it is said to make you a year older.", "먹으면 한 살 더 먹는다는 음식") },
    ],
  },
  samiljeol: {
    hangul: "삼일절",
    name: t("Día del Movimiento del 1 de Marzo", "March 1st Movement Day", "삼일절"),
    about: t(
      "Recuerda la declaración de independencia de 1919 frente al dominio colonial japonés. Es festivo nacional.",
      "It remembers the 1919 declaration of independence against Japanese colonial rule. It is a national holiday.",
      "1919년 독립 선언과 만세 운동을 기리는 국경일입니다.",
    ),
    phrases: [
      { ko: "독립", meaning: t("Independencia.", "Independence.", "다른 나라에 속하지 않음") },
      { ko: "태극기", meaning: t("La bandera de Corea del Sur; ese día se cuelga en las casas.", "South Korea's flag; homes hang it that day.", "이날 집집마다 다는 국기") },
      { ko: "대한 독립 만세", meaning: t("«¡Viva la independencia de Corea!», el grito de 1919.", "“Long live Korean independence!”, the 1919 cry.", "1919년에 외친 구호") },
    ],
  },
  "childrens-day": {
    hangul: "어린이날",
    name: t("Día de los Niños", "Children's Day", "어린이날"),
    about: t(
      "Se celebra desde 1923 y es festivo desde 1975: parques llenos, regalos y excursiones. Mayo es el «mes de la familia».",
      "Celebrated since 1923 and a public holiday since 1975: crowded parks, gifts and day trips. May is “family month”.",
      "1923년에 시작되어 1975년부터 공휴일이 되었습니다. 5월은 ‘가정의 달’이라고 부릅니다.",
    ),
    phrases: [
      { ko: "어린이", meaning: t("Niño, niña (forma respetuosa creada para esta fiesta).", "Child (a respectful word coined for this day).", "아이를 높여 부르는 말") },
      { ko: "선물", meaning: t("Regalo.", "Gift.", "주는 물건") },
      { ko: "가정의 달", meaning: t("«Mes de la familia»: así llaman a mayo.", "“Family month”: what May is called.", "5월을 부르는 말") },
    ],
  },
  chuseok: {
    hangul: "추석",
    name: t("Chuseok, fiesta de la cosecha", "Chuseok, the harvest festival", "추석"),
    about: t(
      "También llamado 한가위. Las familias viajan a su ciudad natal, visitan las tumbas de sus antepasados y preparan songpyeon.",
      "Also called 한가위. Families travel home, visit their ancestors' graves and make songpyeon.",
      "한가위라고도 합니다. 고향에 내려가 성묘를 하고 송편을 빚습니다.",
    ),
    phrases: [
      { ko: "즐거운 추석 보내세요", meaning: t("Que pases un feliz Chuseok.", "Have a happy Chuseok.", "추석 인사") },
      { ko: "송편", meaning: t("Pastelitos de arroz en forma de media luna, rellenos de sésamo o judías.", "Half-moon rice cakes filled with sesame or beans.", "반달 모양의 떡") },
      { ko: "성묘", meaning: t("Visita y limpieza de las tumbas de los antepasados.", "Visiting and tending the ancestors' graves.", "조상의 산소를 찾아가는 일") },
    ],
  },
  "hangeul-day": {
    hangul: "한글날",
    name: t("Día del Hangul", "Hangeul Day", "한글날"),
    about: t(
      "Celebra la proclamación del alfabeto coreano por el rey Sejong en 1446, en el documento Hunminjeongeum.",
      "It celebrates King Sejong's proclamation of the Korean alphabet in 1446, in the Hunminjeongeum.",
      "1446년 세종대왕이 훈민정음을 반포한 것을 기념하는 날입니다.",
    ),
    phrases: [
      { ko: "세종대왕", meaning: t("El rey Sejong el Grande, creador del hangul.", "King Sejong the Great, who created Hangeul.", "한글을 만든 임금") },
      { ko: "훈민정음", meaning: t("«Los sonidos correctos para enseñar al pueblo»: el nombre original del alfabeto.", "“The correct sounds to teach the people”: the alphabet's original name.", "한글의 원래 이름") },
      { ko: "자음과 모음", meaning: t("Consonantes y vocales: las piezas de cada sílaba.", "Consonants and vowels: the parts of every syllable.", "글자를 이루는 소리") },
    ],
  },
  "pepero-day": {
    hangul: "빼빼로 데이",
    name: t("Día del Pepero", "Pepero Day", "빼빼로 데이"),
    about: t(
      "No es festivo: el 11/11 parece cuatro palitos, así que amigos y parejas se regalan galletas alargadas.",
      "Not a holiday: 11/11 looks like four sticks, so friends and couples swap stick biscuits.",
      "공휴일은 아니지만 11월 11일에 친구나 연인에게 막대 과자를 선물합니다.",
    ),
    phrases: [
      { ko: "친구에게 빼빼로를 줘요", meaning: t("Le doy un Pepero a un amigo.", "I give a friend some Pepero.", "선물하는 문장") },
      { ko: "막대 과자", meaning: t("Galleta en forma de palito.", "Stick-shaped biscuit.", "길쭉한 과자") },
      { ko: "고마워", meaning: t("Gracias (informal, entre amigos).", "Thanks (casual, between friends).", "친구끼리 쓰는 감사 인사") },
    ],
  },
  suneung: {
    hangul: "수능",
    name: t("Selectividad coreana (Suneung)", "Korean college entrance exam (Suneung)", "수능"),
    about: t(
      "El examen de acceso a la universidad. Ese día la oficina abre más tarde y los aviones no despegan durante la prueba de comprensión oral.",
      "The university entrance exam. Offices open later that day and planes stay grounded during the listening test.",
      "대학수학능력시험입니다. 출근 시간이 늦춰지고 듣기 평가 중에는 비행기가 뜨지 않습니다.",
    ),
    phrases: [
      { ko: "수능 대박 나세요", meaning: t("¡Mucha suerte en el Suneung! (deseo de un gran resultado).", "Ace the Suneung! (wishing a huge success).", "수험생 응원 인사") },
      { ko: "엿", meaning: t("Caramelo de arroz: se regala para que lo aprendido «se pegue».", "Rice taffy: given so what you studied “sticks”.", "합격을 바라며 주는 간식") },
      { ko: "수험생", meaning: t("Persona que se examina.", "Exam candidate.", "시험을 보는 학생") },
    ],
  },
  dongji: {
    hangul: "동지",
    name: t("Solsticio de invierno", "Winter solstice", "동지"),
    about: t(
      "La noche más larga del año. Se toma sopa de judías rojas, que según la tradición aleja la mala suerte.",
      "The longest night of the year. People eat red bean porridge, which tradition says keeps bad luck away.",
      "일 년 중 밤이 가장 긴 날로, 나쁜 기운을 쫓는다는 팥죽을 먹습니다.",
    ),
    phrases: [
      { ko: "팥죽", meaning: t("Sopa espesa de judías rojas.", "Red bean porridge.", "붉은 팥으로 쑨 죽") },
      { ko: "작은 설", meaning: t("«Pequeño año nuevo»: otro nombre tradicional del solsticio.", "“Little New Year”: a traditional name for the solstice.", "동지를 부르는 다른 이름") },
      { ko: "밤이 길어요", meaning: t("Las noches son largas.", "The nights are long.", "겨울밤을 말하는 문장") },
    ],
  },
};
