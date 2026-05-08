"use client"

import { useEffect, useState } from "react"

export type CurrencyCode = "INR" | "USD"

export const currencyStorageKey = "financeflow_currency"

const currencyConfig: Record<CurrencyCode, { label: string; locale: string }> = {
  INR: { label: "₹ INR", locale: "en-IN" },
  USD: { label: "$ USD", locale: "en-US" },
}

const isCurrencyCode = (value: string | null): value is CurrencyCode =>
  value === "INR" || value === "USD"

export const getStoredCurrency = (): CurrencyCode => {
  if (typeof window === "undefined") {
    return "INR"
  }

  const storedCurrency = window.localStorage.getItem(currencyStorageKey)
  return isCurrencyCode(storedCurrency) ? storedCurrency : "INR"
}

export const setStoredCurrency = (currency: CurrencyCode) => {
  window.localStorage.setItem(currencyStorageKey, currency)
  window.dispatchEvent(new CustomEvent("financeflow:currency-change", { detail: currency }))
}

export const getCurrencyLabel = (currency: CurrencyCode) => currencyConfig[currency].label

export const formatCurrency = (value: number, currency: CurrencyCode) =>
  value.toLocaleString(currencyConfig[currency].locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  })

export const formatCompactCurrency = (value: number, currency: CurrencyCode) => {
  const symbol = currency === "INR" ? "₹" : "$"
  return `${symbol}${(value / 1000).toFixed(0)}k`
}

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyCode>("INR")

  useEffect(() => {
    setCurrency(getStoredCurrency())

    const handleCurrencyChange = () => {
      setCurrency(getStoredCurrency())
    }

    window.addEventListener("storage", handleCurrencyChange)
    window.addEventListener("financeflow:currency-change", handleCurrencyChange)

    return () => {
      window.removeEventListener("storage", handleCurrencyChange)
      window.removeEventListener("financeflow:currency-change", handleCurrencyChange)
    }
  }, [])

  const updateCurrency = (nextCurrency: CurrencyCode) => {
    setStoredCurrency(nextCurrency)
    setCurrency(nextCurrency)
  }

  return { currency, setCurrency: updateCurrency }
}
