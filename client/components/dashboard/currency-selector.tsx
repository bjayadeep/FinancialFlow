"use client"

import { cn } from "@/lib/utils"
import { formatCurrency, type CurrencyCode, useCurrency } from "@/lib/currency"

const currencyOptions: { value: CurrencyCode; label: string }[] = [
  { value: "INR", label: "₹ INR" },
  { value: "USD", label: "$ USD" },
]

export function CurrencySelector() {
  const { currency, setCurrency, exchangeRate, isExchangeRateLoading } = useCurrency()

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
        {currencyOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setCurrency(option.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              currency === option.value
                ? "bg-emerald-500 text-zinc-950"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
        {isExchangeRateLoading || !exchangeRate
          ? "Loading rate..."
          : `1 USD = ${formatCurrency(exchangeRate, "INR")}`}
      </span>
    </div>
  )
}
