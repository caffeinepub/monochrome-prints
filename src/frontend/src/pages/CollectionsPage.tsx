import { motion } from "motion/react";
import { useState } from "react";
import type { Print } from "../backend";
import { ExternalBlob } from "../backend";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductDetailModal from "../components/ProductDetailModal";
import ShippingBanner from "../components/ShippingBanner";

type Category =
  | "All"
  | "Nature"
  | "Architecture"
  | "Street"
  | "Portrait"
  | "Abstract"
  | "Cityscape";

interface DummyPrint {
  id: bigint;
  title: string;
  category: Exclude<Category, "All">;
  image: string;
  isLandscape?: boolean;
}

const IMAGES = [
  "/assets/generated/print-mountain-mist.dim_800x1000.jpg", // portrait [0]
  "/assets/generated/print-urban-geometry.dim_800x1000.jpg", // portrait [1]
  "/assets/generated/print-ocean-storm.dim_800x1000.jpg", // portrait [2]
  "/assets/generated/print-forest-light.dim_800x1000.jpg", // portrait [3]
  "/assets/generated/print-bridge-dusk.dim_1000x700.jpg", // landscape [4]
  "/assets/generated/print-coastal-wide.dim_1000x700.jpg", // landscape [5]
  "/assets/generated/print-mountain-wide.dim_1000x700.jpg", // landscape [6]
];

const DUMMY_PRINTS: DummyPrint[] = [
  { id: 1n, title: "Morning Fog", category: "Nature", image: IMAGES[0] },
  {
    id: 2n,
    title: "Cathedral Arch",
    category: "Architecture",
    image: IMAGES[1],
  },
  { id: 3n, title: "Wet Pavement", category: "Street", image: IMAGES[1] },
  { id: 4n, title: "Solitude", category: "Portrait", image: IMAGES[3] },
  {
    id: 5n,
    title: "Fracture Lines",
    category: "Abstract",
    image: IMAGES[4],
    isLandscape: true,
  },
  { id: 6n, title: "Steel Horizon", category: "Cityscape", image: IMAGES[1] },
  { id: 7n, title: "Silent Pines", category: "Nature", image: IMAGES[3] },
  { id: 8n, title: "Ribbed Vault", category: "Architecture", image: IMAGES[1] },
  { id: 9n, title: "Night Market", category: "Street", image: IMAGES[1] },
  { id: 10n, title: "The Gaze", category: "Portrait", image: IMAGES[3] },
  {
    id: 11n,
    title: "Grain Study",
    category: "Abstract",
    image: IMAGES[5],
    isLandscape: true,
  },
  { id: 12n, title: "Overpass", category: "Cityscape", image: IMAGES[1] },
  { id: 13n, title: "Valley Mist", category: "Nature", image: IMAGES[0] },
  { id: 14n, title: "Iron Facade", category: "Architecture", image: IMAGES[1] },
  { id: 15n, title: "Rain on Glass", category: "Street", image: IMAGES[2] },
  { id: 16n, title: "Still Life I", category: "Portrait", image: IMAGES[3] },
  {
    id: 17n,
    title: "Negative Space",
    category: "Abstract",
    image: IMAGES[6],
    isLandscape: true,
  },
  { id: 18n, title: "High Rise", category: "Cityscape", image: IMAGES[1] },
  { id: 19n, title: "Winter Shore", category: "Nature", image: IMAGES[2] },
  {
    id: 20n,
    title: "Stone Colonnade",
    category: "Architecture",
    image: IMAGES[1],
  },
  { id: 21n, title: "Underpass", category: "Street", image: IMAGES[1] },
  { id: 22n, title: "The Elder", category: "Portrait", image: IMAGES[3] },
  {
    id: 23n,
    title: "Texture No. 4",
    category: "Abstract",
    image: IMAGES[4],
    isLandscape: true,
  },
  { id: 24n, title: "Rooftops", category: "Cityscape", image: IMAGES[1] },
  { id: 25n, title: "Birch Forest", category: "Nature", image: IMAGES[3] },
  {
    id: 26n,
    title: "Spiral Stair",
    category: "Architecture",
    image: IMAGES[1],
  },
  { id: 27n, title: "Alley Light", category: "Street", image: IMAGES[1] },
  { id: 28n, title: "Introspection", category: "Portrait", image: IMAGES[3] },
  {
    id: 29n,
    title: "Motion Blur",
    category: "Abstract",
    image: IMAGES[5],
    isLandscape: true,
  },
  { id: 30n, title: "Bridge at Dusk", category: "Cityscape", image: IMAGES[1] },
  { id: 31n, title: "Stormy Summit", category: "Nature", image: IMAGES[0] },
  {
    id: 32n,
    title: "Brutalist Block",
    category: "Architecture",
    image: IMAGES[1],
  },
  { id: 33n, title: "Corner Shop", category: "Street", image: IMAGES[1] },
  { id: 34n, title: "Hands", category: "Portrait", image: IMAGES[3] },
  {
    id: 35n,
    title: "Light Leak",
    category: "Abstract",
    image: IMAGES[6],
    isLandscape: true,
  },
  { id: 36n, title: "Fog Line", category: "Cityscape", image: IMAGES[1] },
  { id: 37n, title: "Dry Creek", category: "Nature", image: IMAGES[3] },
  {
    id: 38n,
    title: "Concrete Wing",
    category: "Architecture",
    image: IMAGES[1],
  },
  { id: 39n, title: "Vendor", category: "Street", image: IMAGES[3] },
  { id: 40n, title: "Dusk Study", category: "Portrait", image: IMAGES[3] },
  {
    id: 41n,
    title: "Scatter",
    category: "Abstract",
    image: IMAGES[4],
    isLandscape: true,
  },
  { id: 42n, title: "Signal Tower", category: "Cityscape", image: IMAGES[1] },
  { id: 43n, title: "Ocean Storm", category: "Nature", image: IMAGES[2] },
  { id: 44n, title: "Glass Tower", category: "Architecture", image: IMAGES[1] },
  { id: 45n, title: "Crossing", category: "Street", image: IMAGES[1] },
  { id: 46n, title: "Quiet Mind", category: "Portrait", image: IMAGES[3] },
  {
    id: 47n,
    title: "Form Study",
    category: "Abstract",
    image: IMAGES[5],
    isLandscape: true,
  },
  { id: 48n, title: "Metro", category: "Cityscape", image: IMAGES[1] },
  { id: 49n, title: "Forest Floor", category: "Nature", image: IMAGES[3] },
  { id: 50n, title: "The Archive", category: "Architecture", image: IMAGES[1] },
];

