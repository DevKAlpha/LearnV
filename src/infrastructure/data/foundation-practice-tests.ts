import type { ProductionTask, TestLanguage, TestQuestion, TestSkill, TestStage } from "../../domain/models/language-test";

type FoundationSkill = Extract<TestSkill, "reading" | "grammar" | "vocabulary">;

type FoundationSeed = {
  title: string;
  focus: string;
  passage: string;
  prompt: string;
  correct: string;
  wrong: [string, string, string];
  rule: string;
  example: string;
  transfer: string;
};

const seed = (
  title: string,
  focus: string,
  passage: string,
  prompt: string,
  correct: string,
  wrong: [string, string, string],
  rule: string,
  example: string,
  transfer: string,
): FoundationSeed => ({ title, focus, passage, prompt, correct, wrong, rule, example, transfer });

const englishReading: FoundationSeed[] = [
  seed("Read a campus notice", "Scanning · obligation", "LIBRARY NOTICE: The second floor closes at 18:00 on Friday. Return reserved books at the ground-floor desk before 17:30.", "What must a student with a reserved book do?", "Return it at the ground-floor desk before 17:30.", ["Leave it on the second floor after 18:00.", "Keep it until Monday without asking.", "Return it to any classroom at 17:30."], "Scan for the action, place and deadline; do not answer from a familiar keyword alone.", "The imperative ‘Return’ identifies the required action, while ‘before 17:30’ limits the time.", "When reading a notice, underline who acts, what they must do and by when."),
  seed("Follow an email request", "Purpose · next action", "Hi Mina, I have attached the revised timetable. Please confirm by noon whether the Tuesday seminar conflicts with your lab. Best, Dr Cole", "Why did Dr Cole write?", "To ask Mina to confirm a possible timetable conflict.", ["To cancel every Tuesday seminar.", "To announce that the lab has closed.", "To request a new research report."], "The purpose normally appears in the requested action, not in the background detail.", "‘Please confirm’ signals what the reader must do next.", "After reading an email, state its purpose as an action: ask, inform, confirm or arrange."),
  seed("Compare a timetable", "Table reading · constraints", "Workshop A: Mon 09:00, room 4. Workshop B: Tue 14:00, online. Workshop C: Wed 09:00, room 7. Leo works Monday and needs a remote session.", "Which workshop fits Leo?", "Workshop B.", ["Workshop A.", "Workshop C.", "None of the workshops."], "Combine every stated constraint before choosing; one matching detail is not enough.", "Workshop B is both outside Monday and online.", "Turn each constraint into a checkbox and reject any option that fails one."),
  seed("Find the main idea", "Main idea · support", "Peer mentoring can reduce the uncertainty new international students feel. Mentors answer practical questions, model campus routines and direct students to specialist services when necessary.", "What is the paragraph mainly about?", "How peer mentoring supports new international students.", ["Why specialist services should replace mentors.", "How to recruit only international staff.", "Why campus routines should never change."], "A main idea covers all supporting details without becoming broader than the paragraph.", "Questions, routines and referrals all support the benefit of peer mentoring.", "Check that every sentence can sit underneath your chosen main idea."),
  seed("Track a reference word", "Cohesion · pronouns", "The committee rejected the first proposal because it lacked cost estimates. This prompted the team to submit a revised budget.", "What does ‘This’ refer to?", "The committee's rejection of the first proposal.", ["The revised budget itself.", "The cost estimates alone.", "The team joining the committee."], "A reference word can point to a whole previous event, not only the nearest noun.", "‘This prompted’ means the rejection caused the next action.", "Replace the reference word with your answer and check whether the sentence still makes sense."),
  seed("Infer from evidence", "Inference · cautious conclusion", "Applications rose by 30%, but the programme added only five places. Staff expect interviews to take longer than last year.", "What can reasonably be inferred?", "Competition and processing pressure may increase.", ["Every applicant will receive a place.", "Interviews have already been cancelled.", "Application quality fell by exactly 30%."], "An inference must follow from the evidence and remain as cautious as the source.", "More applications with few extra places can increase competition, but does not prove individual outcomes.", "Use may, likely or suggests when the text does not establish certainty."),
  seed("Recognise tone", "Tone · wording", "We appreciate the effort behind the draft. However, several claims still need sources before the report can be approved.", "How would you describe the tone?", "Professional, appreciative and cautious.", ["Angry and insulting.", "Completely enthusiastic and final.", "Humorous and informal."], "Tone comes from the combination of evaluation, qualifiers and register.", "‘Appreciate’ softens the criticism, while ‘however’ introduces a necessary limitation.", "Identify one positive and one limiting expression before naming the tone."),
  seed("Identify paragraph purpose", "Structure · function", "Although online advising is convenient, some students lack stable connections. Universities should therefore keep bookable in-person appointments.", "What does the second sentence do?", "It proposes a response to the limitation.", ["It repeats the limitation with no change.", "It gives a historical definition.", "It rejects all online advising."], "Ask what a sentence does—contrast, explain, exemplify or recommend—not only what it says.", "‘Therefore’ turns the connection problem into a recommendation.", "Label each sentence with a function word to reveal the paragraph's logic."),
  seed("Match a heading", "Gist · scope", "Students often collect too many new words. A smaller set reviewed through sentences, retrieval and spaced intervals is more likely to become usable vocabulary.", "Which heading fits best?", "From word collection to usable vocabulary", ["The complete history of dictionaries", "Why every unknown word is urgent", "Translation without context"], "A good heading captures the contrast and full scope without adding a new claim.", "The paragraph contrasts collecting many words with practising a smaller useful set.", "Draft a five-to-eight-word heading after summarising the paragraph in one sentence."),
  seed("Separate claim and evidence", "Argument · support", "The pilot should continue. Attendance increased from 58% to 76%, and 42 of 50 participants requested another session.", "Which detail is evidence for the claim?", "Attendance rose and most participants requested another session.", ["The word ‘pilot’ sounds innovative.", "The writer uses a short first sentence.", "All future sessions will certainly succeed."], "Evidence is observable information that supports a claim; style and prediction are not evidence.", "The percentages and participant count can be checked against records.", "For each claim, ask what data, example or source would allow another person to verify it."),
  seed("Distinguish fact and opinion", "Evaluation · verifiability", "The centre opened in 2018 and serves 600 learners a year. Its welcoming design makes it the best place to study in the city.", "Which statement is an opinion?", "It is the best place to study in the city.", ["The centre opened in 2018.", "It serves 600 learners a year.", "The text gives a yearly learner figure."], "Facts are verifiable; opinions depend on a judgement that may require criteria.", "‘Best’ expresses evaluation without defining how places were compared.", "Mark evaluative words such as best, useful or disappointing and look for supporting criteria."),
  seed("Compare two viewpoints", "Comparison · agreement", "Ana argues that recorded lectures improve access. Ben agrees they help absent students but warns that recordings cannot replace live discussion.", "Where do Ana and Ben agree?", "Recordings can improve access for some students.", ["Live discussion is unnecessary.", "Every lecture should be recorded forever.", "Absent students learn more than present students."], "In comparison questions, separate shared ground from each writer's qualification.", "Ben accepts the access benefit before adding a limitation.", "Create two columns for each viewpoint and a middle column for overlap."),
  seed("Trace cause and effect", "Logic · mechanism", "Because the application form was simplified, fewer candidates left required fields blank. Staff consequently spent less time requesting corrections.", "What caused staff to spend less time on corrections?", "The simpler form reduced missing information.", ["Candidates submitted more blank fields.", "Staff stopped checking applications.", "The deadline became shorter."], "A causal chain may contain an intermediate step; follow each link in order.", "Simpler form → fewer blank fields → fewer correction requests.", "Rewrite causal paragraphs with arrows to test whether any link is missing."),
  seed("Choose an accurate summary", "Summary · compression", "A university trial gave first-year students weekly planning prompts. Participants reported better organisation, but the trial was small and did not measure grades.", "Which summary is most accurate?", "Planning prompts appeared useful for organisation, although the small trial did not show an effect on grades.", ["The prompts definitely raised every student's grades.", "The trial proved planning support is useless.", "A large national study compared several universities."], "A summary preserves the main result and its limitation without exaggeration.", "‘Reported better organisation’ is weaker than proof of improved grades.", "Keep the source's level of certainty when compressing it."),
  seed("Detect the author's stance", "Stance · qualification", "Universities should explore AI-assisted feedback, provided students know its limits and can request human review.", "What is the author's position?", "Conditional support with safeguards.", ["Complete rejection of AI feedback.", "Unrestricted replacement of teachers.", "No opinion about feedback."], "Words such as provided, although and only if reveal the conditions attached to a position.", "The writer supports exploration but requires transparency and human review.", "State the position and its condition together; omitting either distorts the stance."),
  seed("Read an implied consequence", "Implication · context", "The deadline remains Friday, yet the portal will be offline from Thursday evening until Friday noon.", "What should an applicant probably do?", "Submit before Thursday evening if possible.", ["Wait until the portal goes offline.", "Assume the deadline has moved to Saturday.", "Send no application at all."], "An implication combines stated facts with a practical consequence, without inventing a rule.", "The deadline and outage overlap, so earlier submission reduces risk.", "When a text presents a constraint, ask what safe action follows from it."),
  seed("Evaluate a source", "Credibility · authority", "Source A is an official admissions page updated yesterday. Source B is an anonymous forum post from three years ago describing one person's experience.", "Which source should confirm the current requirement?", "Source A, because it is official and current.", ["Source B, because personal stories are always rules.", "Either source without checking dates.", "Neither; current requirements cannot be verified."], "Use authority, currency and relevance together when evaluating a source.", "A personal account may suggest questions, but an updated official page controls current requirements.", "Record the publisher, date and purpose before relying on a source."),
  seed("Synthesize two sources", "Synthesis · relationship", "Study 1 links regular retrieval practice with longer retention. Study 2 finds that feedback helps learners correct retrieval errors.", "Which synthesis combines both findings?", "Retrieval can strengthen retention, while feedback helps prevent repeated retrieval errors.", ["Both studies prove all learners need identical lessons.", "Only feedback matters because memory is automatic.", "The studies discuss unrelated subjects."], "Synthesis explains how distinct findings relate instead of listing them separately.", "One study explains retention; the other adds a correction mechanism.", "Use a linking relationship such as while, together or however to connect sources."),
  seed("Read critically", "Critical reading · missing evidence", "The brochure claims that its course guarantees fluency in four weeks, but it gives no level definition, learner data or assessment method.", "What is the strongest criticism?", "The guarantee lacks defined outcomes and supporting evidence.", ["Four-week courses can never teach anything.", "Brochures should contain no claims.", "Fluency is determined only by course colour."], "Critical reading tests the evidence and definitions behind a claim rather than replacing it with another absolute claim.", "Without a measure of fluency or learner results, the guarantee cannot be evaluated.", "Challenge strong claims by asking: measured how, compared with what and supported by which data?"),
  seed("Integrate a complex argument", "C1 reading · nuance", "Mobility programmes can widen opportunity, but only when funding, accessibility and credit recognition are designed together. Expanding places without these supports may reproduce existing inequality.", "Which interpretation best preserves the argument?", "Expansion helps only if practical barriers and recognition are addressed together.", ["More places automatically create equal access.", "Mobility programmes always increase inequality.", "Credit recognition is the only relevant factor."], "Complex arguments often combine a qualified benefit, necessary conditions and a warning.", "The phrase ‘but only when’ makes the three supports conditions for fair expansion.", "Map the claim as benefit + conditions + risk before choosing an interpretation."),
];

