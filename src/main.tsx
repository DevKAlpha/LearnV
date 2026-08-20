import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { I18nProvider } from "./application/i18n/I18nContext";
import { ThemeProvider } from "./application/theme/ThemeContext";
import { App } from "./presentation/App";
import "./presentation/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
