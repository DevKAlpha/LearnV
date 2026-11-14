import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/noto-sans-kr/wght.css";
import { App } from "@/app/App";
import { AppProviders } from "@/app/providers/AppProviders";
import "@/styles/tokens.css";
import "@/styles/tailwind.css";
import "@/styles/app.css";
import "@/styles/light-theme.css";
import "@/styles/desktop-typography.css";
import "@/styles/spiral-learning.css";
import "@/styles/progressive-navigation.css";
import "@/styles/qa-preview.css";
import "@/styles/learning-audio.css";
import "@/styles/language-culture.css";
import "@/styles/language-motion.css";
import "@/styles/advanced-path.css";
import "@/styles/learning-path.css";
import "@/styles/storybook.css";
import "@/styles/content-layout.css";
import { requestPersistentStorage } from "@/infrastructure/data/storage-persistence";
import { registerServiceWorker } from "@/infrastructure/pwa/register-service-worker";
import { preloadInitialLocale } from "@/application/i18n/I18nContext";
import { scopedStorageKey } from "@/infrastructure/config/app-scope";

// Render once the start-up language is available (Spanish is bundled; EN/KO are small chunks).
void preloadInitialLocale().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  );
});

// Installable and usable offline (production builds only).
registerServiceWorker();

// Returning learners get durable storage (avoids eviction, incl. Safari's 7-day rule).
// New visitors are not asked until they have progress worth keeping.
try {
  if (localStorage.getItem(scopedStorageKey("learnv-learning-journey-v1"))) void requestPersistentStorage();
} catch { /* Storage unavailable: nothing to protect. */ }
