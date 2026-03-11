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
  title: "Twins - AI Writing Style Cloning",
  description: "Clone your unique writing style with AI. Upload your past writings, extract your Style DNA, and generate content that matches your voice.",
  keywords: ["AI", "writing", "style cloning", "content generation", "personalization"],
  authors: [{ name: "Twins" }],
  openGraph: {
    title: "Twins - AI Writing Style Cloning",
    description: "Clone your unique writing style with AI",
    type: "website",
    url: "https://twins.dsx.plus",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
