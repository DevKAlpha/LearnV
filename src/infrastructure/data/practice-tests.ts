import type {
  ProductionMode,
  ListeningMedia,
  TestLanguage,
  TestQuestion,
  TestSkill,
  TestStage,
  TestTrack,
} from "../../domain/models/language-test";

type LevelSeed = {
  title: string;
  focus: string;
  prompt: string;
  model: string;
  weak: string;
  detail: string;
  distractors: [string, string, string];
  media?: ListeningMedia;
};

function rotateOptions(question: TestQuestion, offset: number): TestQuestion {
  const shift = offset % question.options.length;
  if (shift === 0) return question;
  const options = [...question.options.slice(shift), ...question.options.slice(0, shift)];
  return {
    ...question,
    options,
    correctIndex: (question.correctIndex - shift + question.options.length) % question.options.length,
  };
}

function varyAnswerPositions(items: TestQuestion[], level: number) {
  return items.map((item, index) => rotateOptions(item, level + index));
}

const englishWriting: LevelSeed[] = [
  ["A focused paragraph", "Topic sentence · support", "Write 100–120 words explaining one reason to study International Business in Korea.", "Studying International Business in Korea would let me examine trade decisions within an economy that has built strong links with Europe.", "Korea is great and business is very interesting for many reasons.", "one academic reason supported by a concrete example", ["a list of unrelated interests", "only praise for Korea", "a repeated conclusion"]],
  ["Evidence, not adjectives", "Evidence · measurable result", "Write 120 words about an achievement that demonstrates initiative.", "When our school project lost a supplier, I compared three alternatives and negotiated a replacement within two days.", "I am extremely proactive and always solve every problem.", "an action and its verifiable result", ["three personality adjectives", "a claim without context", "an unrelated ambition"]],
  ["Cohesion with purpose", "Connectors · paragraph flow", "Write 130 words on how Spain and Korea could strengthen educational exchange.", "A joint case-study programme could connect Spanish market knowledge with Korean innovation; moreover, it would give students evidence-based teamwork experience.", "Also Korea. Also Spain. Also students can learn.", "a logical link between proposal and benefit", ["as many connectors as possible", "a new topic in every sentence", "an informal anecdote only"]],
  ["Compare two options", "Comparison · criteria", "Compare studying International Business and a health-related field in 140 words, using two clear criteria.", "International Business aligns more directly with my trade experience, whereas health informatics would require stronger scientific preparation.", "Both courses are good, so choosing is difficult.", "a comparison using explicit criteria", ["a ranking with no reason", "only course names", "a description of Korea"]],
  ["Academic motivation", "Motivation · specificity", "Write 150 words explaining why your chosen major follows logically from your previous studies.", "My economics coursework introduced market analysis, and the export simulation showed me that I want to study cross-border strategy in greater depth.", "I have dreamed about this major since I was young.", "a traceable link between past preparation and future study", ["a childhood claim only", "the university ranking alone", "general enthusiasm"]],
  ["Problem and response", "Analysis · solution", "Write 160 words proposing one response to a challenge faced by international students.", "A peer-mentoring scheme could reduce early academic isolation because it provides both practical guidance and a regular point of contact.", "International students have problems and universities should help.", "one defined problem, a feasible response and its mechanism", ["several vague problems", "a solution with no connection", "personal praise"]],
  ["Data commentary", "Trend · cautious interpretation", "Write 170 words describing a rise from 35% to 52% and give one cautious interpretation.", "Participation rose by 17 percentage points; however, the figures alone do not show whether the programme caused the increase.", "Participation rose 17 percent, so the programme was definitely perfect.", "the correct numerical change and a cautious inference", ["a causal certainty", "only the final percentage", "an unrelated recommendation"]],
  ["Counterargument", "Balance · rebuttal", "Write 180 words arguing for exchange programmes while addressing one realistic objection.", "Although travel costs may limit access, targeted grants could reduce that barrier without weakening the academic purpose of the programme.", "Anyone who disagrees with exchanges is wrong.", "a fair objection followed by a proportionate response", ["an attack on critics", "no stated position", "a second unrelated benefit"]],
  ["Study-plan extract", "Sequence · feasibility", "Write 190 words outlining a first-year study plan with milestones.", "During the first semester I will strengthen academic Korean; by the second, I will use it to compare two Korea–Spain business cases.", "I will study very hard and learn everything quickly.", "timed actions that build on one another", ["ambition without milestones", "a list of course names only", "guaranteed outcomes"]],
  ["C1 synthesis", "Synthesis · qualification", "Write 220 words combining academic preparation, social contribution and a post-graduation goal.", "My preparation supports the degree, while the proposed project gives that learning a practical Korea–Spain purpose; nevertheless, its impact would need to be evaluated over time.", "My grades, my dreams and my future prove that I am the best candidate.", "a coherent synthesis with appropriately qualified claims", ["three disconnected lists", "absolute self-praise", "a conclusion with new evidence"]],
].map(([title, focus, prompt, model, weak, detail, distractors]) => ({ title, focus, prompt, model, weak, detail, distractors } as LevelSeed));

