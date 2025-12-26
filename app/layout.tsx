import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fridge Chef - 냉장고 셰프",
  description: "AI가 냉장고 재료로 한국 레시피를 추천해드립니다",
  manifest: "/manifest.json",
  themeColor: "#2dd4bf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ paddingBottom: '70px' }}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
