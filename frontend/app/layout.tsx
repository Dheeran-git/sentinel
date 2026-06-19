import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SENTINEL — See it. Prove it. Act on it.",
  description:
    "Report a civic environmental violation and watch an agent identify the law, draft the action, and prepare it for your approval.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-stone-900">
        {children}
      </body>
    </html>
  );
}
