import { motion } from "motion/react";
import { useState } from "react";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ShippingBanner from "../components/ShippingBanner";

export default function AboutPage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <ShippingBanner />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-10">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            {" / "}About
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[3/4] overflow-hidden border border-border">
                <img
                  src="/assets/generated/artist-portrait-rohan.dim_600x800.jpg"
                  alt="Rohan Mehta — Photographer"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div className="mt-4">
                <p className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
                  Rohan Mehta
                </p>
                <p className="text-xs tracking-widest uppercase text-muted-foreground mt-0.5">
                  Mumbai, India
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-start pt-2"
            >
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">
                About the Artist
              </p>

              <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-8">
                Rohan Mehta
              </h1>

              <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Rohan Mehta is a self-taught photographer based in Mumbai,
                  India. With over a decade behind the lens, his work spans the
                  quiet drama of fog-laced mountains to the relentless geometry
                  of city streets.
                </p>
                <p>
                  For Rohan, stripping colour from a photograph is not a
                  stylistic choice — it is an act of honesty. Colour seduces. It
                  pulls the eye toward the familiar, toward comfort. Monochrome
                  forces you to look harder, to read light instead of hue, to
                  find structure where there is only shadow.
                </p>
                <p>
                  He shoots on film and digital, processing each print with care
                  to preserve tonal range and shadow depth. His limited edition
                  prints are produced on museum-quality archival and fine art
                  paper, meant to last generations.
                </p>
                <p>
                  Achromis is his print studio — a space where each image is
                  offered as a deliberate, singular object.
                </p>
              </div>

              <blockquote className="mt-10 border-l-2 border-foreground pl-6">
                <p className="font-display text-xl md:text-2xl italic text-foreground leading-snug">
                  &ldquo;When I remove colour, I remove noise. What remains is
                  the thing itself — the weight of a moment, the texture of
                  silence.&rdquo;
                </p>
                <cite className="block mt-3 text-xs tracking-widest uppercase text-muted-foreground not-italic">
                  — Rohan Mehta
                </cite>
              </blockquote>

              <div className="mt-10 pt-8 border-t border-border">
                <a
                  href="/collections"
                  data-ocid="about.collections.link"
                  className="inline-block text-xs tracking-widest uppercase text-foreground border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
                >
                  View Collections
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
