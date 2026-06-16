import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AM MODE — Prêt-à-porter",
  description: "L'élégance au naturel. Des coupes nettes et des matières confortables pour le quotidien.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <CartProvider>
          <div className="site-bg"></div>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