const englishListening: LevelSeed[] = [
  { title: "An Australian day at the beach", focus: "Story · Australian accent", prompt: "Watch the story once without subtitles, then replay only the section you found hardest.", model: "The narrator retells a day at the beach and then explains the Australian expressions used in the story.", weak: "It is only a list of unrelated beach words.", detail: "a beach story followed by an explanation of Australian English", distractors: ["a news report about coastal policy", "an American pronunciation drill", "a song about travelling"], media: { provider: "youtube", videoId: "rk0yxFc6-Vk", title: "Day at the Beach · Australian English story", creator: "Aussie English", kind: "story", variety: "Australian English · narrative", sourceUrl: "https://www.youtube.com/watch?v=rk0yxFc6-Vk" } },
  { title: "The Gift of the Magi", focus: "Story · Indian English", prompt: "Listen for the sacrifice made by each main character and the irony of the ending.", model: "Both characters give up something valuable to buy a gift for the other, making the gifts unusable but revealing mutual generosity.", weak: "The couple solves the problem by keeping their possessions.", detail: "mutual sacrifice makes the ending ironic and affectionate", distractors: ["a competition determines the best gift", "the couple receives money from a stranger", "the story ends before any gift is exchanged"], media: { provider: "youtube", videoId: "fJYrLUCNuCk", title: "The Gift of the Magi · O. Henry", creator: "Folksy Storytelling Podcast", kind: "story", variety: "Indian English · literary narration", sourceUrl: "https://www.youtube.com/watch?v=fJYrLUCNuCk" } },
  { title: "A cosy British pet story", focus: "Story · British accent", prompt: "Listen for the daily routine, the emotional change and the British expressions explained afterwards.", model: "The cat story uses an everyday home routine to introduce natural British vocabulary and contrasts it with American usage.", weak: "The video is a scientific lecture about animal behaviour.", detail: "a home routine becomes a British-English vocabulary lesson", distractors: ["a veterinary emergency report", "an Australian travel diary", "a formal university debate"], media: { provider: "youtube", videoId: "DWM-0868Ocs", title: "Pet Cat · Learn British English Through Story", creator: "English Natively", kind: "story", variety: "British English · everyday narration", sourceUrl: "https://www.youtube.com/watch?v=DWM-0868Ocs" } },
  { title: "News in slower American English", focus: "Report · American accent", prompt: "Identify the topic change, the key fact in each item and the speaker's neutral reporting tone.", model: "The programme presents several current-affairs items in slower American English and separates fact from review or recommendation.", weak: "One speaker tells a single fictional story from beginning to end.", detail: "several factual items are delivered in clear, paced American English", distractors: ["a British comedy sketch", "a Caribbean song performance", "an Australian travel story"], media: { provider: "youtube", videoId: "dVJeaIZ0Czc", title: "VOA Slow English listening selection", creator: "VOA Learning English selection", kind: "story", variety: "American English · news register", sourceUrl: "https://www.youtube.com/watch?v=dVJeaIZ0Czc" } },
  { title: "A moral story about self-control", focus: "Story · international English", prompt: "Follow the problem, the impulsive reaction and the lesson the narrator draws from the outcome.", model: "A talented worker loses an opportunity after reacting too quickly, so the story frames emotional control as a practical strength.", weak: "The central lesson is to make every decision immediately.", detail: "an impulsive reaction shows why emotional control matters", distractors: ["technical skill always prevents conflict", "anger creates a better opportunity", "the narrator rejects reflection"], media: { provider: "youtube", videoId: "wDxi6Sy4mD4", title: "Control Your Emotions · graded story", creator: "English Wisdom Stories", kind: "story", variety: "International English · clear narration", sourceUrl: "https://www.youtube.com/watch?v=wDxi6Sy4mD4" } },
  { title: "Riptide", focus: "Music · Australian indie", prompt: "Listen for the changing images, repeated hook and contrast between upbeat rhythm and uneasy details.", model: "The song links vivid, shifting images through a memorable refrain rather than a linear plot.", weak: "The song gives step-by-step academic instructions.", detail: "a repeated refrain connects surreal images and emotional tension", distractors: ["a chronological news report", "a formal debate between two speakers", "a literal travel itinerary"], media: { provider: "youtube", videoId: "uJ_1HMAGb4k", title: "Riptide", creator: "Vance Joy", kind: "song", variety: "Australian English · indie folk", sourceUrl: "https://www.youtube.com/watch?v=uJ_1HMAGb4k" } },
  { title: "Three Little Birds", focus: "Music · Jamaican reggae", prompt: "Notice the Caribbean pronunciation, relaxed pulse and reassuring idea repeated across the song.", model: "The repeated reassurance and steady reggae rhythm create an optimistic response to worry.", weak: "The singer develops a detailed argument about economic policy.", detail: "repetition and reggae rhythm reinforce reassurance", distractors: ["a tense warning about travel", "a tragic story with no resolution", "a neutral weather forecast"], media: { provider: "youtube", videoId: "HNBCVM4KbUM", title: "Three Little Birds", creator: "Bob Marley & The Wailers", kind: "song", variety: "Jamaican English · reggae", sourceUrl: "https://www.youtube.com/watch?v=HNBCVM4KbUM" } },
  { title: "Happy", focus: "Music · American pop/funk", prompt: "Track the repeated central emotion and how rhythm, clapping and imperatives invite participation.", model: "The song uses repetition and an energetic groove to turn happiness into a shared, participatory message.", weak: "The delivery is restrained and the central feeling remains unclear.", detail: "an energetic groove and repetition invite listeners to share the emotion", distractors: ["a slow account of personal loss", "a spoken academic presentation", "an unresolved mystery narrative"], media: { provider: "youtube", videoId: "ZbZSe6N_BXs", title: "Happy", creator: "Pharrell Williams", kind: "song", variety: "American English · pop/funk", sourceUrl: "https://www.youtube.com/watch?v=ZbZSe6N_BXs" } },
  { title: "Here Comes the Sun", focus: "Music · British pop", prompt: "Listen for the seasonal metaphor and the emotional movement from difficulty towards relief.", model: "The return of sunlight works as a metaphor for relief after a long difficult period.", weak: "The speaker argues that winter will never end.", detail: "a seasonal change represents renewed hope", distractors: ["sunlight represents greater danger", "the song compares university rankings", "the narrator rejects any emotional change"], media: { provider: "youtube", videoId: "KQetemT1sWc", title: "Here Comes the Sun", creator: "The Beatles", kind: "song", variety: "British English · acoustic pop", sourceUrl: "https://www.youtube.com/watch?v=KQetemT1sWc" } },
  { title: "I Have a Dream", focus: "Music · European pop English", prompt: "Identify how hope, imagination and belief are repeated as resources for coping with difficulty.", model: "The singer presents hope and imagination as inner resources that make difficult moments easier to face.", weak: "The song claims that personal belief has no practical emotional value.", detail: "hope and imagination are framed as support during difficulty", distractors: ["success is guaranteed without effort", "the singer recounts a legal dispute", "the song rejects future goals"], media: { provider: "youtube", videoId: "LxBbX9IdA2Y", title: "I Have a Dream", creator: "ABBA", kind: "song", variety: "Swedish-accented English · European pop", sourceUrl: "https://www.youtube.com/watch?v=LxBbX9IdA2Y" } },
];

