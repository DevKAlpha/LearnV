import { Component, type ErrorInfo, type ReactNode } from "react";
import { recoverFromAssetFailure, resemblesAssetFailure } from "@/app/routing/asset-recovery";
import { recordLearningError, resolveLearningDiagnosticArea } from "@/infrastructure/data/learning-error-log";
import { BrandMark } from "@/shared/ui/BrandMark";

type Props = {
  children: ReactNode;
  onFailure: () => void;
};

type FailureKind = "asset" | "render";
type State = { failure: FailureKind | null };

function isAssetLoadFailure(error: unknown) {
  return resemblesAssetFailure(error);
}

function recoveryCopy(kind: FailureKind) {
  const lang = document.documentElement.lang;
  if (kind === "render") {
    if (lang === "ko") return { title: "이 화면에서 문제가 발생했습니다", detail: "진행 상황은 이 기기에 그대로 남아 있습니다.", action: "다시 시도", home: "홈으로" };
    if (lang === "en") return { title: "Something went wrong on this screen", detail: "Your progress is still saved on this device.", action: "Try again", home: "Go home" };
    return { title: "Algo falló en esta pantalla", detail: "Tu progreso sigue guardado en este dispositivo.", action: "Reintentar", home: "Ir al inicio" };
  }
  if (lang === "ko") return { title: "불러오기를 완료하지 못했습니다", detail: "", action: "다시 시도", home: "" };
  if (lang === "en") return { title: "We could not finish loading", detail: "", action: "Retry", home: "" };
  return { title: "No pudimos completar la carga", detail: "", action: "Reintentar", home: "" };
}

/**
 * Prevents a failed lazy route from leaving the full-screen loader mounted forever.
 * Network/asset failures recover with a reload; render errors are logged and offer a soft retry.
 */
export class RouteRecoveryBoundary extends Component<Props, State> {
  state: State = { failure: null };

  static getDerivedStateFromError(error: unknown): State {
    return { failure: isAssetLoadFailure(error) ? "asset" : "render" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    recordLearningError({
      area: resolveLearningDiagnosticArea(window.location.pathname) ?? "app-shell",
      code: isAssetLoadFailure(error) ? "react-route-asset-failed" : "react-route-render-failed",
      error,
      context: { componentStack: info.componentStack ?? "" },
    });
    this.props.onFailure();
  }

  render() {
    const { failure } = this.state;
    if (!failure) return this.props.children;
    const copy = recoveryCopy(failure);
    return (
      <div className="route-recovery" role="alert">
        <span className="route-recovery__mark" aria-hidden="true"><BrandMark showLetter={false} /></span>
        <strong>{copy.title}</strong>
        {copy.detail && <p>{copy.detail}</p>}
        {failure === "asset" ? (
          <button type="button" onClick={() => recoverFromAssetFailure(new Error("Asset load timed out"), true)}>
            {copy.action}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => this.setState({ failure: null })}>{copy.action}</button>
            <a href={import.meta.env.BASE_URL}>{copy.home}</a>
          </>
        )}
      </div>
    );
  }
}
