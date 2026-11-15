import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/** 32 random bytes as base64url (43 characters): sign-in tokens and session ids. */
export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Tokens are stored only as hashes, so a database leak cannot be replayed as a sign-in. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

const FORMAT = "v1";

/**
 * AES-256-GCM encryption at rest. The additional data binds a ciphertext to its account and
 * key, so rows cannot be swapped between users or documents without failing authentication.
 */
export function encryptValue(key: Buffer, plain: string, context: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(context, "utf8"));
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [FORMAT, iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(":");
}

export function decryptValue(key: Buffer, stored: string, context: string): string {
  const [format, iv, tag, data] = stored.split(":");
  if (format !== FORMAT || !iv || !tag || data === undefined) throw new Error("Unknown ciphertext format");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  decipher.setAAD(Buffer.from(context, "utf8"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}
