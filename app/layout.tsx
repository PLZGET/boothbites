import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoothBites — 말은 달라도, 축제의 맛은 함께.",
  description: "작은 축제 부스와 세계의 여행자를 잇는 QR 음식 주문 서비스. 한영 메뉴, 모바일 주문과 픽업 상태를 직접 체험해 보세요.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
