import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Go Off Script — AI Career Companion",
  description:
    "An AI career companion that reads your CV, learns your values, and finds real paths you haven't considered. Built by Cambridge students.",
  openGraph: {
    title: "Go Off Script — AI Career Companion",
    description:
      "Stop following the default path. Nova helps you find the career that actually fits you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
