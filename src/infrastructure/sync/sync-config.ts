import { isLearningQa } from "@/infrastructure/config/app-scope";

const configured = import.meta.env.VITE_SYNC_API;

/**
 * Same-origin path of the optional account API, or null when this build has none
 * (GitHub Pages and the learning QA build): LearnV then works fully on the device.
 * Only a path is accepted, so requests stay on this origin (CSP `connect-src 'self'`).
 */
export const syncApiBase: string | null = !isLearningQa && typeof configured === "string" && /^\/(?:[\w-]+\/)*$/.test(configured)
  ? configured
  : null;