const englishGrammar: FoundationSeed[] = [
  seed("Routine or action now", "Present simple · continuous", "Maya normally studies in the library, but today she ___ from home because the campus is closed.", "Choose the correct form.", "is studying", ["studies", "study", "has study"], "Use the present simple for routines and the present continuous for a temporary action happening around now.", "She usually studies on campus, but this week she is studying at home.", "Write one routine and contrast it with a temporary change today."),
  seed("Finished time or present result", "Past simple · present perfect", "I ___ the application yesterday, but I have not received confirmation yet.", "Choose the correct verb form.", "submitted", ["have submitted", "submit", "had submit"], "Use the past simple with a finished time such as yesterday; use the present perfect when no finished time is stated and the result matters now.", "I submitted it yesterday, and I have kept the receipt.", "Contrast one dated past action with one present result."),
  seed("Articles with institutions", "a/an · the · zero article", "She hopes to attend ___ university in Seoul that offers a health-informatics programme.", "Which article completes the sentence?", "a", ["an", "the", "no article"], "Use a/an for one non-specific singular countable noun; use the when both reader and writer can identify it.", "She chose a university; the university has a bilingual programme.", "Introduce one institution, then refer to it again with the definite article."),
  seed("Countable academic nouns", "Countability · quantifiers", "The adviser gave me ___ useful information about the interview.", "Choose the natural quantifier.", "some", ["an", "many", "a few"], "Information is uncountable in English, so do not use an or a plural ending with it.", "She gave me some advice and two useful suggestions.", "Use one uncountable noun and one countable alternative in a sentence."),
  seed("Compare accurately", "Comparatives · modifiers", "This year's instructions are slightly ___ than last year's version.", "Choose the correct comparative.", "clearer", ["more clearliest", "clearest", "clear"], "Use a comparative to compare two things; slightly, much and far can modify the degree of difference.", "The new checklist is much shorter but slightly more detailed.", "Compare two study resources using one strong and one small degree modifier."),
  seed("Advice or obligation", "Modals · force", "Applicants ___ verify the official deadline; relying on an old blog is unsafe.", "Which modal best expresses strong obligation?", "must", ["might", "could", "would"], "Modal choice changes force: must expresses obligation, should advice, may possibility and can ability.", "You must submit the form, but you may attach an optional portfolio.", "Write one obligation and one optional action about an application."),
  seed("A real future condition", "First conditional", "If the portal reopens tonight, I ___ the documents before breakfast.", "Choose the correct result clause.", "will upload", ["uploaded", "would upload", "will uploaded"], "Use if + present simple and will + base verb for a realistic future condition and result.", "If I receive the email, I will reply immediately.", "State one realistic study condition and its future result."),
  seed("An unreal present situation", "Second conditional", "If I ___ more confident, I would volunteer to lead the discussion.", "Choose the correct form.", "were", ["am", "will be", "have been yesterday"], "Use the past form in the if-clause and would + base verb for a hypothetical present or future situation.", "If I had more time, I would join the language exchange.", "Describe an unreal present condition and what you would do."),
  seed("Add defining information", "Relative clauses", "The mentor ___ helped me revise the essay studies economics.", "Choose the correct relative word.", "who", ["where", "which place", "whose is"], "Use who for people, which for things, where for places and whose for possession.", "The course that I chose includes a tutor who gives weekly feedback.", "Join two sentences about a person using a defining relative clause."),
  seed("Verb patterns", "Gerund · infinitive", "I decided ___ a weekly error log after the diagnostic.", "Choose the correct pattern.", "to keep", ["keeping", "keep to", "kept"], "Decide is followed by to + infinitive; avoid is followed by a gerund. Verb patterns must be learned with the verb.", "I decided to practise daily and avoided translating every sentence.", "Use decide and avoid in two related study sentences."),
  seed("Focus on the process", "Passive voice", "Applications ___ by two independent reviewers before interview invitations are sent.", "Choose the correct passive form.", "are assessed", ["assess", "are assessing", "assessed them"], "Form the present passive with am/is/are + past participle when the process or receiver matters more than the actor.", "The documents are checked before the shortlist is announced.", "Describe a two-step process using two passive verbs."),
  seed("Report what someone said", "Reported speech", "The adviser said that the deadline ___ the following Friday.", "Choose the appropriate reported form.", "was", ["is tomorrow", "will yesterday", "be"], "Reported speech often shifts tense and time expressions when the reporting viewpoint changes.", "‘The portal is open today’ became: She said the portal was open that day.", "Report one instruction and adjust its time expression."),
  seed("Order two past events", "Past perfect", "By the time the interview began, I ___ my examples twice.", "Choose the form showing the earlier event.", "had rehearsed", ["rehearse", "have rehearsed tomorrow", "was rehearse"], "Use the past perfect for an event completed before another past event when the order needs clarification.", "I had checked the microphone before the call started.", "Link two past actions and make the earlier one past perfect."),
  seed("Choose a future form", "Plans · predictions · arrangements", "We ___ the tutor at 15:00 tomorrow; the appointment is already confirmed.", "Choose the most natural future form.", "are meeting", ["will perhaps meet yesterday", "meet now every day", "have met tomorrow"], "Use the present continuous for a fixed arrangement, be going to for an intention and will for a spontaneous decision or prediction.", "I am meeting the adviser on Monday, and I am going to prepare three questions.", "Write one fixed arrangement and one personal intention."),
  seed("Make a logical deduction", "Modals of deduction", "Her office light is off and the calendar says ‘conference’. She ___ be on campus.", "Choose the strongest logical deduction.", "cannot", ["must", "should to", "is can"], "Use must for a strong positive deduction, might for possibility and cannot for a strong negative deduction based on evidence.", "The file is dated today, so it must be the new version.", "Make one positive and one negative deduction from visible evidence."),
  seed("Connect cause and concession", "Complex connectors", "___ the sample was small, the researchers reported the pattern cautiously.", "Choose the connector that introduces concession.", "Although", ["Because of", "Therefore", "In order to"], "Although introduces an unexpected contrast; because gives a cause and therefore introduces a result.", "Although participation rose, the study cannot prove causation.", "Write a concession that prevents an overconfident conclusion."),
  seed("Reduce a relative clause", "Participle clauses", "Students ___ for the interview should review their submitted application.", "Choose the reduced clause.", "preparing", ["prepare yesterday", "are prepare", "prepared them"], "An active relative clause can sometimes be reduced to an -ing participle when the subject is the same.", "Applicants waiting outside should keep their identification ready.", "Reduce one active relative clause without changing its meaning."),
  seed("Hedge an academic claim", "Cautious language", "The findings ___ that regular feedback supports revision, but more data are needed.", "Choose the appropriately cautious verb.", "suggest", ["prove forever", "guarantee", "make certain"], "Academic hedging matches language to evidence: suggest, may and appears avoid claiming more than the data show.", "The results may indicate a benefit rather than prove a universal effect.", "Rewrite one absolute claim with two suitable hedging devices."),
  seed("Emphasise with inversion", "Negative adverbial inversion", "Only after reviewing the rubric ___ the missing evidence.", "Choose the correct inversion.", "did I notice", ["I noticed did", "I did noticed", "noticed I"], "After restrictive expressions such as only after or rarely, formal English inverts the auxiliary and subject.", "Rarely do applicants receive useful feedback without revising their draft.", "Rewrite a normal sentence beginning with ‘Only after’."),
  seed("Use a formal recommendation", "Mandative subjunctive", "The committee recommended that every candidate ___ a source list.", "Choose the formal base form.", "include", ["includes", "included yesterday", "including"], "After formal verbs such as recommend, suggest and insist, that-clauses can use the base verb regardless of subject.", "The adviser suggested that she revise the conclusion.", "Write a formal recommendation using suggest that + subject + base verb."),
];

