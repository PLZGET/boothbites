import type { Booth, MenuItem } from "./model.ts";

export const sampleMenu: MenuItem[] = [
  { id: "tteokbokki", name: { en: "Classic tteokbokki", ko: "매콤 쌀떡볶이" }, description: { en: "Chewy rice cakes in a rich, spicy-sweet red pepper sauce. A Korean street-food favorite.", ko: "쫄깃한 쌀떡에 매콤달콤한 고추장 소스. 축제에서 즐기는 따뜻한 한 컵." }, price: 5000, portion: { en: "1 cup · 1 person", ko: "1컵 · 1인분" }, image: "/images/tteokbokki.jpg", category: "signature", spicy: true, ingredients: "", ingredientsConfirmed: false, stock: 30, available: true },
  { id: "chicken", name: { en: "Sweet & crispy chicken", ko: "달콤 바삭 닭강정" }, description: { en: "Bite-sized crispy chicken coated in a sweet, sticky glaze. Made for sharing, or keeping all to yourself.", ko: "한입 크기의 바삭한 닭강정에 달콤한 소스. 들고 다니며 먹기 좋은 컵 메뉴." }, price: 7000, portion: { en: "1 cup · 1 person", ko: "1컵 · 1인분" }, image: "/images/chicken.jpg", category: "savory", spicy: false, ingredients: "", ingredientsConfirmed: false, stock: 20, available: true },
  { id: "hotteok", name: { en: "Warm cinnamon hotteok", ko: "따끈한 꿀호떡" }, description: { en: "A golden griddled pancake with a warm, sweet cinnamon filling. Enjoy slowly: the center is hot.", ko: "노릇하게 구운 호떡 속에 달콤한 계피 설탕이 가득. 뜨거운 속을 조심하세요." }, price: 3000, portion: { en: "1 piece", ko: "1개" }, image: "/images/hotteok.jpg", category: "sweet", spicy: false, ingredients: "", ingredientsConfirmed: false, stock: 25, available: true },
];

export function createBooth(id: string): Booth {
  return { id, name: "소풍 분식", nameEn: "Sopung Street Kitchen", festival: "가을 소풍 마켓", festivalEn: "Autumn Picnic Market", number: "B-07", location: { en: "Food alley · beside the yellow flag", ko: "먹거리 골목 · 노란 깃발 옆" }, published: true, paused: false, capacity: 12, menu: structuredClone(sampleMenu), orders: [], nextNumber: 1 };
}
