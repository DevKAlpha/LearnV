export const sceneNames = ["reader", "seoul", "london", "desk", "journey", "garden"] as const;
export type SceneName = typeof sceneNames[number];

/** Separate local vectors: route illustrations never increase the initial JS bank. */
export function SceneArt({ scene, className = "", eager = false }: { scene: SceneName; className?: string; eager?: boolean }) {
  return <img className={`scene-art ${className}`} src={`${import.meta.env.BASE_URL}illustrations/storybook/${scene}.svg`}
    width={scene === "reader" ? 480 : 640} height={scene === "reader" ? 520 : 400}
    alt="" aria-hidden="true" loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"} />;
}