const englishVocabulary: FoundationSeed[] = [
  seed("Choose make, do or take", "High-frequency verbs", "The team needs to ___ a decision before it can take action.", "Choose the natural verb.", "make", ["do", "take into", "perform up"], "Learn the noun together with its common verb: make a decision, do research and take action.", "We did the research, made a decision and took action.", "Use all three collocations to describe a short project sequence."),
  seed("Avoid a false friend", "Spanish–English contrast", "The library is currently open. Here, ‘currently’ means ___.", "Choose the correct meaning.", "at the present time", ["possibly", "in fact", "with electricity"], "Currently means ‘at present’; actually means ‘in fact’ and is the false friend of Spanish actualmente.", "I am currently revising the essay; actually, I started yesterday.", "Contrast currently and actually in two connected sentences."),
  seed("Expand a word family", "Word formation", "The committee asked for a clear ___ of the proposed project.", "Choose the correct noun.", "description", ["describe", "descriptive clearly", "describingly"], "Recognise the grammatical slot before choosing a word-family member: describe (verb), description (noun), descriptive (adjective).", "The report describes the project and provides a concise description.", "Build a sentence using a verb and noun from the same word family."),
  seed("Use a phrasal verb precisely", "Phrasal verbs · context", "The meeting was ___ until Friday because two reviewers were absent.", "Choose the phrasal verb.", "put off", ["put up with", "put out", "put through"], "Phrasal verbs change meaning with the particle; put off means postpone, while put up with means tolerate.", "They put off the meeting but carried on with the document review.", "Use one phrasal verb for delay and one for continuation."),
  seed("Select an academic reporting verb", "Academic verbs", "The survey results ___ that students value timely feedback.", "Choose the cautious academic verb.", "indicate", ["shout", "invent", "promise"], "Reporting verbs encode evidence and stance: indicate or suggest are cautious; demonstrate is stronger and needs stronger evidence.", "The interviews suggest a pattern, while the larger dataset demonstrates a consistent association.", "Choose two reporting verbs with different levels of certainty."),
  seed("Describe cause and effect", "Cause vocabulary", "Limited transport was a major ___ to evening attendance.", "Choose the word that means an obstacle.", "barrier", ["benefit", "outcome", "trend"], "Cause-and-effect vocabulary has distinct roles: factor or driver influences, barrier prevents, outcome results.", "Cost was a barrier, so the grant became a factor in higher participation.", "Describe one barrier, one contributing factor and one outcome."),
  seed("Signal contrast", "Contrast vocabulary", "The first plan is inexpensive; ___, it would reach fewer students.", "Choose the connector.", "however", ["therefore", "for example", "similarly"], "However marks contrast, therefore a result, for example illustration and similarly comparison.", "The course is demanding; however, its weekly structure makes progress visible.", "Connect one advantage and one limitation with an accurate contrast marker."),
  seed("Report a trend", "Data vocabulary", "Applications ___ gradually from 420 to 510 over three years.", "Choose the precise trend verb.", "rose", ["plunged upward", "stabilised to 510 from 420", "fluctuated only downward"], "Match trend verbs to direction and pattern: rise, fall, fluctuate, peak and remain stable.", "Numbers rose steadily, peaked in May and then remained stable.", "Describe a three-stage trend without repeating increase."),
  seed("Use health vocabulary safely", "Health · precision", "A screening test can identify risk, but it does not by itself ___ a condition.", "Choose the precise verb.", "diagnose", ["prescribe a person", "symptom", "recover a test"], "Distinguish diagnose a condition, prescribe treatment, experience symptoms and recover from illness.", "The clinician diagnosed the condition and prescribed appropriate treatment.", "Write a sequence using symptom, diagnose and treatment without making medical claims."),
  seed("Use business vocabulary", "Trade · roles", "The company entered a new market through a local distribution ___.", "Choose the business noun.", "partnership", ["symptom", "syllable", "scholarship essay"], "Business vocabulary should show the relationship: supplier provides, distributor delivers and partnership links organisations.", "The supplier worked with a regional distributor through a long-term partnership.", "Describe how a product moves from supplier to customer using three role words."),
  seed("Talk about education precisely", "Learning · assessment", "The weekly quiz is ___: it helps learners identify gaps before the final exam.", "Choose the assessment term.", "formative", ["summative only", "decorative", "administrative"], "Formative assessment guides improvement during learning; summative assessment judges achievement at the end.", "Feedback on a draft is formative, while the final graded submission is summative.", "Compare one formative and one summative activity in your study plan."),
  seed("Express emotion with nuance", "Connotation · intensity", "Before the interview, I felt ___ but still able to concentrate.", "Choose the most proportionate adjective.", "nervous", ["devastated", "ecstatic", "indifferent"], "Near-synonyms differ in intensity and implication; choose the word that matches the evidence.", "She was concerned about the deadline, not terrified of it.", "Replace a very strong emotion word with a more accurate degree."),
  seed("Adjust register", "Formal · informal", "Which phrase suits a formal email to an admissions office?", "Choose the most appropriate option.", "Could you please confirm receipt of my documents?", ["Hey, did you get my stuff?", "Answer me ASAP!!!", "What's up with my papers?"], "Register depends on audience and purpose; formal politeness is clear and respectful, not vague or excessively elaborate.", "I would be grateful if you could clarify the deadline.", "Rewrite an informal request as one concise formal sentence."),
  seed("Decode prefixes", "Prefixes · meaning", "The reviewer asked me to ___ the file because one page was missing.", "Choose the word meaning ‘send again’.", "resubmit", ["presubmit", "unsubmit", "mis-submit approved"], "Common prefixes modify meaning: re- again, pre- before, mis- wrongly and un- reversal or absence.", "I rewrote the paragraph after noticing that I had misunderstood the prompt.", "Use re- and mis- in a sentence showing problem and correction."),
  seed("Use dependent prepositions", "Adjective + preposition", "She is responsible ___ checking the final references.", "Choose the required preposition.", "for", ["of", "at", "to checking"], "Many adjectives and verbs select a fixed preposition: responsible for, interested in and contribute to.", "He is interested in policy and contributes to the research group.", "Write one sentence with responsible for and another with contribute to."),
  seed("Interpret an idiom in context", "Idiomatic meaning", "After weeks of preparation, the mock interview helped me ‘break the ice’ with the new group.", "What does ‘break the ice’ mean here?", "Make the first interaction more comfortable.", ["Damage frozen water.", "End the group permanently.", "Win every argument."], "Interpret idioms from context and register; do not translate each word literally.", "A simple introduction broke the ice before the discussion began.", "Use one common idiom, then paraphrase its meaning literally."),
  seed("Create a lexical chain", "Cohesion · repetition", "The programme introduced a mentoring scheme. This ___ pairs new students with trained volunteers.", "Choose the cohesive substitute.", "initiative", ["weather", "pronunciation", "deadline"], "Lexical cohesion repeats an idea through controlled synonyms or related terms without changing reference.", "The policy introduced a grant; this funding supports travel costs.", "Link three sentences using a key noun and two accurate related expressions."),
  seed("Paraphrase without changing meaning", "Synonyms · grammar change", "‘The number of applicants increased substantially.’ Which paraphrase is accurate?", "Choose the closest meaning.", "There was a substantial rise in applicant numbers.", ["Applicant numbers fell slightly.", "Every applicant became more qualified.", "The increase was impossible to measure."], "Good paraphrase changes vocabulary or grammar while preserving meaning, degree and certainty.", "The committee rejected the plan → The plan was rejected by the committee.", "Paraphrase a trend sentence by changing both word class and sentence structure."),
  seed("Recognise connotation", "C1 vocabulary · stance", "The proposal is described as ‘ambitious’ rather than ‘unrealistic’. What changes?", "Choose the best explanation.", "‘Ambitious’ presents difficulty more positively.", ["Both words are perfectly neutral.", "‘Unrealistic’ is stronger praise.", "The proposal's factual cost changes."], "Connotation adds evaluation beyond dictionary meaning and can reveal stance.", "Persistent praises continued effort; stubborn may criticise refusal to change.", "Compare a positive and negative word for the same general trait."),
  seed("Choose precise C1 wording", "Precision · nominalisation", "The policy was changed after students objected. Choose the concise academic version.", "Select the strongest rewrite.", "Student objections led to a revision of the policy.", ["Students did a thing and policy got different.", "The policy was nice after people.", "Objections revised students."], "Precise academic vocabulary can compress relationships, but clarity matters more than unnecessary nominalisation.", "A decline in attendance prompted a review of the timetable.", "Rewrite a cause-and-result sentence with one precise noun and one active verb."),
];