const englishPronunciation: LevelSeed[] = [
  ["Clear introduction", "Pacing · key words", "Record a 45-second introduction: identity, intended major and one relevant experience.", "I am preparing to study International Business, and my school market project gave that goal a practical direction.", "Read every word with equal stress and no pauses.", "stress the major and the concrete experience", ["stress articles and prepositions", "speak as fast as possible", "avoid every pause"]],
  ["Thought groups", "Pausing · meaning", "Record the model sentence, pausing where the idea changes.", "After comparing the programmes, / I selected this course / because it connects trade analysis with regional expertise.", "Pause after every word.", "pause at meaningful phrase boundaries", ["pause only in the middle of names", "remove all pauses", "whisper the final phrase"]],
  ["Sentence stress", "Content words · contrast", "Explain why your chosen major fits you, using contrastive stress once.", "I chose International Business because I want to analyse markets, not simply describe them.", "Stress every syllable equally.", "make the contrast between analyse and describe audible", ["stress only 'because'", "drop the final idea", "speed up on the contrast"]],
  ["Final consonants", "Clarity · endings", "Record the sentence twice, keeping grammatical endings audible.", "The project helped me develop stronger research skills and more precise communication.", "Omit word endings to sound faster.", "keep plural and past-tense endings clear", ["add a vowel after every consonant", "stress only articles", "merge every word"]],
  ["Intonation for confidence", "Falling tone · completion", "Answer 'Why Korea?' in 60 seconds with a confident, non-memorised ending.", "Korea offers the regional context my academic question requires, and that is why the programme is a deliberate choice.", "Use rising intonation on every statement.", "use a settled fall to signal a complete central point", ["turn every statement into a question", "speak in one breath", "raise volume on every word"]],
  ["Repair naturally", "Reformulation · fluency", "Record an answer that includes one calm self-correction.", "Let me put that more precisely: the experience did not create my interest, but it clarified the problem I want to study.", "Apologise repeatedly and restart from the beginning.", "use a short repair phrase and continue with the clearer idea", ["abandon the answer", "hide the correction with speed", "repeat the same sentence"]],
  ["Numbers and names", "Chunking · accuracy", "Present one result containing a number, a date and a programme name.", "In 2025, our five-person team increased participation by seventeen percentage points.", "Rush through every number.", "separate numbers into clear, meaningful chunks", ["replace numbers with 'many'", "stress only the year", "lower volume on names"]],
  ["Long answer control", "Prominence · structure", "Give a 75-second answer using an audible opening, example and conclusion.", "My main reason is academic. For example, the export simulation exposed a gap in my knowledge. Therefore, I now want structured training in cross-border strategy.", "Use the same pitch throughout.", "signal the three parts with prominence and brief pauses", ["memorise without meaning", "pause inside every noun phrase", "remove the conclusion"]],
  ["Unexpected follow-up", "Response time · composure", "Answer an unexpected weakness question after five seconds of preparation.", "One current limitation is my Korean level; I address it through daily listening practice and a weekly error review.", "Fill every pause with repeated sounds.", "take a short silent pause, then answer directly", ["apologise for thinking", "change the question", "speak before choosing a point"]],
  ["Interview simulation", "Natural delivery · precision", "Record a two-minute response linking motivation, evidence, study plan and contribution.", "My goal is specific, the evidence shows how I prepared, and the study plan explains what I will do next.", "Perform a memorised speech without responding to the prompt.", "sound responsive while keeping key claims precise", ["maximise speed", "avoid emphasis", "add unsupported superlatives"]],
].map(([title, focus, prompt, model, weak, detail, distractors]) => ({ title, focus, prompt, model, weak, detail, distractors } as LevelSeed));

