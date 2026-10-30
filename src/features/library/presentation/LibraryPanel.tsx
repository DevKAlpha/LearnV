import { useMemo, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { filterReadings, readingCategories, type ReadingCategory, type ReadingLanguage } from "@/domain/models/reading-library";
import { readingLibrary } from "@/infrastructure/data/reading-library";
import { libraryLabels } from "@/infrastructure/i18n/library-copy";
import { LibraryBookArt } from "@/shared/ui/LibraryArtwork";
import "@/styles/reading-library.css";

export function LibraryPanel() {
  const { locale } = useI18n();
  const text = libraryLabels[locale];
  const [language, setLanguage] = useState<ReadingLanguage>(locale === "ko" ? "ko" : "en");
  const [category, setCategory] = useState<ReadingCategory | "all">("all");
  const [query, setQuery] = useState("");
  const resources = useMemo(() => filterReadings(readingLibrary, language, category, query, text.categories), [language, category, query, text.categories]);
  const reset = () => { setQuery(""); setCategory("all"); };
  return <div className="reading-library">
    <div className="reading-library__intro"><div><span className="eyebrow">EN / 한 · {readingLibrary.length} {text.results}</span><h2>{text.title}</h2><p>{text.intro}</p></div><div className="library-stamp" aria-hidden="true"><span>LearnV</span><b>READ<br />& GROW</b><span>✦ EX LIBRIS ✦</span></div></div>
    <div className="reading-library__filters">
      <div className="library-language" role="group" aria-label={text.languages}>{(["en", "ko"] as const).map((value) => <button key={value} type="button" aria-pressed={language === value} onClick={() => { setLanguage(value); reset(); }}>{value === "en" ? "English" : "한국어"}<small>{readingLibrary.filter((item) => item.language === value).length}</small></button>)}</div>
      <label className="library-search"><span>{text.search}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} /></label>
      <label className="library-category"><span>{text.topics}</span><select value={category} onChange={(event) => setCategory(event.target.value as ReadingCategory | "all")}><option value="all">{text.all}</option>{readingCategories.map((value) => <option key={value} value={value}>{text.categories[value]}</option>)}</select></label>
    </div>
    <div className="library-results"><strong role="status" aria-live="polite">{resources.length} {text.results}</strong><span>{text.accessible}</span></div>
    {resources.length ? <ul className="library-shelves">{resources.map((resource) => <li className={`library-volume library-volume--${resource.category}`} key={resource.id}>
      <a href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`${text.read}: ${resource.title}. ${text.newTab}`}>
        <div className="library-cover"><LibraryBookArt category={resource.category} /><div className="library-cover__type">{text.kind[resource.kind]} · {resource.language.toUpperCase()}</div><strong lang={resource.language}>{resource.title}</strong><span className="library-cover__action">{text.read}<i aria-hidden="true">↗</i></span></div>
        <div className="library-volume__caption"><span>{text.categories[resource.category]}</span><h3 lang={resource.language}>{resource.title}</h3><small>{resource.author}</small><p>{text.purpose[resource.category]}</p>{resource.note?.[locale] && <p className="library-volume__note">{resource.note[locale]}</p>}<div><b>{text.level[resource.level]}</b><time dateTime={resource.verifiedAt}>{text.verified}: {resource.verifiedAt}</time></div></div>
      </a>
    </li>)}</ul> : <div className="library-empty"><LibraryBookArt category="language" /><p>{text.empty}</p><button type="button" onClick={reset}>{text.reset}</button></div>}
    <p className="library-scope">{text.scope}</p>
  </div>;
}
