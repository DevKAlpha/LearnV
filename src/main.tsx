import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/noto-sans-kr/wght.css";
import { App } from "@/app/App";
import { AppProviders } from "@/app/providers/AppProviders";
import "@/styles/app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