const koreanReading: FoundationSeed[] = [
  seed("표지판 읽기", "TOPIK I · 핵심 행동", "도서관 안에서는 휴대 전화를 진동으로 바꿔 주세요.", "이 표지판의 내용은 무엇입니까?", "도서관에서 휴대 전화를 조용히 사용해야 합니다.", ["도서관에서 전화를 빌릴 수 있습니다.", "도서관에 휴대 전화를 가져오면 안 됩니다.", "도서관은 오늘 문을 닫습니다."], "표지판은 장소와 요청 행동을 함께 확인해야 합니다. ‘-아/어 주세요’는 정중한 요청입니다.", "‘진동으로 바꿔 주세요’는 소리가 나지 않게 설정하라는 뜻입니다.", "표지판에서 장소, 금지 또는 요청 행동을 한 문장으로 정리하세요."),
  seed("짧은 메시지", "약속 · 변경", "수진 씨, 오늘 비가 많이 와서 공원 대신 지하철역 2번 출구에서 만나요. 저는 여섯 시에 도착해요.", "두 사람은 어디에서 만납니까?", "지하철역 2번 출구", ["공원 입구", "수진 씨의 집", "버스 정류장"], "메시지에서 ‘대신’ 뒤의 정보가 변경된 최종 선택입니다.", "공원 대신 지하철역에서 만난다는 변경을 확인해야 합니다.", "약속 메시지에서는 원래 계획, 변경 이유와 최종 장소·시간을 구분하세요."),
  seed("광고의 목적", "생활 정보 · 혜택", "한국어 책 나눔: 토요일 오전 10시부터 학생회관 앞에서 무료로 책을 드립니다. 가방을 가져오세요.", "이 광고는 무엇을 알립니까?", "무료 책 나눔 행사", ["한국어 시험 접수", "학생회관 공사", "가방 판매 행사"], "광고의 목적은 행사명, 시간, 장소와 혜택을 묶어 파악합니다.", "‘무료로 책을 드립니다’가 행사의 핵심 혜택입니다.", "광고를 읽고 무엇, 언제, 어디서, 준비물 네 항목을 메모하세요."),
  seed("시간표 비교", "표 · 조건", "회화반: 월·수 18시 / 쓰기반: 화·목 16시 / TOPIK반: 토 10시. 민호는 평일 오후 5시까지 일합니다.", "민호 씨가 들을 수 있는 수업은 무엇입니까?", "회화반과 TOPIK반", ["쓰기반만", "세 수업 모두", "아무 수업도 없음"], "표 문제는 가능한 선택을 모두 찾고 시간 조건과 하나씩 대조해야 합니다.", "평일 17시 이후인 회화반과 토요일 TOPIK반은 가능하지만 16시 쓰기반은 어렵습니다.", "일정표의 각 선택 옆에 가능/불가능과 이유를 표시하세요."),
  seed("대화의 관계", "대화 · 역할", "가: 주문하시겠어요? 나: 네, 비빔밥 하나하고 물 주세요. 가: 맵게 드릴까요?", "두 사람의 관계로 알맞은 것은 무엇입니까?", "식당 직원과 손님", ["의사와 환자", "선생님과 학생", "집주인과 세입자"], "관계는 장소 이름보다 서로 주고받는 행동과 높임말에서 추론합니다.", "‘주문하시겠어요?’와 음식 요청은 식당 상황을 보여 줍니다.", "대화에서 각 화자가 제공하거나 요청하는 것을 찾아 관계를 정하세요."),
  seed("안내문의 세부 정보", "공지 · 대상", "기숙사 점검 안내: 3층 학생은 수요일 오전 9시까지 방 문 앞에 점검표를 붙여 주세요.", "누가 무엇을 해야 합니까?", "3층 학생이 수요일 9시까지 점검표를 붙입니다.", ["모든 학생이 목요일에 방을 비웁니다.", "직원이 3층 문을 잠급니다.", "1층 학생이 점검표를 씁니다."], "공지에서는 대상, 행동과 기한을 정확히 연결해야 합니다.", "‘3층 학생은’이 대상이고 ‘붙여 주세요’가 요청 행동입니다.", "공지의 대상이 나인지 먼저 확인한 뒤 행동과 마감 시간을 찾으세요."),
  seed("이메일의 요청", "목적 · 회신", "안녕하세요. 보내 주신 보고서를 확인했습니다. 표 2의 출처가 빠져 있으니 금요일까지 추가해서 다시 보내 주세요.", "받는 사람이 해야 할 일은 무엇입니까?", "표 2의 출처를 추가해 다시 보냅니다.", ["보고서 전체를 삭제합니다.", "금요일 회의를 취소합니다.", "새로운 표를 열 개 만듭니다."], "이메일의 핵심 요청은 문제점과 수정 행동, 기한으로 구성됩니다.", "출처 누락이 문제이고 추가 후 재전송이 필요한 행동입니다.", "요청 이메일을 ‘문제 → 수정 → 기한’ 구조로 요약하세요."),
  seed("사용 설명 순서", "절차 · 연결어", "먼저 앱에서 신청서를 내려받습니다. 내용을 작성한 후 서명합니다. 마지막으로 한 파일로 저장해 올립니다.", "서명한 다음에 무엇을 합니까?", "한 파일로 저장해 올립니다.", ["신청서를 처음 내려받습니다.", "내용을 모두 지웁니다.", "앱을 삭제합니다."], "먼저, -한 후, 마지막으로 같은 표현은 절차의 순서를 나타냅니다.", "작성 → 서명 → 한 파일로 저장하여 업로드 순서입니다.", "절차문에서는 각 동사를 화살표로 연결해 순서를 확인하세요."),
  seed("지시어 이해", "이것 · 그 결과", "학교는 야간 셔틀을 새로 운행했습니다. 이로 인해 늦게 끝나는 수업의 학생들도 안전하게 귀가할 수 있게 되었습니다.", "‘이로 인해’는 무엇을 가리킵니까?", "야간 셔틀을 운행한 것", ["수업이 모두 취소된 것", "학생들이 학교에 남은 것", "귀가가 불가능해진 것"], "‘이로 인해’는 앞 문장의 사건 전체를 원인으로 받습니다.", "새 셔틀 운행이 안전한 귀가라는 결과를 만들었습니다.", "지시어를 앞 문장의 내용으로 바꾸어 읽고 자연스러운지 확인하세요."),
  seed("원인 찾기", "-기 때문에 · 결과", "최근 이용자가 늘었기 때문에 도서관은 시험 기간에 운영 시간을 두 시간 연장하기로 했다.", "운영 시간을 연장한 이유는 무엇입니까?", "도서관 이용자가 늘었기 때문입니다.", ["시험 기간이 사라졌기 때문입니다.", "책이 모두 없어졌기 때문입니다.", "운영 시간을 줄이기 위해서입니다."], "‘-기 때문에’ 앞은 원인, 뒤는 그 원인에 따른 결과입니다.", "이용자 증가가 원인이고 운영 시간 연장이 결과입니다.", "원인과 결과를 각각 표시한 뒤 연결 표현의 방향을 확인하세요."),
  seed("대조 내용", "반면에 · 비교", "온라인 수업은 장소에 상관없이 들을 수 있다. 반면에 실습 수업은 장비가 있는 교실에 직접 가야 한다.", "두 수업의 차이는 무엇입니까?", "온라인 수업은 장소가 자유롭지만 실습은 교실에 가야 합니다.", ["두 수업 모두 장비가 필요 없습니다.", "실습 수업만 집에서 들을 수 있습니다.", "온라인 수업은 들을 수 없습니다."], "‘반면에’는 같은 기준에서 두 대상의 차이를 보여 줍니다.", "비교 기준은 수업 장소의 제약입니다.", "대조문에서는 공통 비교 기준과 각 대상의 특징을 표로 만드세요."),
  seed("글의 중심 생각", "중급 · 주제", "새 단어를 많이 외우는 것보다 자주 사용할 단어를 문장 속에서 반복하는 것이 더 효과적이다. 문맥과 함께 익힌 단어는 실제 대화에서도 떠올리기 쉽다.", "이 글의 중심 생각은 무엇입니까?", "단어는 문맥 속에서 반복해야 실제로 사용하기 쉽습니다.", ["모든 단어를 하루에 외워야 합니다.", "대화에서는 단어가 필요 없습니다.", "문장을 외우면 의미를 몰라도 됩니다."], "중심 생각은 모든 세부 문장을 포함하면서 지나치게 넓지 않아야 합니다.", "반복, 문맥과 실제 사용이 같은 학습 원리를 뒷받침합니다.", "각 문장이 선택한 주제를 어떻게 지원하는지 확인하세요."),
  seed("글쓴이의 목적", "설명 · 제안", "교환학생의 초기 불안을 줄이려면 학교가 생활 정보만 제공해서는 부족하다. 선배와 정기적으로 만나는 멘토링도 함께 운영할 필요가 있다.", "글쓴이의 목적은 무엇입니까?", "생활 안내와 멘토링을 함께 제공하자고 제안하는 것", ["교환학생을 줄이자고 주장하는 것", "생활 정보를 모두 없애는 것", "선배가 수업을 대신하게 하는 것"], "글의 목적은 핵심 주장과 글쓴이가 독자에게 원하는 반응을 함께 봅니다.", "‘운영할 필요가 있다’는 제안을 나타냅니다.", "글을 정보 제공, 설명, 비판 또는 제안 중 하나로 분류하고 근거 표현을 찾으세요."),
  seed("태도 파악", "어조 · 신중함", "이번 결과는 긍정적이지만 참여자가 적었으므로 모든 학생에게 같은 효과가 있다고 단정하기는 어렵다.", "글쓴이의 태도로 알맞은 것은 무엇입니까?", "긍정적 결과를 인정하지만 일반화에는 신중합니다.", ["결과를 완전히 부정합니다.", "모든 학생에게 효과가 있다고 확신합니다.", "연구와 관계없는 농담을 합니다."], "‘-지만’, ‘단정하기 어렵다’ 같은 표현은 인정과 제한을 함께 나타냅니다.", "긍정적이라는 평가 뒤에 작은 표본이라는 한계를 제시합니다.", "태도를 정할 때 긍정 표현과 제한 표현을 각각 하나씩 찾으세요."),
  seed("숨은 의미 추론", "추론 · 실용 판단", "제출 마감은 금요일 오후 5시입니다. 그러나 금요일 오전에는 시스템 점검으로 사이트를 이용할 수 없습니다.", "지원자가 하는 것이 가장 안전한 행동은 무엇입니까?", "목요일까지 미리 제출합니다.", ["금요일 오전에만 제출합니다.", "마감이 자동으로 연장된다고 생각합니다.", "서류를 준비하지 않습니다."], "추론은 명시된 사실에서 안전하게 나아가되, 글에 없는 규칙을 만들면 안 됩니다.", "마감과 시스템 중단 시간이 가까우므로 사전 제출이 위험을 줄입니다.", "제약 조건을 찾고 그 조건에서 가능한 가장 안전한 행동을 선택하세요."),
  seed("그래프 설명 읽기", "수치 · 변화", "한국어 프로그램 참여자는 2024년 120명에서 2025년 180명으로 늘었다. 만족도는 두 해 모두 82%였다.", "자료와 일치하는 것은 무엇입니까?", "참여자는 늘었지만 만족도 비율은 같았습니다.", ["참여자와 만족도가 모두 감소했습니다.", "2025년 참여자는 82명입니다.", "만족도가 60%포인트 올랐습니다."], "인원과 비율을 구분하고 각 수치의 단위와 비교 시점을 확인해야 합니다.", "120→180은 인원 증가이고 82%→82%는 비율 유지입니다.", "그래프를 읽을 때 대상, 단위, 시작값과 끝값을 따로 기록하세요."),
  seed("문단 제목 고르기", "요약 · 범위", "피드백은 틀린 답을 알려 주는 데서 끝나지 않아야 한다. 왜 틀렸는지 이해하고 새로운 문제에 같은 원리를 적용할 때 학습이 이어진다.", "가장 알맞은 제목은 무엇입니까?", "정답 확인을 넘어 적용으로", ["시험을 없애는 방법", "정답을 빨리 외우기", "새 문제를 피해야 하는 이유"], "좋은 제목은 문단 전체의 변화나 핵심 관계를 짧게 담습니다.", "문단은 오답 확인에서 이해와 전이로 나아가야 한다고 말합니다.", "문단을 한 문장으로 요약한 뒤 핵심 대비를 제목으로 줄이세요."),
  seed("주장과 근거", "TOPIK II · 논리", "대학은 야간 상담을 유지해야 한다. 지난 학기 이용자의 64%가 낮 시간에 근무했고, 상담 후 중도 포기 의사가 줄었다고 답했다.", "주장을 뒷받침하는 근거는 무엇입니까?", "이용자 특성과 상담 후 변화에 관한 수치", ["‘대학’이라는 단어가 사용된 것", "상담실 벽의 색깔", "모든 학생이 반드시 성공할 것이라는 예측"], "근거는 다른 사람이 확인할 수 있는 수치, 사례 또는 출처여야 합니다.", "근무 비율과 상담 후 응답 변화가 야간 상담 필요성을 지원합니다.", "주장마다 확인 가능한 근거가 무엇인지 질문하세요."),
  seed("두 자료 종합", "종합 · 연결", "자료 1은 반복해서 떠올리는 연습이 기억을 오래 유지하게 한다고 설명한다. 자료 2는 틀린 답에 대한 구체적인 피드백이 같은 오류의 반복을 줄인다고 보고한다.", "두 자료를 종합한 내용은 무엇입니까?", "회상 연습과 구체적 피드백을 함께 사용하면 기억과 오류 수정에 도움이 됩니다.", ["피드백 없이 암기만 해야 합니다.", "두 자료는 서로 관계가 없습니다.", "모든 학습자는 같은 실수를 합니다."], "종합은 두 자료를 따로 요약하는 것이 아니라 관계와 함께 설명합니다.", "첫 자료는 기억, 둘째 자료는 오류 수정을 보완합니다.", "‘함께’, ‘반면에’, ‘따라서’ 중 정확한 관계 표현으로 두 결과를 연결하세요."),
  seed("비판적으로 읽기", "근거 · 한계", "한 광고는 이 강의를 들으면 한 달 만에 누구나 TOPIK 6급을 받을 수 있다고 주장하지만 학습자의 시작 수준이나 평가 자료를 제시하지 않는다.", "가장 적절한 비판은 무엇입니까?", "보장하는 결과를 판단할 기준과 근거가 없습니다.", ["한 달 동안은 아무것도 배울 수 없습니다.", "모든 광고의 내용은 거짓입니다.", "TOPIK에는 점수가 없습니다."], "강한 주장은 측정 기준, 비교 자료와 대상 범위가 있어야 평가할 수 있습니다.", "시작 수준과 실제 결과가 없으면 ‘누구나’라는 보장을 확인할 수 없습니다.", "강한 주장에 대해 무엇을, 어떻게, 누구에게 측정했는지 질문하세요."),
];

