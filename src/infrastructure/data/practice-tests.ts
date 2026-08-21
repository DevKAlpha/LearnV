import type {
  ProductionMode,
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
};

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
  ["Dates and deadlines", "Key detail · correction", "Listen once, note the final deadline, then answer without reading a transcript.", "The briefing was planned for Tuesday, but it will now take place on Thursday at four p.m. Please confirm attendance by Wednesday noon.", "The briefing remains on Tuesday.", "Wednesday at noon", ["Tuesday at four", "Thursday at noon", "Friday at noon"]],
  ["Instructions", "Sequence · required action", "Listen for what must be completed before the next step.", "Before uploading the transcript, check that every page shows your name. Only then should you add the certified translation.", "Upload everything immediately.", "check that every page shows the applicant's name", ["remove the translation", "rename the university", "print only the first page"]],
  ["Reason and result", "Cause · effect", "Listen for the reason behind the speaker's recommendation.", "Keep a copy of each submitted file because the portal does not allow edits after final submission.", "Copies are required for decoration.", "the portal does not allow changes after final submission", ["the portal deletes names", "paper is always preferred", "the interview is cancelled"]],
  ["Speaker attitude", "Tone · evaluation", "Identify how the speaker balances strengths and concerns.", "Your motivation is specific and the example is convincing. I would, however, make the link to your study plan more explicit.", "The speaker rejects the whole answer.", "positive overall, with one precise recommendation", ["entirely negative", "uncertain about every point", "uncritically enthusiastic"]],
  ["Academic mini-lecture", "Main idea · support", "Listen for the main claim and the example used to support it.", "Trade statistics can reveal a pattern, but they cannot explain it alone. For example, a rise in exports may reflect exchange-rate changes rather than stronger demand.", "Statistics explain every cause.", "patterns require contextual evidence before causes are claimed", ["exports always mean demand", "exchange rates never matter", "statistics should not be used"]],
  ["Two viewpoints", "Contrast · attribution", "Separate the two speakers' positions in a short academic exchange.", "Mina argues that online interviews improve access. Daniel agrees on access, but warns that unstable connections may affect how candidates are perceived.", "Both speakers oppose online interviews.", "Daniel accepts the access benefit but raises a fairness concern", ["Mina discusses tuition", "Daniel rejects access", "both discuss only costs"]],
  ["Numbers and qualification", "Data · limitation", "Capture the change and the limitation mentioned by the speaker.", "Applications increased from 240 to 300, although the reporting period was one month longer than last year.", "Applications fell by sixty.", "applications rose by 60, but the periods were not directly comparable", ["applications rose by 300", "the periods were identical", "the increase proves quality"]],
  ["Implicit meaning", "Inference · context", "Infer what the speaker is politely asking the listener to do.", "The introduction is already two minutes long, and we still need time for your study plan.", "The study plan should be removed.", "shorten the introduction", ["speak more slowly", "add another example", "end the interview"]],
  ["Fast interview follow-up", "Paraphrase · response", "Listen for a follow-up that challenges an unsupported claim.", "You said this programme is uniquely suitable. Which course or research opportunity makes it more suitable than your other choices?", "The interviewer asks for the university address.", "provide comparative, programme-specific evidence", ["repeat that it is unique", "list personal hobbies", "change the chosen major"]],
  ["C1 synthesis listening", "Synthesis · stance", "Listen twice and identify the qualified conclusion across the whole extract.", "The pilot improved confidence scores, yet academic results remained stable. The team therefore recommends extending the trial, not adopting it institution-wide.", "The programme should be adopted everywhere now.", "continue testing because the evidence is promising but incomplete", ["stop the pilot immediately", "confidence did not change", "academic results proved success"]],
].map(([title, focus, prompt, model, weak, detail, distractors]) => ({ title, focus, prompt, model, weak, detail, distractors } as LevelSeed));

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
  ["TOPIK I 시간 정보", "시간 · 변경", "음성을 듣고 최종 시간을 메모하세요.", "모임은 화요일이 아니라 목요일 오후 네 시에 합니다. 수요일 정오까지 참석 여부를 알려 주세요.", "모임은 화요일에 합니다.", "수요일 정오까지 참석 여부를 알리는 것", ["화요일 네 시에 참석", "목요일 정오에 제출", "금요일에 연락"]],
  ["순서와 행동", "지시 · 순서", "다음 단계 전에 해야 할 일을 들으세요.", "성적표를 올리기 전에 모든 페이지에 이름이 있는지 확인한 후 번역본을 추가하세요.", "바로 모든 파일을 올리세요.", "모든 페이지의 이름을 확인하는 것", ["번역본을 삭제하는 것", "대학교 이름을 바꾸는 것", "첫 페이지만 인쇄하는 것"]],
  ["이유 파악", "원인 · 결과", "화자의 권고 이유를 찾으세요.", "최종 제출 후에는 내용을 수정할 수 없으므로 제출한 파일의 사본을 보관하세요.", "사본은 꾸미기 위해 필요합니다.", "최종 제출 후 수정할 수 없기 때문", ["파일 이름이 사라지기 때문", "종이만 인정되기 때문", "면접이 취소되기 때문"]],
  ["화자의 태도", "평가 · 전환", "장점과 개선점을 구분해서 들으세요.", "지원 동기는 구체적이고 예시도 적절합니다. 다만 학업 계획과의 연결을 더 분명히 하세요.", "화자는 답변 전체를 부정합니다.", "전체적으로 긍정적이지만 한 가지 개선점을 제시함", ["완전히 부정적임", "모든 내용을 의심함", "조건 없이 만족함"]],
  ["TOPIK II 중심 내용", "주장 · 예시", "짧은 설명의 중심 생각을 찾으세요.", "통계는 현상을 보여 주지만 원인을 모두 설명하지는 못한다. 예를 들어 수출 증가는 수요보다 환율 변화의 영향일 수 있다.", "통계는 모든 원인을 설명합니다.", "원인을 판단하려면 통계 외의 맥락이 필요함", ["수출은 항상 수요를 뜻함", "환율은 중요하지 않음", "통계를 사용하면 안 됨"]],
  ["두 의견 비교", "대조 · 입장", "두 사람의 공통점과 차이점을 들으세요.", "민아는 온라인 면접이 접근성을 높인다고 말한다. 다니엘도 이에 동의하지만 연결 상태가 평가에 영향을 줄 수 있다고 지적한다.", "두 사람 모두 온라인 면접에 반대합니다.", "다니엘은 접근성에 동의하면서 공정성 문제를 제기함", ["민아는 등록금을 말함", "다니엘은 접근성을 부정함", "두 사람은 비용만 말함"]],
  ["수치와 조건", "변화 · 한계", "수치 변화와 비교의 한계를 함께 메모하세요.", "지원자는 240명에서 300명으로 늘었지만 조사 기간이 작년보다 한 달 더 길었다.", "지원자는 60명 줄었습니다.", "60명 늘었지만 조사 기간이 달라 직접 비교하기 어려움", ["300명 증가함", "기간이 같음", "증가가 질을 증명함"]],
  ["간접 표현", "추론 · 요청", "화자가 실제로 원하는 행동을 추론하세요.", "자기소개가 벌써 2분이 되었는데 아직 학업 계획을 말할 시간이 필요합니다.", "학업 계획을 삭제해야 합니다.", "자기소개를 줄이는 것", ["더 천천히 말하는 것", "예시를 추가하는 것", "면접을 끝내는 것"]],
  ["빠른 추가 질문", "바꿔 말하기 · 근거", "면접관의 질문이 요구하는 근거를 찾으세요.", "이 과정이 특별히 적합하다고 했는데, 다른 선택보다 적합한 이유를 보여 주는 과목이나 연구 기회는 무엇입니까?", "대학교 주소를 묻습니다.", "과정에 관한 비교 가능하고 구체적인 근거", ["특별하다는 말의 반복", "개인 취미 목록", "전공 변경"]],
  ["TOPIK II 종합 듣기", "종합 · 결론", "전체 내용을 듣고 제한적인 결론을 고르세요.", "시범 프로그램 후 자신감 점수는 높아졌지만 학업 성적은 유지되었다. 연구팀은 전면 도입보다 시범 기간 연장을 권고했다.", "지금 모든 곳에 도입해야 합니다.", "가능성은 있으나 근거가 부족해 검증을 계속해야 함", ["즉시 중단해야 함", "자신감이 변하지 않음", "성적이 성공을 증명함"]],
].map(([title, focus, prompt, model, weak, detail, distractors]) => ({ title, focus, prompt, model, weak, detail, distractors } as LevelSeed));

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
  const common = { passage: skill === "pronunciation" ? seed.model : undefined, audioText: skill === "listening" ? seed.model : undefined };
  return [
    {
      id: `${id}-main`, skill: isKo ? "핵심 이해" : "Core task", ...common,
      prompt: skill === "listening" ? (isKo ? "들은 내용으로 가장 알맞은 것은 무엇입니까?" : "Which option best matches what you heard?") : (isKo ? "이 과제에서 가장 중요한 것은 무엇입니까?" : "What is the most important requirement in this task?"),
      options: [seed.detail, ...seed.distractors], correctIndex: 0,
      explanation: isKo ? `핵심은 ${seed.detail}입니다.` : `The response must show ${seed.detail}.`,
      improvement: isKo ? "질문의 요구 사항을 한 문장으로 먼저 정리하세요." : "Restate the exact task in one sentence before responding.",
    },
    {
      id: `${id}-model`, skill: isKo ? "좋은 모델" : "Effective model",
      prompt: isKo ? "더 효과적인 표현을 고르세요." : "Choose the more effective response.",
      options: [seed.weak, seed.model, isKo ? "열심히 하겠습니다." : "I will always do my best.", isKo ? "잘 모르겠습니다." : "There are many possible answers."], correctIndex: 1,
      explanation: isKo ? "구체적인 내용과 논리 관계가 드러납니다." : "It gives specific content and makes the relationship between ideas clear.",
      improvement: isKo ? "일반적인 평가 대신 행동, 이유 또는 결과를 제시하세요." : "Replace general evaluation with an action, reason or result.",
    },
    {
      id: `${id}-strategy`, skill: isKo ? "전략" : "Strategy",
      prompt: skill === "pronunciation" ? (isKo ? "녹음 후 가장 먼저 확인할 것은 무엇입니까?" : "What should you check first after recording?") : (isKo ? "가장 효과적인 수행 전략은 무엇입니까?" : "Which is the most effective strategy?"),
      options: isKo ? ["요구 사항과 핵심어를 확인한다.", "무조건 어려운 표현을 추가한다.", "속도만 높인다.", "첫 답을 검토하지 않는다."] : ["Check the task and the key meaning units.", "Add difficult words regardless of meaning.", "Focus only on speed.", "Never review the first response."], correctIndex: 0,
      explanation: isKo ? "정확한 수행은 요구와 핵심 의미를 확인하는 데서 시작합니다." : "Accurate performance starts by checking the task and its key meaning units.",
      improvement: isKo ? "내용, 구조, 언어를 순서대로 검토하세요." : "Review content, structure and language in that order.",
    },
    {
      id: `${id}-official`, skill: isKo ? "시험 인식" : "Assessment awareness",
      prompt: isKo ? "이 LearnV 연습에 대한 설명으로 맞는 것은 무엇입니까?" : "Which statement about this LearnV practice is accurate?",
      options: isKo ? ["학습용 연습이며 공식 성적이 아니다.", "공식 TOPIK 성적을 발급한다.", "GKS 합격을 보장한다.", "녹음을 서버에 제출한다."] : ["It is learning practice, not an official score.", "It issues an official IELTS score.", "It guarantees GKS selection.", "It uploads recordings for admission."], correctIndex: 0,
      explanation: isKo ? "LearnV 결과는 학습 방향을 위한 참고 자료입니다." : "LearnV results guide study and do not replace official assessment.",
      improvement: isKo ? "공식 시험 기준과 학습용 피드백을 구분하세요." : "Keep official criteria separate from formative practice feedback.",
    },
  ];
}