const koreanWriting: LevelSeed[] = [
  ["TOPIK I 문장 연결", "기초 연결어 · 문장", "‘한국어 공부 습관’에 대해 80~100자로 쓰세요.", "매일 짧게 복습하면 어휘를 오래 기억할 수 있기 때문에 학습 기록을 꾸준히 작성한다.", "한국어 좋아요. 공부 많이 해요.", "이유와 학습 행동을 연결한 문장", ["관련 없는 문장 목록", "이유 없는 감상", "같은 문장의 반복"]],
  ["이유와 결과", "-기 때문에 · 따라서", "봉사 활동이 필요한 이유를 100~120자로 쓰세요.", "봉사 활동은 전공 지식을 사회와 연결할 수 있기 때문에 필요하다. 따라서 학생이 참여할 기회를 넓혀야 한다.", "봉사는 좋다. 모두 해야 한다.", "이유와 그에 따른 결론", ["근거 없는 명령", "개인 취미만 설명", "반대 주제"]],
  ["격식 있는 문체", "-다 문체 · 어휘", "교환학생의 장점 한 가지를 120자로 설명하세요.", "교환학생 경험은 다른 관점을 직접 접하게 하므로 문제를 다양한 기준으로 분석하는 데 도움이 된다.", "교환학생은 진짜 좋고 재미있어요.", "일관된 문어체와 구체적인 장점", ["친구에게 쓰는 말투", "감탄 표현만 사용", "장점 없는 정의"]],
  ["비교하기", "반면에 · 기준", "온라인 수업과 대면 수업을 두 기준으로 비교하세요.", "온라인 수업은 반복 학습이 편리한 반면, 대면 수업은 즉각적인 상호 작용에 유리하다.", "둘 다 좋지만 다르다.", "분명한 기준에 따른 차이", ["기준 없는 선호", "한 방법만 설명", "새로운 주제"]],
  ["TOPIK II 3급 주장", "주장 · 근거", "대학생의 동아리 활동에 대한 의견을 150~180자로 쓰세요.", "동아리 활동은 협업 능력을 실제 상황에서 연습하게 하므로 학업과 균형을 이루는 범위에서 장려할 필요가 있다.", "동아리는 재미있으니까 무조건 좋다.", "입장과 이를 뒷받침하는 이유", ["절대적인 주장", "경험 없는 감상", "주제의 단순 반복"]],
  ["문제와 해결", "원인 · 대안", "유학생의 초기 적응 문제와 해결책을 180자로 쓰세요.", "정보가 여러 곳에 흩어져 있으면 초기 적응이 어렵다. 대학이 다국어 안내와 멘토링을 함께 제공하면 혼란을 줄일 수 있다.", "유학생은 힘들다. 학교가 잘해야 한다.", "구체적인 문제와 실행 가능한 해결책", ["여러 문제의 나열", "주체 없는 해결책", "한국 칭찬"]],
  ["자료 설명", "수치 · 변화", "참여율이 35%에서 52%로 변한 자료를 설명하세요.", "참여율은 35%에서 52%로 17%포인트 증가했다. 다만 이 자료만으로 증가 원인을 판단하기는 어렵다.", "참여율이 17% 증가해서 정책이 완벽했다.", "정확한 변화와 제한적인 해석", ["원인의 단정", "마지막 수치만 제시", "수치와 무관한 의견"]],
  ["반론 다루기", "양보 · 대응", "유학의 장점을 주장하고 비용 문제에 답하세요.", "유학 비용이 부담이 될 수 있으나 단계별 재정 지원을 제공하면 교육 기회의 불평등을 줄일 수 있다.", "유학에 반대하는 사람은 틀렸다.", "현실적인 반론과 적절한 대응", ["반대자 비난", "입장 없는 설명", "다른 장점 추가"]],
  ["학업 계획", "단계 · 실현 가능성", "첫 학년의 한국어 및 전공 학습 계획을 220자로 쓰세요.", "1학기에는 학술 어휘를 정리하고, 2학기에는 이를 활용해 한국과 스페인의 기업 사례 두 개를 비교하겠다.", "열심히 공부해서 모든 것을 잘하겠다.", "시간과 활동이 분명한 단계별 계획", ["일정 없는 포부", "과목명만 나열", "보장된 결과"]],
  ["TOPIK II 종합", "종합 · 한정", "준비 경험, 학업 목표와 졸업 후 기여를 300자로 연결하세요.", "기존 경험은 전공 선택의 근거가 되며 학업 계획은 다음 행동을 보여 준다. 졸업 후에는 그 지식을 한·스 협력 사례에 적용하되 성과를 지속적으로 평가하겠다.", "저는 꿈과 열정이 많아서 최고의 지원자이다.", "근거와 계획과 기여를 논리적으로 종합한 글", ["세 가지 목록", "절대적인 자기 칭찬", "결론의 새로운 주제"]],
].map(([title, focus, prompt, model, weak, detail, distractors]) => ({ title, focus, prompt, model, weak, detail, distractors } as LevelSeed));

