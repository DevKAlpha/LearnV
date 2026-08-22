import type { SVGProps } from "react";

export type AppIconName =
  | "home"
  | "scholarship"
  | "study"
  | "checklist"
  | "profile"
  | "sun"
  | "moon"
  | "writing"
  | "listening"
  | "speaking"
  | "document"
  | "book"
  | "test"
  | "video"
  | "sparkle"
  | "refresh"
  | "lock";

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: AppIconName;
};

export function AppIcon({ name, className, ...props }: AppIconProps) {
  return (
    <svg
      className={`app-icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="square"
      strokeLinejoin="miter"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {name === "home" && <><path d="M3 11 12 4l9 7" /><path d="M5.5 10v10h13V10M10 20v-6h4v6" /></>}
      {name === "scholarship" && <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>}
      {name === "study" && <><path d="M3 5.5h5.5c2 0 3.5 1.3 3.5 3.1V21c0-1.8-1.5-3.1-3.5-3.1H3z" /><path d="M21 5.5h-5.5c-2 0-3.5 1.3-3.5 3.1V21c0-1.8 1.5-3.1 3.5-3.1H21z" /></>}
      {name === "checklist" && <><path d="M7 3h10v4H7zM5 5H3v16h18V5h-2" /><path d="m7 13 3 3 7-7" /></>}
      {name === "profile" && <><circle cx="12" cy="8" r="4" /><path d="M4.5 21c.7-4.2 3.2-6.5 7.5-6.5s6.8 2.3 7.5 6.5" /></>}
      {name === "sun" && <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.2 2.2M16.8 16.8 19 19M19 5l-2.2 2.2M7.2 16.8 5 19" /></>}
      {name === "moon" && <path d="M19.5 15.5A8.5 8.5 0 0 1 8.5 4.5 8.5 8.5 0 1 0 19.5 15.5Z" />}
      {name === "writing" && <><path d="m5 16-1 4 4-1L19 8l-3-3Z" /><path d="m13.5 7.5 3 3M4 20h16" /></>}
      {name === "listening" && <><path d="M4 10v4h4l5 4V6L8 10z" /><path d="M16 9c1.3 1.6 1.3 4.4 0 6M19 6c3 3.2 3 8.8 0 12" /></>}
      {name === "speaking" && <><rect x="8" y="3" width="8" height="12" rx="4" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></>}
      {name === "document" && <><path d="M5 3h10l4 4v14H5zM15 3v5h4" /><path d="M8 12h8M8 16h8" /></>}
      {name === "book" && <><path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z" /><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" /></>}
      {name === "test" && <><path d="M5 3h14v18H5zM8 8h5M8 12h3" /><path d="m13 16 2 2 4-5" /></>}
      {name === "video" && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>}
      {name === "sparkle" && <><path d="M12 2c.5 5.5 2.5 7.5 8 8-5.5.5-7.5 2.5-8 8-.5-5.5-2.5-7.5-8-8 5.5-.5 7.5-2.5 8-8Z" /><path d="M19 16v6M16 19h6" /></>}
      {name === "refresh" && <><path d="M20 8V3l-2 2.1A8 8 0 1 0 20 15" /><path d="M15 3h5v5" /></>}
      {name === "lock" && <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>}
    </svg>
  );
}
