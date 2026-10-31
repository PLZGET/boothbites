import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoothBites — Less waiting. More tasting.",
  description: "A little bite, a lot of festival. Bilingual food ordering and pickup for small Korean festival booths. Interactive demo; no real payments.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
