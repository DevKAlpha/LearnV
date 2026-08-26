import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { I18nProvider } from "@/application/i18n/I18nContext";
import { ThemeProvider } from "@/application/theme/ThemeContext";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          {children}
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}
