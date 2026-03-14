import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FraudShield",
  description: "FraudShield landing experience"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--bg-base)] font-sans text-white antialiased">{children}</body>
    </html>
  );
}
