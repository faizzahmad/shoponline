/** Normalize Clerk / API emails for cart and order lookups. */
export function normalizeAccountEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}
