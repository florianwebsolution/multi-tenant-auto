import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Auto-École",
  description: "Votre auto-école de confiance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${figtree.variable} antialiased`} style={{ fontFamily: "var(--font-figtree), 'Figtree', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
