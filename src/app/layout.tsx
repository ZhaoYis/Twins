import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="zh" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} antialiased font-sans`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
