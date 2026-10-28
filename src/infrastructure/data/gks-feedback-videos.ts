export const gksFeedbackVideos = [
  {
    id: "application",
    videoId: "lU_LRwkBy88",
    creator: "Fabiola Ibarra · DorajiTV",
    sourceUrl: "https://www.youtube.com/watch?v=lU_LRwkBy88",
    referenceUrl: null,
  },
  {
    id: "documents",
    videoId: "kGAIkQQJfu4",
    creator: "LaoRamos",
    sourceUrl: "https://www.youtube.com/watch?v=kGAIkQQJfu4",
    referenceUrl: null,
  },
  {
    id: "guidelines",
    videoId: "eE1RYyhentI",
    creator: "Nabi's Life",
    sourceUrl: "https://www.youtube.com/watch?v=eE1RYyhentI",
    referenceUrl: null,
  },
  {
    id: "onlineGuide",
    videoId: "6FKKLB_eifo",
    creator: "GKS Alumni · GKS Buddies / NIIED",
    sourceUrl: "https://www.youtube.com/watch?v=6FKKLB_eifo",
    referenceUrl: "https://www.studyinkorea.go.kr/en/plan/scholarship.do?tab=gks-tab1",
  },
  {
    id: "applicationMistakes",
    videoId: "og8GBS3FAog",
    creator: "StudyChingu",
    sourceUrl: "https://www.youtube.com/watch?v=og8GBS3FAog",
    referenceUrl: null,
  },
] as const;

export type GksFeedbackVideoId = (typeof gksFeedbackVideos)[number]["id"];
