export const learningPathCopy = {
  es: {
    window: (start: number, end: number, total: number) => `Actividades ${start}–${end} de ${total}`,
    expand: (total: number) => `Ver las ${total} actividades`,
    collapse: "Volver al paso actual",
    finished: "Ruta completada · puedes repasar cualquier actividad",
    legend: "Sigue los números. El candado indica una actividad pendiente de desbloquear.",
  },
  en: {
    window: (start: number, end: number, total: number) => `Activities ${start}–${end} of ${total}`,
    expand: (total: number) => `Show all ${total} activities`,
    collapse: "Back to current steps",
    finished: "Path complete · revisit any activity",
    legend: "Follow the numbers. A lock marks an activity you have not unlocked yet.",
  },
  ko: {
    window: (start: number, end: number, total: number) => `전체 ${total}개 중 ${start}–${end}단계`,
    expand: (total: number) => `${total}개 활동 모두 보기`,
    collapse: "현재 단계로 돌아가기",
    finished: "경로 완료 · 모든 활동을 복습할 수 있습니다",
    legend: "번호 순서대로 진행하세요. 자물쇠는 아직 열리지 않은 활동을 나타냅니다.",
  },
} as const;
