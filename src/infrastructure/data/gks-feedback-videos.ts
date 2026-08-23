export const gksFeedbackVideos = [
  {
    id: "application",
    videoId: "lU_LRwkBy88",
    creator: "Fabiola Ibarra · DorajiTV",
    sourceUrl: "https://www.youtube.com/watch?v=lU_LRwkBy88",
  },
  {
    id: "documents",
    videoId: "kGAIkQQJfu4",
    creator: "LaoRamos",
    sourceUrl: "https://www.youtube.com/watch?v=kGAIkQQJfu4",
  },
  {
    id: "guidelines",
    videoId: "eE1RYyhentI",
    creator: "Nabi's Life",
    sourceUrl: "https://www.youtube.com/watch?v=eE1RYyhentI",
  },
] as const;

export type GksFeedbackVideoId = (typeof gksFeedbackVideos)[number]["id"];
