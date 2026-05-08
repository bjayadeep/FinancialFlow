"use client"

import { cn } from "@/lib/utils"
import { type CurrencyCode, useCurrency } from "@/lib/currency"

const currencyOptions: { value: CurrencyCode; label: string }[] = [
  { value: "INR", label: "₹ INR" },
  { value: "USD", label: "$ USD" },
]

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()

  return (
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
  )
}
