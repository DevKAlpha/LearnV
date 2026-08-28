import { useEffect, useState } from "react";
import { useI18n } from "@/application/i18n/I18nContext";

type LiteYouTubeProps = {
  videoId: string;
  title: string;
  startSeconds?: number;
  endSeconds?: number;
};

function warmYouTubeConnection() {
  const origin = "https://www.youtube-nocookie.com";
  if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = origin;
  link.crossOrigin = "anonymous";
  document.head.append(link);
}

export function LiteYouTube({ videoId, title, startSeconds = 0, endSeconds }: LiteYouTubeProps) {
  const { locale } = useI18n();
  const [active, setActive] = useState(false);

  useEffect(() => setActive(false), [videoId]);

  const playLabel = locale === "ko" ? `${title} 재생` : locale === "en" ? `Play ${title}` : `Reproducir ${title}`;
  const end = endSeconds ? `&end=${endSeconds}` : "";

  return active ? (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1&start=${startSeconds}${end}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  ) : (
    <button
      className="lite-youtube"
      type="button"
      aria-label={playLabel}
      onPointerEnter={warmYouTubeConnection}
      onFocus={warmYouTubeConnection}
      onTouchStart={warmYouTubeConnection}
      onClick={() => setActive(true)}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="high"
        width="480"
        height="360"
      />
      <span className="lite-youtube__veil" aria-hidden="true" />
      <span className="lite-youtube__play" aria-hidden="true"><i /></span>
      <strong>{playLabel}</strong>
    </button>
  );
}
