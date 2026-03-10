import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수학 AI 서비스 | 현장 교사 설문 분석",
  description: "24명의 현장 교사가 말하는 수학 교육의 현실과 AI 서비스에 거는 기대",
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
