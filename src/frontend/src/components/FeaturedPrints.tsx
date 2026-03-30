import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import type { Print, Product } from "../backend";
import ProductCard from "./ProductCard";

const SAMPLE_PRINTS = [
  {
    id: 1n,
    title: "Mountain Mist",
    description:
      "Ethereal fog drifts through ancient mountain peaks in this stunning landscape.",
    active: true,
    image: {
      getDirectURL: () =>
        "/assets/generated/print-mountain-mist.dim_800x1000.jpg",
    } as any,
  },
  {
    id: 2n,
    title: "Urban Geometry",
    description:
      "The sweeping curves of modern architecture cast dramatic light and shadow.",
    active: true,
    image: {
      getDirectURL: () =>
        "/assets/generated/print-urban-geometry.dim_800x1000.jpg",
    } as any,
  },
  {
    id: 3n,
    title: "Ocean Storm",
    description: "Raw power of ocean waves frozen in high contrast monochrome.",
    active: true,
    image: {
      getDirectURL: () =>
        "/assets/generated/print-ocean-storm.dim_800x1000.jpg",
    } as any,
  },
  {
    id: 4n,
    title: "Forest Light",
    description:
      "Ancient trees and divine light converge in this ethereal forest portrait.",
    active: true,
    image: {
      getDirectURL: () =>
        "/assets/generated/print-forest-light.dim_800x1000.jpg",
    } as any,
  },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    printId: 1n,
    finish: "matte" as any,
    productLabel: "8x10 Matte",
    price: 4500n,
    printSize: { width: 8n, height: 10n },
  },
  {
    printId: 1n,
    finish: "glossy" as any,
    productLabel: "16x20 Glossy",
    price: 8500n,
    printSize: { width: 16n, height: 20n },
  },
  {
    printId: 2n,
    finish: "matte" as any,
    productLabel: "8x10 Matte",
    price: 4500n,
    printSize: { width: 8n, height: 10n },
  },
  {
    printId: 2n,
    finish: "satin" as any,
    productLabel: "11x14 Satin",
    price: 6500n,
    printSize: { width: 11n, height: 14n },
  },
  {
    printId: 3n,
    finish: "matte" as any,
    productLabel: "8x10 Matte",
    price: 4500n,
    printSize: { width: 8n, height: 10n },
  },
  {
    printId: 3n,
    finish: "glossy" as any,
    productLabel: "24x36 Glossy",
    price: 14500n,
    printSize: { width: 24n, height: 36n },
  },
  {
    printId: 4n,
    finish: "matte" as any,
    productLabel: "8x10 Matte",
    price: 4500n,
    printSize: { width: 8n, height: 10n },
  },
  {
    printId: 4n,
    finish: "satin" as any,
    productLabel: "11x14 Satin",
    price: 6500n,
    printSize: { width: 11n, height: 14n },
  },
];

interface FeaturedPrintsProps {
  prints: Print[];
  products: Product[];
  isLoading: boolean;
  onSelectPrint: (print: Print) => void;
}

export default function FeaturedPrints({
  prints,
  products,
  isLoading,
  onSelectPrint,
}: FeaturedPrintsProps) {
  const displayPrints: Print[] =
    prints.length > 0 ? prints : (SAMPLE_PRINTS as unknown as Print[]);
  const displayProducts: Product[] =
    products.length > 0 ? products : SAMPLE_PRODUCTS;

  const getMinPrice = (printId: bigint) => {
    const ps = displayProducts.filter((p) => p.printId === printId);
    if (ps.length === 0) return null;
    return ps.reduce((min, p) => (p.price < min ? p.price : min), ps[0].price);
  };

  const skeletonKeys = ["sk1", "sk2", "sk3", "sk4"];

  return (
    <section id="featured-prints" className="bg-background py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
            The Collection
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
            Featured Prints
          </h2>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            data-ocid="prints.loading_state"
          >
            {skeletonKeys.map((k) => (
              <div key={k} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full bg-muted" />
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        ) : displayPrints.length === 0 ? (
          <div
            data-ocid="prints.empty_state"
            className="text-center py-24 border border-border"
          >
            <p className="font-display text-2xl uppercase tracking-widest text-muted-foreground mb-4">
              No prints available yet
            </p>
            <p className="text-sm text-muted-foreground">
              Check back soon or visit the{" "}
              <a href="/admin" className="underline hover:text-foreground">
                admin panel
              </a>{" "}
              to add prints.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            data-ocid="prints.list"
          >
            {displayPrints.map((print, idx) => (
              <ProductCard
                key={String(print.id)}
                print={print}
                minPrice={getMinPrice(print.id)}
                index={idx + 1}
                onClick={() => onSelectPrint(print)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
