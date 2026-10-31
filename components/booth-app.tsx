"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChefHat, ChevronDown, Clock3, CreditCard, Flame, MapPin, Minus, Plus, ShoppingBag, Store, Ticket } from "lucide-react";
import type { Language, MenuItem, OrderReceipt, PublicBooth, PublicOrder } from "@/lib/model";
import { api, errorMessage, getSession, orderNumber, won, readJson, saveJson } from "@/lib/client";
import { Credits, ErrorNotice, Header, Loading } from "./common";

type PendingOrder = { requestId: string; token: string; lines?: { itemId: string; quantity: number }[]; language?: Language };
const statusLabels = { queued: ["Order received", "주문 접수"], preparing: ["Something delicious is cooking", "맛있게 준비하고 있어요"], ready: ["Your food is ready!", "음식이 준비됐어요!"], collected: ["Enjoy every little bite.", "맛있는 축제 되세요."], cancelled: ["This order was cancelled", "주문이 취소되었습니다"] };
export default function BoothApp({ boothId }: { boothId?: string }) {
 const [lang, setLang] = useState<Language>("en");
 const [id, setId] = useState(boothId || "");
 const [booth, setBooth] = useState<PublicBooth | null>(null);
 const [cart, setCart] = useState<Record<string, number>>({});
 const [view, setView] = useState<"menu" | "checkout" | "tracking">("menu");
 const [filter, setFilter] = useState("all");
 const [error, setError] = useState("");
 const [busy, setBusy] = useState(false);
 const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
 const [receipts, setReceipts] = useState<OrderReceipt[]>([]);
 const [order, setOrder] = useState<PublicOrder | null>(null);
 const [mobileCart, setMobileCart] = useState(false);
 const pending = useRef<PendingOrder | null>(null);
 const [unresolved, setUnresolved] = useState(false);
 const cartLoaded = useRef(false);
 const t = (en: string, ko: string) => lang === "en" ? en : ko;
 useEffect(() => { document.documentElement.lang = lang; }, [lang]);
 const load = useCallback(async (currentId: string) => { const data = await api<PublicBooth>(`/booths/${currentId}`); setBooth(data); return data; }, []);
 const initialize = useCallback(async () => {
  setError("");
  try {
   const currentId = boothId || (await getSession()).boothId;
   setCart(readJson(`bb.cart:${currentId}`, {}));
   const legacy = readJson<OrderReceipt | null>(`bb.receipt:${currentId}`, null);
   let savedReceipts = readJson<OrderReceipt[]>(`bb.receipts:${currentId}`, legacy ? [legacy] : []);
   const pendingOrder = readJson<PendingOrder | null>(`bb.pending:${currentId}`, null);
   if (pendingOrder) {
    pending.current = pendingOrder; setUnresolved(true);
    try { const recovered = await api<{ order: PublicOrder }>(`/booths/${currentId}/orders/lookup?requestId=${pendingOrder.requestId}`, { headers: { "x-order-token": pendingOrder.token } });
     const recoveredReceipt = { boothId: currentId, orderId: recovered.order.id, token: pendingOrder.token, number: recovered.order.number };
     savedReceipts = [...savedReceipts.filter(r => r.orderId !== recovered.order.id), recoveredReceipt];
     saveJson(`bb.receipts:${currentId}`, savedReceipts); saveJson(`bb.pending:${currentId}`, null); pending.current = null; setUnresolved(false); setCart({}); setOrder(recovered.order); setView("tracking");
    } catch (e) { if (!(e instanceof Error) || e.message !== "ORDER_NOT_FOUND") setError(errorMessage(e, "en")); }
   }
   setReceipts(savedReceipts); if (savedReceipts.length) setReceipt(savedReceipts[savedReceipts.length - 1]);
   cartLoaded.current = true; setId(currentId); await load(currentId);
  } catch (e) { setError(errorMessage(e, "en")); }
 }, [boothId, load]);
 useEffect(() => { void initialize(); }, [initialize]);
 useEffect(() => { if (id && cartLoaded.current) saveJson(`bb.cart:${id}`, cart); }, [cart, id]);
 useEffect(() => { if (view === "menu") return; const heading = document.querySelector<HTMLElement>(view === "checkout" ? ".checkout-layout h1" : ".order-ticket h1"); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); } }, [view, Boolean(order)]);
 useEffect(() => { if (!id) return; const timer = setInterval(() => { void load(id).catch(() => setError(lang === "en" ? "Live updates paused. Check your connection." : "실시간 연결이 끊겼습니다. 네트워크를 확인해 주세요.")); }, 5000); return () => clearInterval(timer); }, [id, load, lang]);
 useEffect(() => {
  if (!receipt) return; let active = true;
  const poll = async () => { try { const data = await api<{ order: PublicOrder }>(`/booths/${receipt.boothId}/orders/${receipt.orderId}`, { headers: { "x-order-token": receipt.token } }); if (active) setOrder(data.order); } catch (e) { if (active && view === "tracking") setError(errorMessage(e, lang)); } };
  void poll(); const timer = setInterval(poll, 3000); return () => { active = false; clearInterval(timer); };
 }, [receipt, lang, view]);
 useEffect(() => { if (mobileCart) document.getElementById("basket")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [mobileCart]);
 const lines = (booth?.menu || []).filter(item => cart[item.id] > 0);
 const count = lines.reduce((n, item) => n + cart[item.id], 0);
 const total = lines.reduce((n, item) => n + item.price * cart[item.id], 0);
 const updateQuantity = (item: MenuItem, amount: number) => { if (busy || pending.current) return; setCart(previous => ({ ...previous, [item.id]: Math.max(0, Math.min(10, item.stock, (previous[item.id] || 0) + amount)) })); };
 const checkout = () => { setError(""); setView("checkout"); setMobileCart(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
 const place = async () => {
  if (!booth || busy || (!count && !pending.current)) return; setBusy(true); setError("");
  pending.current ??= { requestId: crypto.randomUUID(), token: crypto.randomUUID() + crypto.randomUUID() };
  pending.current.lines ??= lines.map(item => ({ itemId: item.id, quantity: cart[item.id] }));
  pending.current.language ??= lang;
  setUnresolved(true);
  saveJson(`bb.pending:${id}`, pending.current);
  const attempt = pending.current;
  try {
   const result = await api<PublicOrder>(`/booths/${id}/orders`, { method: "POST", body: JSON.stringify(attempt) });
   const nextReceipt = { boothId: id, orderId: result.id, token: attempt.token, number: result.number };
   const nextReceipts = [...receipts.filter(r => r.orderId !== result.id), nextReceipt];
   setReceipts(nextReceipts); setReceipt(nextReceipt); setOrder(result); setCart({}); setView("tracking"); pending.current = null; setUnresolved(false);
   if (!saveJson(`bb.receipts:${id}`, nextReceipts)) setError(t("Order placed. This browser cannot save the receipt; keep this page open until pickup.", "주문이 접수됐습니다. 브라우저에 티켓을 저장할 수 없어 픽업까지 이 화면을 열어두세요."));
   saveJson(`bb.pending:${id}`, null); void load(id).catch(() => {});
  } catch (e) {
   const rejected = ["INVALID_CART", "INVALID_QUANTITY", "SOLD_OUT", "BOOTH_PAUSED", "QUEUE_FULL", "NOT_PUBLISHED", "DEMO_LIMIT", "INVALID_ORDER", "INVALID_ORIGIN", "JSON_REQUIRED", "REQUEST_TOO_LARGE", "INVALID_JSON"].includes(e instanceof Error ? e.message : "");
   if (rejected) { pending.current = null; setUnresolved(false); saveJson(`bb.pending:${id}`, null); }
   setError(errorMessage(e, lang)); void load(id).catch(() => {});
  } finally { setBusy(false); }
 };
 return <div className="visitor-app"><Header lang={lang} setLang={setLang} boothHref={id ? `/b/${id}` : "/"}/><main className="visitor-main">
 {!booth ? error ? <div className="initial-error"><h1>{t("Let's get you to the booth.", "부스에 연결하고 있어요.")}</h1><ErrorNotice message={error} retry={initialize}/></div> : <Loading/> : <>
 <nav className="visitor-nav" aria-label={t("Booth navigation", "부스 메뉴")}><button className={view === "menu" ? "active" : ""} onClick={() => setView("menu")}><Store size={17}/>{t("The menu", "메뉴 보기")}</button><button className={view === "tracking" ? "active" : ""} disabled={!receipt} onClick={() => setView("tracking")}><Ticket size={17}/>{t("My order", "내 주문")}{order && !["collected", "cancelled"].includes(order.status) && <span className="nav-dot"/>}</button><span className="nav-location"><MapPin size={15}/>{lang === "en" ? booth.festivalEn : booth.festival}</span></nav>
 {error && <ErrorNotice message={error} retry={() => { setError(""); void load(id).catch(e => setError(errorMessage(e, lang))); }}/>}
 {unresolved && !busy && <div className="pending-notice"><p>{t("The last order has not been confirmed yet. Retry the same order before changing your basket; it will not create a duplicate.", "직전 주문의 결과를 확인하지 못했습니다. 장바구니를 변경하기 전에 같은 주문을 다시 전송해 주세요. 중복 접수되지 않습니다.")}</p><button className="button secondary" onClick={place}>{t("Retry this order", "같은 주문 재확인")}</button></div>}
 {view === "menu" && <>
 <section className="menu-intro"><div><h1>{t("Less waiting.", "기다림은 짧게.")}<br/><span>{t("More tasting.", "축제는 맛있게.")}</span></h1><p>{t("Pick your favorites. We'll keep your place in line.", "좋아하는 음식을 고르세요. 주문은 저희가 받아둘게요.")}</p></div><div className="intro-note"><div className="note-icon"><ShoppingBag size={26}/></div><p>{t("Order. Explore. Pick up.", "주문하고, 즐기다가, 픽업.")}</p><span>{t("No app. No small talk needed.", "앱 설치도, 복잡한 설명도 없이.")}</span></div></section>
 <section className="booth-strip"><div className="booth-number">{booth.number}</div><div className="booth-heading"><h2>{lang === "en" ? booth.nameEn : booth.name}</h2><p><MapPin size={14}/>{booth.location[lang]}</p></div><div className={`service-state ${booth.acceptingOrders ? "open" : "paused"}`}><span/>{booth.acceptingOrders ? t("Taking orders", "주문 가능") : t("Orders paused", "접수 잠시 중단")}</div></section>
 {!booth.acceptingOrders && <div className="inline-notice">{t("The kitchen is catching up. Browse while new orders are paused.", "밀린 음식을 준비하고 있어요. 메뉴를 둘러보며 잠시 기다려 주세요.")}</div>}
 <div className="menu-layout"><section className="menu-area"><div className="menu-toolbar"><h2>{t("Made for your festival day", "오늘의 축제 한 입")}</h2><span>{booth.menu.length} {t("bites", "가지 메뉴")}</span></div><div className="filter-tabs" role="group" aria-label={t("Menu category", "메뉴 분류")}>{[["all", "All bites", "전체"], ["savory", "Savory", "든든하게"], ["sweet", "Sweet", "달콤하게"]].map(([key, en, ko]) => <button key={key} aria-pressed={filter === key} className={filter === key ? "selected" : ""} onClick={() => setFilter(key)}>{t(en, ko)}</button>)}</div>
 <div className="food-list">{booth.menu.filter(item => filter === "all" || (filter === "savory" ? item.category !== "sweet" : item.category === "sweet")).map((item, index) => <FoodItem key={item.id} item={item} quantity={cart[item.id] || 0} lang={lang} locked={busy || unresolved} featured={index === 0 && filter === "all"} add={() => updateQuantity(item, 1)} remove={() => updateQuantity(item, -1)}/>)}</div>
 {!booth.menu.length && <div className="empty-state"><Store size={32}/><h3>{t("The menu is getting ready", "메뉴를 준비하고 있어요")}</h3></div>}
 <div className="diet-note"><strong>{t("Know before you bite", "주문 전 확인해 주세요")}</strong><p>{t("Ingredients are shown only when confirmed by the vendor. If information is missing, check with the booth before ordering.", "원재료는 판매자가 확인한 경우에만 표시합니다. 정보가 없는 음식은 부스에 확인한 뒤 주문해 주세요.")}</p></div></section>
 <aside id="basket" className={`basket ${mobileCart ? "mobile-open" : ""}`}><div className="basket-title"><h2>{t("Your little feast", "나의 축제 한 상")}</h2><ShoppingBag size={21}/></div>{!count ? <div className="basket-empty"><div><ShoppingBag size={31} strokeWidth={1.4}/></div><h3>{t("Good things start with a bite.", "맛있는 시작을 골라보세요.")}</h3><p>{t("Add something delicious from the menu.", "메뉴에서 먹고 싶은 음식을 담아주세요.")}</p></div> : <><div className="basket-items">{lines.map(item => <div className="basket-item" key={item.id}><div><strong>{item.name[lang]}</strong><span>{won(item.price * cart[item.id])}</span></div><Quantity disabled={busy || unresolved} name={item.name[lang]} value={cart[item.id]} minus={() => updateQuantity(item, -1)} plus={() => updateQuantity(item, 1)} plusDisabled={cart[item.id] >= Math.min(10, item.stock)}/></div>)}</div><div className="basket-total"><span>{t("Total", "합계")}</span><strong>{won(total)}</strong></div></>}
 <button className="button primary full" disabled={!count || !booth.acceptingOrders} onClick={checkout}>{t("Review order", "주문 확인")}<ArrowRight size={18}/></button><p className="basket-footnote"><CheckCircle2 size={14}/>{t("Demo payment. Pick up at the booth.", "데모 결제 후 부스에서 수령해요.")}</p><div className="pickup-note"><MapPin size={17}/><div><strong>{t("Pick up at", "픽업 장소")} {booth.number}</strong><p>{booth.location[lang]}</p></div></div></aside></div>
 {count > 0 && <div className="mobile-cart-bar"><button className="button primary full" onClick={() => { if (mobileCart) checkout(); else setMobileCart(true); }}><span className="count-badge">{count}</span>{mobileCart ? t("Review order", "주문 확인") : t("View basket", "장바구니 보기")}<strong>{won(total)}</strong><ArrowRight size={18}/></button></div>}
 </>}
 {view === "checkout" && <section className="checkout-layout"><div><button className="back-button" onClick={() => setView("menu")}><ArrowLeft size={17}/>{t("Back to menu", "메뉴로 돌아가기")}</button><h1>{t("A good choice.", "맛있는 선택이에요.")}</h1><p className="section-description">{t("One last look before the kitchen gets cooking.", "조리를 시작하기 전에 주문을 확인해 주세요.")}</p><div className="checkout-items">{lines.map(item => <div key={item.id} className="checkout-item">{item.image && <img src={item.image} alt={item.name[lang]}/>}<div><h3>{item.name[lang]}</h3><p>{item.portion[lang]}</p><Quantity disabled={busy || unresolved} name={item.name[lang]} value={cart[item.id]} minus={() => updateQuantity(item, -1)} plus={() => updateQuantity(item, 1)} plusDisabled={cart[item.id] >= Math.min(10, item.stock)}/></div><strong>{won(item.price * cart[item.id])}</strong></div>)}</div><div className="checkout-location"><MapPin size={20}/><div><strong>{t("Pick up at booth", "픽업 부스")} {booth.number}</strong><p>{booth.location[lang]}</p></div></div></div>
 <aside className="payment-panel"><CreditCard size={28}/><h2>{t("Demo checkout", "데모 결제")}</h2><p>{t("Try the full ordering experience. No card details. No money charged.", "주문 흐름을 체험해 보세요. 카드 정보가 필요 없고 실제 돈이 결제되지 않습니다.")}</p><div className="payment-method"><span className="radio-dot"/><div><strong>{t("Simulated payment", "모의 결제")}</strong><span>{t("For this festival demo only", "축제 시연 전용")}</span></div><Check size={17}/></div><div className="basket-total"><span>{t("Order total", "총 주문 금액")}</span><strong>{won(total)}</strong></div><button className="button primary full" disabled={busy || (!count && !pending.current) || (!booth.acceptingOrders && !pending.current)} onClick={place}>{busy ? <><span className="spinner small"/>{t("Placing order…", "주문하는 중…")}</> : <>{t("Place demo order", "데모 주문하기")}<ArrowRight size={18}/></>}</button><button className="text-button failure-test" disabled={busy} onClick={() => setError(t("Demo: payment declined. Nothing was charged and no order was created. Your basket is saved.", "결제 실패를 시연했습니다. 결제·주문은 발생하지 않았고 장바구니는 유지됩니다."))}>{t("Try a declined-payment scenario", "결제 실패 상황 체험")}</button></aside></section>}
 {view === "tracking" && receipts.length > 1 && <label className="receipt-picker">{t("Your pickup tickets", "나의 픽업 티켓")}<select aria-label={t("Select order", "주문 선택")} value={receipt?.orderId || ""} onChange={e => { const selected = receipts.find(r => r.orderId === e.target.value); if (selected) { setOrder(null); setReceipt(selected); } }}>{receipts.map((r, i) => <option key={r.orderId} value={r.orderId}>{r.number ? `#${orderNumber(r.number)}` : `${t("Order", "주문")} ${i + 1}`}</option>)}</select></label>}
 {view === "tracking" && (order ? <section className="tracking-layout"><div className={`order-ticket status-${order.status}`}><div className="ticket-top"><span><Ticket size={18}/>{t("Your pickup ticket", "나의 픽업 티켓")}</span><span>{booth.number}</span></div><div className="ticket-number">{orderNumber(order.number)}</div><div className="ticket-status-icon">{["ready", "collected"].includes(order.status) ? <CheckCircle2 size={34}/> : <ChefHat size={34}/>}</div><h1 aria-live="polite" aria-atomic="true">{statusLabels[order.status][lang === "en" ? 0 : 1]}</h1><p>{order.status === "ready" ? t(`Head to ${booth.number} and show this number.`, `${booth.number} 부스에서 이 번호를 보여주세요.`) : order.status === "cancelled" ? t("This was a simulated payment. No refund is needed.", "모의 결제 주문으로 실제 환불은 발생하지 않습니다.") : order.status === "collected" ? t("Thanks for making us part of your festival.", "축제의 한 순간을 함께해 주셔서 고마워요.") : t("Enjoy the festival nearby. This page updates while open.", "가까운 곳에서 축제를 즐겨주세요. 화면을 열어두면 상태가 갱신됩니다.")}</p><div className="ticket-divider"/><div className="pickup-steps">{[["queued", "Received", "접수"], ["preparing", "Cooking", "조리"], ["ready", "Pick up", "픽업"]].map(([status, en, ko], index) => { const active = ["queued", "preparing", "ready", "collected"].indexOf(order.status) >= index; return <div className={active ? "complete" : ""} key={status}><span>{active ? <Check size={15}/> : index + 1}</span><strong>{t(en, ko)}</strong></div>; })}</div><p className="ticket-demo">{t("DEMO ORDER · NO REAL PAYMENT", "데모 주문 · 실제 결제 없음")}</p></div>
 <div className="tracking-details"><h2>{t("Your order", "주문 내역")}</h2>{order.lines.map(line => <div className="receipt-line" key={line.itemId}><span>{line.quantity} × {line.name[lang]}</span><strong>{won(line.quantity * line.price)}</strong></div>)}<div className="basket-total"><span>{t("Total", "합계")}</span><strong>{won(order.total)}</strong></div><div className="checkout-location"><MapPin size={20}/><div><strong>{booth.number} · {lang === "en" ? booth.nameEn : booth.name}</strong><p>{booth.location[lang]}</p></div></div><p className="muted-text"><Clock3 size={15}/>{t("Updates while this page is open.", "이 페이지를 열어두면 자동으로 갱신됩니다.")}</p><button className="button secondary full" onClick={() => setView("menu")}>{t("Back for another bite", "다른 메뉴 둘러보기")}<ArrowRight size={17}/></button></div></section> : <Loading text={t("Finding your order…", "주문을 불러오고 있어요…")}/>)}
 <Credits lang={lang}/></>}
 </main></div>;
}
function Quantity({ name, value, minus, plus, plusDisabled, disabled = false }: { name: string; value: number; minus: () => void; plus: () => void; plusDisabled?: boolean; disabled?: boolean }) { return <div className="quantity"><button aria-label={`${name} −1`} onClick={minus} disabled={disabled || value <= 0}><Minus size={15}/></button><span aria-live="polite">{value}</span><button aria-label={`${name} +1`} onClick={plus} disabled={disabled || plusDisabled}><Plus size={15}/></button></div>; }
function FoodItem({ item, quantity, lang, featured, add, remove, locked }: { item: MenuItem; quantity: number; lang: Language; featured: boolean; locked: boolean; add: () => void; remove: () => void }) {
 const soldOut = !item.available || item.stock === 0; const t = (en: string, ko: string) => lang === "en" ? en : ko;
 return <article className={`food-item ${featured ? "featured" : ""} ${soldOut ? "sold-out" : ""}`}><div className="food-image">{item.image ? <img src={item.image} alt={item.name[lang]} loading={featured ? "eager" : "lazy"}/> : <div className="food-placeholder"><Store size={22}/>{t("Photo coming soon", "사진 준비 중")}</div>}{featured && <span className="food-label">{t("The festival classic", "축제의 대표 한 입")}</span>}{soldOut && <span className="sold-out-label">{t("Sold out", "품절")}</span>}</div><div className="food-copy"><div className="food-title"><h3>{item.name[lang]}</h3>{item.spicy && <span className="spicy-tag"><Flame size={13}/>{t("Spicy", "매콤")}</span>}</div>{lang === "en" && <p className="korean-name">{item.name.ko}</p>}<p className="food-description">{item.description[lang] || t("Ask the vendor for details about this dish.", "자세한 음식 정보는 판매자에게 확인해 주세요.")}</p><span className="portion">{item.portion[lang]}</span><div className="food-bottom"><strong className="food-price">{won(item.price)}</strong>{quantity > 0 ? <Quantity disabled={locked} name={item.name[lang]} value={quantity} minus={remove} plus={add} plusDisabled={soldOut || quantity >= Math.min(10, item.stock)}/> : <button className="add-button" disabled={soldOut || locked} onClick={add} aria-label={`${item.name[lang]} ${t("Add to basket", "담기")}`}><Plus size={17}/>{t("Add", "담기")}</button>}</div><details className="ingredients"><summary>{t("Ingredients & dietary info", "원재료 · 식이 정보")}<ChevronDown size={13}/></summary><p>{item.ingredientsConfirmed && (lang === "en" ? item.ingredientsEn : item.ingredients) ? (lang === "en" ? item.ingredientsEn : item.ingredients) : t("Not confirmed by the vendor. Check before ordering if you have a dietary restriction or allergy.", "판매자가 확인한 정보가 없습니다. 식이 제한이나 알레르기가 있다면 주문 전에 확인해 주세요.")}</p></details></div></article>;
}
