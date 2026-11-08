/** A permission prompt must not leave a copy action pending indefinitely. */
export async function copyText(text: string): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Clipboard request timed out")), 5000); }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
