export type FactStatus = "confirmed" | "historical" | "pending";

export type Source = {
  id: string;
  title: string;
  organization: string;
  url: string;
  publishedAt?: string;
  verifiedAt: string;
};

export type GksFact = {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: string;
  status: FactStatus;
  sourceId: string;
};

export type StudyTask = {
  id: string;
  title: string;
  meta: string;
  category: "topik" | "english" | "application";
  duration: number;
};

export type DocumentItem = {
  id: string;
  label: string;
  detail: string;
  required: boolean;
  needsApostille?: boolean;
  needsTranslation?: boolean;
};