function challenges(language: TestLanguage, skill: TestSkill, level: number, seed: LevelSeed): TestQuestion[] {
  const id = `${language}-${skill}-${level}`;
  const isKo = language === "ko";
  return [
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
  ];
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
    estimatedMinutes: 5 + Math.floor(index / 3),
    passScore: 70,
    productionTask: {
      mode,
      prompt: seed.prompt,
      instructions: skill === "listening"
        ? (isKo ? "준비가 되면 계속하세요. 각 문항의 음성은 기기에서 재생되며 두 번까지 듣는 것을 권장합니다." : "Continue when ready. Audio is generated on your device; listen no more than twice per item.")
        : skill === "pronunciation"
          ? (isKo ? "먼저 핵심어를 표시하고 녹음한 뒤 내용, 발음과 속도를 스스로 확인하세요." : "Mark key words, record, then review meaning, pronunciation and pace.")
          : (isKo ? "초안을 작성한 뒤 내용, 구조와 문어체를 차례로 확인하세요." : "Draft first, then review content, structure and academic register."),
      checklist: skill === "listening"
        ? (isKo ? ["숫자와 전환 표현을 메모함", "중심 내용과 세부 정보를 구분함", "답을 고르기 전 전체 의미를 확인함"] : ["Note numbers and contrast signals", "Separate main idea from detail", "Check the whole meaning before choosing"])
        : skill === "pronunciation"
          ? (isKo ? ["핵심어가 들림", "의미 단위로 자연스럽게 쉼", "녹음을 듣고 한 가지를 수정함"] : ["Key words are audible", "Pauses follow meaning units", "One point is revised after playback"])
          : (isKo ? ["모든 요구 사항에 답함", "구체적인 근거나 예시가 있음", "문어체와 연결을 검토함"] : ["Every part of the task is answered", "Evidence or a concrete example is included", "Register and cohesion are reviewed"]),
      minimumCharacters: skill === "writing" ? (isKo ? 60 + index * 18 : 320 + index * 45) : undefined,
      targetSeconds: skill === "pronunciation" ? 45 + Math.min(index * 8, 75) : undefined,
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
    sourceUrl: isKo ? "https://www.topik.go.kr/" : "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-in-detail",
    stages: [...writing, ...listening, ...pronunciation],
  };
}

export const practiceTestTracks: Record<TestLanguage, TestTrack> = {
  en: makeTrack("en"),
  ko: makeTrack("ko"),
};

export const TESTS_PER_SKILL = 10;
export const TESTS_PER_LANGUAGE = 30;

