import { Component, type ErrorInfo, type ReactNode } from "react";
import { recoverFromAssetFailure } from "@/app/routing/asset-recovery";
import { BrandMark } from "@/shared/ui/BrandMark";

type Props = {
  children: ReactNode;
  onFailure: () => void;
};

type State = { failed: boolean };

function recoveryCopy() {
  if (document.documentElement.lang === "ko") return { title: "불러오기를 완료하지 못했습니다", action: "다시 시도" };
  if (document.documentElement.lang === "en") return { title: "We could not finish loading", action: "Retry" };
  return { title: "No pudimos completar la carga", action: "Reintentar" };
}

/** Prevents a failed lazy route from leaving the full-screen loader mounted forever. */
export class RouteRecoveryBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onFailure();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const copy = recoveryCopy();
    return (
      <div className="route-recovery" role="alert">
        <span className="route-recovery__mark" aria-hidden="true"><BrandMark showLetter={false} /></span>
        <strong>{copy.title}</strong>
        <button type="button" onClick={() => recoverFromAssetFailure(new Error("Asset load timed out"), true)}>
          {copy.action}
        </button>
      </div>
    );
  }
}
