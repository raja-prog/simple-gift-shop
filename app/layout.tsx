import type { Metadata } from "next";
import { Inter, Fraunces, Geist_Mono, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ClientDecor } from "@/components/ClientDecor";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { LanguageProvider } from "@/components/LanguageProvider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
});

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Divs Aesthetix Gift";
export const metadata: Metadata = {
  title: STORE_NAME,
  description: `${STORE_NAME} - where "this reminded me of you" lives`,
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${instrumentSerif.variable} ${geistMono.variable} ${notoTamil.variable} antialiased text-zinc-900 min-h-screen flex flex-col`}>
        <LanguageProvider>
          <ClientDecor />
          <NavBar />
          <main className="flex-1 relative">
            {children}
          </main>
          <FloatingWhatsApp />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
