import type { Metadata } from "next";
import { Inter, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { WebGLBackground } from "@/components/WebGLBackground";
import { GiftBox3D } from "@/components/GiftBox3D";

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
      <body className={`${inter.variable} ${instrumentSerif.variable} ${geistMono.variable} antialiased text-zinc-900 min-h-screen flex flex-col`}>
        <CustomCursor />
        <WebGLBackground />
        <GiftBox3D />
        <NavBar />
        <main className="flex-1 relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
