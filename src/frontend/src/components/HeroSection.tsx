import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function HeroSection() {
  const scrollToShop = () => {
    document
      .getElementById("featured-prints")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      aria-label="Hero"
      style={{
        backgroundImage: `url('/assets/uploads/img_2025-10-18_01_00_28-019d3917-9806-753e-998e-a47f0c7c9d12-1.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" style={{ zIndex: 0 }} />

      {/* Content */}
      <div className="relative w-full" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/80 mb-8 font-medium">
              Monochrome Prints &nbsp;·&nbsp; Limited Edition
            </p>

            <h1
              className="font-display font-light leading-none text-white mb-8"
              style={{
                fontSize: "clamp(3.5rem, 10vw, 9rem)",
                letterSpacing: "0.08em",
              }}
            >
              Achromis
            </h1>

            <p className="text-white/60 text-sm md:text-base max-w-sm mb-10 leading-loose tracking-wide">
              Curated greyscale prints for discerning collectors.
              <br />
              Archival museum-grade paper. Ships worldwide.
            </p>

            <div className="flex flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToShop}
                data-ocid="hero.primary_button"
                className="bg-white text-black hover:bg-white/90 uppercase tracking-[0.2em] text-[10px] font-bold px-8 py-6 rounded-none"
              >
                Shop Prints
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  window.location.href = "/collections";
                }}
                data-ocid="hero.secondary_button"
                className="border-white/30 text-white/70 hover:text-white hover:border-white/60 uppercase tracking-[0.2em] text-[10px] font-bold px-8 py-6 rounded-none bg-transparent"
              >
                View Collections
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
