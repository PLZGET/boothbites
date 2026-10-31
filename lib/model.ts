export type Language = "en" | "ko";
export type Localized = { en: string; ko: string };
export type MenuItem = {
  id: string; name: Localized; description: Localized;
  price: number; portion: Localized; image: string;
  category: "signature" | "sweet" | "savory";
  spicy: boolean; ingredients: string; ingredientsEn?: string; ingredientsConfirmed: boolean;
  stock: number; available: boolean;
};
export type OrderStatus = "queued" | "preparing" | "ready" | "collected" | "cancelled";
export type Order = {
  id: string; number: number; tokenHash: string; requestId: string;
  lines: { itemId: string; name: Localized; price: number; quantity: number; image: string }[];
  total: number; status: OrderStatus; createdAt: string; updatedAt: string;
  payment: "simulated"; language: Language;
};
export type Booth = {
  id: string; name: string; nameEn: string; festival: string; festivalEn: string;
  number: string; location: Localized; published: boolean; paused: boolean;
  capacity: number; menu: MenuItem[]; orders: Order[]; nextNumber: number;
};
export type PublicBooth = Omit<Booth, "orders" | "nextNumber"> & {
  activeOrders: number; acceptingOrders: boolean;
};
export type PublicOrder = Omit<Order, "tokenHash" | "requestId">;
export type OwnerSession = { boothId: string; token: string };
export type OrderReceipt = { boothId: string; orderId: string; token: string; number?: number };
