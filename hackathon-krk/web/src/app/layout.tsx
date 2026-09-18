import type { Metadata } from "next";
import { SolanaProvider } from "@/components/SolanaProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pico — AI tools. Real control. On-chain.",
  description:
    "Give your AI a budget, not your wallet. Pay per tool call on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
