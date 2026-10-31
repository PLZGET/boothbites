import test from "node:test";
import assert from "node:assert/strict";
import { createBooth } from "../lib/seed.ts";
import { DomainError, placeOrder, publicBooth, publicOrder, updateOrder, validateMenu } from "../lib/domain.ts";
const input = (key = "one") => ({ lines: [{ itemId: "tteokbokki", quantity: 2 }], language: "en" as const, requestId: key, id: key, tokenHash: `secret-${key}` });
const fails = (code: string) => (error: unknown) => error instanceof DomainError && error.code === code;
test("order uses trusted menu prices, snapshots names and decrements stock", () => { const b = createBooth("test"); const order = placeOrder(b, input()); assert.equal(order.total, 10000); assert.equal(b.menu[0].stock, 28); b.menu[0].price = 9999; b.menu[0].name.en = "Changed"; assert.equal(order.lines[0].price, 5000); assert.equal(order.lines[0].name.en, "Classic tteokbokki"); });
test("retry is idempotent and cannot take stock twice", () => { const b = createBooth("test"); const first = placeOrder(b, input()); b.paused = true; assert.equal(placeOrder(b, input()).id, first.id); assert.equal(b.orders.length, 1); assert.equal(b.menu[0].stock, 28); assert.throws(() => placeOrder(b, { ...input(), tokenHash: "wrong" }), fails("IDEMPOTENCY_CONFLICT")); });
test("invalid basket does not partially decrement other items", () => { const b = createBooth("test"); assert.throws(() => placeOrder(b, { ...input(), lines: [{ itemId: "tteokbokki", quantity: 2 }, { itemId: "missing", quantity: 1 }] }), fails("SOLD_OUT")); assert.equal(b.menu[0].stock, 30); assert.equal(b.orders.length, 0); });
test("aggregated duplicate quantities cannot exceed stock", () => { const b = createBooth("test"); b.menu[0].stock = 3; assert.throws(() => placeOrder(b, { ...input(), lines: [{ itemId: "tteokbokki", quantity: 2 }, { itemId: "tteokbokki", quantity: 2 }] }), fails("SOLD_OUT")); assert.equal(b.menu[0].stock, 3); });
test("queue capacity blocks new orders and ready releases kitchen capacity", () => { const b = createBooth("test"); b.capacity = 1; placeOrder(b, input()); assert.equal(publicBooth(b).acceptingOrders, false); assert.throws(() => placeOrder(b, input("two")), fails("QUEUE_FULL")); updateOrder(b, "one", "preparing"); updateOrder(b, "one", "ready"); assert.equal(publicBooth(b).acceptingOrders, true); });
test("pause and unpublished booth reject new orders", () => { const b = createBooth("test"); b.paused = true; assert.throws(() => placeOrder(b, input()), fails("BOOTH_PAUSED")); b.paused = false; b.published = false; assert.throws(() => placeOrder(b, input()), fails("NOT_PUBLISHED")); });
test("cancellation restores inventory once and prevents state skipping", () => { const b = createBooth("test"); placeOrder(b, input()); assert.throws(() => updateOrder(b, "one", "ready"), fails("INVALID_TRANSITION")); updateOrder(b, "one", "cancelled"); updateOrder(b, "one", "cancelled"); assert.equal(b.menu[0].stock, 30); assert.throws(() => updateOrder(b, "one", "preparing"), fails("INVALID_TRANSITION")); });
test("public views do not expose order tokens or seller order lists", () => { const b = createBooth("test"); const order = placeOrder(b, input()); assert.equal("orders" in publicBooth(b), false); assert.equal("tokenHash" in publicOrder(order), false); assert.equal("requestId" in publicOrder(order), false); });
test("menu accepts only verified fields and validates prices and quantities", () => { const b = createBooth("test"); assert.equal(validateMenu(b.menu).length, 3); b.menu[0].price = -1; assert.throws(() => validateMenu(b.menu), fails("INVALID_MENU")); b.menu[0].price = 100; b.menu[0].stock = 1.5; assert.throws(() => validateMenu(b.menu), fails("INVALID_MENU")); });

test("saved food photos survive menu validation only for their own booth", () => {
  const b = createBooth("photo-test");
  const path = "/api/booths/photo-test/photos/12345678-1234-1234-1234-123456789012.jpg";
  b.menu[0].image = path;
  assert.equal(validateMenu(b.menu, "photo-test")[0].image, path);
  assert.equal(validateMenu(b.menu, "another-booth")[0].image, "");
  b.menu[0].image = "https://untrusted.example/photo.jpg";
  assert.equal(validateMenu(b.menu, "photo-test")[0].image, "");
});