const koreanListening: LevelSeed[] = [
  { title: "자연스러운 한국어 대화", focus: "대화 · 표준어", prompt: "두 화자의 관계, 대화의 중심 주제와 반응 표현을 메모하세요.", model: "두 화자는 자연스러운 속도로 경험과 의견을 주고받으며 상대의 말에 짧게 반응한다.", weak: "한 사람이 준비한 글을 혼자 읽는다.", detail: "두 화자가 경험과 의견을 자연스럽게 주고받는 대화", distractors: ["뉴스를 한 사람이 낭독함", "노래 가사를 설명함", "시험 날짜만 안내함"], media: { provider: "youtube", videoId: "6Y7VwFR5cDg", title: "1 HOUR Natural Korean Conversation", creator: "Talk To Me In Korean", kind: "story", variety: "서울 표준어 · 자연 대화", sourceUrl: "https://www.youtube.com/watch?v=6Y7VwFR5cDg" } },
  { title: "온라인 세종학당 안내", focus: "정보 · 학술 표준어", prompt: "기관이 제공하는 학습 방식과 이용 목적을 중심으로 들으세요.", model: "온라인 세종학당은 장소에 구애받지 않고 한국어와 한국 문화를 학습할 수 있는 과정을 소개한다.", weak: "영상은 한국 여행 상품만 판매한다.", detail: "온라인으로 한국어와 문화를 학습할 수 있는 기관 안내", distractors: ["대학 입학 결과 발표", "음악 공연 예고", "사투리만 배우는 강좌"], media: { provider: "youtube", videoId: "DJg3pVLbpSQ", title: "Online King Sejong Institute", creator: "King Sejong Institute Foundation", kind: "story", variety: "표준어 · 공식 안내", sourceUrl: "https://www.youtube.com/watch?v=DJg3pVLbpSQ" } },
  { title: "공부와 기억에 관한 대화", focus: "팟캐스트 · 빠른 대화", prompt: "화자들이 제시하는 공부 방법과 서로 다른 의견을 구분해 들으세요.", model: "화자들은 암기와 공부 습관을 이야기하며 각 방법의 장점과 한계를 비교한다.", weak: "화자들은 공부와 관련 없는 여행 일정만 정한다.", detail: "공부 습관과 기억 방법을 비교하는 빠른 대화", distractors: ["요리 순서를 설명하는 방송", "한 사람이 동화를 읽는 영상", "음악 장르를 순위로 정함"], media: { provider: "youtube", videoId: "hUixFwqpL18", title: "공부와 기억법 이야기", creator: "우왕좌왕 팟캐스트", kind: "story", variety: "표준어 · 자연 속도 팟캐스트", sourceUrl: "https://www.youtube.com/watch?v=hUixFwqpL18" } },
  { title: "응급실의 비밀", focus: "오디오드라마 · 감정", prompt: "사건의 출발점, 인물 관계와 긴장감이 커지는 단서를 들으세요.", model: "주인공은 오래전에 죽었다고 생각한 남편과 닮은 의사를 응급실에서 만나며 과거의 비밀을 마주한다.", weak: "주인공은 처음 만난 의사와 평범한 예약을 한다.", detail: "예상하지 못한 재회가 과거의 비밀과 긴장을 만든다", distractors: ["학교 축제가 취소됨", "가족이 여행 계획을 세움", "의사가 음악 대회를 준비함"], media: { provider: "youtube", videoId: "pTSJfq70i4M", title: "응급실의 비밀 · 오디오드라마", creator: "바람소리 이야기", kind: "story", variety: "표준어 · 감성 오디오드라마", sourceUrl: "https://www.youtube.com/watch?v=pTSJfq70i4M" } },
  { title: "백설공주 이야기", focus: "동화 · 명료한 발음", prompt: "등장인물, 사건의 순서와 반복되는 동화 표현을 중심으로 들으세요.", model: "백설공주는 위험을 피해 새로운 친구들을 만나고 갈등을 겪는 익숙한 동화 구조를 따른다.", weak: "주인공은 처음부터 끝까지 아무 문제도 겪지 않는다.", detail: "위험, 도움과 갈등이 순서대로 이어지는 동화", distractors: ["대학교 면접 안내", "경제 뉴스 요약", "현대 록 공연"], media: { provider: "youtube", videoId: "kjrhzyTeKsY", title: "백설공주 외 · 인기 세계 명작 동화", creator: "핑크퐁", kind: "story", variety: "표준어 · 또렷한 동화 구연", sourceUrl: "https://www.youtube.com/watch?v=kjrhzyTeKsY" } },
  { title: "Feel the Rhythm of Korea", focus: "음악 · 판소리 퓨전", prompt: "전통적인 창법과 현대적인 리듬이 어떻게 함께 사용되는지 관찰하세요.", model: "판소리의 반복적이고 강한 발성과 현대적인 리듬을 결합해 서울의 이미지를 새롭게 보여 준다.", weak: "전통 요소 없이 조용한 피아노 연주만 들린다.", detail: "판소리 발성과 현대 리듬을 결합한 서울 이미지", distractors: ["학술 강연의 차분한 설명", "서양 고전 음악 독주", "대화 없는 뉴스 화면"], media: { provider: "youtube", videoId: "3P1CnWI62Ik", title: "Feel the Rhythm of KOREA: SEOUL", creator: "한국관광공사", kind: "song", variety: "판소리 발성 · 얼터너티브 팝", sourceUrl: "https://www.youtube.com/watch?v=3P1CnWI62Ik" } },
  { title: "Palette · acoustic", focus: "음악 · 어쿠스틱 팝", prompt: "화자가 자신의 변화와 취향을 차분하게 설명하는 방식에 집중하세요.", model: "화자는 현재의 취향과 자아를 이전 시기와 비교하며 성장과 자기 이해를 이야기한다.", weak: "화자는 자신의 취향을 전혀 알 수 없다고 말한다.", detail: "현재의 자아와 취향을 과거와 비교하는 성찰", distractors: ["여행 경비를 계산함", "스포츠 경기 결과를 발표함", "역사 사건을 연도별로 설명함"], media: { provider: "youtube", videoId: "w7EnL9ehpfc", title: "Palette · Acoustic Version", creator: "IU Official", kind: "song", variety: "서울 표준어 · 어쿠스틱 팝", sourceUrl: "https://www.youtube.com/watch?v=w7EnL9ehpfc" } },
  { title: "어떻게 이별까지 사랑하겠어", focus: "음악 · 발라드", prompt: "사랑과 이별을 대조하는 핵심 정서와 느린 발음의 연결을 들으세요.", model: "노래는 사랑하는 사람과 이별이라는 상황을 구분하며 관계를 놓기 어려운 감정을 표현한다.", weak: "화자는 이별에 아무 감정도 느끼지 않는다.", detail: "사랑과 이별을 대조하며 놓기 어려운 감정을 표현함", distractors: ["새 직장을 축하함", "여행지를 추천함", "빠른 랩으로 정책을 비판함"], media: { provider: "youtube", videoId: "m3DZsBw5bnE", title: "어떻게 이별까지 사랑하겠어, 널 사랑하는 거지", creator: "AKMU", kind: "song", variety: "표준어 · 서정 발라드", sourceUrl: "https://www.youtube.com/watch?v=m3DZsBw5bnE" } },
  { title: "한 페이지가 될 수 있게", focus: "음악 · 밴드 록", prompt: "빠른 밴드 리듬 속에서 반복되는 시간과 추억의 이미지를 찾으세요.", model: "함께한 시간을 한 페이지에 비유하며 현재의 순간이 좋은 기억으로 남기를 바란다.", weak: "화자는 모든 추억을 즉시 잊고 싶어 한다.", detail: "함께한 순간을 기억에 남을 한 페이지로 비유함", distractors: ["시험 답안을 한 장으로 줄임", "과거를 모두 부정함", "도시 교통을 설명함"], media: { provider: "youtube", videoId: "vnS_jn2uibs", title: "한 페이지가 될 수 있게", creator: "DAY6", kind: "song", variety: "표준어 · 팝 록", sourceUrl: "https://www.youtube.com/watch?v=vnS_jn2uibs" } },
  { title: "봄날", focus: "음악 · K-pop", prompt: "계절 이미지와 기다림의 정서가 어떻게 연결되는지 들으세요.", model: "겨울과 봄의 변화를 사용해 그리움, 거리와 다시 만날 희망을 표현한다.", weak: "계절은 감정과 아무 관련 없이 날씨 정보로만 제시된다.", detail: "겨울에서 봄으로 가는 이미지가 그리움과 재회의 희망을 나타냄", distractors: ["여름 휴가 계획을 확정함", "친구와의 관계를 완전히 부정함", "경제 성장률을 비교함"], media: { provider: "youtube", videoId: "xEeFrLSkMm8", title: "봄날 · Spring Day", creator: "BTS", kind: "song", variety: "표준어 · K-pop 발라드", sourceUrl: "https://www.youtube.com/watch?v=xEeFrLSkMm8" } },
];

