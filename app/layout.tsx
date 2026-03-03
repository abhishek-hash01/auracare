import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "AuraCare — Your Voice Companion",
  description:
    "AuraCare is a voice-only AI emotional support companion. Talk it out, I'm listening.",
  keywords: ["emotional support", "AI companion", "mental wellness", "voice AI"],
  openGraph: {
    title: "AuraCare — Your Voice Companion",
    description: "Talk it out. I'm listening.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
