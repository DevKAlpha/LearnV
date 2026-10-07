import type { TestLanguage, TestQuestion, TestSkill, TestStage } from "../../domain/models/language-test";

type Choice = [text: string, reason: string];
type Case = { prompt: string; answer: string; rule: string; wrong: [Choice, Choice, Choice] };
type Exercise = {
  title: string;
  focus: string;
  context: string;
  task: string;
  apply: string;
  cases: [Case, Case, Case];
};
const q = (prompt: string, answer: string, rule: string, ...wrong: [Choice, Choice, Choice]): Case => ({ prompt, answer, rule, wrong });

// Original, short scenarios: no copied exam papers or song lyrics.
const english: Record<TestSkill, [Exercise, Exercise]> = {
  reading: [
    {
      title: "Read a pilot study without overclaiming", focus: "Evidence · scope · qualification",
      context: "Thirty volunteers joined a six-week mentoring pilot. Twenty-four reported greater confidence. There was no comparison group, and attendance was optional. The report recommends a larger trial before expanding the programme.",
      task: "In 35–70 words, summarise the finding, cite two clues and propose one cautious conclusion.",
      apply: "Explain a new survey result without turning an association into proof.",
      cases: [
        q("Which conclusion does the report support?", "Most participants reported greater confidence, but the programme's effect is uncertain.", "Self-reports without a comparison group cannot establish causation.", ["Mentoring proved effective for every student.", "Neither every student nor a causal effect was tested."], ["Six weeks of mentoring guarantees confidence.", "A limited pilot cannot guarantee an outcome."], ["No participant gained confidence.", "Twenty-four reported an improvement."]),
        q("Which detail limits generalisation?", "Participation was voluntary and involved only thirty people.", "A small, self-selected sample may differ from the wider population.", ["The report used the word mentoring.", "A topic label is not a sampling limitation."], ["The pilot lasted a full academic year.", "It lasted six weeks."], ["Every student was required to attend.", "Attendance was optional."]),
        q("A second pilot finds similar self-reports. Which wording is proportionate?", "The second pilot is consistent with a possible benefit; a controlled trial is still needed.", "Repeated observations strengthen a pattern, not necessarily a causal explanation.", ["The second pilot removes every limitation.", "The lack of a comparison group remains."], ["Both pilots must be ignored.", "Limited evidence still has informational value."], ["Confidence and grades are the same outcome.", "The pilots measured reported confidence, not grades."]),
      ],
    },
    {
      title: "Combine sources for a practical decision", focus: "Synthesis · trade-offs · attribution",
      context: "The mentoring pilot suggests a possible confidence benefit but cannot prove causation. A student survey identifies evening transport as a barrier. The university budget can fund either extra evening sessions or travel vouchers for the pilot participants, not both.",
      task: "In 35–70 words, recommend one option, use evidence from both sources and acknowledge a limitation.",
      apply: "Use a source's finding and limitation together when making a recommendation.",
      cases: [
        q("Which recommendation uses both sources?", "Trial travel vouchers to address the reported barrier while measuring whether mentoring helps.", "A recommendation should address the barrier without claiming an unproven benefit.", ["Add sessions because mentoring certainly raises grades.", "Neither grades nor certainty is supported."], ["Fund both options immediately.", "The stated budget excludes this."], ["Cancel mentoring because surveys never help.", "The survey identifies a relevant barrier."]),
        q("Which information would most help evaluate the trial?", "Participation and confidence before and after, with a suitable comparison group.", "Match the evaluation to access and the proposed benefit.", ["The colour of the vouchers.", "Appearance does not evaluate access or confidence."], ["Only the number of printed leaflets.", "Distribution alone does not measure outcomes."], ["A guaranteed positive result written in advance.", "An evaluation must allow different results."]),
        q("Which sentence preserves the distinction between sources?", "The survey identifies an access barrier, whereas the pilot suggests a possible confidence benefit.", "Attribution prevents findings from different sources being conflated.", ["The survey proves mentoring causes confidence.", "It concerns transport, not causation."], ["The pilot measured transport costs.", "That is not stated."], ["Both sources establish identical outcomes.", "They address different questions."]),
      ],
    },
  ],
  grammar: [
    {
      title: "Qualify a claim in a research update", focus: "Modals · concession · evidence",
      context: "You are reporting a small mentoring pilot. Participants felt more confident, but there was no comparison group.",
      task: "Write 35–70 words using may or might, one concession and a clear limitation.", apply: "Use a cautious modal when the next report gives limited evidence.",
      cases: [
        q("Choose the sentence that matches limited evidence.", "Mentoring may have improved confidence.", "May have + past participle expresses a possible past explanation.", ["Mentoring may improved confidence.", "May requires have improved here."], ["Mentoring must improving confidence.", "The verb form is invalid and must is too strong."], ["Mentoring definitely improved every student's confidence.", "Definitely and every exceed the evidence."]),
        q("Combine the positive result and the limitation.", "Although confidence increased, causation remains uncertain.", "Although introduces a concessive clause; do not add but to the same link.", ["Although confidence increased, but causation remains uncertain.", "Although and but duplicate the conjunction."], ["Despite confidence increased, causation remains uncertain.", "Despite needs a noun phrase or -ing form."], ["Because confidence increased, causation is certain.", "A temporal change is not proof of causation."]),
        q("Complete: A larger sample ___ us assess the pattern more reliably.", "would help", "A proposed, not yet conducted study can be described with would + base verb.", ["would helps", "The verb after would takes the base form."], ["would helped", "Would does not take a past-tense verb."], ["would helping", "The -ing form cannot follow would alone."]),
      ],
    },
    {
      title: "Use evidence in a conditional recommendation", focus: "Conditionals · reference · cohesive sentences",
      context: "The university will expand mentoring only if a follow-up study supports it. Your report must avoid promising an outcome.",
      task: "Write 35–70 words combining an if-clause, a cautious modal and a reference to the follow-up study.", apply: "Link a recommendation to a condition instead of presenting it as certain.",
      cases: [
        q("Choose the accurate future condition.", "If the study supports the pilot, we will consider expansion.", "For a real future condition, use present simple in the if-clause.", ["If the study will supports the pilot, we consider expansion.", "Will supports is invalid; use supports."], ["If the study support the pilot, we will considers expansion.", "Study needs supports; will needs consider."], ["If the study supports the pilot, expansion has already happened.", "Already happened contradicts the future decision."]),
        q("Which relative clause identifies a useful study?", "We need a study that compares similar groups.", "That introduces a defining clause; its verb agrees with study.", ["We need a study that compare similar groups.", "The singular study requires compares."], ["We need a study which it compares similar groups.", "Which is already the subject; do not add it."], ["We need a study whose compares similar groups.", "Whose must introduce a possessed noun."]),
        q("Which sentence avoids an unsupported promise?", "This design might clarify the effect, although uncertainty will remain.", "Might conveys possibility; although keeps the limitation visible.", ["This design might clarifies every effect.", "Might needs clarify, not clarifies."], ["This design guarantees that uncertainty disappears.", "The scenario does not support a guarantee."], ["Although this design might help, but uncertainty remains.", "Do not use although and but together."]),
      ],
    },
  ],
  vocabulary: [
    {
      title: "Turn research words into a clear update", focus: "Tentative findings · natural collocations",
      context: "Your team has a promising but small pilot. Explain it to a classmate without exaggerating.",
      task: "Write a 35–70-word exchange using preliminary findings, gather evidence and one limitation.", apply: "Use tentative research vocabulary when discussing another small study.",
      cases: [
        q("Which phrase labels an early, incomplete result?", "preliminary findings", "Preliminary signals that findings may change with further evidence.", ["conclusive evidence", "Conclusive indicates a decisive result, not a tentative finding."], ["representative sample", "This describes the participants, not the status of the findings."], ["longitudinal study", "This names a study over time, not an early result."]),
        q("Which collocation describes collecting support for a claim?", "gather evidence", "Gather collocates naturally with evidence; evidence is uncountable here.", ["evaluate evidence", "Evaluation judges existing evidence; gathering obtains it."], ["dismiss evidence", "Dismiss means reject, not collect."], ["fabricate evidence", "Fabricate means invent false support, not collect valid evidence."]),
        q("Which update accurately reflects uncertainty?", "The findings suggest a possible benefit, but further evidence is needed.", "Suggest a possible benefit avoids claiming proof.", ["The findings guarantee a benefit for all.", "Guarantee and all overstate the pilot."], ["The findings command every student to improve.", "Findings do not command an outcome."], ["The findings are a benefit factory.", "This metaphor is not a clear research update."]),
      ],
    },
    {
      title: "Recommend an action with calibrated language", focus: "Address a barrier · allocate resources",
      context: "Students cannot attend mentoring because transport is expensive. You have limited funds for a trial.",
      task: "Write 35–70 words recommending a trial, using address a barrier and allocate resources, with a tentative claim.", apply: "Turn evidence into a feasible recommendation with no guaranteed outcome.",
      cases: [
        q("Which phrase means taking action to deal with an obstacle?", "address a barrier", "Address can mean deal with a problem, not only write a location.", ["identify a barrier", "Identify means recognise it; action to deal with it is a further step."], ["assess a barrier", "Assess judges the obstacle's extent rather than responding to it."], ["reinforce a barrier", "Reinforce strengthens the obstacle rather than tackling it."]),
        q("Which phrase describes deciding where available funds go?", "allocate resources", "Allocate resources means assign available support for a purpose.", ["estimate costs", "Estimating predicts the amount needed, not where funds are assigned."], ["audit spending", "Auditing checks expenditure rather than allocating available funds."], ["request funding", "Requesting asks for funds; allocation decides how available funds are used."]),
        q("Choose a realistic recommendation.", "Allocate resources to a small voucher trial that may address the transport barrier.", "The recommendation names an action, a target and a cautious benefit.", ["Allocate every resource to guarantee perfect attendance.", "The claim is absolute and the budget limited."], ["Address a barrier by collecting unrelated words.", "The action does not address transport."], ["Resources prove mentoring improves grades.", "Resources are not evidence of that effect."]),
      ],
    },
  ],
  writing: [
    {
      title: "Write a concise evidence-led recommendation", focus: "Claim · supporting detail · limitation",
      context: "In a fictional pilot, 24 of 30 students reported greater confidence. Transport costs limited attendance. There was no comparison group.",
      task: "Write 100–140 words recommending one affordable next step. Include a claim, one numerical detail and a limitation.", apply: "Retain one accurate detail while adapting your recommendation to a new constraint.",
      cases: [
        q("Which opening fits the evidence?", "A small travel-voucher trial could address an access barrier while the mentoring pilot is evaluated.", "A focused recommendation connects the observed barrier and an unresolved question.", ["Mentoring has proved that all students need vouchers.", "Neither proof nor all students is supported."], ["Korea is interesting and education is important.", "This avoids the specific recommendation."], ["The university should change everything immediately.", "An unlimited action ignores the task."]),
        q("Which numerical detail is accurate?", "Twenty-four of the thirty participants reported greater confidence.", "Preserve the denominator and the self-reported nature of the result.", ["Thirty of twenty-four students became confident.", "The denominator and numerator are reversed."], ["Confidence rose by twenty-four percentage points.", "There is no before-and-after percentage."], ["Twenty-four students achieved higher grades.", "The measure was confidence, not grades."]),
        q("Which final sentence acknowledges a limitation?", "A comparison group would help assess whether mentoring, rather than other factors, explains the change.", "A limitation should name missing evidence and a feasible way to improve it.", ["Therefore the programme definitely caused every change.", "That ignores the missing comparison."], ["This proves the budget is unlimited.", "The evidence says nothing about unlimited funds."], ["In conclusion, I enjoy travelling.", "This introduces an unrelated personal topic."]),
      ],
    },
    {
      title: "Revise your proposal after a new constraint", focus: "Revision · trade-off · measurable next step",
      context: "The university cannot fund vouchers this month, but it can move one mentoring session to lunchtime. Only a small pilot is possible.",
      task: "Write 100–140 words adapting the earlier proposal: preserve the access goal, change the action and name one measure of success.", apply: "Revise an argument when circumstances change, rather than repeat a memorised answer.",
      cases: [
        q("Which revision responds to the new constraint?", "Move one session to lunchtime and compare attendance with the previous schedule.", "Keep the purpose but adapt the action to resources that actually exist.", ["Distribute vouchers immediately.", "Funding is unavailable this month."], ["Repeat the old proposal without acknowledging the budget.", "The response must address new information."], ["Cancel every session permanently.", "A feasible alternative is available."]),
        q("Which measure matches the access goal?", "Attendance at the lunchtime session compared with earlier sessions.", "Measure the outcome targeted by the revised action.", ["The number of adjectives in the proposal.", "This does not measure access."], ["Guaranteed long-term career success.", "A small schedule trial cannot establish this."], ["The design of a travel voucher.", "The revised action no longer uses vouchers."]),
        q("Which sentence makes the trade-off clear?", "Lunchtime sessions avoid extra travel, although they may conflict with some students' classes.", "A realistic trade-off recognises both a benefit and a remaining barrier.", ["Lunchtime solves every student's timetable.", "Some students may have classes."], ["Although lunchtime helps, but classes exist.", "Although and but duplicate the same link."], ["The old pilot guarantees the new schedule will work.", "Evidence from one setting does not guarantee another."]),
      ],
    },
  ],
  listening: [
    {
      title: "Hear a changed meeting plan", focus: "Contrast signals · corrected details",
      context: "We originally planned to meet on Friday at four, but the room is unavailable. Let's meet on Thursday at three in the library instead. Bring your draft, not the final report. We will discuss feedback before deciding what to revise.",
      task: "Listen to the short original announcement. Note the corrected day, time and required document; then explain the change in one sentence.", apply: "In the next message, distinguish an old plan from the correction introduced by but or instead.",
      cases: [
        q("When is the revised meeting?", "Thursday at three", "But and instead replace the original Friday-at-four plan.", ["Friday at four", "That was the original, cancelled plan."], ["Thursday at four", "The corrected time is three."], ["Friday at three", "The corrected day is Thursday."]),
        q("What should students bring?", "Their draft", "Not the final report explicitly excludes the final version.", ["Their final report", "The announcement explicitly excludes it."], ["A room reservation", "Students are not asked to bring this."], ["Their exam certificate", "No certificate is mentioned."]),
        q("What happens before deciding on revisions?", "They discuss feedback.", "Before establishes the order of actions.", ["They submit the final report.", "The final report is not requested."], ["They cancel the project.", "Only the meeting plan changes."], ["They move the library.", "The library is the venue, not something being moved."]),
      ],
    },
    {
      title: "Listen for conditions in a follow-up", focus: "Sequence · conditional action",
      context: "The Thursday meeting is still at three in the library. First, compare the feedback on your draft. If both reviewers question the evidence, revise that section before changing the introduction. Otherwise, keep the evidence and clarify the introduction. Send the revised draft on Monday, not Friday.",
      task: "Listen to the follow-up. Identify what stayed the same, what changed and which revision depends on the reviewers' feedback.", apply: "Keep the correction strategy and add conditional listening: if is not a confirmed fact.",
      cases: [
        q("What stayed the same?", "The meeting is on Thursday at three in the library.", "Still marks a detail that has not changed.", ["The draft is due on Friday.", "Monday replaces Friday."], ["The introduction must always be changed first.", "The order depends on the feedback."], ["Both reviewers have already rejected the evidence.", "The announcement presents this as a condition."]),
        q("When should the evidence section be revised first?", "If both reviewers question the evidence.", "The if-clause sets a condition, not a report that it has already occurred.", ["Whenever one reviewer likes the title.", "This condition is not mentioned."], ["In every case, without reading feedback.", "Otherwise gives a different action."], ["Only after submitting the final report.", "The revisions precede the revised draft submission."]),
        q("What is the revised deadline?", "Monday", "Not Friday explicitly corrects the old deadline.", ["Friday", "Friday is excluded."], ["Thursday at three", "That is the meeting time, not the submission deadline."], ["No deadline is given.", "Monday is stated."]),
      ],
    },
  ],
  pronunciation: [
    {
      title: "GKS answer: make a contrast audible", focus: "Meaning groups · contrast stress",
      context: "I want to study in Korea, not simply to travel, but to compare how small businesses enter international markets. My school project gave me a starting point; I still need stronger research skills.",
      task: "Record a 45–60-second GKS answer using your own example. Make the difference between tourism and academic purpose audible, with two natural pauses.", apply: "Use meaning groups and contrast stress when adapting the answer to a follow-up question.",
      cases: [
        q("Which chunking preserves the intended contrast?", "Not simply to travel / but to compare international markets.", "Pause between meaningful units, not inside a tightly linked phrase.", ["Not / simply to / travel but to compare international markets.", "The fragmentation obscures the contrast."], ["Not simply to travel but / to / compare / international markets.", "Pauses split the purpose phrase unnecessarily."], ["Not simply to travel but to compare international markets with no pause or emphasis.", "The contrast becomes harder to follow."]),
        q("Which words should carry contrastive emphasis?", "Travel and compare", "Emphasise the contrasted purposes rather than every function word.", ["Every word equally", "Equal stress hides the contrast."], ["Only to and in", "Function words do not express the contrasted purposes."], ["Only the final full stop", "Punctuation is not spoken as a stressed word."]),
        q("Which self-correction keeps the answer credible?", "To be more precise, I compared two local firms in a school project.", "A brief correction adds a specific detail without derailing the answer.", ["I never need to correct anything.", "This replaces clarification with an absolute claim."], ["Forget the question; I will recite a different answer.", "It abandons the interviewer's topic."], ["I compared every firm in the world.", "The detail is implausibly absolute."]),
      ],
    },
    {
      title: "GKS follow-up: clarify without starting over", focus: "Repair · concise example · controlled pace",
      context: "The interviewer asks: What did comparing those businesses actually teach you? Model: It taught me to separate a good idea from the evidence supporting it. For example, I compared customer feedback rather than assuming the most popular brand was best.",
      task: "Record a 45–60-second follow-up with a direct answer, one example and one brief clarification. Reuse the contrast and pauses from the previous practice.", apply: "In another follow-up, retain the speaking habit but change the evidence to fit the question.",
      cases: [
        q("Which opening directly answers the follow-up?", "It taught me to compare evidence rather than rely on popularity.", "Answer the new question before adding an example.", ["I want to travel to Korea.", "That repeats motivation instead of explaining learning."], ["Businesses exist in many countries.", "This is general background, not what you learned."], ["Let me repeat my entire first answer.", "Repeating everything burdens the listener."]),
        q("Which pause pattern supports the example?", "For example / I compared customer feedback / rather than relying on popularity.", "Each pause marks a complete meaning unit.", ["For / example I / compared customer / feedback rather than relying on popularity.", "The pauses break expressions and noun phrases."], ["For example I compared customer feedback rather than relying on popularity at maximum speed.", "Rushing reduces clarity."], ["A long pause after every word", "Word-by-word pauses prevent fluent grouping."]),
        q("Which clarification is brief and useful?", "By evidence, I mean customer comments collected during our project.", "Define the ambiguous word with a concrete source.", ["Evidence means absolutely everything.", "This does not clarify the source."], ["I cannot explain that word, so I will change the subject.", "The original point remains unclear."], ["By evidence, I mean that I am always right.", "Self-certainty is not supporting evidence."]),
      ],
    },
  ],
};

