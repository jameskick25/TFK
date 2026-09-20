import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import MetaPixel from "@/components/MetaPixel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TFK Store — Boutique de Vêtements & Accessoires Téléphone",
  description: "Découvrez notre collection de vêtements modernes et nos accessoires téléphoniques premium. Style et élégance pour tous.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <MetaPixel />
        <CartProvider>
          <div className="site-bg"></div>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
