import { z } from "zod";
import { isSafeJson, isSyncKey, MAX_DOCUMENT_CHARS, MAX_SYNC_DOCUMENTS } from "./sync-keys.ts";

/**
 * Request and response contract of the LearnV API (`/api/v1`).
 * The API validates every request with these schemas; the web client validates responses.
 */

/** Bump when the privacy notice changes in substance: the next sign-in records the new consent. */
export const PRIVACY_VERSION = "2026-11";
export const LOCALES = ["es", "en", "ko"] as const;
export const AGE_BANDS = ["14-plus", "guardian"] as const;

export const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());
export const syncKeySchema = z.string().refine(isSyncKey, "Unknown or device-only key");
const isoDate = z.iso.datetime({ offset: true });

export const magicLinkRequestSchema = z.strictObject({
  email: emailSchema,
  locale: z.enum(LOCALES),
  consent: z.strictObject({
    /** 14-plus: the person declares being 14 or older. guardian: a parent or guardian consents (LOPDGDD art. 7). */
    age: z.enum(AGE_BANDS),
    privacy: z.literal(PRIVACY_VERSION),
  }),
});

/** 32 random bytes, base64url. */
export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
export const verifyRequestSchema = z.strictObject({ token: tokenSchema });

export const accountSchema = z.strictObject({
  id: z.string().uuid(),
  email: z.string(),
  createdAt: isoDate,
  consent: z.strictObject({ age: z.enum(AGE_BANDS), privacy: z.string(), at: isoDate }),
});
export const meResponseSchema = z.strictObject({ account: accountSchema });

export const deleteAccountRequestSchema = z.strictObject({ confirm: emailSchema });

const revision = z.number().int().min(0).max(2_147_483_647);

export const manifestEntrySchema = z.strictObject({
  key: z.string(),
  revision,
  updatedAt: isoDate,
  /** A deletion other devices should apply (a tombstone). */
  deleted: z.boolean(),
});
export const manifestResponseSchema = z.strictObject({
  documents: z.array(manifestEntrySchema).max(MAX_SYNC_DOCUMENTS * 2),
  usage: z.strictObject({ chars: z.number().int().min(0), limit: z.number().int().min(0) }),
});

export const pullRequestSchema = z.strictObject({ keys: z.array(syncKeySchema).min(1).max(MAX_SYNC_DOCUMENTS) });

export const documentSchema = z.strictObject({
  key: z.string(),
  revision,
  updatedAt: isoDate,
  /** null for a deleted document. */
  value: z.string().nullable(),
});
export const pullResponseSchema = z.strictObject({ documents: z.array(documentSchema).max(MAX_SYNC_DOCUMENTS) });

const documentValue = z.string().max(MAX_DOCUMENT_CHARS).refine(isSafeJson, "Value must be safe JSON text");

export const pushRequestSchema = z.strictObject({
  changes: z.array(z.strictObject({
    key: syncKeySchema,
    /** Revision the change is based on; 0 creates the document. */
    baseRevision: revision,
    /** New JSON text, or null to delete the document. */
    value: documentValue.nullable(),
  })).min(1).max(MAX_SYNC_DOCUMENTS)
    .refine((changes) => new Set(changes.map((change) => change.key)).size === changes.length, "Duplicate key"),
});

export const pushResultSchema = z.discriminatedUnion("status", [
  z.strictObject({ key: z.string(), status: z.literal("ok"), revision, updatedAt: isoDate }),
  /** Someone else changed the document first: merge with `current` and push again. */
  z.strictObject({ key: z.string(), status: z.literal("conflict"), current: documentSchema }),
  /** The account storage limit would be exceeded. */
  z.strictObject({ key: z.string(), status: z.literal("quota") }),
]);
export const pushResponseSchema = z.strictObject({ results: z.array(pushResultSchema).max(MAX_SYNC_DOCUMENTS) });

export const errorResponseSchema = z.strictObject({ error: z.string() });

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;
export type Account = z.infer<typeof accountSchema>;
export type ManifestEntry = z.infer<typeof manifestEntrySchema>;
export type ManifestResponse = z.infer<typeof manifestResponseSchema>;
export type SyncDocument = z.infer<typeof documentSchema>;
export type PushChange = z.infer<typeof pushRequestSchema>["changes"][number];
export type PushResult = z.infer<typeof pushResultSchema>;