const korean: Record<TestSkill, [Exercise, Exercise]> = {
  reading: [
    {
      title: "시범 프로그램의 결과와 한계", focus: "결과 · 근거 · 단정 피하기",
      context: "학생 30명이 6주 동안 멘토링에 참여했다. 그중 24명은 자신감이 높아졌다고 답했다. 참여는 자율이었으며 비교 집단은 없었다. 보고서는 프로그램을 확대하기 전에 추가 조사가 필요하다고 제안했다.",
      task: "글의 결과와 한계를 70자 이상으로 요약하고 근거 두 개를 쓰세요.", apply: "다른 조사에서도 보고된 변화와 확인된 원인을 구분하세요.",
      cases: [
        q("글의 내용과 일치하는 것은 무엇입니까?", "참여자 대부분이 자신감 향상을 보고했지만 원인은 확정할 수 없다.", "자기 보고와 비교 집단의 부재를 함께 읽어야 합니다.", ["모든 학생의 성적이 올랐다.", "조사는 성적이 아니라 자신감에 관한 것입니다."], ["멘토링의 효과가 완전히 증명되었다.", "비교 집단이 없어 원인을 확정하기 어렵습니다."], ["아무도 자신감이 높아졌다고 하지 않았다.", "24명이 향상을 보고했습니다."]),
        q("결과를 모든 학생에게 적용하기 어려운 이유는 무엇입니까?", "참여자가 적고 참여가 자율이었다.", "작은 자율 참여 집단은 전체 학생과 다를 수 있습니다.", ["프로그램 이름이 멘토링이다.", "이름은 표본의 한계가 아닙니다."], ["모든 학생이 의무적으로 참여했다.", "참여는 자율이었습니다."], ["비교 집단이 충분히 많았다.", "비교 집단은 없었습니다."]),
        q("새 조사에서도 비슷한 결과가 나오면 어떻게 표현해야 합니까?", "가능성을 보여 주지만 비교 조사가 더 필요하다.", "비슷한 결과가 반복되어도 원인에 대한 증거를 더 확인해야 합니다.", ["한계가 모두 없어졌다.", "비교 집단의 부재는 여전히 한계입니다."], ["성적 향상이 보장된다.", "자신감 조사로 성적을 보장할 수 없습니다."], ["조사 결과는 아무 가치가 없다.", "제한된 결과도 참고 자료가 됩니다."]),
      ],
    },
    {
      title: "두 자료로 다음 행동 정하기", focus: "자료 종합 · 조건 · 제안",
      context: "멘토링 시범 조사에서는 자신감 향상의 가능성이 나타났지만 원인은 확정되지 않았다. 다른 설문에서는 저녁 교통비가 참여의 어려움으로 나타났다. 대학은 추가 수업과 교통비 지원 중 하나만 시범 운영할 수 있다.",
      task: "두 자료의 근거를 사용해 한 가지 행동을 제안하고 한계를 70자 이상으로 설명하세요.", apply: "근거와 한계를 함께 사용해 현실적인 제안을 하세요.",
      cases: [
        q("두 자료를 함께 고려한 제안은 무엇입니까?", "교통비 지원을 시범 운영하면서 참여와 자신감의 변화를 조사한다.", "교통 장벽을 줄이고 멘토링 효과는 계속 확인하는 제안입니다.", ["두 사업을 동시에 전면 시행한다.", "예산상 하나만 시범 운영할 수 있습니다."], ["멘토링이 성적을 올린다고 단정한다.", "성적이나 원인은 확인되지 않았습니다."], ["설문을 무시하고 모든 수업을 없앤다.", "설문은 구체적인 참여 장벽을 제시합니다."]),
        q("시범 운영을 평가할 때 가장 필요한 것은 무엇입니까?", "지원 전후의 참여와 자신감, 그리고 적절한 비교 자료", "행동의 목표와 평가 기준이 연결되어야 합니다.", ["홍보물의 색깔만 확인하기", "참여나 자신감을 평가하지 못합니다."], ["좋은 결과를 미리 확정하기", "평가는 다른 결과도 허용해야 합니다."], ["관련 없는 관광객 수만 조사하기", "학생 참여와 관련이 없습니다."]),
        q("자료의 역할을 정확히 구분한 문장은 무엇입니까?", "설문은 교통의 어려움을, 시범 조사는 자신감 향상의 가능성을 보여 준다.", "각 자료가 실제로 다룬 내용을 구분해서 연결합니다.", ["설문이 멘토링의 원인을 증명한다.", "설문은 교통의 어려움에 관한 것입니다."], ["시범 조사에서 교통비를 정확히 측정했다.", "그런 내용은 제시되지 않았습니다."], ["두 자료는 같은 결과를 확정했다.", "자료의 주제도 확실성도 다릅니다."]),
      ],
    },
  ],
  grammar: [
    {
      title: "결과를 조심스럽게 설명하기", focus: "-는 것 같다 · -지만 · 근거",
      context: "소규모 멘토링 후 학생들이 자신감이 높아졌다고 답했습니다. 비교 집단은 없습니다.",
      task: "70자 이상으로 결과를 설명하세요. '-는 것 같다'와 '-지만'을 사용하고 한계를 쓰세요.", apply: "확실하지 않은 결과에는 추측 표현과 근거를 함께 사용하세요.",
      cases: [
        q("확실하지 않은 결과에 알맞은 문장은 무엇입니까?", "멘토링이 학생들에게 도움이 되는 것 같습니다.", "동사 현재형의 추측은 '-는 것 같다'로 표현할 수 있습니다.", ["멘토링이 학생들에게 도움이 되는 것 무조건입니다.", "추측 구조가 완성되지 않았고 무조건은 근거보다 강합니다."], ["멘토링이 모든 결과를 반드시 보장합니다.", "비교 집단이 없어 보장을 말하기 어렵습니다."], ["멘토링이 학생들에게 도움을 같습니다.", "도움이 되는 것 같습니다가 자연스러운 구조입니다."]),
        q("결과와 한계를 연결한 문장은 무엇입니까?", "자신감은 높아졌지만 원인은 아직 확실하지 않습니다.", "-지만은 앞의 긍정적 결과와 뒤의 한계를 대조합니다.", ["자신감은 높아졌지만 그래서 원인은 확실합니다.", "대조 관계가 사라지고 원인을 단정합니다."], ["자신감이 높아진 원인은 무조건 멘토링입니다.", "원인을 확정할 근거가 부족합니다."], ["자신감은 높아졌지만을 원인입니다.", "연결 어미 뒤에 목적격 조사를 붙일 수 없습니다."]),
        q("빈칸에 알맞은 것은? 더 큰 조사가 ___.", "필요한 것 같습니다", "필요하다는 형용사이므로 필요한 것 같습니다로 연결합니다.", ["필요하는 것 같습니다", "형용사 필요하다에는 필요한을 씁니다."], ["필요할을 것 같습니다", "관형형에 을을 다시 붙이지 않습니다."], ["필요하를 것 같습니다", "필요하다는 필요한 또는 필요할로 활용합니다."]),
      ],
    },
    {
      title: "조건에 따라 다음 행동 제안하기", focus: "-(으)면 · -기 전에 · 추측 유지",
      context: "추가 조사에서 효과가 확인될 때만 프로그램을 확대하려고 합니다.",
      task: "70자 이상으로 조건과 행동을 연결하세요. '-(으)면', '-기 전에'와 조심스러운 표현을 사용하세요.", apply: "조건을 이미 일어난 사실처럼 말하지 말고 행동의 순서도 분명히 하세요.",
      cases: [
        q("조건을 정확히 표현한 문장은 무엇입니까?", "효과가 확인되면 확대를 검토하겠습니다.", "확인되다의 어간에 -면을 붙여 조건을 만듭니다.", ["효과가 확인되으면 확대하겠습니다.", "모음으로 끝나는 어간에는 -면을 붙입니다."], ["효과가 확인되면 이미 확대했습니다.", "앞의 미래 조건과 뒤의 완료된 행동이 맞지 않습니다."], ["효과가 확인되를 확대합니다.", "조건을 나타내는 연결 어미가 필요합니다."]),
        q("행동 순서가 알맞은 문장은 무엇입니까?", "프로그램을 확대하기 전에 결과를 확인해야 합니다.", "-기 전에 앞의 행동보다 뒤의 행동을 먼저 합니다.", ["프로그램을 확대하기 전에 결과를 확인할 필요가 없습니다.", "시나리오에서는 확인이 먼저 필요합니다."], ["결과를 확인한 후 전에 확대합니다.", "후와 전의 순서 표현을 겹치면 뜻이 불분명합니다."], ["프로그램을 확대하는 전에 확인합니다.", "-기 전에가 올바른 연결입니다."]),
        q("조건과 추측을 함께 유지한 문장은 무엇입니까?", "참여가 늘면 도움이 될 것 같지만 추가 확인이 필요합니다.", "조건, 가능성, 한계를 함께 표현합니다.", ["참여가 늘면 모든 효과가 보장됩니다.", "참여 증가가 모든 효과의 증거는 아닙니다."], ["참여가 늘으면 도움이 됩니다.", "늘다에는 늘면을 씁니다."], ["참여가 늘면 도움이 되는을 같습니다.", "되는 것 같습니다가 올바른 구조입니다."]),
      ],
    },
  ],
  vocabulary: [
    {
      title: "조사 결과를 자연스럽게 전달하기", focus: "자료를 수집하다 · 결과를 분석하다",
      context: "팀의 작은 시범 조사를 친구에게 설명하려고 합니다. 아직 추가 자료가 필요합니다.",
      task: "70자 이상으로 짧은 대화를 쓰세요. '자료를 수집하다'와 '결과를 분석하다'를 사용하세요.", apply: "새 조사에서도 조사 단계에 맞는 동사와 명사를 연결하세요.",
      cases: [
        q("정보를 모으는 단계에 알맞은 표현은 무엇입니까?", "자료를 수집하다", "수집하다는 자료나 정보를 모은다는 뜻입니다.", ["자료를 해석하다", "해석은 이미 있는 자료의 뜻을 파악하는 단계입니다."], ["자료를 공유하다", "공유는 자료를 다른 사람과 나누는 행동입니다."], ["자료를 요약하다", "요약은 내용을 짧게 정리하는 행동입니다."]),
        q("얻은 결과의 내용과 관계를 자세히 살펴보는 표현은 무엇입니까?", "결과를 분석하다", "분석하다는 내용이나 관계를 나누어 살펴보는 것입니다.", ["결과를 수집하다", "수집은 결과를 모으는 단계이며 관계를 살펴보는 단계는 아닙니다."], ["결과를 발표하다", "발표는 결과를 다른 사람에게 전달하는 행동입니다."], ["결과를 예상하다", "예상은 아직 확인되지 않은 결과를 미리 생각하는 것입니다."]),
        q("아직 충분한 근거가 없을 때 알맞은 설명은 무엇입니까?", "자료를 더 수집한 뒤 결과를 분석해야 합니다.", "자료 수집과 분석의 순서를 자연스럽게 연결합니다.", ["먼저 결론을 확정하고 그에 맞는 자료만 모읍니다.", "결론을 미리 정하면 반대 근거를 놓칠 수 있습니다."], ["자료를 공유했으므로 추가 분석은 필요 없습니다.", "공유와 분석은 서로 다른 단계입니다."], ["작은 시범 결과가 좋으므로 모든 학생의 효과를 확정합니다.", "작은 조사만으로 전체 학생의 효과를 단정할 수 없습니다."]),
      ],
    },
    {
      title: "참여의 어려움에 대응하기", focus: "부담을 줄이다 · 예산을 배정하다",
      context: "학생들이 교통비 때문에 멘토링에 오기 어렵습니다. 대학의 시범 사업 예산은 제한되어 있습니다.",
      task: "70자 이상으로 한 가지 지원을 제안하세요. '부담을 줄이다', '예산을 배정하다'와 조사 표현 하나를 사용하세요.", apply: "자료를 바탕으로 구체적인 어려움과 지원 행동을 연결하세요.",
      cases: [
        q("학생의 비용 문제를 완화하는 표현은 무엇입니까?", "교통비 부담을 줄이다", "부담을 줄이다는 어려움이나 비용을 덜어 주는 자연스러운 결합입니다.", ["교통비 부담을 조사하다", "조사는 어려움을 알아보는 것이며 직접 줄이는 행동은 아닙니다."], ["교통비 부담을 인정하다", "인정은 어려움이 있다는 것을 받아들이는 것입니다."], ["교통비 부담을 비교하다", "비교는 차이를 살피는 행동이며 비용을 줄이는 행동은 아닙니다."]),
        q("사업에 사용할 돈의 몫과 용도를 정하는 표현은 무엇입니까?", "예산을 배정하다", "배정하다는 몫이나 자원을 특정 용도에 나누어 정하는 것입니다.", ["예산을 추정하다", "추정은 금액을 예상하는 것으로 실제 배정과 다릅니다."], ["예산을 검토하다", "검토는 계획을 살펴보는 단계입니다."], ["예산을 보고하다", "보고는 예산 정보를 전달하는 행동입니다."]),
        q("제한된 예산에 알맞은 제안은 무엇입니까?", "교통비 지원에 예산 일부를 배정하고 참여 결과를 분석한다.", "작은 행동과 평가를 연결해 현실적인 제안을 합니다.", ["예산이 없어도 모든 비용을 영원히 보장한다.", "한정된 예산과 맞지 않습니다."], ["학생의 부담을 늘려 참여를 보장한다.", "참여 장벽을 악화시키는 제안입니다."], ["자료를 모으지 않고 결과를 확정한다.", "근거 없이 결과를 단정합니다."]),
      ],
    },
  ],
  writing: [
    {
      title: "근거가 있는 짧은 제안문", focus: "주장 · 수치 · 한계",
      context: "가상의 시범 조사에서 학생 30명 중 24명이 자신감 향상을 보고했습니다. 교통비 때문에 참여하기 어려운 학생도 있습니다. 비교 집단은 없습니다.",
      task: "100자 이상으로 작은 지원 사업을 제안하세요. 정확한 수치 하나와 조사 한계를 포함하세요.", apply: "새 조건에서도 근거와 한계를 유지하며 제안을 바꾸세요.",
      cases: [
        q("근거에 맞는 제안의 시작은 무엇입니까?", "교통비 지원을 시범 운영하고 멘토링의 효과를 더 조사할 필요가 있다.", "구체적인 참여 장벽을 줄이면서 효과는 확인 대상으로 남깁니다.", ["멘토링은 모든 학생의 성공을 보장한다.", "모든 학생이나 성공은 조사되지 않았습니다."], ["한국은 좋고 여행은 재미있다.", "지원 제안과 연결되지 않습니다."], ["예산과 관계없이 모든 사업을 확대한다.", "작은 지원이라는 조건과 맞지 않습니다."]),
        q("수치를 정확히 전달한 문장은 무엇입니까?", "참여 학생 30명 중 24명이 자신감 향상을 보고했다.", "전체 인원, 응답 인원, 측정 내용을 함께 보존합니다.", ["학생 24명 중 30명이 참여했다.", "부분 인원이 전체 인원보다 많아졌습니다."], ["성적이 24점 올랐다.", "성적 점수는 제시되지 않았습니다."], ["모든 학생이 같은 효과를 보았다.", "24명의 자기 보고만 제시되었습니다."]),
        q("제안문에 필요한 한계는 무엇입니까?", "비교 집단이 없어 변화의 원인을 확정하기 어렵다.", "한계는 근거가 부족한 이유를 구체적으로 설명합니다.", ["따라서 다른 원인은 절대로 없다.", "비교 자료가 없어 다른 원인을 제외할 수 없습니다."], ["모든 결과가 영원히 유지된다.", "장기 결과는 확인되지 않았습니다."], ["그래서 여행 계획을 바꿨다.", "제안문과 관련 없는 결론입니다."]),
      ],
    },
    {
      title: "새 조건에 맞게 제안 수정하기", focus: "수정 · 장단점 · 평가 기준",
      context: "이번 달에는 교통비 지원 예산이 없습니다. 대신 멘토링 한 회를 점심시간으로 옮길 수 있습니다. 작은 시범 운영만 가능합니다.",
      task: "100자 이상으로 이전 제안을 수정하세요. 참여 목표를 유지하고 행동 하나, 장단점, 평가 기준을 쓰세요.", apply: "외운 글을 반복하지 말고 새로운 조건에 맞게 행동을 바꾸세요.",
      cases: [
        q("새 조건에 맞는 수정은 무엇입니까?", "한 회를 점심시간으로 옮기고 이전 시간대와 참여율을 비교한다.", "참여 목표를 유지하면서 가능한 자원에 맞게 행동을 바꿉니다.", ["당장 모든 학생에게 교통비를 지급한다.", "이번 달에는 해당 예산이 없습니다."], ["이전 글을 조건 변경 없이 그대로 제출한다.", "새 정보를 반영하지 않습니다."], ["모든 수업을 영구 폐지한다.", "가능한 대안이 있는데 지나친 변경입니다."]),
        q("평가 기준으로 가장 적절한 것은 무엇입니까?", "점심시간 회차의 참여율과 이전 회차의 참여율", "참여 목표와 연결되는 결과를 측정합니다.", ["제안문의 글자 색깔", "참여를 평가하지 않습니다."], ["평생의 취업 성공 보장", "작은 시간대 변경으로 확인할 수 없습니다."], ["쓰지 않는 교통권의 모양", "수정된 행동은 교통권을 사용하지 않습니다."]),
        q("장단점을 함께 제시한 문장은 무엇입니까?", "추가 이동은 줄일 수 있지만 수업 시간이 겹치는 학생도 있을 수 있다.", "가능한 장점과 남아 있는 어려움을 함께 인정합니다.", ["점심시간은 모든 학생에게 완벽하다.", "수업이 겹칠 가능성을 무시합니다."], ["이전 조사가 새 시간대의 성공을 보장한다.", "다른 조건의 성공을 보장하지 못합니다."], ["어려움은 하나도 없으므로 조사하지 않는다.", "평가가 필요한 시범 운영입니다."]),
      ],
    },
  ],
  listening: [
    {
      title: "변경된 모임 안내 듣기", focus: "정정 · 시간 · 준비물",
      context: "원래 금요일 네 시에 만나려고 했지만 그때는 방을 사용할 수 없습니다. 대신 목요일 세 시에 도서관에서 만납시다. 완성된 보고서가 아니라 초안을 가져오세요. 수정할 내용을 정하기 전에 의견을 나누겠습니다.",
      task: "짧은 안내를 듣고 바뀐 요일, 시간, 준비물을 메모하세요. 변경 내용을 한 문장으로 설명하세요.", apply: "다음 안내에서도 원래 계획과 대신 제시된 새 계획을 구분하세요.",
      cases: [
        q("바뀐 모임 시간은 언제입니까?", "목요일 세 시", "대신 뒤의 요일과 시간이 이전 계획을 바꿉니다.", ["금요일 네 시", "원래 계획이며 변경되었습니다."], ["목요일 네 시", "바뀐 시간은 세 시입니다."], ["금요일 세 시", "바뀐 요일은 목요일입니다."]),
        q("무엇을 가져와야 합니까?", "초안", "아니라 뒤의 초안이 필요한 준비물입니다.", ["완성된 보고서", "완성된 보고서가 아니라고 했습니다."], ["시험 성적표", "성적표는 언급되지 않았습니다."], ["방 예약 확인서", "예약 확인서를 요청하지 않았습니다."]),
        q("수정 내용을 정하기 전에 무엇을 합니까?", "의견을 나눈다.", "-기 전에는 행동의 순서를 알려 줍니다.", ["완성된 보고서를 제출한다.", "최종 보고서를 요구하지 않았습니다."], ["프로젝트를 취소한다.", "모임 시간만 바뀌었습니다."], ["도서관을 옮긴다.", "도서관은 모임 장소입니다."]),
      ],
    },
    {
      title: "후속 안내의 조건과 순서", focus: "유지된 정보 · -(으)면 · 마감",
      context: "목요일 세 시 도서관 모임은 그대로입니다. 먼저 초안에 대한 의견을 비교하세요. 두 검토자가 모두 근거가 부족하다고 하면 서론보다 근거 부분을 먼저 수정하세요. 그렇지 않으면 근거는 유지하고 서론을 명확하게 쓰세요. 수정한 초안은 금요일이 아니라 월요일에 보내세요.",
      task: "후속 안내를 듣고 유지된 정보, 바뀐 마감, 조건에 따라 달라지는 행동을 메모하세요.", apply: "정정 듣기에 조건 구분을 더하세요. 조건은 이미 확인된 사실이 아닙니다.",
      cases: [
        q("바뀌지 않은 정보는 무엇입니까?", "목요일 세 시 도서관 모임", "그대로는 유지된 정보를 표시합니다.", ["금요일 제출 마감", "마감은 월요일로 바뀌었습니다."], ["서론을 항상 먼저 수정하기", "수정 순서는 조건에 따라 다릅니다."], ["두 검토자가 이미 근거를 거절했다는 사실", "그것은 확인된 사실이 아니라 조건입니다."]),
        q("근거 부분을 먼저 수정하는 조건은 무엇입니까?", "두 검토자가 모두 근거가 부족하다고 할 때", "-면으로 제시한 조건을 정확히 구분합니다.", ["검토자 한 명이 제목을 좋아할 때", "이런 조건은 언급되지 않았습니다."], ["의견과 관계없이 항상", "그렇지 않으면 다른 행동을 합니다."], ["최종 보고서를 제출한 뒤", "초안을 수정한 뒤 보내는 순서입니다."]),
        q("수정한 초안은 언제 보냅니까?", "월요일", "금요일이 아니라 월요일이라고 마감을 정정했습니다.", ["금요일", "금요일은 제외되었습니다."], ["목요일 세 시", "그것은 모임 시간입니다."], ["마감이 없다.", "월요일을 명시했습니다."]),
      ],
    },
  ],
  pronunciation: [
    {
      title: "GKS 답변의 대조를 분명하게", focus: "의미 단위 · 대조 · 자연스러운 쉼",
      context: "저는 단순히 여행하기 위해서가 아니라 국제 시장을 공부하기 위해 한국에 가고 싶습니다. 학교 프로젝트에서 두 기업을 비교했습니다. 이 경험이 출발점이 되었지만 연구 방법은 더 배워야 합니다.",
      task: "자신의 경험으로 45~60초 GKS 답변을 녹음하세요. 여행과 학업 목적의 차이를 분명히 하고 의미 단위로 두 번 쉬세요.", apply: "후속 질문에서도 대조와 의미 단위의 쉼을 유지하세요.",
      cases: [
        q("의미가 잘 전달되는 끊어 읽기는 무엇입니까?", "여행하기 위해서가 아니라 / 국제 시장을 공부하기 위해서입니다.", "대조되는 목적을 의미 단위로 나누면 이해하기 쉽습니다.", ["여행하기 / 위해서가 / 아니라 국제 시장을 공부하기 위해서입니다.", "목적 표현을 작은 조각으로 나누면 흐름이 끊깁니다."], ["여행하기 위해서가 아니라 국제 / 시장을 / 공부하기 위해서입니다.", "국제 시장이라는 명사구를 불필요하게 나눕니다."], ["모든 단어 뒤에서 오래 쉰다.", "단어마다 쉬면 문장 흐름이 사라집니다."]),
        q("대조를 위해 분명하게 말할 부분은 무엇입니까?", "여행과 공부라는 두 목적", "목적의 차이가 핵심이므로 그 부분을 또렷하게 말합니다.", ["모든 조사만 크게 말하기", "조사만 강조하면 핵심 목적이 잘 들리지 않습니다."], ["모든 단어를 같은 속도로 급하게 말하기", "대조와 의미 단위가 들리기 어렵습니다."], ["문장 끝의 마침표를 읽기", "문장부호를 읽는 것이 대조를 전달하지 않습니다."]),
        q("자연스럽고 구체적인 정정은 무엇입니까?", "더 정확히 말하면, 학교 프로젝트에서 두 지역 기업을 비교했습니다.", "짧은 정정은 답변을 버리지 않고 구체성을 더합니다.", ["저는 절대로 설명을 고치지 않습니다.", "정확한 정보를 더하지 못합니다."], ["질문과 관계없는 외운 답을 말하겠습니다.", "면접 질문에서 벗어납니다."], ["전 세계 모든 기업을 비교했습니다.", "지나치게 절대적이고 믿기 어려운 주장입니다."]),
      ],
    },
    {
      title: "GKS 후속 질문에 간결하게 답하기", focus: "직접 답하기 · 예시 · 짧은 설명",
      context: "면접관: 두 기업을 비교하면서 무엇을 배웠습니까? 모델: 인기와 근거를 구분하는 법을 배웠습니다. 예를 들어 유명하다는 이유만으로 판단하지 않고 프로젝트에서 모은 고객 의견을 비교했습니다.",
      task: "45~60초 후속 답변을 녹음하세요. 직접 답하고 예시 하나와 짧은 설명을 넣으세요. 이전의 대조와 쉼을 다시 사용하세요.", apply: "다음 후속 질문에서는 말하기 습관을 유지하되 근거를 질문에 맞게 바꾸세요.",
      cases: [
        q("후속 질문에 직접 답하는 시작은 무엇입니까?", "인기보다 근거를 비교하는 법을 배웠습니다.", "무엇을 배웠는지 먼저 말한 뒤 예시를 더합니다.", ["한국으로 여행을 가고 싶습니다.", "학습 내용을 묻는 새 질문에 답하지 않습니다."], ["여러 나라에 기업이 있습니다.", "일반적인 배경 설명에 머뭅니다."], ["첫 답변을 처음부터 모두 반복하겠습니다.", "전체 반복은 듣는 사람에게 부담이 됩니다."]),
        q("예시를 이해하기 쉬운 쉼은 무엇입니까?", "예를 들어 / 고객 의견을 비교했습니다 / 인기에만 의존하지 않고요.", "각 쉼은 하나의 의미 단위를 구분합니다.", ["예를 / 들어 고객 / 의견을 비교했습니다.", "예를 들어와 고객 의견을 불필요하게 나눕니다."], ["가능한 가장 빠르게 쉼 없이 말하기", "속도만 높이면 내용 전달이 어려워집니다."], ["매 음절마다 오래 쉬기", "음절 단위의 쉼은 자연스러운 흐름을 끊습니다."]),
        q("근거가 무엇인지 명확하게 설명한 문장은 무엇입니까?", "여기서 근거는 프로젝트 중 모은 고객 의견을 뜻합니다.", "불분명한 말의 뜻과 실제 출처를 짧게 설명합니다.", ["근거는 모든 것을 뜻합니다.", "실제 출처가 여전히 불분명합니다."], ["근거를 설명할 수 없으니 주제를 바꾸겠습니다.", "기존 주장이 명확해지지 않습니다."], ["근거는 제가 항상 옳다는 뜻입니다.", "자신감은 확인 가능한 근거가 아닙니다."]),
      ],
    },
  ],
};

