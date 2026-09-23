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

export type CertificationPriority = "highest" | "high" | "supporting";

export type GksCertification = {
  id: "topik" | "toefl" | "ielts" | "supporting";
  icon: string;
  priority: CertificationPriority;
  sourceId: string;
  scoreBands: Array<{
    score: string;
    weight: string;
  }>;
};

export type CertificationLanguage = "korean" | "english";
export type CertificationCost = "free" | "paid" | "conditional";
export type CertificationModality = "online" | "in-person";
export type CertificationGksUse = "scoring" | "supporting" | "diagnostic";
export type CertificationAvailability = "open" | "scheduled" | "check";

export type CertificationOpportunity = {
  id: string;
  name: string;
  issuer: string;
  language: CertificationLanguage;
  cost: CertificationCost;
  modalities: CertificationModality[];
  gksUse: CertificationGksUse;
  availability: CertificationAvailability;
  url: string;
  verifiedAt: string;
  content: {
    summary: Record<"es" | "en" | "ko", string>;
    price: Record<"es" | "en" | "ko", string>;
    schedule: Record<"es" | "en" | "ko", string>;
    caution: Record<"es" | "en" | "ko", string>;
  };
};

export type CertificationCatalog = {
  schemaVersion: 1;
  updatedAt: string;
  opportunities: CertificationOpportunity[];
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
