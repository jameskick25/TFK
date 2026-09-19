import Navbar from "@/components/Navbar";
import { CartProvider } from "@/components/CartProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <CartProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <CartDrawer />
          <main style={{ flex: '1 0 auto' }}>
            {children}
          </main>
          <Footer />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}