function makeQuestion(language: TestLanguage, stageId: string, item: Case, index: number, exercise: Exercise): TestQuestion {
  const options = [item.answer, ...item.wrong.map(([text]) => text)];
  const feedback = [item.rule, ...item.wrong.map(([, reason]) => `${reason} ${item.rule}`)];
  const offset = index % options.length;
  return {
    id: `${stageId}-context-${index}`,
    skill: exercise.focus,
    prompt: item.prompt,
    passage: exercise.context,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    optionFeedback: [...feedback.slice(offset), ...feedback.slice(0, offset)],
    correctIndex: (options.length - offset) % options.length,
    explanation: item.rule,
    improvement: language === "ko" ? `선택한 표현을 모델과 비교하세요. ${exercise.apply}` : `Compare the selected wording with the model. ${exercise.apply}`,
    lesson: item.rule,
    example: item.answer,
    transfer: exercise.apply,
  };
}

export function buildExtensionStages(language: TestLanguage, skill: TestSkill): TestStage[] {
  const ko = language === "ko";
  return (ko ? korean : english)[skill].map((exercise, index) => {
    const id = `${language}-${skill}-${21 + index}`;
    const mode = skill === "listening" ? "listening" : skill === "pronunciation" ? "speaking" : "writing";
    return {
      id, order: 21 + index, skill, icon: ko ? "한" : "EN",
      title: exercise.title, description: exercise.context, focus: exercise.focus,
      estimatedMinutes: skill === "writing" ? 10 : 8, passScore: 70,
      productionTask: {
        mode, prompt: exercise.task, context: mode === "writing" ? exercise.context : undefined,
        instructions: ko ? "새 상황에 직접 적용하세요. 이전에 배운 것 하나만 다시 사용하면 됩니다. 추가 과제는 없습니다." : "Apply the skill in this new situation. Carry forward just one earlier point; there is no extra task.",
        checklist: ko ? ["이번 질문에 직접 답함", "구체적인 근거 또는 예시 하나를 확인함", "이전 학습 하나를 새 상황에 사용함"] : ["Answer the current task directly", "Check one concrete clue or example", "Use one previous learning point in the new context"],
        minimumCharacters: mode === "writing" ? (skill === "writing" ? 100 : 70) : undefined,
        minimumWords: mode === "writing" && !ko ? (skill === "writing" ? 100 : 35) : undefined,
        maximumWords: mode === "writing" && !ko ? (skill === "writing" ? 140 : 70) : undefined,
        targetSeconds: mode === "speaking" ? 60 : undefined,
        listeningScript: mode === "listening" ? exercise.context : undefined,
        retakeInstruction: ko ? "같은 상황에서 틀린 점 하나를 수정하세요. 답을 길게 만들 필요는 없습니다." : "In the same situation, revise one point from your feedback; you do not need a longer answer.",
      },
      // The fourth question is a retrieval item supplied by connectPracticeStages.
      questions: exercise.cases.map((item, questionIndex) => makeQuestion(language, id, item, questionIndex, exercise)),
      challengeQuestions: revisionQuestions(language, id, exercise),
    };
  });
}

