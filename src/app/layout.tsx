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
  title: "Unblock Me Solver",
  description:
    "Solve Unblock Me sliding block puzzles instantly. Build your own custom puzzle on a 6x6 grid, choose from hand-picked presets, and watch the optimal solution animate step by step with adjustable playback speed.",
  keywords: [
    "unblock me",
    "puzzle solver",
    "sliding block puzzle",
    "brain teaser",
    "logic puzzle",
  ],
  openGraph: {
    title: "Unblock Me Solver",
    description:
      "Solve Unblock Me sliding block puzzles instantly. Build your own or pick a preset and watch the solution unfold.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.06), transparent 60%)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
