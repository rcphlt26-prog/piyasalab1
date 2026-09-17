export const formatCurrency = (value: number, currency: "TRY" | "USD" = "TRY") =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
