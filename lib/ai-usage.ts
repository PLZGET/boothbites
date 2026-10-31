import { DomainError } from "./domain.ts";

// Atomic, shared across booths and Workers. Reserve before a paid API request;
// failures also count, so retries cannot bypass the public demo's daily budget.
export async function reserveAiRequest(db: D1Database, configuredLimit?: string, now = new Date()) {
  const configured = Number(configuredLimit);
  const limit = Number.isInteger(configured) && configured > 0 && configured <= 1000 ? configured : 50;
  const day = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const result = await db.prepare(`INSERT INTO ai_usage (id, requests) VALUES (?, 1)
    ON CONFLICT(id) DO UPDATE SET requests = requests + 1 WHERE requests < ?
    RETURNING requests`).bind(`menu:${day}`, limit).first<{ requests: number }>();
  if (!result) throw new DomainError("AI_DEMO_LIMIT", 429);
}