const koreanPronunciation: LevelSeed[] = [
  ["자기소개 또박또박", "속도 · 핵심어", "45초 동안 전공과 관련 경험을 포함해 자기소개를 녹음하세요.", "저는 국제경영을 공부하려고 준비하고 있으며 학교 시장 프로젝트를 통해 목표를 구체화했습니다.", "모든 말을 쉬지 않고 빠르게 읽습니다.", "전공과 구체적인 경험을 또렷하게 강조하는 것", ["조사만 강조하는 것", "가능한 한 빨리 말하는 것", "모든 쉼을 없애는 것"]],
  ["의미 단위", "끊어 읽기 · 의미", "문장의 의미가 바뀌는 곳에서 쉬며 녹음하세요.", "과정을 비교한 후 / 무역 분석과 지역 전문성을 연결하는 / 이 전공을 선택했습니다.", "한 글자마다 쉽니다.", "의미 단위의 경계에서 자연스럽게 쉬는 것", ["이름 중간에서만 쉬는 것", "쉼을 모두 없애는 것", "마지막 말을 작게 하는 것"]],
  ["받침 명료도", "받침 · 조사", "받침과 조사를 생략하지 않고 두 번 읽으세요.", "프로젝트를 통해 분석 능력과 정확한 의사소통 능력을 길렀습니다.", "빨리 말하려고 받침을 생략합니다.", "문법 정보를 주는 받침과 조사를 분명히 발음하는 것", ["모든 받침 뒤에 모음 추가", "첫 단어만 강조", "단어를 모두 연결"]],
  ["이유의 억양", "강조 · 결론", "‘왜 한국인가요?’에 60초 동안 답하세요.", "한국은 제 학업 질문에 필요한 지역적 맥락을 제공하기 때문에 의도적으로 선택했습니다.", "모든 문장의 끝을 질문처럼 올립니다.", "중심 이유를 강조하고 문장 끝을 안정적으로 내리는 것", ["모든 끝을 올리는 것", "한 번에 숨 없이 말하는 것", "모든 단어의 크기를 높이는 것"]],
  ["자연스러운 수정", "고쳐 말하기 · 유창성", "답변 중 한 번 자연스럽게 고쳐 말해 보세요.", "더 정확히 말씀드리면, 그 경험이 관심을 만든 것이 아니라 제가 공부할 문제를 구체화했습니다.", "계속 사과하고 처음부터 다시 시작합니다.", "짧은 수정 표현 뒤에 더 분명한 내용을 말하는 것", ["답변을 포기하는 것", "더 빨리 말해 숨기는 것", "같은 문장을 반복하는 것"]],
  ["숫자와 고유명사", "숫자 · 정확성", "숫자와 연도가 포함된 성과를 소개하세요.", "2025년에 5명의 팀원과 함께 참여율을 17퍼센트포인트 높였습니다.", "숫자를 모두 빠르게 읽습니다.", "숫자를 의미 있는 단위로 나누어 정확히 말하는 것", ["숫자를 ‘많이’로 바꾸는 것", "연도만 강조하는 것", "이름을 작게 말하는 것"]],
  ["긴 답변 구조", "표지 표현 · 호흡", "도입, 예시, 결론이 있는 75초 답변을 녹음하세요.", "가장 중요한 이유는 학업입니다. 예를 들어 수출 모의 활동에서 지식의 부족을 확인했습니다. 따라서 국제 전략을 체계적으로 배우고 싶습니다.", "같은 높이로 계속 읽습니다.", "세 부분을 표지 표현과 짧은 쉼으로 구분하는 것", ["뜻 없이 외우는 것", "명사 중간에서 쉬는 것", "결론을 빼는 것"]],
  ["예상 밖 질문", "생각할 시간 · 침착함", "약점에 관한 질문을 듣고 5초 준비 후 답하세요.", "현재의 한계는 한국어 수준이지만 매일 듣기와 주간 오답 검토로 보완하고 있습니다.", "모든 쉼을 의미 없는 소리로 채웁니다.", "잠깐 조용히 생각한 뒤 직접 답하는 것", ["생각해서 미안하다고 하는 것", "질문을 바꾸는 것", "내용을 정하기 전에 말하는 것"]],
  ["전공 용어 설명", "전문어 · 쉬운 설명", "전공 용어 하나를 면접관에게 쉽게 설명하세요.", "시장 세분화란 비슷한 필요를 가진 소비자를 그룹으로 나누어 전략을 정하는 과정입니다.", "어려운 용어를 더 많이 사용합니다.", "전문어 뒤에 쉬운 정의와 예시를 붙이는 것", ["정의 없이 영어만 쓰는 것", "용어를 여러 번 반복", "목소리를 낮추는 것"]],
  ["GKS 면접 시뮬레이션", "자연스러움 · 정확성", "동기, 근거, 학업 계획과 기여를 연결해 2분간 녹음하세요.", "목표는 구체적으로, 준비는 근거로, 학업 계획은 다음 행동으로 설명하겠습니다.", "질문과 상관없이 외운 글을 말합니다.", "질문에 반응하면서 핵심 주장을 정확히 유지하는 것", ["속도를 최대화하는 것", "강조를 없애는 것", "근거 없는 최고 표현"]],
].map(([title, focus, prompt, model, weak, detail, distractors]) => ({ title, focus, prompt, model, weak, detail, distractors } as LevelSeed));