const koreanGrammar: FoundationSeed[] = [
  seed("이에요/예요 선택", "명사 서술", "저는 대학생___.", "받침이 있는 명사 뒤에 알맞은 것은 무엇입니까?", "이에요", ["예요", "에서", "에게"], "받침이 있는 명사 뒤에는 ‘이에요’, 받침이 없으면 ‘예요’를 사용합니다.", "학생이에요 / 의사예요", "받침이 있는 직업과 없는 직업을 하나씩 소개하세요."),
  seed("은/는과 이/가", "주제 · 새 정보", "가: 누가 한국어를 공부해요? 나: 민지___ 공부해요.", "질문에 대한 새 주어를 표시하세요.", "가", ["는", "를", "에서"], "‘누가’ 질문의 새 정보에는 보통 이/가를 쓰고, 이미 정한 화제나 대비에는 은/는을 씁니다.", "민지가 공부해요. 민지는 매일 도서관에 가요.", "새 인물을 소개한 뒤 그 인물을 화제로 이어 두 문장을 만드세요."),
  seed("목적격 조사", "을/를", "저는 매일 한국어 책___ 읽어요.", "빈칸에 알맞은 조사는 무엇입니까?", "을", ["이", "은", "에서"], "동작의 대상을 나타낼 때 받침 뒤에는 을, 받침이 없으면 를 사용합니다.", "책을 읽어요 / 영화를 봐요", "받침이 있는 목적어와 없는 목적어를 사용해 두 행동을 말하세요."),
  seed("에와 에서", "장소 · 이동과 행동", "친구가 도서관___ 공부해요.", "행동이 일어나는 장소의 조사는 무엇입니까?", "에서", ["에", "를", "와"], "‘에’는 이동의 목적지나 존재 위치, ‘에서’는 행동이 일어나는 장소를 나타냅니다.", "학교에 가요. 학교에서 공부해요.", "같은 장소를 목적지와 행동 장소로 각각 사용하세요."),
  seed("현재형 만들기", "-아요/어요", "‘먹다’의 해요체 현재형은 무엇입니까?", "알맞은 활용을 고르세요.", "먹어요", ["먹아요", "먹었어요", "먹으세요요"], "어간의 마지막 모음이 ㅏ/ㅗ이면 -아요, 그 외에는 보통 -어요를 붙이며 일부는 줄어듭니다.", "가다→가요, 먹다→먹어요, 공부하다→공부해요", "ㅏ/ㅗ 어간과 그 외 어간을 하나씩 현재형으로 활용하세요."),
  seed("과거형 만들기", "-았/었어요", "어제 친구를 만나서 같이 점심을 ___.", "‘먹다’의 과거형을 고르세요.", "먹었어요", ["먹어요", "먹을 거예요", "먹고 있어요"], "과거는 어간에 -았/었어요를 붙이고 시간 표현과 일치시킵니다.", "어제 학교에 갔고 친구를 만났어요.", "어제 한 두 행동을 순서대로 과거형으로 말하세요."),
  seed("안과 못", "부정 · 의지와 능력", "감기에 걸려서 오늘 수업에 ___ 갔어요.", "상황상 불가능했다는 뜻을 고르세요.", "못", ["안", "더", "잘"], "‘안’은 하지 않음을, ‘못’은 능력이나 상황 때문에 할 수 없음을 나타냅니다.", "오늘은 운동을 안 했어요. 다리가 아파서 못 했어요.", "의지로 하지 않은 일과 상황상 못 한 일을 비교하세요."),
  seed("수 관형사와 단위", "고유어 수 · 명", "교환학생 ___ 명이 설명회에 왔어요.", "알맞은 수 표현을 고르세요.", "세", ["삼을", "셋이 명", "삼 번째 명들"], "명, 개, 시 같은 단위 앞에서는 하나→한, 둘→두, 셋→세, 넷→네로 바뀝니다.", "학생 세 명이 사과 두 개를 샀어요.", "사람 수와 물건 수를 한 문장에 정확히 표현하세요."),
  seed("하고/와/과", "명사 연결", "여권___ 성적표를 준비했어요.", "일상적인 나열에 알맞은 조사는 무엇입니까?", "하고", ["에서", "에게만", "으로부터만"], "명사를 나열할 때 하고, (이)랑, 와/과를 사용할 수 있으며 와/과가 조금 더 문어적입니다.", "여권과 성적표 / 친구하고 선생님", "같은 두 명사를 구어체와 문어체로 각각 연결하세요."),
  seed("주세요와 -고 싶어요", "요청 · 희망", "카페에서 물을 정중하게 요청하려고 합니다.", "가장 알맞은 표현은 무엇입니까?", "물 주세요.", ["물이 되고 싶어요.", "물에 가요.", "물을 안 사람."], "명사+주세요는 물건 요청, 동사+-고 싶어요는 말하는 사람의 희망을 나타냅니다.", "물 주세요. / 한국어를 더 배우고 싶어요.", "하나의 요청과 하나의 개인 희망을 구분해 말하세요."),
  seed("-아서/어서", "원인 · 자연스러운 결과", "비가 많이 ___ 우산을 가져왔어요.", "원인을 연결하는 활용을 고르세요.", "와서", ["오지만", "오려고", "오면 안"], "-아서/어서는 앞의 원인이나 순서가 뒤 행동과 자연스럽게 이어질 때 사용합니다.", "날씨가 추워서 창문을 닫았어요.", "일상적인 원인과 그 결과를 한 문장으로 연결하세요."),
  seed("-지만", "대조", "이 책은 어렵___ 설명이 자세해서 유용해요.", "대조를 나타내는 연결 표현을 고르세요.", "지만", ["어서만", "고 싶어서", "을 때부터만"], "-지만은 앞 내용과 뒤 내용의 대조를 나타냅니다.", "수업은 어렵지만 배울 것이 많아요.", "한 대상의 단점과 장점을 -지만으로 연결하세요."),
  seed("-(으)면", "조건", "시간이 있___ 오늘 복습할 거예요.", "알맞은 조건 표현은 무엇입니까?", "으면", ["으니까만", "었지만", "으려고만"], "-(으)면은 조건을 나타내며 받침이 있으면 -으면, 없거나 ㄹ 받침이면 -면을 씁니다.", "비가 오면 집에서 공부해요.", "현실적인 학습 조건과 결과를 말하세요."),
  seed("-(으)려고", "의도 · 목적", "한국에서 공부하___ 매일 한국어를 연습해요.", "의도를 나타내는 연결 표현을 고르세요.", "려고", ["지만", "었는데도만", "는 바람에만"], "-(으)려고는 주어가 하려는 의도나 목적을 나타냅니다.", "시험을 준비하려고 단어장을 만들었어요.", "목표 하나와 그 목표를 위한 행동을 연결하세요."),
  seed("-아/어야 하다", "의무", "지원자는 금요일까지 서류를 제출___.", "의무를 나타내는 표현을 고르세요.", "해야 해요", ["하고 싶어요", "할 수 있어요", "한 적이 있어요"], "-아/어야 하다는 반드시 필요한 행동이나 의무를 나타냅니다.", "면접 전에 제출한 자기소개서를 읽어야 해요.", "지원 과정의 의무와 선택 행동을 각각 표현하세요."),
  seed("-는 것", "명사화", "매일 소리 내어 읽___ 발음에 도움이 됩니다.", "행동을 문장의 주어로 만드는 표현은 무엇입니까?", "는 것이", ["는 데서만", "고 싶지만", "었기만"], "동사+-는 것은 현재의 일반 행동을 명사처럼 다룰 때 사용합니다.", "새 단어를 문장으로 쓰는 것이 기억에 도움이 돼요.", "효과적인 학습 행동 하나를 -는 것이로 설명하세요."),
  seed("높임말 -(으)시-", "주체 높임", "교수님이 지금 연구실에 ___.", "높임 표현으로 알맞은 것은 무엇입니까?", "계세요", ["있어", "있는다요", "있게 해"], "높여야 하는 주어의 동사에 -(으)시-를 쓰며 ‘있다’의 높임말은 ‘계시다’입니다.", "선생님께서 말씀하시고 연구실에 계세요.", "높여야 하는 사람의 행동과 위치를 한 문장으로 말하세요."),
  seed("간접 인용", "-다고 하다", "민수 씨가 ‘내일 시험이 있어요’라고 말했습니다.", "간접 인용으로 알맞은 것은 무엇입니까?", "민수 씨가 내일 시험이 있다고 했어요.", ["민수 씨가 내일 시험을 있대요 했어요.", "민수 씨는 시험에게 말했어요.", "내일이 민수 씨를 시험했어요."], "서술문 간접 인용은 받침 여부와 품사에 따라 -다고/라고 하다를 사용합니다.", "지현 씨가 시간이 없다고 했어요.", "친구의 계획 한 문장을 간접 인용으로 바꾸세요."),
  seed("-기 때문에", "공식적인 원인", "자료가 충분하지 않___ 결론을 단정할 수 없습니다.", "알맞은 원인 표현을 고르세요.", "기 때문에", ["는 반면에", "도록 하자마자", "더라도만"], "-기 때문에는 원인을 분명하게 제시하며 보고서나 설명문에서도 자주 사용합니다.", "표본이 작기 때문에 결과를 일반화하기 어렵습니다.", "신중한 결론이 필요한 이유를 -기 때문에로 설명하세요."),
  seed("반면에", "TOPIK II · 대조", "온라인 수업은 이동이 편리한 ___ 대면 수업은 즉각적인 상호 작용이 쉽습니다.", "같은 기준의 대조를 완성하세요.", "반면에", ["덕분에만", "때문이라고만", "뿐이어서"], "‘반면에’는 두 대상의 서로 다른 특징을 같은 비교 기준에서 대조합니다.", "도시는 기회가 많은 반면에 생활비가 높습니다.", "하나의 주제에서 장점 또는 특징이 다른 두 대상을 비교하세요."),
];

