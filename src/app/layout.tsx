import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LangProviderWrapper } from "./LangProviderWrapper";
import type { Lang } from "@/i18n";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "北欧经济文化中心 | NECEC",
  description: "连接中北欧经济、文化、教育、科技、城市合作的官方枢纽与桥梁平台。提供定制化夏令营、冬令营、政企互访及国际经贸展览服务。",
  keywords: ["北欧经济文化中心", "NECEC", "芬兰夏令营", "极地冬令营", "中芬教育合作", "北欧游学", "政企互访"],
  openGraph: {
    title: "北欧经济文化中心 | NECEC",
    description: "连接中北欧的官方枢纽与桥梁平台",
    url: "https://estfinfuture.com",
    siteName: "NECEC",
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NECEC 官方分享图",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  icons: {
    icon: "/brand/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lang')?.value;
  const initialLang: Lang | undefined = (langCookie === 'fi' || langCookie === 'en') ? langCookie : undefined;

  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-[#000a1a] text-gray-200 min-h-screen flex flex-col`}>
        <LangProviderWrapper initialLang={initialLang}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </LangProviderWrapper>
      </body>
    </html>
  );
}