function questions(language: TestLanguage, skill: TestSkill, level: number, seed: LevelSeed): TestQuestion[] {
  const id = `${language}-${skill}-${level}`;
  const isKo = language === "ko";
  const common = { passage: skill === "pronunciation" ? seed.model : undefined, audioText: skill === "listening" && !seed.media ? seed.model : undefined };
  return varyAnswerPositions([
    {
      id: `${id}-main`, skill: isKo ? "핵심 이해" : "Core task", ...common,
      prompt: skill === "listening" ? (isKo ? "영상의 중심 내용으로 가장 알맞은 것은 무엇입니까?" : "Which option best captures the video's main idea?") : (isKo ? "이 과제에서 가장 중요한 것은 무엇입니까?" : "What is the most important requirement in this task?"),
      options: [seed.detail, ...seed.distractors], correctIndex: 0,
      explanation: isKo ? `핵심은 ${seed.detail}입니다.` : `The response must show ${seed.detail}.`,
      improvement: isKo ? "질문의 요구 사항을 한 문장으로 먼저 정리하세요." : "Restate the exact task in one sentence before responding.",
    },
    {
      id: `${id}-model`, skill: isKo ? "좋은 모델" : "Effective model",
      prompt: skill === "listening" ? (isKo ? "영상의 내용을 가장 정확하게 요약한 문장을 고르세요." : "Choose the most accurate summary of the video.") : (isKo ? "더 효과적인 표현을 고르세요." : "Choose the more effective response."),
      options: [seed.weak, seed.model, seed.distractors[0], seed.distractors[1]], correctIndex: 1,
      explanation: isKo ? "구체적인 내용과 논리 관계가 드러납니다." : "It gives specific content and makes the relationship between ideas clear.",
      improvement: isKo ? "일반적인 평가 대신 행동, 이유 또는 결과를 제시하세요." : "Replace general evaluation with an action, reason or result.",
    },
    {
      id: `${id}-strategy`, skill: isKo ? "전략" : "Strategy",
      prompt: skill === "pronunciation" ? (isKo ? "녹음 후 가장 먼저 확인할 것은 무엇입니까?" : "What should you check first after recording?") : skill === "listening" ? (isKo ? "이 영상으로 듣기를 연습하는 가장 좋은 방법은 무엇입니까?" : "What is the best way to practise listening with this video?") : (isKo ? "가장 효과적인 수행 전략은 무엇입니까?" : "Which is the most effective strategy?"),
      options: skill === "listening"
        ? (isKo ? ["먼저 자막 없이 듣고, 어려운 부분만 다시 확인한다.", "처음부터 번역만 읽는다.", "영상 없이 제목만 외운다.", "모르는 단어마다 즉시 재생을 멈춘다."] : ["Listen once without subtitles, then replay only difficult sections.", "Read a translation before listening.", "Memorise the title without watching.", "Stop after every unfamiliar word."])
        : (isKo ? ["요구 사항과 핵심어를 확인한다.", "무조건 어려운 표현을 추가한다.", "속도만 높인다.", "첫 답을 검토하지 않는다."] : ["Check the task and the key meaning units.", "Add difficult words regardless of meaning.", "Focus only on speed.", "Never review the first response."]), correctIndex: 0,
      explanation: isKo ? "정확한 수행은 요구와 핵심 의미를 확인하는 데서 시작합니다." : "Accurate performance starts by checking the task and its key meaning units.",
      improvement: isKo ? "내용, 구조, 언어를 순서대로 검토하세요." : "Review content, structure and language in that order.",
    },
    {
      id: `${id}-official`, skill: isKo ? "시험 인식" : "Assessment awareness",
      prompt: skill === "listening" ? (isKo ? "이번 영상에서 집중해야 할 발화 유형은 무엇입니까?" : "Which delivery variety should you focus on in this video?") : (isKo ? "이 과제를 검토할 때 기록해야 할 핵심 근거는 무엇입니까?" : "Which evidence belongs in the review log for this task?"),
      options: skill === "listening" && seed.media
        ? [seed.media.variety, isKo ? "무음 자료" : "Silent material", isKo ? "스페인어 공식 연설" : "Formal speech in Spanish", isKo ? "기계음만 사용" : "Synthetic speech only"]
        : [seed.detail, ...seed.distractors], correctIndex: 0,
      explanation: skill === "listening" && seed.media ? (isKo ? `이번 자료는 ${seed.media.variety}에 집중합니다.` : `This resource focuses on ${seed.media.variety}.`) : (isKo ? `검토 기록은 ${seed.detail}을 확인해야 합니다.` : `The review log must verify ${seed.detail}.`),
      improvement: skill === "listening" ? (isKo ? "발음뿐 아니라 속도, 리듬과 감정도 함께 메모하세요." : "Note pace, rhythm and emotion as well as pronunciation.") : (isKo ? "과제의 핵심 기준을 실제 초안이나 녹음의 근거와 연결하세요." : "Connect the task criterion to evidence in the actual draft or recording."),
    },
  ], level);
}

function challenges(language: TestLanguage, skill: TestSkill, level: number, seed: LevelSeed): TestQuestion[] {
  const id = `${language}-${skill}-${level}`;
  const isKo = language === "ko";
  return varyAnswerPositions([
    {
      id: `${id}-challenge-edit`, skill: isKo ? "정교화" : "Refinement",
      prompt: isKo ? "첫 답변을 가장 효과적으로 개선하는 방법은 무엇입니까?" : "Which revision most effectively improves the first response?",
      options: [seed.model, seed.weak, isKo ? "매우, 정말, 항상을 추가한다." : "Add very, really and always.", isKo ? "구체적인 내용을 삭제한다." : "Remove the specific detail."], correctIndex: 0,
      explanation: isKo ? `개선된 답은 ${seed.detail}을 보여 줍니다.` : `The revision demonstrates ${seed.detail}.`,
      improvement: isKo ? "추상적인 말을 검증 가능한 내용으로 바꾸세요." : "Turn abstract language into verifiable content.",
    },
    {
      id: `${id}-challenge-transfer`, skill: isKo ? "전이" : "Transfer",
      prompt: isKo ? "더 어려운 재시도에서 유지해야 할 원칙은 무엇입니까?" : "Which principle should remain in a harder timed retake?",
      options: isKo ? ["정확성을 유지하면서 더 복잡한 내용을 추가한다.", "복잡성을 위해 정확성을 포기한다.", "외운 답을 질문과 관계없이 말한다.", "피드백을 보지 않는다."] : ["Add complexity while preserving accuracy.", "Sacrifice accuracy for complexity.", "Use a memorised response regardless of the prompt.", "Ignore previous feedback."], correctIndex: 0,
      explanation: isKo ? "재시도는 같은 역량을 더 엄격한 조건에서 확인합니다." : "A retake checks the same skill under stricter conditions.",
      improvement: isKo ? "이전 피드백 중 한 가지를 재시도 목표로 정하세요." : "Choose one previous feedback point as the retake target.",
    },
  ], level + 2);
}