const koreanVocabulary: FoundationSeed[] = [
  seed("인사와 관계", "상황별 인사", "처음 만난 교수님께 하는 인사로 가장 알맞은 것은 무엇입니까?", "표현을 고르세요.", "안녕하세요. 처음 뵙겠습니다.", ["야, 오랜만이야.", "잘 자, 또 봐.", "밥 먹었냐?"], "인사는 관계와 상황에 따라 높임 정도가 달라집니다.", "처음 뵙겠습니다 / 만나서 반갑습니다", "친구와 교수님에게 하는 인사를 각각 적으세요."),
  seed("가족 관계", "가족 어휘", "아버지의 남자 형제는 누구입니까?", "알맞은 가족 호칭을 고르세요.", "큰아버지 또는 작은아버지", ["외할머니", "누나", "조카딸만"], "한국어 가족 호칭은 화자와 친족의 관계, 성별과 나이에 따라 구체적입니다.", "어머니의 어머니는 외할머니입니다.", "가족 두 명을 나와의 관계로 설명하세요."),
  seed("하루 일과", "동작 연어", "아침에 일어나서 이를 ___ 세수를 해요.", "자연스러운 동사를 고르세요.", "닦고", ["입고", "타고", "열고"], "일상 어휘는 명사와 자주 결합하는 동사를 함께 익힙니다: 이를 닦다, 세수하다, 옷을 입다.", "이를 닦고 옷을 입은 뒤 학교에 가요.", "아침 행동 네 개를 자연스러운 동사와 순서대로 말하세요."),
  seed("음식과 단위", "주문 · 그릇", "식당에서 비빔밥 두 ___ 주문했어요.", "음식 그릇을 세는 단위를 고르세요.", "그릇을", ["명을", "권을", "마리를"], "단위 명사는 대상에 맞게 선택합니다: 사람 명, 책 권, 동물 마리, 음식 그릇.", "비빔밥 한 그릇과 물 두 병 주세요.", "음식과 음료를 서로 다른 단위로 주문하세요."),
  seed("장소와 방향", "길 찾기", "은행은 우체국과 약국 ___에 있습니다.", "두 장소 사이를 나타내는 말을 고르세요.", "사이", ["밖만", "동안", "처럼"], "위치 어휘는 기준점을 함께 말해야 분명합니다: 앞, 뒤, 옆, 맞은편, 사이.", "도서관은 학생회관 맞은편에 있어요.", "두 기준점을 사용해 한 장소의 위치를 설명하세요."),
  seed("교통 이용", "타다 · 갈아타다", "시청역에서 2호선으로 ___.", "노선을 바꾸는 동사를 고르세요.", "갈아타세요", ["내리세요만", "걸리세요", "막히세요"], "교통에서 타다, 내리다, 갈아타다, 걸리다를 상황에 맞게 구분합니다.", "버스를 타고 시청에서 지하철로 갈아탔어요.", "출발지부터 목적지까지 교통수단 두 개를 설명하세요."),
  seed("쇼핑과 교환", "가격 · 문제 해결", "산 옷의 크기가 맞지 않아서 다른 크기로 ___ 싶어요.", "알맞은 동사를 고르세요.", "교환하고", ["환승하고", "진단하고", "졸업하고"], "쇼핑에서는 교환하다, 환불하다, 할인하다와 영수증 같은 어휘를 함께 익힙니다.", "영수증이 있으면 교환하거나 환불할 수 있어요.", "상품 문제와 원하는 해결 방법을 정중하게 말하세요."),
  seed("날씨와 준비", "예보 · 행동", "오후에 소나기가 내릴 가능성이 높으니 우산을 ___.", "가장 자연스러운 표현을 고르세요.", "챙기세요", ["졸업하세요", "예약하세요", "번역하세요"], "날씨 어휘를 실제 준비 행동과 연결하면 문맥에서 오래 기억할 수 있습니다.", "기온이 떨어질 예정이니 겉옷을 챙기세요.", "날씨 한 가지와 그에 맞는 준비 행동을 연결하세요."),
  seed("몸 상태 설명", "증상 · 진료", "목이 아프고 열이 나서 병원에서 ___을 받았습니다.", "알맞은 의료 상황 어휘를 고르세요.", "진료", ["환승", "면접", "할인"], "증상은 ‘-이/가 아프다, 열이 나다’로 말하고 병원에서는 진료를 받습니다.", "기침이 나고 머리가 아파서 진료를 받았어요.", "증상 두 개와 취한 행동을 말하되 스스로 진단하지 마세요."),
  seed("학교생활", "수강 · 과제", "이번 학기에 경제학 수업을 ___ 과제를 매주 제출합니다.", "수업을 듣는 뜻의 동사를 고르세요.", "수강하고", ["퇴근하고", "환불하고", "처방하고"], "학교 어휘는 수강하다, 제출하다, 출석하다, 복습하다처럼 활동과 함께 익힙니다.", "수업을 수강하고 과제를 제출한 뒤 시험을 준비해요.", "한 주의 학업 활동을 세 가지 동사로 설명하세요."),
  seed("직장과 업무", "회의 · 마감", "팀은 금요일 마감 전에 보고서를 ___해야 합니다.", "문서를 완성해 내는 동사를 고르세요.", "제출", ["탑승", "진찰", "요리"], "업무에서는 회의에 참석하다, 업무를 맡다, 마감을 지키다, 보고서를 제출하다를 묶어 익힙니다.", "업무를 나누고 마감까지 보고서를 제출했어요.", "팀 과제의 역할, 마감과 결과를 업무 어휘로 설명하세요."),
  seed("감정의 정도", "걱정 · 긴장", "면접 전에 조금 ___지만 질문에 집중할 수 있었습니다.", "상황에 맞는 감정을 고르세요.", "긴장했", ["황홀했", "무관심했", "절망만 했"], "비슷한 감정도 정도와 원인이 다릅니다: 걱정하다, 긴장하다, 불안하다, 실망하다.", "결과가 걱정됐지만 준비한 내용에 집중했어요.", "감정, 원인과 대응 행동을 한 문장에 담으세요."),
  seed("여행 준비", "예약 · 일정", "출발 날짜를 정한 뒤 비행기 표와 숙소를 ___.", "미리 자리를 확보하는 동사를 고르세요.", "예약했어요", ["졸업했어요", "발음했어요", "처방했어요"], "여행 어휘는 일정을 세우다, 표를 예매하다, 숙소를 예약하다, 짐을 싸다의 순서로 익힐 수 있습니다.", "표를 예매하고 숙소를 예약한 뒤 짐을 쌌어요.", "여행 준비 네 단계를 순서 표현과 함께 말하세요."),
  seed("집과 계약", "주거 · 비용", "매달 집주인에게 내는 돈을 무엇이라고 합니까?", "알맞은 주거 어휘를 고르세요.", "월세", ["등록금", "교통비만", "장학금"], "주거 계약에서는 보증금, 월세, 관리비와 계약 기간을 구분해야 합니다.", "보증금 외에 월세와 관리비가 얼마인지 확인했어요.", "방을 구할 때 확인할 비용 세 가지를 질문으로 만드세요."),
  seed("공공 서비스", "신청 · 증명서", "주민센터에서 필요한 증명서를 ___.", "문서를 공식적으로 요청하는 동사를 고르세요.", "발급받았어요", ["환승했어요", "복습했어요", "진단했어요"], "공공기관에서는 신청하다, 제출하다, 발급받다, 문의하다를 절차에 맞게 사용합니다.", "온라인으로 신청한 뒤 주민센터에서 증명서를 발급받았어요.", "행정 문서 한 개를 신청부터 수령까지 설명하세요."),
  seed("학술 학습", "자료 · 분석", "연구자는 여러 자료를 비교하고 결과를 ___.", "자료의 의미를 설명하는 동사를 고르세요.", "분석합니다", ["환불합니다", "탑승합니다", "처방합니다"], "학술 어휘는 자료를 수집하다, 분석하다, 해석하다, 근거를 제시하다처럼 과정으로 익힙니다.", "자료를 수집하고 분석한 뒤 결과를 조심스럽게 해석했습니다.", "작은 연구 과정을 네 개의 학술 동사로 설명하세요."),
  seed("뉴스 어휘", "발표 · 보도", "정부는 새로운 교육 지원 정책을 다음 주에 ___.", "공식적으로 알리는 동사를 고르세요.", "발표할 예정입니다", ["요리할 예정입니다", "환승할 예정입니다", "잠들 예정입니다"], "뉴스에서는 발표하다, 시행하다, 증가하다, 감소하다와 출처 표현을 구분합니다.", "교육부가 정책을 발표했고 언론이 그 내용을 보도했습니다.", "누가 무엇을 발표했고 어떤 변화가 예상되는지 요약하세요."),
  seed("비즈니스 어휘", "거래 · 공급", "제조업체는 지역 ___을 통해 제품을 여러 상점에 보냅니다.", "유통 역할에 알맞은 단어를 고르세요.", "유통업체", ["환자", "수험표", "음절"], "공급업체, 제조업체, 유통업체와 소비자의 역할을 구분하면 거래 과정을 정확히 설명할 수 있습니다.", "제조업체가 유통업체에 제품을 보내고 소비자가 상점에서 구매합니다.", "제품이 만들어져 소비자에게 가는 과정을 역할 어휘로 설명하세요."),
  seed("환경 문제", "원인 · 실천", "일회용품 사용을 줄이면 쓰레기 ___을 줄이는 데 도움이 됩니다.", "쓰레기가 생기는 양을 뜻하는 말을 고르세요.", "발생량", ["출석률", "합격자", "발음법"], "환경 어휘는 배출량, 발생량, 재활용, 절약과 같은 원인·행동·결과로 연결해 익힙니다.", "에너지를 절약하고 일회용품을 줄이면 배출량 감소에 도움이 됩니다.", "환경 문제 하나와 가능한 실천, 예상 효과를 연결하세요."),
  seed("GKS 지원 어휘", "지원 · 선발", "서류 심사를 통과한 지원자는 다음 단계인 ___에 참여할 수 있습니다.", "알맞은 선발 절차를 고르세요.", "면접", ["환승", "진료", "환불"], "지원 절차에서는 모집 공고, 지원 자격, 서류 심사, 면접, 최종 선발을 순서대로 구분합니다.", "모집 공고를 확인하고 서류 심사와 면접을 거쳐 최종 결과를 기다립니다.", "지원 절차를 실제 공고와 대조하며 순서대로 설명하세요."),
];