const CATEGORIES: Category[] = [
  "All",
  "Nature",
  "Architecture",
  "Street",
  "Portrait",
  "Abstract",
  "Cityscape",
];

function dummyToBackendPrint(d: DummyPrint): Print {
  return {
    id: d.id,
    title: d.title,
    active: true,
    description: `A striking monochrome study — ${d.title}. Limited edition fine art print by Rohan Mehta.`,
    image: ExternalBlob.fromURL(d.image),
  };
}

interface PrintCardProps {
  print: DummyPrint;
  idx: number;
  onClick: () => void;
}

function PrintCard({ print, idx, onClick }: PrintCardProps) {
  return (
    <motion.button
      type="button"
      key={print.id.toString()}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: idx * 0.02 }}
      data-ocid={`collections.item.${idx + 1}`}
      className="group relative cursor-pointer overflow-hidden border border-border bg-card text-left w-full"
      onClick={onClick}
      aria-label={`View ${print.title}`}
    >
      <div
        className={`overflow-hidden ${print.isLandscape ? "aspect-[5/4]" : "aspect-[4/5]"}`}
      >
        <img
          src={print.image}
          alt={print.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300 flex items-end">
        <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 w-full p-3 bg-background/90">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
            {print.category}
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {print.title}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function CollectionsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedPrint, setSelectedPrint] = useState<Print | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered =
    activeCategory === "All"
      ? DUMMY_PRINTS
      : DUMMY_PRINTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <ShippingBanner />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
              <a href="/" className="hover:text-foreground transition-colors">
                Home
              </a>
              {" / "}Collections
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
              Collections
            </h1>
          </div>

          <div
            className="flex flex-wrap gap-2 mb-10"
            role="tablist"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                data-ocid="collections.filter.tab"
                className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
                  activeCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filtered.map((print, idx) => (
              <PrintCard
                key={print.id.toString()}
                print={print}
                idx={idx}
                onClick={() => setSelectedPrint(dummyToBackendPrint(print))}
              />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div
              data-ocid="collections.empty_state"
              className="text-center py-24"
            >
              <p className="text-muted-foreground text-sm">
                No prints in this category yet.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedPrint && (
        <ProductDetailModal
          print={selectedPrint}
          products={[]}
          onClose={() => setSelectedPrint(null)}
        />
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
