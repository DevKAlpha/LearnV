import { useEffect, useState } from "react";
import { BrandMark } from "@/shared/ui/BrandMark";

export function RouteLoader({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 110);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={visible ? "route-loader is-visible" : "route-loader"} role="status" aria-label={label}>
      {visible && <>
        <span className="route-loader__bar" />
        <div className="route-loader__scene" aria-hidden="true">
          <div className="route-loader__tulip"><BrandMark showLetter={false} /></div>
          <div className="route-loader__books">{[0, 1, 2].map((book) => <span key={book} />)}</div>
          <strong>LearnV</strong>
        </div>
      </>}
    </div>
  );
}