function revisionQuestions(language: TestLanguage, id: string, exercise: Exercise): TestQuestion[] {
  const ko = language === "ko";
  const first = exercise.cases[0];
  const last = exercise.cases[2];
  const detection: Case = {
    prompt: ko ? "다음 중 수정이 필요한 표현이나 판단은 무엇입니까?" : "Which statement or choice needs correction in this context?",
    answer: first.wrong[0][0],
    rule: `${first.wrong[0][1]} ${ko ? "올바른 모델:" : "Accurate model:"} ${first.answer}`,
    wrong: [
      [first.answer, ko ? "이것은 문맥에 맞는 모델이므로 수정할 대상이 아닙니다." : "This is the accurate contextual model, not the error to correct."],
      [first.rule, ko ? "이 원리는 문맥에 맞습니다. 다른 선택지의 오류를 확인하세요." : "This principle fits the context; look for the error in another choice."],
      [exercise.apply, ko ? "이것은 적절한 적용 목표입니다. 오류가 있는 표현을 찾으세요." : "This is an appropriate transfer goal, not the incorrect statement."],
    ],
  };
  const repair: Case = {
    prompt: ko ? `학습자가 ‘${last.wrong[0][0]}’라고 답했습니다. 가장 정확한 피드백은 무엇입니까?` : `A learner answered “${last.wrong[0][0]}”. Which feedback identifies the actual problem?`,
    answer: last.wrong[0][1],
    rule: `${last.wrong[0][1]} ${last.rule}`,
    wrong: [
      [last.wrong[1][1], ko ? "다른 선택지의 오류에 대한 설명입니다. 인용된 답을 다시 확인하세요." : "That explanation concerns a different distractor; check the quoted response."],
      [last.wrong[2][1], ko ? "인용된 답의 문제와 다른 설명입니다. 어떤 표현이 잘못되었는지 확인하세요." : "That describes a different issue, not the error in the quoted response."],
      [ko ? "길이를 늘리기만 하면 문제가 해결됩니다." : "Only the response length needs changing.", ko ? "길이가 아니라 내용이나 표현의 문제를 수정해야 합니다." : "Changing length alone does not fix the mistaken meaning or form."],
    ],
  };
  return [detection, repair].map((item, index) => ({
    ...makeQuestion(language, id, item, index + 3, exercise),
    id: `${id}-challenge-${index}`,
    example: index === 0 ? first.answer : last.answer,
  }));
}
