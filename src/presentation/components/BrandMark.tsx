import { useId, type SVGProps } from "react";

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  showLetter?: boolean;
};

export function BrandMark({ className, showLetter = true, ...props }: BrandMarkProps) {
  const gradientId = useId().replace(/:/g, "");
  const highlightId = `${gradientId}-highlight`;

  return (
    <svg
      className={`brand-tulip${className ? ` ${className}` : ""}`}
      viewBox="0 0 72 82"
      fill="none"
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="18" y1="9" x2="54" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#efd8f7" />
          <stop offset="0.42" stopColor="#c88be0" />
          <stop offset="1" stopColor="#8342a5" />
        </linearGradient>
        <linearGradient id={highlightId} x1="20" y1="18" x2="46" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.92" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M35 48v29" stroke="#557645" strokeWidth="5" strokeLinecap="round" />
      <path d="M34 65c-10-7-18-4-22 4 9 4 17 3 22-4Z" fill="#78965a" stroke="#2d3927" strokeWidth="2" />
      <path d="M38 59c8-7 15-6 20 0-7 5-14 5-20 0Z" fill="#91aa6e" stroke="#2d3927" strokeWidth="2" />
      <path d="M36 52C21 52 10 41 11 25c8 1 15 5 20 12-1-11 1-21 5-31 5 10 7 20 5 31 5-7 12-11 20-12 1 16-10 27-25 27Z" fill={`url(#${gradientId})`} stroke="#2b1830" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M36 52c-9-3-14-11-13-25 6 4 10 9 13 17 3-8 7-13 13-17 1 14-4 22-13 25Z" fill="#a85bc5" fillOpacity="0.58" stroke="#2b1830" strokeWidth="1.8" />
      <path d="M18 27c3-7 8-11 14-13" stroke={`url(#${highlightId})`} strokeWidth="4" strokeLinecap="round" />
      {showLetter && <path d="m27 25 9 19 9-19" stroke="#fffaf6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
