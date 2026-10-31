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
 AI_AUTH_ERROR: ["Menu scanning needs an administrator to check its API connection.", "Claude API 인증을 확인해야 합니다. 관리자에게 알려 주세요."],
 AI_RATE_LIMIT: ["Menu scanning is busy. Please try again shortly.", "AI 요청이 몰렸습니다. 잠시 후 다시 시도해 주세요."],
 AI_DEMO_LIMIT: ["Today's shared AI demo allowance has been used. You can still enter menus manually.", "오늘의 AI 체험 한도를 모두 사용했습니다. 직접 입력은 계속 가능하며, 한국 시간 자정에 한도가 초기화됩니다."],
 INVALID_IMAGE: ["Choose a JPG, PNG or WebP image up to 4 MB.", "JPG·PNG·WebP 형식의 4MB 이하 사진을 선택해 주세요."],
 AI_NO_FOOD: ["No food or readable menu was found. Choose a photo showing the dish or menu.", "음식이나 메뉴판을 확인하지 못했어요. 음식이 잘 보이는 사진 또는 메뉴판 사진을 선택해 주세요."],
 AI_INVALID_RESPONSE: ["The AI response could not be processed. Please try again.", "AI 결과를 처리하지 못했어요. 사진은 유지되니 다시 시도해 주세요."],
 AI_INCOMPLETE: ["The AI response was cut short. Try again with fewer menu items in the photo.", "AI 응답이 중간에 끝났어요. 다시 시도하거나 메뉴판을 나눠 촬영해 주세요."],
 AI_REFUSED: ["This photo could not be processed. Choose another food or menu photo.", "이 사진은 AI가 처리하지 못했어요. 다른 음식·메뉴판 사진을 선택해 주세요."],
 PHOTO_STORAGE_UNAVAILABLE: ["The photo could not be saved. Please try again.", "음식 사진을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."],
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
