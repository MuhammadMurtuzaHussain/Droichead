import type { Metadata, Viewport } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "latin-ext", "cyrillic"] });
const serif = Source_Serif_4({ variable: "--font-serif4", subsets: ["latin", "latin-ext", "cyrillic"] });

export const metadata: Metadata = {
  title: "Droichead: bridge the gap",
  description: "A calm, private career navigator for the AI era. See what's changing in your industry, find rising roles, and get a dated plan to bridge the gap. Available in 7 languages.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#08483a" },
    { media: "(prefers-color-scheme: dark)", color: "#0e2b24" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <Header />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