const metaDistractors = (language: TestLanguage): [string, string, string] => language === "ko"
  ? ["가장 긴 선택지는 항상 정답이라는 규칙", "문맥을 보지 않고 단어 하나만 번역하는 규칙", "근거보다 익숙한 표현을 먼저 고르는 규칙"]
  : ["The longest option is always correct.", "Translate one word and ignore the context.", "Choose the most familiar phrase without checking evidence."];

function addFeedback(
  language: TestLanguage,
  question: Omit<TestQuestion, "optionFeedback" | "lesson" | "example" | "transfer">,
  seedItem: FoundationSeed,
): TestQuestion {
  const optionFeedback = question.options.map((option, index) => index === question.correctIndex
    ? (language === "ko"
      ? `정확합니다. ${seedItem.rule} 이 문항에서는 ‘${option}’이 문맥과 근거를 모두 만족합니다.`
      : `Correct. ${seedItem.rule} Here, “${option}” satisfies both the context and the evidence.`)
    : (language === "ko"
      ? `‘${option}’은 이 문맥에 맞지 않습니다. ${seedItem.rule} 다음 모델과 비교하세요: ${seedItem.example}`
      : `“${option}” does not fit this context. ${seedItem.rule} Compare it with this model: ${seedItem.example}`));
  return {
    ...question,
    optionFeedback,
    lesson: seedItem.rule,
    example: seedItem.example,
    transfer: seedItem.transfer,
  };
}

