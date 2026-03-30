import { useState } from "react";
import type { Print, Product } from "../backend";
import CartDrawer from "../components/CartDrawer";
import FeaturedPrints from "../components/FeaturedPrints";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import ProductDetailModal from "../components/ProductDetailModal";
import ShippingBanner from "../components/ShippingBanner";
import { useActivePrints, useAllProducts } from "../hooks/useQueries";

export default function StorefrontPage() {
  const { data: prints = [], isLoading } = useActivePrints();
  const { data: products = [] } = useAllProducts();
  const [selectedPrint, setSelectedPrint] = useState<Print | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const productsForPrint = (printId: bigint): Product[] =>
    products.filter((p) => p.printId === printId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <ShippingBanner />

      <main className="flex-1">
        <HeroSection />
        <FeaturedPrints
          prints={prints}
          products={products}
          isLoading={isLoading}
          onSelectPrint={setSelectedPrint}
        />
      </main>

      <Footer />

      {selectedPrint && (
        <ProductDetailModal
          print={selectedPrint}
          products={productsForPrint(selectedPrint.id)}
          onClose={() => setSelectedPrint(null)}
        />
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
