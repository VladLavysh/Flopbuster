import { getRequestIP, type H3Event } from "h3";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUCCESSFUL_LLM_HITS = 3;

// temp - in-memory
const successfulHitsByClient = new Map<string, number[]>();

function pruneWindow(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function getRateLimitKey(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
}

export function checkSuccessfulLlmRateLimit(
  key: string,
): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  const recent = pruneWindow(successfulHitsByClient.get(key) ?? [], now);
  successfulHitsByClient.set(key, recent);

  if (recent.length < MAX_SUCCESSFUL_LLM_HITS) {
    return { allowed: true };
  }

  const oldest = recent[0] ?? now;
  const retryAfterSec = Math.max(
    1,
    Math.ceil((oldest + WINDOW_MS - now) / 1000),
  );

  return { allowed: false, retryAfterSec };
}

export function recordSuccessfulLlmHit(key: string): void {
  const now = Date.now();
  const recent = pruneWindow(successfulHitsByClient.get(key) ?? [], now);
  recent.push(now);
  successfulHitsByClient.set(key, recent);
}
