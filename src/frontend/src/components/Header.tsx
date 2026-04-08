import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Globe, LogOut, ShoppingBag, User } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { CURRENCIES, useCurrency } from "../context/CurrencyContext";

const NAV_LINKS = [
  { label: "Shop", href: "/#featured-prints" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
];

function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}…${principal.slice(-3)}`;
}

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();
  const { currency, setCurrencyCode } = useCurrency();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const currentPath = window.location.pathname;

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const isLoggedIn = loginStatus === "success" && !!identity;

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="font-display text-2xl font-light tracking-wider text-foreground"
        >
          Achromis
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
          {isLoggedIn && (
            <a
              href="/account"
              data-ocid="nav.account.link"
              className={`text-xs tracking-widest uppercase transition-colors ${
                currentPath === "/account"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Account
            </a>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Currency selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCurrencyOpen((v) => !v)}
              data-ocid="header.currency.toggle"
              className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Select currency"
              aria-expanded={currencyOpen}
            >
              <Globe className="h-4 w-4" />
              <span>{currency.code}</span>
            </button>

            {currencyOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  role="button"
                  tabIndex={-1}
                  aria-label="Close currency selector"
                  onClick={() => setCurrencyOpen(false)}
                  onKeyDown={(e) =>
                    e.key === "Escape" && setCurrencyOpen(false)
                  }
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
                        setCurrencyOpen(false);
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

          {/* Sign In / User */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                ref={userButtonRef}
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                data-ocid="header.user.toggle"
                aria-label="Account menu"
                aria-expanded={userOpen}
                className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline font-mono text-[10px] normal-case tracking-normal">
                  {shortenPrincipal(identity.getPrincipal().toText())}
                </span>
              </button>

              {userOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    role="button"
                    tabIndex={-1}
                    aria-label="Close account menu"
                    onClick={() => setUserOpen(false)}
                    onKeyDown={(e) => e.key === "Escape" && setUserOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-8 z-20 bg-card border border-border shadow-lg min-w-[160px]"
                    data-ocid="header.user.dropdown_menu"
                  >
                    <a
                      href="/account"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="h-3.5 w-3.5" />
                      My Account
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setUserOpen(false);
                      }}
                      data-ocid="header.signout.button"
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              data-ocid="header.signin.button"
              aria-label="Sign in"
              className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

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
