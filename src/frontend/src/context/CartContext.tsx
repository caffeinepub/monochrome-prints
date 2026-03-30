import { type ReactNode, createContext, useContext, useState } from "react";
import type { Print, Product } from "../backend";

export interface CartItem {
  print: Print;
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (print: Print, product: Product) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (print: Print, product: Product) => {
    setItems((prev) => {
      const existing = prev.findIndex(
        (i) =>
          i.print.id === print.id &&
          i.product.productLabel === product.productLabel,
      );
      if (existing >= 0) {
        return prev.map((item, idx) =>
          idx === existing ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { print, product, quantity: 1 }];
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
