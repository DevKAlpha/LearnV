import type { PropsWithChildren } from "react";
import { domAnimation, LazyMotion, MotionConfig } from "motion/react";

/** Centralizes motion behavior and the reduced-motion accessibility policy. */
export function AppMotionProvider({ children }: PropsWithChildren) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
