import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "브레이크타임 — 최적 휴가 플래너",
  description:
    "남은 연차를 최대한 활용할 수 있는 최적의 휴가 기간을 찾아드립니다.",
  keywords: ["연차", "휴가", "공휴일", "황금연휴", "브릿지 데이"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
