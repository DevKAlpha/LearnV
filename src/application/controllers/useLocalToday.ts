import { useEffect, useState } from "react";
import { localDateKey } from "@/domain/models/learning-journey";

/** Re-renders when the local day changes (midnight, or when a sleeping tab wakes up). */
export function useLocalToday() {
  const [today, setToday] = useState(() => localDateKey(new Date()));
  useEffect(() => {
    const refresh = () => setToday(localDateKey(new Date()));
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime() - now.getTime();
    const timer = window.setTimeout(refresh, nextMidnight);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [today]);
  return today;
}
