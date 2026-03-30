import { motion } from "motion/react";
import type { Print } from "../backend";
import { useCurrency } from "../context/CurrencyContext";

interface ProductCardProps {
  print: Print;
  minPrice: bigint | null;
  index: number;
  onClick: () => void;
}

export default function ProductCard({
  print,
  minPrice,
  index,
  onClick,
}: ProductCardProps) {
  const { formatPrice } = useCurrency();

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      data-ocid={`prints.item.${index}`}
      className="group cursor-pointer"
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={onClick}
        aria-label={`View ${print.title}`}
      >
        {/* Image */}
        <div className="aspect-[4/5] overflow-hidden bg-card mb-4 relative">
          <img
            src={print.image.getDirectURL()}
            alt={print.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
          {/* Quick view overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-xs tracking-widest uppercase text-foreground text-center">
              Quick View
            </p>
          </div>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground mb-1">
            {print.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {minPrice !== null
              ? `From ${formatPrice(minPrice)}`
              : "Inquire for pricing"}
          </p>
        </div>
      </button>
    </motion.article>
  );
}
