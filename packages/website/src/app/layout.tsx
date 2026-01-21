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
  metadataBase: new URL('https://apiflow.cn'),
  title: {
    default: "Apiflow - 开源的API 文档、调试、Mock、测试平台。",
    template: "%s | Apiflow"
  },
  description: "Postman 和 Apifox 的强大替代品，工作流程快 3 倍。",
  keywords: ['API', 'Postman', 'Apifox', 'API测试', 'API文档', 'Mock', '开源'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://apiflow.cn',
    siteName: 'Apiflow',
    title: 'Apiflow - 开源的API 文档、调试、Mock、测试平台',
    description: 'Postman 和 Apifox 的强大替代品，工作流程快 3 倍。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Apiflow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apiflow - 开源的API 文档、调试、Mock、测试平台',
    description: 'Postman 和 Apifox 的强大替代品，工作流程快 3 倍。',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-7GB2601HMR"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7GB2601HMR');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
