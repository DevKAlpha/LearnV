import type { ReadingCategory, ReadingLanguage, ReadingResource } from "@/domain/models/reading-library";

// Only public reading targets, never shop pages, ZIP downloads or course sign-ups.
const checked = "2026-10-29";
function reading(id: string, language: ReadingLanguage, category: ReadingCategory, title: string, author: string, url: string, kind: ReadingResource["kind"] = "book", level: ReadingResource["level"] = "intermediate", sourceUrl = url, note?: ReadingResource["note"]): ReadingResource {
  return { id, language, category, title, author, url, kind, level, sourceUrl, verifiedAt: checked, note };
}
const openstax = (id: string, category: ReadingCategory, title: string, slug: string, firstPage = "1-introduction") => reading(id, "en", category, title, "OpenStax · Rice University", `https://openstax.org/books/${slug}/pages/${firstPage}`);
const notice = "https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522";
const generalGks = { es: "Descripción general del programa; contrasta requisitos y plazos con la convocatoria 2027.", en: "General programme overview; check requirements and deadlines against the 2027 guidelines.", ko: "일반 사업 안내입니다. 자격과 일정은 2027 모집 요강과 대조하세요." };

export const readingLibrary: readonly ReadingResource[] = [
  reading("gks-2027-en", "en", "gks", "2027 GKS-U · Application announcement", "NIIED · Study in Korea", notice, "reading", "advanced", notice, { es: "Texto de la convocatoria. Los PDF adjuntos están en la fuente; esta portada abre el anuncio, no un libro completo.", en: "The application announcement. Attachments are on the source page; this opens the announcement, not a full book.", ko: "모집 공지 본문입니다. 첨부 PDF는 출처 페이지에 있으며 전체 책이 아닌 공지를 엽니다." }),
  reading("gks-programme-en", "en", "gks", "Global Korea Scholarship · Degree Program", "NIIED", "https://www.niied.go.kr/web/niied/contents/niiedEng/eng_gksDegree", "guide", "intermediate", undefined, generalGks),
  openstax("business", "business", "Introduction to Business", "introduction-business"),
  openstax("management", "business", "Principles of Management", "principles-management"),
  openstax("organisations", "business", "Organizational Behavior", "organizational-behavior"),
  openstax("ethics", "business", "Business Ethics", "business-ethics"),
  openstax("marketing", "business", "Principles of Marketing", "principles-marketing", "1-1-marketing-and-the-marketing-process"),
  openstax("economics", "business", "Principles of Economics 3e", "principles-economics-3e"),
  openstax("entrepreneurship", "business", "Entrepreneurship", "entrepreneurship"),
  openstax("anatomy", "health", "Anatomy and Physiology 2e", "anatomy-and-physiology-2e"),
  openstax("biology", "health", "Biology 2e", "biology-2e"),
  openstax("microbiology", "health", "Microbiology", "microbiology"),
  openstax("psychology", "health", "Psychology 2e", "psychology-2e"),
  openstax("chemistry", "health", "Chemistry 2e", "chemistry-2e"),
  openstax("statistics", "data", "Introductory Statistics 2e", "introductory-statistics-2e"),
  openstax("python-openstax", "data", "Introduction to Python Programming", "introduction-python-programming"),
  reading("python-en", "en", "data", "The Python Tutorial", "Python Software Foundation", "https://docs.python.org/3/tutorial/introduction.html", "guide"),
  reading("health-information-exchange", "en", "data", "Health Information Exchange", "HHS · HealthIT.gov", "https://healthit.gov/health-it-basics/hie/", "guide"),
  reading("fhir", "en", "data", "FHIR Overview · R5", "HL7 International", "https://hl7.org/fhir/overview.html", "guide", "advanced"),
  openstax("writing", "writing", "Writing Guide with Handbook", "writing-guide"),
  reading("application-essays", "en", "writing", "Application Essays", "UNC · The Writing Center", "https://writingcenter.unc.edu/tips-and-tools/application-essays/", "guide", "intermediate", undefined, { es: "Herramientas de escritura transferibles; las consignas GKS vigentes tienen prioridad.", en: "Transferable writing tools; current GKS prompts take priority.", ko: "글쓰기 도구를 활용하되 최신 GKS 작성 지시를 우선하세요." }),
  reading("present-perfect", "en", "language", "Present perfect · B1–B2", "British Council", "https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect", "reading", "foundation"),

  reading("gks-2027-ko", "ko", "gks", "2027 GKS-U · 학부 장학생 모집 공지", "NIIED · Study in Korea", notice, "reading", "advanced", notice, { es: "Anuncio bilingüe de la convocatoria; no es el PDF completo de requisitos.", en: "Bilingual application announcement, not the full requirements PDF.", ko: "한·영 모집 공지이며 전체 요강 PDF가 아닙니다." }),
  reading("gks-programme-ko", "ko", "gks", "정부초청외국인장학생 선발 안내", "국립국제교육원 · NIIED", "https://www.niied.go.kr/web/niied/contents/niied_prog_gks_sel", "guide", "advanced", undefined, generalGks),
  reading("competitiveness", "ko", "business", "국제경쟁력 · 국가와 기업", "KDI 경제교육·정보센터", "https://eiec.kdi.re.kr/material/conceptList.do?idx=154", "reading", "advanced"),
  reading("esg", "ko", "business", "지속가능한 성장을 위한 기업의 노력, ESG경영", "KDI 경제교육·정보센터", "https://eiec.kdi.re.kr/material/pageoneView.do?idx=1474", "reading", "advanced"),
  reading("behavioural-economics", "ko", "business", "인간의 심리를 탐구하는 행동경제학", "KDI 경제교육·정보센터", "https://eiec.kdi.re.kr/material/pageoneView.do?idx=1499", "reading", "advanced"),
  reading("brexit", "ko", "business", "브렉시트, 그 후 영국은?", "KDI 경제교육·정보센터", "https://eiec.kdi.re.kr/material/pageoneView.do?idx=1635", "reading", "advanced", undefined, { es: "Caso de estudio histórico sobre comercio internacional.", en: "A historical international-trade case study.", ko: "국제무역을 살펴보는 과거 사례입니다." }),
  reading("capitalism", "ko", "business", "오늘날의 자본주의가 있기까지", "KDI 경제교육·정보센터", "https://eiec.kdi.re.kr/material/pageoneView.do?idx=1755", "reading", "advanced"),
  reading("skin-health", "ko", "health", "여드름 · 피부 건강 읽기", "NIAMS · National Institutes of Health", "https://www.niams.nih.gov/ko/health-topics/yeodeuleumi", "reading"),
  reading("bone-health", "ko", "health", "뼈 건강에 중요한 칼슘 및 비타민 D", "NIAMS · National Institutes of Health", "https://www.niams.nih.gov/ko/health-topics/calcium-and-vitamin-d-important-bone-health", "reading"),
  reading("dermatitis", "ko", "health", "아토피 피부염 · 건강 토픽", "NIAMS · National Institutes of Health", "https://www.niams.nih.gov/ko/health-topics/atopi-pibuyeomi", "reading"),
  reading("osteoarthritis", "ko", "health", "골관절염 · 건강 토픽", "NIAMS · National Institutes of Health", "https://www.niams.nih.gov/ko/health-topics/golgwanjeolyeom", "reading"),
  reading("python-ko", "ko", "data", "파이썬 자습서", "Python Software Foundation", "https://docs.python.org/ko/3/tutorial/introduction.html", "guide"),
  reading("data-school-python", "ko", "data", "데이터 사이언스 스쿨 · 파이썬 편", "김도형 · Data Science School", "https://datascienceschool.net/01%20python/02.01%20파이썬을%20계산기로%20사용하기.html", "book", "foundation", "https://datascienceschool.net/"),
  reading("data-school-maths", "ko", "data", "데이터 사이언스 스쿨 · 수학 편", "김도형 · Data Science School", "https://datascienceschool.net/02%20mathematics/02.01%20데이터와%20행렬.html", "book", "intermediate", "https://datascienceschool.net/"),
  reading("data-school-ml", "ko", "data", "데이터 사이언스 스쿨 · 머신러닝 편", "김도형 · Data Science School", "https://datascienceschool.net/03%20machine%20learning/02.01%20데이터%20전처리%20기초.html", "book", "advanced", "https://datascienceschool.net/"),
  reading("deep-learning", "ko", "data", "Dive into Deep Learning · 한국어판", "Aston Zhang 외 · D2L", "https://ko.d2l.ai/chapter_introduction/deep-learning-intro.html", "book", "advanced", "https://ko.d2l.ai/", { es: "Edición coreana histórica para conceptos; sus ejemplos de MXNet no representan las herramientas actuales.", en: "An older Korean edition for concepts; its MXNet examples do not represent current tooling.", ko: "개념을 위한 이전 한국어판이며 MXNet 예제는 최신 도구를 반영하지 않습니다." }),
  reading("lucky-day", "ko", "language", "운수 좋은 날", "현진건 · 위키문헌", "https://ko.wikisource.org/wiki/운수_좋은_날", "reading", "advanced", undefined, { es: "Relato clásico completo para comprensión lectora; contiene vocabulario y grafías de su época.", en: "A complete classic short story for reading practice, with period vocabulary and spelling.", ko: "독해 연습을 위한 고전 단편 원문입니다. 당시 어휘와 표기가 포함됩니다." }),
  reading("camellias", "ko", "language", "동백꽃", "김유정 · 위키문헌", "https://ko.wikisource.org/wiki/동백꽃", "reading", "advanced", undefined, { es: "Relato clásico completo para practicar diálogo y narración en coreano.", en: "A complete classic short story for Korean dialogue and narrative practice.", ko: "한국어 대화와 서술을 읽어 보는 고전 단편 원문입니다." }),
];
