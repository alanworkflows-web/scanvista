export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "CA$",
  AUD: "AU$",
  JPY: "¥",
  CHF: "CHF",
  SGD: "SG$",
  AED: "AED",
  NZD: "NZ$",
  BRL: "R$",
  MXN: "MX$"
};

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return "$";
  const code = currencyCode.toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
}

export function formatPrice(
  price: number | string | undefined | null,
  currencyCode: string = "USD",
  locale: string = "en-US"
): string {
  const numericPrice = typeof price === "number" ? price : parseFloat(String(price || 0)) || 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: (currencyCode || "USD").toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericPrice);
  } catch (e) {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${numericPrice.toFixed(2)}`;
  }
}
