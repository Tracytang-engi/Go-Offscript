import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "go offscript — AI career companion",
  description:
    "Upload your CV, chat with Nova, and map real career paths, opportunities, mentors & scholarships. Built for students who want to go off script.",
  openGraph: {
    title: "go offscript — AI career companion",
    description: "bestie, your degree doesn't define you. find paths that actually fit.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
