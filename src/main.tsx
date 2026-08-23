import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/noto-sans-kr/wght.css";
import { I18nProvider } from "./application/i18n/I18nContext";
import { ThemeProvider } from "./application/theme/ThemeContext";
import { App } from "./presentation/App";
import { AppMotionProvider } from "./presentation/components/AppMotionProvider";
import "./presentation/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AppMotionProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </AppMotionProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
