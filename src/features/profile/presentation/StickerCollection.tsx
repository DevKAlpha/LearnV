import "@/styles/tailwind-study.css";
import { useI18n } from "@/application/i18n/I18nContext";
import { useStickers } from "@/application/controllers/useMilestones";
import { stickerIds, type StickerId } from "@/domain/models/milestones";
import { immersionCopy } from "@/infrastructure/i18n/immersion-copy";

/** The face of each sticker: a syllable, a date or a symbol tied to what it celebrates. */
const FACES: Record<StickerId, string> = {
  "hangul-first": "가", "topik-bridge": "3", "c1-summit": "C1", "streak-7": "7", "streak-30": "30",
  seollal: "설", samiljeol: "3·1", "childrens-day": "🎈", chuseok: "🌕", "hangeul-day": "ㄱ",
  suneung: "✏️", "pepero-day": "11·11", dongji: "❄️", hwaiting: "💪", tulip: "🌷", credit: "💜",
};

/** Every sticker, held or still hidden. Hidden ones show how to earn them: nothing is a dead end. */
export function StickerCollection({ longestStreak }: { longestStreak: number }) {
  const { locale } = useI18n();
  const copy = immersionCopy[locale].stickers;
  const held = useStickers(longestStreak);
  const dateFormat = new Intl.DateTimeFormat({ es: "es-ES", en: "en-GB", ko: "ko-KR" }[locale], { dateStyle: "medium" });

  return (
    <section className="my-4 grid gap-3 rounded-3xl border-2 border-edge bg-paper p-[clamp(16px,4vw,28px)] text-left text-fg" aria-labelledby="stickers-title" data-sticker-collection>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="grid gap-1">
          <span className="eyebrow">{copy.kicker}</span>
          <h2 id="stickers-title" className="m-0 text-[clamp(1.2rem,3.4vw,1.5rem)] leading-tight">{copy.title}</h2>
        </div>
        <span className="count-pill">{copy.count(held.size, stickerIds.length)}</span>
      </div>
      <p className="m-0 text-[0.95rem] leading-relaxed">{copy.intro}</p>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 p-0">
        {stickerIds.map((id) => {
          const sticker = copy.items[id];
          const owned = held.has(id);
          const date = held.get(id);
          return (
            <li key={id} className={`grid content-start justify-items-center gap-1 rounded-2xl border-2 p-3 text-center ${owned ? "border-edge bg-cream" : "border-dashed border-current/40"}`} data-sticker={id} data-held={owned}>
              <span aria-hidden="true" className={`grid size-16 place-items-center rounded-full border-2 text-xl font-black ${owned ? "-rotate-6 border-ink bg-accent text-ink shadow-[3px_3px_0_var(--edge)]" : "border-dashed border-current/50 text-fg"}`} lang={owned ? "ko" : undefined}>{owned ? FACES[id] : "?"}</span>
              <strong className="leading-tight">{owned ? sticker.name : copy.locked}</strong>
              <small className="text-xs leading-snug">{owned ? (date ? copy.earnedOn(dateFormat.format(new Date(date))) : sticker.hint) : sticker.hint}</small>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
