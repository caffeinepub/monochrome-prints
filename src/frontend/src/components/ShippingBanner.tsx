import { Package } from "lucide-react";

export default function ShippingBanner() {
  return (
    <div className="w-full bg-muted/40 border-b border-border flex items-center justify-center gap-2 py-2 px-4">
      <Package className="h-3 w-3 text-muted-foreground shrink-0" />
      <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground text-center">
        Prints ship worldwide&nbsp;&nbsp;·&nbsp;&nbsp;Frames available in India
        only
      </p>
    </div>
  );
}
