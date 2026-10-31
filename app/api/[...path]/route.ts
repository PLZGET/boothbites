import { env } from "cloudflare:workers";
import { extractClaudeMenu, parseMenuImage } from "@/lib/claude-menu";
import { readMenuPhoto, storeMenuPhoto } from "@/lib/menu-photos";
import { reserveAiRequest } from "@/lib/ai-usage";
import { createBooth } from "@/lib/seed";
import { authorize, hashToken, insertBooth, mutateBooth, readBooth, secret } from "@/lib/store";
import { DomainError, placeOrder, publicBooth, publicOrder, updateOrder, validateMenu } from "@/lib/domain";
import type { OrderStatus } from "@/lib/model";

export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
async function body(request: Request, max = 100_000) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new DomainError("JSON_REQUIRED", 415);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new DomainError("INVALID_ORIGIN", 403);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > max) throw new DomainError("REQUEST_TOO_LARGE", 413);
  const raw = await request.text();
  if (raw.length > max) throw new DomainError("REQUEST_TOO_LARGE", 413);
  try { return JSON.parse(raw); } catch { throw new DomainError("INVALID_JSON"); }
}
async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const [, , resource, id, action, orderId] = url.pathname.split("/");
    const method = request.method;
    if (resource === "health") return json({ ok: true, payment: "simulated", ai: Boolean(env.ANTHROPIC_API_KEY) });
    if (resource !== "booths") throw new DomainError("NOT_FOUND", 404);
    if (!id && method === "POST") {
      await body(request);
      const booth = createBooth(crypto.randomUUID());
      const token = secret(); await insertBooth(booth, token);
      return json({ boothId: booth.id, token, booth: publicBooth(booth) }, 201);
    }
    const { row, booth } = await readBooth(id);
    if (action === "photos" && method === "GET") {
      const path = "/api/booths/" + id + "/photos/" + orderId;
      if (!booth.published || !booth.menu.some(item => item.image === path)) await authorize(request, row.access_hash);
      return await readMenuPhoto(env.BUCKET, id, orderId);
    }
    if (!action && method === "GET") {
      const result = publicBooth(booth);
      if (!result.published) result.menu = [];
      return json(result);
    }
    if (action === "orders" && method === "POST" && !orderId) {
      const input = await body(request);
      if (typeof input.requestId !== "string" || !/^[a-f0-9-]{36}$/.test(input.requestId) || typeof input.token !== "string" || !/^[a-f0-9-]{72}$/.test(input.token)) throw new DomainError("INVALID_ORDER");
      const tokenHash = await hashToken(input.token);
      const result = await mutateBooth(id, b => placeOrder(b, { lines: input.lines, requestId: input.requestId, id: crypto.randomUUID(), tokenHash, language: input.language === "ko" ? "ko" : "en" }));
      return json(publicOrder(result.result), 201);
    }
    if (action === "orders" && orderId && method === "GET") {
      const order = orderId === "lookup" ? booth.orders.find(o => o.requestId === url.searchParams.get("requestId")) : booth.orders.find(o => o.id === orderId);
      const token = request.headers.get("x-order-token");
      if (!order || !token || token.length > 200 || await hashToken(token) !== order.tokenHash) throw new DomainError("ORDER_NOT_FOUND", 404);
      return json({ order: publicOrder(order), booth: publicBooth(booth) });
    }
    await authorize(request, row.access_hash);
    if (action === "manage" && method === "GET") return json({ booth: publicBooth(booth), orders: booth.orders.map(publicOrder), revision: row.revision, aiConfigured: Boolean(env.ANTHROPIC_API_KEY) });
    if (action === "manage" && method === "PATCH") {
      const input = await body(request);
      const updated = await mutateBooth(id, (b, revision) => {
        if (input.menu !== undefined) {
          if (input.revision !== revision) throw new DomainError("MENU_CHANGED", 409);
          const next = validateMenu(input.menu, id);
          const activeItemIds = b.orders.filter(o => !["collected", "cancelled"].includes(o.status)).flatMap(o => o.lines.map(l => l.itemId));
          if (activeItemIds.some(itemId => !next.some(m => m.id === itemId))) throw new DomainError("MENU_HAS_ACTIVE_ORDERS", 409);
          b.menu = next;
        }
        for (const key of ["paused", "published"] as const) if (typeof input[key] === "boolean") b[key] = input[key];
        if (input.capacity !== undefined) {
          if (!Number.isInteger(input.capacity) || input.capacity < 1 || input.capacity > 50) throw new DomainError("INVALID_CAPACITY");
          b.capacity = input.capacity;
        }
        for (const key of ["name", "nameEn", "number"] as const) if (typeof input[key] === "string" && input[key].trim()) b[key] = input[key].trim().slice(0, 80);
      });
      return json({ booth: publicBooth(updated.booth), revision: updated.revision });
    }
    if (action === "orders" && orderId && method === "PATCH") {
      const input = await body(request);
      if (!["preparing", "ready", "collected", "cancelled"].includes(input.status)) throw new DomainError("INVALID_TRANSITION");
      const updated = await mutateBooth(id, b => updateOrder(b, orderId, input.status as OrderStatus));
      return json(publicOrder(updated.result));
    }
    if (action === "extract" && method === "POST") {
      if (!env.ANTHROPIC_API_KEY) throw new DomainError("AI_NOT_CONFIGURED", 503);
      const input = await body(request, 5_400_000);
      const image = parseMenuImage(input?.image);
      if (!env.DB) throw new DomainError("DATABASE_UNAVAILABLE", 503);
      await reserveAiRequest(env.DB, env.AI_DAILY_LIMIT);
      const result = await extractClaudeMenu(image, env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL);
      const photo = result.imageType === "food" ? await storeMenuPhoto(env.BUCKET, id, image) : "";
      return json({ ...result, photo, mode: "ai", provider: "claude", requiresConfirmation: true });
    }
    throw new DomainError("NOT_FOUND", 404);
  } catch (error) {
    if (error instanceof DomainError) return json({ error: error.code }, error.status);
    console.error("BoothBites request failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "SERVER_ERROR" }, 500);
  }
}
export { handle as GET, handle as POST, handle as PATCH };
