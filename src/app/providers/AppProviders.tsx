import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { I18nProvider } from "@/application/i18n/I18nContext";
import { ThemeProvider } from "@/application/theme/ThemeContext";
import { AppMotionProvider } from "@/app/providers/AppMotionProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppMotionProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            {children}
          </BrowserRouter>
        </AppMotionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
