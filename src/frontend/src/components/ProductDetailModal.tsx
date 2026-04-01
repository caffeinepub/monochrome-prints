import { Button } from "@/components/ui/button";
import { ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Print, Product } from "../backend";
import { PrintFinish } from "../backend";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";

interface ProductDetailModalProps {
  print: Print;
  products: Product[];
  onClose: () => void;
}

const SIZES = [
  { label: "Small", dimensions: "8×10 in", price: 450000n },
  { label: "Medium", dimensions: "12×16 in", price: 750000n },
  { label: "Large", dimensions: "20×24 in", price: 1450000n },
] as const;

const FRAMES = ["None", "Black", "White", "Wood"] as const;
const PAPERS = ["Archival Paper", "Art Paper"] as const;
const FRAME_SURCHARGE = 200000n;

type SizeLabel = (typeof SIZES)[number]["label"];
type FrameOption = (typeof FRAMES)[number];
type PaperOption = (typeof PAPERS)[number];

type RoomScene = "Bedroom" | "Living Room" | "Office";

const SIZE_WIDTHS: Record<SizeLabel, string> = {
  Small: "11%",
  Medium: "16%",
  Large: "22%",
};

const ROOM_SCENES: {
  label: RoomScene;
  image: string;
  printStyle: React.CSSProperties;
}[] = [
  {
    label: "Bedroom",
    image: "/assets/generated/room-bedroom-v3.dim_1200x800.jpg",
    printStyle: {
      top: "12%",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
  {
    label: "Living Room",
    image: "/assets/generated/room-living-v3.dim_1200x800.jpg",
    printStyle: {
      top: "10%",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
  {
    label: "Office",
    image: "/assets/generated/room-office-v2.dim_1200x800.jpg",
    printStyle: {
      top: "10%",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
];

const _FRAME_SWATCHES: Record<FrameOption, React.ReactNode> = {
  None: null,
  Black: <span className="inline-block w-3 h-3 bg-[#1a1a1a] shrink-0" />,
  White: (
    <span className="inline-block w-3 h-3 bg-[#f5f5f0] border border-border shrink-0" />
  ),
  Wood: <span className="inline-block w-3 h-3 bg-[#d4b06a] shrink-0" />,
};

// ---------------------------------------------------------------------------
// Canvas-based framed print renderer
// ---------------------------------------------------------------------------

interface CanvasFramedPrintProps {
  printImageUrl: string;
  frame: FrameOption;
  /** Width of the canvas in CSS pixels. Height is calculated from image aspect ratio. */
  canvasWidth?: number;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: Exclude<FrameOption, "None">,
  fw: number, // frame thickness in pixels
  W: number,
  H: number,
) {
  type FaceStops = {
    top: [string, string];
    bottom: [string, string];
    left: [string, string];
    right: [string, string];
  };

  const mats: Record<Exclude<FrameOption, "None">, FaceStops> = {
    Black: {
      top: ["#4a4a4a", "#1a1a1a"],
      bottom: ["#0d0d0d", "#2d2d2d"],
      left: ["#444444", "#1a1a1a"],
      right: ["#111111", "#333333"],
    },
    White: {
      top: ["#fafaf8", "#d0cec8"],
      bottom: ["#b8b6b0", "#d8d6d0"],
      left: ["#f5f3ee", "#ccc9c2"],
      right: ["#bbb9b3", "#d5d3cd"],
    },
    Wood: {
      top: ["#e2c98a", "#c8a96a"],
      bottom: ["#b89558", "#d4b478"],
      left: ["#dfc585", "#c4a462"],
      right: ["#b09050", "#cba86e"],
    },
  };

  const m = mats[frame];

  function drawFace(
    pts: [number, number][],
    gradX1: number,
    gradY1: number,
    gradX2: number,
    gradY2: number,
    c1: string,
    c2: string,
  ) {
    const grad = ctx.createLinearGradient(gradX1, gradY1, gradX2, gradY2);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  drawFace(
    [
      [0, 0],
      [W, 0],
      [W - fw, fw],
      [fw, fw],
    ],
    0,
    0,
    0,
    fw,
    m.top[0],
    m.top[1],
  );
  drawFace(
    [
      [0, H],
      [W, H],
      [W - fw, H - fw],
      [fw, H - fw],
    ],
    0,
    H - fw,
    0,
    H,
    m.bottom[0],
    m.bottom[1],
  );
  drawFace(
    [
      [0, 0],
      [fw, fw],
      [fw, H - fw],
      [0, H],
    ],
    0,
    0,
    fw,
    0,
    m.left[0],
    m.left[1],
  );
  drawFace(
    [
      [W, 0],
      [W - fw, fw],
      [W - fw, H - fw],
      [W, H],
    ],
    W - fw,
    0,
    W,
    0,
    m.right[0],
    m.right[1],
  );

  if (frame === "Black") {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fw, fw);
    ctx.lineTo(W - fw, fw);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fw, fw);
    ctx.lineTo(fw, H - fw);
    ctx.stroke();
    ctx.restore();
  }

  if (frame === "White") {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,240,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.stroke();
    ctx.restore();
  }

  if (frame === "Wood") {
    ctx.save();

    function drawGrainOnFace(
      pts: [number, number][],
      faceX: number,
      faceY: number,
      faceW: number,
      faceH: number,
      horizontal: boolean,
    ) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.clip();

      const step = 2.5;
      const count = Math.ceil((horizontal ? faceH : faceW) / step) + 2;

      for (let i = 0; i < count; i++) {
        const opacity = 0.08 + Math.random() * 0.22;
        const lw = 0.4 + Math.random() * 0.7;
        const isRing = i % Math.floor(7 + Math.random() * 8) === 0;
        const ringOpacity = isRing ? opacity * 1.6 : opacity;
        const color =
          i % 3 === 0
            ? `rgba(120,80,20,${ringOpacity})`
            : `rgba(180,140,60,${ringOpacity * 0.75})`;

        ctx.beginPath();
        ctx.lineWidth = lw;
        ctx.strokeStyle = color;

        if (horizontal) {
          const y = faceY + i * step;
          const wave = Math.random() * 2 - 1;
          ctx.moveTo(faceX, y);
          ctx.quadraticCurveTo(
            faceX + faceW * 0.5,
            y + wave,
            faceX + faceW,
            y + (Math.random() * 1.5 - 0.75),
          );
        } else {
          const x = faceX + i * step;
          const wave = Math.random() * 2 - 1;
          ctx.moveTo(x, faceY);
          ctx.quadraticCurveTo(
            x + wave,
            faceY + faceH * 0.5,
            x + (Math.random() * 1.5 - 0.75),
            faceY + faceH,
          );
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    drawGrainOnFace(
      [
        [0, 0],
        [W, 0],
        [W - fw, fw],
        [fw, fw],
      ],
      0,
      0,
      W,
      fw,
      true,
    );
    drawGrainOnFace(
      [
        [0, H],
        [W, H],
        [W - fw, H - fw],
        [fw, H - fw],
      ],
      0,
      H - fw,
      W,
      fw,
      true,
    );
    drawGrainOnFace(
      [
        [0, 0],
        [fw, fw],
        [fw, H - fw],
        [0, H],
      ],
      0,
      0,
      fw,
      H,
      false,
    );
    drawGrainOnFace(
      [
        [W, 0],
        [W - fw, fw],
        [W - fw, H - fw],
        [W, H],
      ],
      W - fw,
      0,
      fw,
      H,
      false,
    );

    ctx.strokeStyle = "rgba(255,240,200,0.25)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.stroke();

    ctx.restore();
  }
}

function CanvasFramedPrint({
  printImageUrl,
  frame,
  canvasWidth = 600,
}: CanvasFramedPrintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspectRatio, setAspectRatio] = useState(1.25);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const naturalAspect = img.naturalHeight / img.naturalWidth;
      setAspectRatio(naturalAspect);

      const W = canvasWidth;
      const H = Math.round(W * naturalAspect);
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);

      const hasFrame = frame !== "None";
      const fw = hasFrame ? Math.round(W * 0.07) : 0;
      const matPad = Math.round(W * 0.045);
      const filletW = hasFrame ? 2 : 0;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = hasFrame ? 28 : 18;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "transparent";
      ctx.fillRect(fw, fw, W - fw * 2, H - fw * 2);
      ctx.restore();

      ctx.fillStyle = "#f2ede6";
      ctx.fillRect(fw, fw, W - fw * 2, H - fw * 2);

      const photoX = fw + matPad;
      const photoY = fw + matPad;
      const photoW = W - fw * 2 - matPad * 2;
      const photoH = H - fw * 2 - matPad * 2;
      ctx.drawImage(img, photoX, photoY, photoW, photoH);

      if (hasFrame && filletW > 0) {
        ctx.strokeStyle = "#2a2018";
        ctx.lineWidth = filletW;
        ctx.strokeRect(fw + 0.5, fw + 0.5, W - fw * 2 - 1, H - fw * 2 - 1);
      }

      if (hasFrame) {
        drawFrame(ctx, frame as Exclude<FrameOption, "None">, fw, W, H);
      }

      setLoaded(true);
    };

    img.onerror = () => {
      const W = canvasWidth;
      const H = Math.round(W * aspectRatio);
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#e8e5e0";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#999";
      ctx.font = `${W * 0.04}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Image unavailable", W / 2, H / 2);
      setLoaded(true);
    };

    img.src = printImageUrl;
  }, [printImageUrl, frame, canvasWidth, aspectRatio]);

  const canvasHeight = Math.round(canvasWidth * aspectRatio);

  return (
    <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#e8e5e0",
            minHeight: 80,
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        aria-label="Framed print preview"
      />
    </div>
  );
}

interface RoomMockupProps {
  printImageUrl: string;
  frame: FrameOption;
  size: SizeLabel;
}

function RoomMockup({ printImageUrl, frame, size }: RoomMockupProps) {
  const [activeRoom, setActiveRoom] = useState<RoomScene>("Bedroom");
  const scene = ROOM_SCENES.find((r) => r.label === activeRoom)!;
  const printWidth = SIZE_WIDTHS[size];

  return (
    <div className="mt-6">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
        View in Your Space
      </p>

      {/* Room tabs */}
      <div className="flex gap-1 mb-3">
        {ROOM_SCENES.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setActiveRoom(r.label)}
            className={`px-3 py-1.5 text-[10px] tracking-wider uppercase border transition-colors ${
              activeRoom === r.label
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Room scene */}
      <div
        className="relative w-full overflow-hidden"
        style={{ paddingBottom: "66.67%" }}
      >
        <img
          src={scene.image}
          alt={`Print displayed in a ${activeRoom}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute"
          style={{ ...scene.printStyle, width: printWidth }}
        >
          <CanvasFramedPrint
            printImageUrl={printImageUrl}
            frame={frame}
            canvasWidth={320}
          />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Mockup for visual reference only. Actual proportions may vary.
      </p>
    </div>
  );
}

export default function ProductDetailModal({
  print,
  onClose,
}: ProductDetailModalProps) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [selectedSize, setSelectedSize] = useState<SizeLabel>("Medium");
  const [selectedFrame, setSelectedFrame] = useState<FrameOption>("None");
  const [selectedPaper, setSelectedPaper] =
    useState<PaperOption>("Archival Paper");

  const sizeData = SIZES.find((s) => s.label === selectedSize)!;
  const hasFrame = selectedFrame !== "None";
  const totalPrice = sizeData.price + (hasFrame ? FRAME_SURCHARGE : 0n);

  const handleAddToCart = () => {
    const syntheticProduct: Product = {
      printId: print.id,
      finish: PrintFinish.matte,
      productLabel: `${print.title} — ${selectedSize}, ${selectedPaper}${hasFrame ? `, ${selectedFrame} Frame` : ""}`,
      price: totalPrice,
      printSize: {
        width:
          sizeData.label === "Small"
            ? 8n
            : sizeData.label === "Medium"
              ? 12n
              : 20n,
        height:
          sizeData.label === "Small"
            ? 10n
            : sizeData.label === "Medium"
              ? 16n
              : 24n,
      },
    };
    addItem(print, syntheticProduct);
    toast.success(`${print.title} added to cart`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        data-ocid="product.modal"
      >
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="presentation"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 bg-card border border-border w-full max-w-5xl max-h-[90vh] overflow-auto flex flex-col md:flex-row shadow-gallery"
        >
          <button
            type="button"
            onClick={onClose}
            data-ocid="product.close_button"
            className="absolute top-4 right-4 z-20 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left: Image + Room Mockup */}
          <div className="md:w-1/2 flex flex-col">
            <div className="aspect-[4/5]">
              <img
                src={print.image.getDirectURL()}
                alt={print.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 border-t border-border bg-card">
              <RoomMockup
                printImageUrl={print.image.getDirectURL()}
                frame={selectedFrame}
                size={selectedSize}
              />
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:w-1/2 p-8 flex flex-col justify-start">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
              Monochrome Print
            </p>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-3">
              {print.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {print.description}
            </p>

            <div className="mb-6">
              <p className="font-display text-2xl font-bold text-foreground">
                {formatPrice(totalPrice)}
              </p>
              {hasFrame && (
                <p className="text-xs text-muted-foreground mt-1">
                  Includes frame surcharge (+{formatPrice(FRAME_SURCHARGE)})
                </p>
              )}
            </div>

            {/* Size selector */}
            <div className="mb-5">
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => setSelectedSize(size.label)}
                    data-ocid="product.size.button"
                    className={`px-3 py-2 text-xs tracking-wider border transition-colors ${
                      selectedSize === size.label
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-medium">{size.label}</span>
                    <span className="ml-1 opacity-70">{size.dimensions}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame selector */}
            <div className="mb-5">
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Frame
              </p>
              <div className="flex flex-wrap gap-2">
                {FRAMES.map((frame) => (
                  <button
                    key={frame}
                    type="button"
                    onClick={() => setSelectedFrame(frame)}
                    data-ocid="product.frame.button"
                    className={`px-3 py-2 text-xs tracking-wider border transition-colors ${
                      selectedFrame === frame
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {frame}
                  </button>
                ))}
              </div>
              {hasFrame && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Frame adds {formatPrice(FRAME_SURCHARGE)}
                </p>
              )}
            </div>

            {/* Paper selector */}
            <div className="mb-7">
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Paper
              </p>
              <div className="flex flex-wrap gap-2">
                {PAPERS.map((paper) => (
                  <button
                    key={paper}
                    type="button"
                    onClick={() => setSelectedPaper(paper)}
                    data-ocid="product.paper.button"
                    className={`px-3 py-2 text-xs tracking-wider border transition-colors ${
                      selectedPaper === paper
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {paper}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              data-ocid="product.submit_button"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs font-bold py-6 rounded-none"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
