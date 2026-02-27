import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// ── Google Fonts ──
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ── SEO Metadata ──
export const metadata: Metadata = {
  title: "📒 Ziyaretçi Defteri",
  description:
    "Mesajınızı ve dosyanızı bırakın! Next.js, TanStack Query, Zod ve Vercel Blob ile yapılmış modern bir ziyaretçi defteri uygulaması.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 
          Providers (Client Component):
          - QueryClientProvider → TanStack Query
          - ToastProvider → Radix Toast bildirimleri
          - ReactQueryDevtools → Geliştirme araçları 
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
