export function ProgressOrbit({ score }: { score: number }) {
  return (
    <div className="progress-orbit" role="img" aria-label={`Progreso de preparación: ${score}%`}>
      <div className="orbit-segment orbit-segment--yellow" />
      <div className="orbit-segment orbit-segment--green" />
      <div className="orbit-segment orbit-segment--pink" />
      <div className="orbit-segment orbit-segment--blue" />
      <span className="orbit-chip orbit-chip--top">✓</span>
      <span className="orbit-chip orbit-chip--right">한</span>
      <span className="orbit-chip orbit-chip--bottom">A+</span>
      <span className="orbit-chip orbit-chip--left">✦</span>
      <div className="orbit-center">
        <strong>{score}</strong>
        <span>lista para hoy</span>
      </div>
    </div>
  );
}
