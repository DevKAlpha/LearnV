import "@/styles/tailwind-study.css";
import { useId, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";
import { useApplicantProfile, useGksCycle } from "@/application/controllers/useApplicantProfile";
import { useMeasuredLevels } from "@/application/controllers/useMeasuredLevels";
import { checkAgeLimit, ENGLISH_LEVELS, isValidBirthDate, KOREAN_LEVELS, lastEligibleEntryYear, MAX_MAJOR_LENGTH, TRACKS } from "@/domain/models/applicant-profile";
import { gksProfileCopy } from "@/infrastructure/i18n/gks-profile-copy";

const field = "min-h-11 w-full rounded-xl border-2 border-edge bg-paper px-3 text-base text-fg";
const label = "grid gap-1 font-bold";
const dateLocales = { es: "es-ES", en: "en-GB", ko: "ko-KR" } as const;

/** Editable applicant profile, age check and declared-versus-measured levels. */
export function ApplicantProfileEditor() {
  const id = useId();
  const { locale } = useI18n();
  const copy = gksProfileCopy[locale].profile;
  const { profile, update } = useApplicantProfile();
  const cycle = useGksCycle();
  const levels = useMeasuredLevels();
  // The major is saved on blur, so each keystroke does not rewrite storage.
  const [major, setMajor] = useState(profile.targetMajor);
  const age = checkAgeLimit(profile.birthDate, cycle.entryYear);
  const lastYear = lastEligibleEntryYear(profile.birthDate);
  const formatDate = (date: string) => new Intl.DateTimeFormat(dateLocales[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

  return (
    <section className="my-4 grid gap-4 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby={`${id}-title`}>
      <div className="grid gap-1">
        <h2 id={`${id}-title`} className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{copy.editorTitle}</h2>
        <p className="m-0 text-[0.95rem] leading-relaxed">{copy.editorIntro}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label} htmlFor={`${id}-major`}>{copy.major}
          <input id={`${id}-major`} className={field} value={major} maxLength={MAX_MAJOR_LENGTH} placeholder={copy.majorPlaceholder}
            onChange={(event) => setMajor(event.target.value)} onBlur={() => update({ targetMajor: major })} />
        </label>
        <label className={label} htmlFor={`${id}-track`}>{copy.track}
          <select id={`${id}-track`} className={field} value={profile.track} onChange={(event) => update({ track: event.target.value as typeof profile.track })}>
            {TRACKS.map((track) => <option key={track} value={track}>{copy.tracks[track]}</option>)}
          </select>
        </label>
        <label className={label} htmlFor={`${id}-birth`}>{copy.birthDate}
          <input id={`${id}-birth`} type="date" className={field} value={profile.birthDate ?? ""} max={cycle.today} aria-describedby={`${id}-birth-help`}
            onChange={(event) => update({ birthDate: isValidBirthDate(event.target.value, cycle.today) ? event.target.value : null })} />
          <small id={`${id}-birth-help`} className="font-normal">{copy.birthHelp}</small>
        </label>
        <label className={label} htmlFor={`${id}-ko`}>{copy.declaredKorean}
          <select id={`${id}-ko`} className={field} value={profile.declaredKorean} onChange={(event) => update({ declaredKorean: event.target.value as typeof profile.declaredKorean })}>
            {KOREAN_LEVELS.map((level) => <option key={level} value={level}>{copy.koreanLevels[level]}</option>)}
          </select>
        </label>
        <label className={label} htmlFor={`${id}-en`}>{copy.declaredEnglish}
          <select id={`${id}-en`} className={field} value={profile.declaredEnglish} onChange={(event) => update({ declaredEnglish: event.target.value as typeof profile.declaredEnglish })}>
            {ENGLISH_LEVELS.map((level) => <option key={level} value={level}>{copy.englishLevels[level]}</option>)}
          </select>
        </label>
      </div>

      {profile.track === "embassy" && <p className="m-0 rounded-2xl border-2 border-dashed border-edge p-3 text-[0.95rem]" role="note">{copy.trackNote}</p>}

      {age.status !== "unknown" && (
        <div className={`grid gap-1 rounded-2xl border-2 p-3 ${age.status === "ok" ? "border-current/30" : "border-ink bg-accent text-ink"}`} role="status">
          <strong>{age.status === "ok" ? copy.ageOk(age.age, formatDate(age.cutoff), cycle.entryYear) : copy.ageOver(age.age, formatDate(age.cutoff), cycle.entryYear)}</strong>
          {lastYear !== null && <span>{copy.ageLast(lastYear)}</span>}
          <small>{copy.ageSource}</small>
        </div>
      )}

      <div className="grid gap-2">
        <h3 className="m-0 text-lg">{copy.levelsTitle}</h3>
        <dl className="m-0 grid gap-2 sm:grid-cols-2">
          {(["ko", "en"] as const).map((language) => (
            <div key={language} className="grid gap-1 rounded-2xl border-2 border-current/30 p-3">
              <dt className="font-extrabold">{language === "ko" ? "한국어" : "English"}</dt>
              <dd className="m-0">{copy.declared}: {language === "ko" ? copy.koreanLevels[profile.declaredKorean] : copy.englishLevels[profile.declaredEnglish]}</dd>
              <dd className="m-0">{copy.measured}: <strong>{language === "ko" ? copy.koreanBands[levels.ko.band] : copy.englishBands[levels.en.band]}</strong></dd>
              {levels[language].band !== "none" && <dd className="m-0 text-sm">{copy.reach(levels[language].reach, levels[language].passed)}</dd>}
            </div>
          ))}
        </dl>
        <small>{copy.measuredNote}</small>
      </div>
      <small>{copy.privacy}</small>
    </section>
  );
}
