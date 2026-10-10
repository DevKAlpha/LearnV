import { useI18n } from "@/application/i18n/I18nContext";
import type { TestLanguage } from "@/domain/models/language-test";
import { languageCultureCopy } from "@/infrastructure/i18n/language-culture-copy";

/** Decorative original vectors, not flags or a claim to represent every culture. */
function CultureIllustration({ language }: { language: TestLanguage }) {
  return <svg className="language-culture__art" viewBox="0 0 280 164" aria-hidden="true" focusable="false" fill="none">
    <circle cx="216" cy="42" r="27" className="culture-art__sun" />
    <path d="M14 142H266" className="culture-art__line" />
    {language === "en" ? <>
      <path d="M25 136V75H66V136M30 75V56H61V75M43 56V43H50V56M192 136V66H231V136M197 66V53H225V66" className="culture-art__skyline" />
      <path d="M38 87H52M38 101H52M204 80H218M204 96H218M204 112H218" className="culture-art__line" />
      <path d="M82 126V66C82 37 155 37 155 66V126Z" className="culture-art__building" />
      <path d="M92 101V68C92 46 145 46 145 68V101M118 53V101M92 77H145" className="culture-art__line" />
      <rect x="70" y="110" width="101" height="31" rx="5" className="culture-art__accent" />
      <path d="M84 128C104 119 119 121 132 127C146 121 160 122 176 129L172 149C155 141 144 141 132 147C117 140 103 140 85 149Z" className="culture-art__paper" />
      <path d="M132 127V147M93 133L120 130M145 131L165 135" className="culture-art__line" />
      <path d="M173 31H211C216 31 219 35 219 40V57C219 62 216 66 211 66H194L184 75V66H173C168 66 165 62 165 57V40C165 35 168 31 173 31Z" className="culture-art__paper" />
      <path d="M179 45H206M179 54H197" className="culture-art__line" />
    </> : <>
      <path d="M16 115L51 72L91 114L125 86L169 122L205 85L257 136" className="culture-art__skyline" />
      <path d="M54 91C78 86 100 72 137 55C168 71 192 86 224 91L214 101H65Z" className="culture-art__roof" />
      <path d="M47 88C65 96 97 82 137 61C171 82 206 98 233 87M73 94H207" className="culture-art__line" />
      <path d="M73 101H206V139H73Z" className="culture-art__building" />
      <path d="M88 101V139M191 101V139M114 103V139M165 103V139" className="culture-art__line" />
      <path d="M120 106H159V139H120Z" className="culture-art__paper" />
      <path d="M139 106V139M120 118H159M120 128H159" className="culture-art__line" />
      <path d="M66 140H213L223 148H56Z" className="culture-art__accent" />
      <rect x="24" y="27" width="42" height="39" rx="9" className="culture-art__paper" />
      <path d="M35 39H53V55M237 31V61M237 43H249" className="culture-art__letter" />
      <path d="M246 124V144M234 123C234 115 246 113 246 124C246 113 260 115 258 124C256 132 246 133 246 133C246 133 234 131 234 123Z" className="culture-art__plant" />
    </>}
    <path d="M20 153H258" className="culture-art__line culture-art__ground" />
  </svg>;
}

export function LanguageCulture({ language, variant = "card" }: { language: TestLanguage; variant?: "card" | "hero" | "badge" }) {
  const { locale } = useI18n();
  const copy = languageCultureCopy[locale][language];
  const endonym = language === "en" ? "English" : "한국어";
  return <div className={`language-culture language-culture--${variant}`} data-language={language}>
    <div className="language-culture__copy">
      <span className="language-culture__identity"><b>{language.toUpperCase()}</b><strong lang={language}>{endonym}</strong>{copy.name !== endonym && <span>{copy.name}</span>}</span>
      {variant !== "badge" && <>
        <div className="language-culture__greeting"><strong lang={language}>{language === "en" ? "Hello!" : "안녕하세요"}</strong><span>{copy.greetingMeaning}</span></div>
        <span className="language-culture__motifs">{variant === "hero" ? copy.context : copy.motifs}</span>
      </>}
    </div>
    {variant !== "badge" && <CultureIllustration language={language} />}
    {variant === "hero" && <p className="language-culture__detail">{copy.detail}</p>}
  </div>;
}
