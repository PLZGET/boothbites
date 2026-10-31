import { env } from "cloudflare:workers";
import type { Booth } from "./model";
import { DomainError } from "./domain";

type Row = { id: string; access_hash: string; state: string; revision: number };
function database() {
  if (!env.DB) throw new DomainError("DATABASE_UNAVAILABLE", 503);
  return env.DB;
}
export async function hashToken(token: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
export function secret() { return crypto.randomUUID() + crypto.randomUUID(); }
export async function readBooth(id: string) {
  if (!/^[a-z0-9-]{1,64}$/.test(id)) throw new DomainError("BOOTH_NOT_FOUND", 404);
  const row = await database().prepare("SELECT id, access_hash, state, revision FROM booths WHERE id = ?").bind(id).first<Row>();
  if (!row) throw new DomainError("BOOTH_NOT_FOUND", 404);
  return { row, booth: JSON.parse(row.state) as Booth };
}
export async function insertBooth(booth: Booth, token: string) {
  await database().prepare("INSERT INTO booths (id, access_hash, state, revision, created_at) VALUES (?, ?, ?, 0, ?)")
    .bind(booth.id, await hashToken(token), JSON.stringify(booth), new Date().toISOString()).run();
}
export async function authorize(request: Request, accessHash: string) {
  const token = request.headers.get("x-booth-token");
  if (!token || token.length > 200 || await hashToken(token) !== accessHash) throw new DomainError("UNAUTHORIZED", 401);
}
export async function mutateBooth<T>(id: string, action: (booth: Booth, revision: number) => T) {
  for (let i = 0; i < 5; i++) {
    const { row, booth } = await readBooth(id);
    const result = action(booth, row.revision);
    const update = await database().prepare("UPDATE booths SET state = ?, revision = revision + 1 WHERE id = ? AND revision = ?")
      .bind(JSON.stringify(booth), id, row.revision).run();
    if (update.meta.changes === 1) return { booth, result, revision: row.revision + 1 };
  }
  throw new DomainError("BUSY_RETRY", 409);
}
