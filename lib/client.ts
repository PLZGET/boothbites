import type { Language, OwnerSession } from "./model";
const messages: Record<string, [string, string]> = {
 SOLD_OUT: ["An item just sold out. Check your basket and try again.", "방금 품절된 메뉴가 있습니다. 장바구니를 확인해 주세요."],
 BOOTH_PAUSED: ["The kitchen is taking a short break from new orders.", "주문 접수가 잠시 쉬어갑니다."],
 QUEUE_FULL: ["The kitchen is full right now. Please try again shortly.", "조리 중인 주문이 많습니다. 잠시 후 다시 주문해 주세요."],
 NOT_PUBLISHED: ["This menu is not open yet.", "아직 공개하지 않은 메뉴입니다."],
 BOOTH_NOT_FOUND: ["We couldn't find this booth. Check the QR code.", "부스를 찾을 수 없습니다. QR 코드를 확인해 주세요."],
 UNAUTHORIZED: ["This browser cannot manage this booth.", "이 브라우저에 부스 관리 권한이 없습니다."],
 ORDER_NOT_FOUND: ["This receipt isn't available in this browser.", "이 브라우저에서 주문 영수증을 찾을 수 없습니다."],
 MENU_CHANGED: ["The menu or stock changed. Reload before saving.", "주문이나 재고가 변경되었습니다. 최신 메뉴를 불러온 뒤 다시 저장해 주세요."],
 MENU_HAS_ACTIVE_ORDERS: ["An active order contains a removed item.", "진행 중인 주문에 포함된 메뉴는 삭제할 수 없습니다."],
 INVALID_MENU: ["Check names, prices and quantities.", "메뉴명·가격(100원 이상)·재고를 확인해 주세요."],
 INVALID_TRANSITION: ["This order has changed. Refresh and try again.", "주문 상태가 변경되었습니다. 새로고침 후 확인해 주세요."],
 AI_NOT_CONFIGURED: ["Menu scanning isn't connected. Enter your menu manually.", "AI 인식이 연결되지 않았습니다. 직접 입력하거나 예시 메뉴로 진행해 주세요."],
 AI_UNAVAILABLE: ["We couldn't read the menu. Try again.", "AI 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요."],
 AI_UNREADABLE: ["No readable menu found. Try a clearer photo.", "메뉴를 찾지 못했습니다. 선명한 사진으로 다시 시도해 주세요."],
 DEMO_LIMIT: ["This booth reached its demo order limit.", "데모 주문 한도에 도달했습니다."],
};
export function errorMessage(error: unknown, lang: Language = "ko") { const code = error instanceof Error ? error.message : ""; return messages[code]?.[lang === "en" ? 0 : 1] || (lang === "en" ? "Connection interrupted. Please try again. Your basket is still here." : "연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요."); }
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> { const response = await fetch(`/api${path}`, { ...options, headers: { "Content-Type": "application/json", ...options.headers }, cache: "no-store" }); const data = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(data.error || "SERVER_ERROR"); return data; }
let sessionPromise: Promise<OwnerSession> | null = null;
let memorySession: OwnerSession | null = null;
export function readJson<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
export function saveJson(key: string, value: unknown): boolean { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
export async function getSession(): Promise<OwnerSession> {
 if (sessionPromise) return sessionPromise;
 if (memorySession) return memorySession;
 sessionPromise = (async () => {
  const saved = readJson<OwnerSession | null>("bb.owner", null);
  if (saved?.boothId && saved?.token) {
   try { await api(`/booths/${saved.boothId}`); return saved; }
   catch (error) { if (!(error instanceof Error) || error.message !== "BOOTH_NOT_FOUND") throw error; }
  }
  const result = await api<OwnerSession>("/booths", { method: "POST", body: "{}" });
  const session = { boothId: result.boothId, token: result.token };
  saveJson("bb.owner", session); return session;
 })();
 try { memorySession = await sessionPromise; return memorySession; } finally { sessionPromise = null; }
}
export const won = (value: number) => `₩${value.toLocaleString("en-US")}`;
export const orderNumber = (value: number) => String(value).padStart(3, "0");
