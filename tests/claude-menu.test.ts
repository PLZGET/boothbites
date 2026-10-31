import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { extractClaudeMenu, parseMenuImage, DEFAULT_CLAUDE_MODEL } from "../lib/claude-menu.ts";
import { reserveAiRequest } from "../lib/ai-usage.ts";
import { DomainError } from "../lib/domain.ts";

const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
const item = { nameKo: "떡볶이", nameEn: "Tteokbokki", price: 5000, descriptionKo: "", descriptionEn: "" };
const fail = (code: string) => (error: unknown) => error instanceof DomainError && error.code === code;
const respond = (data: unknown, status = 200) => (async () => Response.json(data, { status })) as typeof fetch;
const complete = (items: unknown) => ({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ items }) }] });

test("Claude receives an image and JSON schema; only reviewed draft fields are returned", async () => {
  const send = (async (url, init) => {
    assert.equal(url, "https://api.anthropic.com/v1/messages");
    assert.equal(new Headers(init?.headers).get("x-api-key"), "test-key");
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.model, DEFAULT_CLAUDE_MODEL);
    assert.equal(payload.messages[0].content[0].source.media_type, "image/png");
    assert.equal(payload.output_config.format.type, "json_schema");
    assert.equal(String(init?.body).includes("test-key"), false);
    assert.match(payload.system, /Never infer or invent ingredients, allergens/);
    return Response.json(complete([{ ...item, ingredients: "invented" }]));
  }) as typeof fetch;
  assert.deepEqual(await extractClaudeMenu(parseMenuImage(image), "test-key", undefined, send), [item]);
});

test("unknown price and absent description remain unconfirmed", async () => {
  const draft = { ...item, price: null };
  assert.deepEqual(await extractClaudeMenu(parseMenuImage(image), "test-key", undefined, respond(complete([draft]))), [draft]);
});

test("invalid images are rejected before a paid request", () => {
  for (const bad of [null, "https://example.com/menu.png", image.replace("image/png", "image/jpeg"), "data:image/png;base64,abcd", "data:image/png;base64," + "A".repeat(5_333_404)]) {
    assert.throws(() => parseMenuImage(bad), fail("INVALID_IMAGE"));
  }
});

test("upstream auth, throttling, errors and network failures expose only app error codes", async () => {
  for (const [status, code] of [[401, "AI_AUTH_ERROR"], [403, "AI_AUTH_ERROR"], [429, "AI_RATE_LIMIT"], [500, "AI_UNAVAILABLE"]] as const) {
    await assert.rejects(extractClaudeMenu(parseMenuImage(image), "test-key", undefined, respond({ error: "private upstream details" }, status)), fail(code));
  }
  await assert.rejects(extractClaudeMenu(parseMenuImage(image), "test-key", undefined, (async () => { throw new Error("private network details"); }) as typeof fetch), fail("AI_UNAVAILABLE"));
});

test("partial, refused, empty, malformed and out-of-range AI results cannot become menu drafts", async () => {
  const invalid = [
    { ...complete([item]), stop_reason: "max_tokens" }, { ...complete([item]), stop_reason: "refusal" },
    { stop_reason: "end_turn", content: [{ type: "text", text: "not json" }] },
    complete([]), complete([null]), complete([{ ...item, price: -1 }]), complete([{ ...item, price: 2.5 }]),
    complete([{ ...item, nameEn: "" }]), complete([{ ...item, descriptionEn: "x".repeat(301) }]), complete(Array(13).fill(item)),
  ];
  for (const result of invalid) await assert.rejects(extractClaudeMenu(parseMenuImage(image), "test-key", undefined, respond(result)), fail("AI_UNREADABLE"));
});

test("shared SQL budget permits exactly the limit and resets at Korean midnight", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../drizzle/0001_outstanding_franklin_richards.sql", import.meta.url), "utf8"));
  const db = { prepare: (sql: string) => ({ bind: (...args: (string | number)[]) => ({ first: async () => sqlite.prepare(sql).get(...args) ?? null }) }) } as unknown as D1Database;
  try {
    const time = new Date("2026-10-31T14:59:00Z");
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => reserveAiRequest(db, "3", time)));
    assert.equal(results.filter(r => r.status === "fulfilled").length, 3);
    for (const result of results) if (result.status === "rejected") assert.equal(fail("AI_DEMO_LIMIT")(result.reason), true);
    await reserveAiRequest(db, "3", new Date("2026-10-31T15:00:00Z"));
    const rows = sqlite.prepare("SELECT requests FROM ai_usage ORDER BY id").all();
    assert.deepEqual(rows.map(r => r.requests), [3, 1]);
  } finally { sqlite.close(); }
});
