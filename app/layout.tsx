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
  openGraph: {
    title: "Droichead: bridge the gap to the job that's coming",
    description: "Rising roles, honest gap analysis and a dated plan, in 7 languages. Built in Dublin for Hack for Humanity.",
    images: ["https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Samuel_Beckett_Bridge%2C_Dublin_20150807_1.jpg/1920px-Samuel_Beckett_Bridge%2C_Dublin_20150807_1.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#07110e", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-[100dvh] flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn btn-primary">
          Skip to content
        </a>
        <div className="ambient" aria-hidden />
        <div className="grain" aria-hidden />
        <Providers>
          <Header />
          <main id="main" className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
