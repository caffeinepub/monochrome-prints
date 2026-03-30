import { Globe, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { CURRENCIES, useCurrency } from "../context/CurrencyContext";

const NAV_LINKS = [
  { label: "Shop", href: "/#featured-prints" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
];

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();
  const { currency, setCurrencyCode } = useCurrency();
  const currentPath = window.location.pathname;
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="font-display text-base font-bold tracking-widest uppercase text-foreground"
        >
          D97 DIMENSION
        </a>

        {/* Nav */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/collections" || item.href === "/about"
                ? currentPath === item.href
                : false;
            return (
              <a
                key={item.label}
                href={item.href}
                data-ocid={`nav.${item.label.toLowerCase()}.link`}
                className={`text-xs tracking-widest uppercase transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Currency selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              data-ocid="header.currency.toggle"
              className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Select currency"
              aria-expanded={open}
            >
              <Globe className="h-4 w-4" />
              <span>{currency.code}</span>
            </button>

            {open && (
              <>
                {/* Click-away backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  role="button"
                  tabIndex={-1}
                  aria-label="Close currency selector"
                  onClick={() => setOpen(false)}
                  onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                />
                <div
                  className="absolute right-0 top-8 z-20 bg-card border border-border shadow-lg min-w-[180px]"
                  data-ocid="header.currency.dropdown_menu"
                >
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCurrencyCode(c.code);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs tracking-wider uppercase transition-colors ${
                        currency.code === c.code
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="font-bold ml-3">{c.code}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart */}
          <button
            type="button"
            onClick={onCartClick}
            data-ocid="header.cart.button"
            className="relative flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
