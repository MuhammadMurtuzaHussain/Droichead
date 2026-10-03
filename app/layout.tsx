import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geist = Geist({ variable: "--font-geist", subsets: ["latin", "latin-ext", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Droichead",
  description: "A calm, private career navigator for the AI era. See what is changing in your industry, find rising roles, and get a dated plan to bridge the gap. In 7 languages.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1411" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-[100dvh] flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
