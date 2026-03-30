import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useCreateCheckoutSession } from "../hooks/useQueries";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const { formatPrice } = useCurrency();
  const checkout = useCreateCheckoutSession();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    const successUrl = `${window.location.origin}${window.location.pathname}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}${window.location.pathname}`;

    const shoppingItems = items.map((item) => ({
      productName: `${item.print.title} - ${item.product.productLabel}`,
      currency: "usd",
      quantity: BigInt(item.quantity),
      priceInCents: item.product.price,
      productDescription: `${item.product.printSize.width}x${item.product.printSize.height} ${item.product.finish}`,
    }));

    try {
      const url = await checkout.mutateAsync({
        items: shoppingItems,
        successUrl,
        cancelUrl,
      });
      window.location.href = url;
    } catch {
      toast.error("Checkout failed. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-card border-l border-border flex flex-col"
            data-ocid="cart.panel"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="font-display text-lg uppercase tracking-widest text-foreground">
                  Cart
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                data-ocid="cart.close_button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              {items.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-64 px-6"
                  data-ocid="cart.empty_state"
                >
                  <p className="font-display text-xl uppercase tracking-widest text-muted-foreground mb-2">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Add some prints to get started.
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {items.map((item, idx) => (
                    <div
                      key={`${String(item.print.id)}-${item.product.productLabel}`}
                      data-ocid={`cart.item.${idx + 1}`}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-24 flex-shrink-0 bg-muted overflow-hidden">
                        <img
                          src={item.print.image.getDirectURL()}
                          alt={item.print.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm uppercase tracking-wider text-foreground truncate">
                          {item.print.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {item.product.productLabel}
                        </p>
                        <p className="text-sm font-bold text-foreground mt-2">
                          {formatPrice(
                            item.product.price * BigInt(item.quantity),
                          )}
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(idx, item.quantity - 1)
                            }
                            data-ocid="cart.quantity_minus.button"
                            className="w-6 h-6 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm text-foreground w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(idx, item.quantity + 1)
                            }
                            data-ocid="cart.quantity_plus.button"
                            className="w-6 h-6 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            data-ocid={`cart.delete_button.${idx + 1}`}
                            className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {items.length > 0 && (
              <div className="p-6 border-t border-border">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs tracking-widest uppercase text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-display text-lg font-bold text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Shipping calculated at checkout.
                </p>
                <Button
                  onClick={handleCheckout}
                  disabled={checkout.isPending}
                  data-ocid="cart.checkout.button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs font-bold py-6 rounded-none"
                >
                  {checkout.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Processing…
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
