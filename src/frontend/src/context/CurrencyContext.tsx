import { createContext, useContext, useState } from "react";

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  rate: number; // relative to INR
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "INR", symbol: "₹", name: "India", rate: 1, locale: "en-IN" },
  {
    code: "USD",
    symbol: "$",
    name: "United States",
    rate: 0.012,
    locale: "en-US",
  },
  { code: "EUR", symbol: "€", name: "Europe", rate: 0.011, locale: "de-DE" },
  {
    code: "GBP",
    symbol: "£",
    name: "United Kingdom",
    rate: 0.0095,
    locale: "en-GB",
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australia",
    rate: 0.018,
    locale: "en-AU",
  },
  { code: "CAD", symbol: "C$", name: "Canada", rate: 0.016, locale: "en-CA" },
  {
    code: "SGD",
    symbol: "S$",
    name: "Singapore",
    rate: 0.016,
    locale: "en-SG",
  },
  { code: "AED", symbol: "AED", name: "UAE", rate: 0.044, locale: "ar-AE" },
  { code: "JPY", symbol: "¥", name: "Japan", rate: 1.78, locale: "ja-JP" },
];

interface CurrencyContextValue {
  currency: CurrencyOption;
  setCurrencyCode: (code: string) => void;
  formatPrice: (paisa: bigint | number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState("INR");
  const currency =
    CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  const formatPrice = (paisa: bigint | number): string => {
    const paisaNum = typeof paisa === "bigint" ? Number(paisa) : paisa;
    const inr = paisaNum / 100;
    const amount = inr * currency.rate;

    if (currency.code === "JPY") {
      return `${currency.symbol}${Math.round(amount).toLocaleString(currency.locale)}`;
    }

    return `${currency.symbol}${amount.toLocaleString(currency.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrencyCode, formatPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
