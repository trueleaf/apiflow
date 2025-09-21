import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "Apiflow - 开源的API 文档、调试、Mock、测试平台。",
    template: "%s | Apiflow"
  },
  description: "开发者喜爱的现代化 API 文档与测试工具。轻松构建、测试和记录您的 API。Postman 和 Apifox 的强大替代品，工作流程快 3 倍。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
