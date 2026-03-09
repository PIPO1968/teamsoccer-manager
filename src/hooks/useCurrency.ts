
import { useState, useEffect } from "react";
import { getCurrencyCode } from "@/utils/countryCurrency";

type Rates = Record<string, number>;

// Module-level cache so we only fetch once per session
let cachedRates: Rates | null = null;
let fetchPromise: Promise<Rates | null> | null = null;

async function fetchRates(): Promise<Rates | null> {
  if (cachedRates) return cachedRates;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("https://open.er-api.com/v6/latest/EUR")
    .then((res) => res.json())
    .then((data) => {
      if (data?.rates) {
        cachedRates = data.rates as Rates;
        return cachedRates;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function useCurrency(countryName: string | null | undefined) {
  const currencyCode = getCurrencyCode(countryName);
  const [rates, setRates] = useState<Rates | null>(cachedRates);

  useEffect(() => {
    if (currencyCode === "EUR") return; // no conversion needed
    if (cachedRates) {
      setRates(cachedRates);
      return;
    }
    fetchRates().then((r) => {
      if (r) setRates(r);
    });
  }, [currencyCode]);

  /**
   * Formats a price originally in EUR.
   * - If country uses EUR: returns "€X.XX"
   * - Otherwise: returns "€X.XX (~SYMBOL X.XX)"
   */
  function formatPrice(euros: number): string {
    const eurStr = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(euros);

    if (currencyCode === "EUR" || !rates) return eurStr;

    const rate = rates[currencyCode];
    if (!rate) return eurStr;

    const localAmount = euros * rate;

    // Decide decimal places: JPY, KRW, etc. use 0
    const noDecimals = ["JPY", "KRW", "IDR", "VND", "HUF", "CLP", "PYG", "UGX", "TZS"];
    const fractionDigits = noDecimals.includes(currencyCode) ? 0 : 2;

    const localStr = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(localAmount);

    return `${eurStr} (~${localStr})`;
  }

  return { formatPrice, currencyCode, isLoading: currencyCode !== "EUR" && !rates };
}