function rotateQuestion(question: TestQuestion, offset: number): TestQuestion {
  const shift = offset % question.options.length;
  if (shift === 0) return question;
  return {
    ...question,
    options: [...question.options.slice(shift), ...question.options.slice(0, shift)],
    optionFeedback: [...question.optionFeedback.slice(shift), ...question.optionFeedback.slice(0, shift)],
    correctIndex: (question.correctIndex - shift + question.options.length) % question.options.length,
  };
}

function foundationQuestions(language: TestLanguage, skill: FoundationSkill, level: number, seedItem: FoundationSeed) {
  const isKo = language === "ko";
  const id = `${language}-${skill}-${level}`;
  const common = { improvement: seedItem.transfer };
  const raw: Array<Omit<TestQuestion, "optionFeedback" | "lesson" | "example" | "transfer">> = [
    {
      id: `${id}-context`,
      skill: isKo ? "문맥 이해" : "Context",
      passage: seedItem.passage,
      prompt: seedItem.prompt,
      options: [seedItem.correct, ...seedItem.wrong],
      correctIndex: 0,
      explanation: seedItem.rule,
      ...common,
    },
    {
      id: `${id}-principle`,
      skill: isKo ? "원리" : "Principle",
      passage: seedItem.passage,
      prompt: isKo ? "이 답을 설명하는 가장 정확한 원리는 무엇입니까?" : "Which principle most accurately explains the answer?",
      options: [seedItem.rule, ...metaDistractors(language)],
      correctIndex: 0,
      explanation: seedItem.rule,
      ...common,
    },
    {
      id: `${id}-model`,
      skill: isKo ? "모델 적용" : "Model application",
      prompt: isKo ? "같은 원리를 가장 잘 보여 주는 모델은 무엇입니까?" : "Which model best demonstrates the same principle?",
      options: [seedItem.example, ...seedItem.wrong],
      correctIndex: 0,
      explanation: isKo ? `이 모델은 다음 원리를 실제 문장에 적용합니다: ${seedItem.rule}` : `This model applies the principle in a complete context: ${seedItem.rule}`,
      ...common,
    },
    {
      id: `${id}-transfer`,
      skill: isKo ? "새 상황 전이" : "Transfer",
      prompt: isKo ? "다음 학습에서 이 원리를 실제로 적용하는 방법은 무엇입니까?" : "How should you transfer this principle to the next practice?",
      options: [seedItem.transfer, ...metaDistractors(language)],
      correctIndex: 0,
      explanation: isKo ? `전이는 새 문맥에서 직접 사용하는 것입니다. ${seedItem.transfer}` : `Transfer means applying the rule in a new context: ${seedItem.transfer}`,
      ...common,
    },
  ];
  return raw.map((question, index) => rotateQuestion(addFeedback(language, question, seedItem), level + index));
}

function foundationChallenges(language: TestLanguage, skill: FoundationSkill, level: number, seedItem: FoundationSeed) {
  const isKo = language === "ko";
  const id = `${language}-${skill}-${level}`;
  const raw: Array<Omit<TestQuestion, "optionFeedback" | "lesson" | "example" | "transfer">> = [
    {
      id: `${id}-challenge-application`,
      skill: isKo ? "심화 적용" : "Advanced application",
      prompt: isKo ? "시간 제한 재응시에서도 유지해야 할 정확한 모델은 무엇입니까?" : "Which accurate model should remain in a timed retake?",
      options: [seedItem.example, ...seedItem.wrong],
      correctIndex: 0,
      explanation: seedItem.rule,
      improvement: seedItem.transfer,
    },
    {
      id: `${id}-challenge-log`,
      skill: isKo ? "오류 기록" : "Error log",
      prompt: isKo ? "오류 기록에 남길 가장 유용한 내용은 무엇입니까?" : "Which note would be most useful in an error log?",
      options: [`${seedItem.rule} → ${seedItem.example}`, ...metaDistractors(language)],
      correctIndex: 0,
      explanation: isKo ? "좋은 오류 기록은 규칙과 정확한 예시를 함께 남깁니다." : "A useful error log records both the principle and an accurate example.",
      improvement: seedItem.transfer,
    },
  ];
  return raw.map((question, index) => rotateQuestion(addFeedback(language, question, seedItem), level + index + 2));
}

function productionTask(language: TestLanguage, skill: FoundationSkill, seedItem: FoundationSeed): ProductionTask {
  const isKo = language === "ko";
  const prompts: Record<FoundationSkill, string> = {
    reading: isKo
      ? `다음 글을 한두 문장으로 요약하고 답의 근거 표현 두 개를 쓰세요: ${seedItem.passage}`
      : `Summarise this text in two sentences and cite two clues supporting your interpretation: ${seedItem.passage}`,
    grammar: isKo
      ? `다음 문법 원리를 사용해 서로 연결된 문장 세 개를 쓰세요: ${seedItem.rule}`
      : `Write three connected sentences that apply this grammar principle: ${seedItem.rule}`,
    vocabulary: isKo
      ? `핵심 어휘를 실제 상황에 사용하는 짧은 대화나 설명을 쓰세요: ${seedItem.focus}`
      : `Write a short real-life exchange or explanation using the target vocabulary: ${seedItem.focus}`,
  };
  const checklists: Record<FoundationSkill, string[]> = {
    reading: isKo
      ? ["중심 내용을 직접 답함", "글에서 근거 두 개를 찾음", "글보다 강하게 단정하지 않음"]
      : ["State the main point directly", "Use two clues from the text", "Keep the source's level of certainty"],
    grammar: isKo
      ? ["목표 문법을 정확히 사용함", "시간·조사·높임이 문맥과 일치함", "모델을 베끼지 않고 새 문장을 만듦"]
      : ["Use the target form accurately", "Keep tense and agreement consistent", "Create a new context instead of copying the model"],
    vocabulary: isKo
      ? ["단어를 자연스러운 결합으로 사용함", "상황과 높임 정도가 맞음", "뜻이 드러나는 충분한 문맥을 제공함"]
      : ["Use the word in a natural collocation", "Match register to the situation", "Provide enough context to show the meaning"],
  };
  return {
    mode: "writing",
    prompt: prompts[skill],
    instructions: isKo
      ? "먼저 도움 없이 작성하고, 아래 기준으로 내용과 언어를 확인한 뒤 문제로 이동하세요."
      : "Write without support first, check meaning and form against the criteria, then continue to the questions.",
    checklist: checklists[skill],
    minimumCharacters: isKo ? 70 : 170,
    minimumWords: isKo ? undefined : 35,
    maximumWords: isKo ? undefined : 70,
    retakeInstruction: isKo
      ? `재시도: 첫 답을 보지 않고 새로운 상황에 적용하세요. ${seedItem.transfer}`
      : `Retake: apply the principle to a new situation without copying your first response. ${seedItem.transfer}`,
  };
}

const foundationSeeds: Record<TestLanguage, Record<FoundationSkill, FoundationSeed[]>> = {
  en: { reading: englishReading, grammar: englishGrammar, vocabulary: englishVocabulary },
  ko: { reading: koreanReading, grammar: koreanGrammar, vocabulary: koreanVocabulary },
};

export function buildFoundationStages(language: TestLanguage, skill: FoundationSkill): TestStage[] {
  const isKo = language === "ko";
  const icons: Record<FoundationSkill, string> = { reading: isKo ? "읽" : "R", grammar: isKo ? "문" : "G", vocabulary: isKo ? "어" : "V" };
  return foundationSeeds[language][skill].map((seedItem, index) => ({
    id: `${language}-${skill}-${String(index + 1).padStart(2, "0")}`,
    order: index + 1,
    skill,
    icon: icons[skill],
    title: seedItem.title,
    description: seedItem.rule,
    focus: seedItem.focus,
    estimatedMinutes: 8 + Math.floor(index / 4),
    passScore: 70,
    productionTask: productionTask(language, skill, seedItem),
    questions: foundationQuestions(language, skill, index + 1, seedItem),
    challengeQuestions: foundationChallenges(language, skill, index + 1, seedItem),
  }));
}

export const FOUNDATION_TESTS_PER_SKILL = 20;