function buildStages(language: TestLanguage, skill: TestSkill, seeds: LevelSeed[]): TestStage[] {
  const isKo = language === "ko";
  const icons: Record<TestSkill, string> = { writing: isKo ? "쓰" : "✎", listening: isKo ? "듣" : "◖", pronunciation: isKo ? "말" : "🎙" };
  const mode: ProductionMode = skill === "writing" ? "writing" : skill === "listening" ? "listening" : "speaking";
  return seeds.map((seed, index) => ({
    id: `${language}-${skill}-${String(index + 1).padStart(2, "0")}`,
    order: index + 1,
    skill,
    icon: icons[skill],
    title: seed.title,
    description: seed.detail,
    focus: seed.focus,
    estimatedMinutes: (skill === "listening" ? 10 : 7) + Math.floor(index / 3),
    passScore: 70,
    media: seed.media ? {
      ...seed.media,
      startSeconds: seed.media.startSeconds ?? 0,
      endSeconds: seed.media.endSeconds ?? 180,
      excerptMinutes: seed.media.excerptMinutes ?? 3,
    } : undefined,
    productionTask: {
      mode,
      prompt: seed.prompt,
      instructions: skill === "listening"
        ? (isKo ? "YouTube 영상을 먼저 한 번 듣고, 어려운 부분만 다시 확인한 뒤 문제로 이동하세요." : "Watch the YouTube resource once, replay only difficult sections, then continue to the questions.")
        : skill === "pronunciation"
          ? (isKo ? "먼저 핵심어를 표시하고 녹음한 뒤 내용, 발음과 속도를 스스로 확인하세요." : "Mark key words, record, then review meaning, pronunciation and pace.")
          : (isKo ? "초안을 작성한 뒤 내용, 구조와 문어체를 차례로 확인하세요." : "Draft first, then review content, structure and academic register."),
      checklist: skill === "listening"
        ? (isKo ? ["숫자와 전환 표현을 메모함", "중심 내용과 세부 정보를 구분함", "답을 고르기 전 전체 의미를 확인함"] : ["Note numbers and contrast signals", "Separate main idea from detail", "Check the whole meaning before choosing"])
        : skill === "pronunciation"
          ? (isKo ? ["핵심어가 들림", "의미 단위로 자연스럽게 쉼", "녹음을 듣고 한 가지를 수정함"] : ["Key words are audible", "Pauses follow meaning units", "One point is revised after playback"])
          : (isKo ? ["모든 요구 사항에 답함", "구체적인 근거나 예시가 있음", "문어체와 연결을 검토함"] : ["Every part of the task is answered", "Evidence or a concrete example is included", "Register and cohesion are reviewed"]),
      minimumCharacters: skill === "writing" ? (isKo ? 60 + index * 18 : 320 + index * 45) : undefined,
      minimumWords: skill === "writing" && !isKo ? 100 + Math.min(index * 10, 90) : undefined,
      maximumWords: skill === "writing" && !isKo ? 120 + Math.min(index * 10, 100) : undefined,
      targetSeconds: skill === "pronunciation" ? 45 + Math.min(index * 8, 75) : undefined,
      retakeInstruction: skill === "writing"
        ? (isKo ? "재시도: 같은 주장을 유지하되 반대 관점 한 문장과 구체적인 근거를 추가하세요." : "Retake: preserve your claim, add one counterpoint and one verifiable detail.")
        : skill === "listening"
          ? (isKo ? "재시도: 자막 없이 듣고 근거가 나온 시간을 메모하세요." : "Retake: listen without subtitles and note the timestamp supporting your answer.")
          : (isKo ? "재시도: 첫 녹음보다 천천히 말하고 한 가지 자연스러운 수정 표현을 사용하세요." : "Retake: speak more slowly than before and include one natural self-correction."),
    },
    questions: questions(language, skill, index + 1, seed),
    challengeQuestions: challenges(language, skill, index + 1, seed),
  }));
}

function makeTrack(language: TestLanguage): TestTrack {
  const isKo = language === "ko";
  const writing = buildStages(language, "writing", isKo ? koreanWriting : englishWriting);
  const listening = buildStages(language, "listening", isKo ? koreanListening : englishListening);
  const pronunciation = buildStages(language, "pronunciation", isKo ? koreanPronunciation : englishPronunciation);
  return {
    language,
    label: isKo ? "TOPIK I → II · 한국어 역량" : "English B1/B2 → C1",
    shortLabel: isKo ? "한" : "EN",
    target: isKo ? "TOPIK I 기반 → TOPIK II 3급" : "B1/B2 foundation → C1 readiness",
    sourceLabel: isKo ? "TOPIK official learning and IBT practice · pronunciation is GKS interview preparation" : "IELTS official Academic test format · adapted as non-official GKS preparation",
    sourceUrl: isKo ? "https://www.topik.go.kr/" : "https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail",
    stages: [...writing, ...listening, ...pronunciation],
  };
}

export const practiceTestTracks: Record<TestLanguage, TestTrack> = {
  en: makeTrack("en"),
  ko: makeTrack("ko"),
};

export const TESTS_PER_SKILL = 10;
export const TESTS_PER_LANGUAGE = 30;
