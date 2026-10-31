import type { Booth, Language, MenuItem, Order, OrderStatus, PublicBooth, PublicOrder } from "./model.ts";

export class DomainError extends Error {
  code: string; status: number;
  constructor(code: string, status = 400) { super(code); this.code = code; this.status = status; }
}
export function publicBooth(booth: Booth): PublicBooth {
  const { orders, nextNumber: _next, ...rest } = booth;
  const activeOrders = orders.filter(o => o.status === "queued" || o.status === "preparing").length;
  return { ...rest, activeOrders, acceptingOrders: booth.published && !booth.paused && activeOrders < booth.capacity };
}
export function publicOrder(order: Order): PublicOrder {
  const { tokenHash: _token, requestId: _request, ...rest } = order;
  return rest;
}
export function placeOrder(booth: Booth, input: {
  lines: { itemId: string; quantity: number }[]; language: Language;
  requestId: string; id: string; tokenHash: string;
}, now = new Date().toISOString()): Order {
  const existing = booth.orders.find(o => o.requestId === input.requestId);
  if (existing) {
    if (existing.tokenHash !== input.tokenHash) throw new DomainError("IDEMPOTENCY_CONFLICT", 409);
    return existing;
  }
  if (!booth.published) throw new DomainError("NOT_PUBLISHED", 409);
  if (booth.paused) throw new DomainError("BOOTH_PAUSED", 409);
  if (!publicBooth(booth).acceptingOrders) throw new DomainError("QUEUE_FULL", 409);
  if (booth.orders.length >= 200) throw new DomainError("DEMO_LIMIT", 409);
  if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > 20) throw new DomainError("INVALID_CART");
  const quantities = new Map<string, number>();
  for (const line of input.lines) {
    if (!line || typeof line !== "object" || typeof line.itemId !== "string") throw new DomainError("INVALID_CART");
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10) throw new DomainError("INVALID_QUANTITY");
    const count = (quantities.get(line.itemId) ?? 0) + line.quantity;
    if (count > 10) throw new DomainError("INVALID_QUANTITY");
    quantities.set(line.itemId, count);
  }
  const lines = Array.from(quantities, ([itemId, quantity]) => {
    const item = booth.menu.find(m => m.id === itemId);
    if (!item || !item.available || item.stock < quantity) throw new DomainError("SOLD_OUT", 409);
    return { itemId, name: structuredClone(item.name), price: item.price, quantity, image: item.image };
  });
  for (const line of lines) booth.menu.find(m => m.id === line.itemId)!.stock -= line.quantity;
  const order: Order = { id: input.id, number: booth.nextNumber++, tokenHash: input.tokenHash, requestId: input.requestId, lines, total: lines.reduce((sum, l) => sum + l.price * l.quantity, 0), status: "queued", createdAt: now, updatedAt: now, payment: "simulated", language: input.language };
  booth.orders.push(order);
  return order;
}
const transitions: Record<OrderStatus, OrderStatus[]> = {
  queued: ["preparing", "cancelled"], preparing: ["ready", "cancelled"], ready: ["collected"], collected: [], cancelled: [],
};
export function updateOrder(booth: Booth, id: string, status: OrderStatus): Order {
  const order = booth.orders.find(o => o.id === id);
  if (!order) throw new DomainError("ORDER_NOT_FOUND", 404);
  if (order.status === status) return order;
  if (!transitions[order.status].includes(status)) throw new DomainError("INVALID_TRANSITION", 409);
  if (status === "cancelled") for (const line of order.lines) {
    const item = booth.menu.find(m => m.id === line.itemId);
    if (item) item.stock += line.quantity;
  }
  order.status = status; order.updatedAt = new Date().toISOString(); return order;
}
export function validateMenu(menu: unknown, boothId?: string): MenuItem[] {
  if (!Array.isArray(menu) || menu.length < 1 || menu.length > 20) throw new DomainError("INVALID_MENU");
  const ids = new Set<string>();
  return menu.map((raw) => {
    if (!raw || typeof raw !== "object") throw new DomainError("INVALID_MENU");
    const m = raw as MenuItem;
    if (typeof m.id !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(m.id) || ids.has(m.id)) throw new DomainError("INVALID_MENU");
    ids.add(m.id);
    for (const value of [m.name?.en, m.name?.ko]) if (typeof value !== "string" || !value.trim() || value.length > 100) throw new DomainError("INVALID_MENU");
    if (!Number.isInteger(m.price) || m.price < 100 || m.price > 1000000 || !Number.isInteger(m.stock) || m.stock < 0 || m.stock > 10000) throw new DomainError("INVALID_MENU");
    const text = (v: unknown, limit: number) => typeof v === "string" ? v.slice(0, limit) : "";
    return { id: m.id, name: { en: m.name.en.trim(), ko: m.name.ko.trim() }, description: { en: text(m.description?.en, 600), ko: text(m.description?.ko, 600) }, portion: { en: text(m.portion?.en, 100), ko: text(m.portion?.ko, 100) }, price: m.price, stock: m.stock, available: m.available === true, image: (/^\/images\/[a-z0-9-]+\.(jpg|webp|png)$/.test(m.image) || (boothId && m.image?.startsWith(`/api/booths/${boothId}/photos/`) && /^\/api\/booths\/[a-z0-9-]{1,64}\/photos\/[a-f0-9-]{36}\.(jpg|webp|png)$/.test(m.image))) ? m.image : "", category: ["signature", "sweet", "savory"].includes(m.category) ? m.category : "savory", spicy: m.spicy === true, ingredients: text(m.ingredients, 500), ingredientsEn: text(m.ingredientsEn, 500), ingredientsConfirmed: m.ingredientsConfirmed === true };
  });
}
