"use client"

import { useEffect, useState } from "react"

export type CurrencyCode = "INR" | "USD"

export const currencyStorageKey = "financeflow_currency"

const exchangeRateStorageKey = "financeflow_usd_inr_rate"
const exchangeRateUrl = "https://api.exchangerate-api.com/v4/latest/USD"
const fiveDaysMs = 5 * 24 * 60 * 60 * 1000

interface CachedExchangeRate {
  rate: number
  fetchedAt: number
}

const currencyConfig: Record<CurrencyCode, { label: string; locale: string }> = {
  INR: { label: "₹ INR", locale: "en-IN" },
  USD: { label: "$ USD", locale: "en-US" },
}

const isBrowser = () => typeof window !== "undefined"

const isCurrencyCode = (value: string | null): value is CurrencyCode =>
  value === "INR" || value === "USD"

const parseCachedExchangeRate = (value: string | null): CachedExchangeRate | null => {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value) as CachedExchangeRate

    if (
      typeof parsed.rate === "number" &&
      parsed.rate > 0 &&
      typeof parsed.fetchedAt === "number"
    ) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

export const getExchangeRate = async (): Promise<number> => {
  if (!isBrowser()) {
    return 84.5
  }

  const cachedRate = parseCachedExchangeRate(
    window.localStorage.getItem(exchangeRateStorageKey),
  )

  if (cachedRate && Date.now() - cachedRate.fetchedAt < fiveDaysMs) {
    return cachedRate.rate
  }

  const response = await fetch(exchangeRateUrl)

  if (!response.ok) {
    if (cachedRate) {
      return cachedRate.rate
    }

    throw new Error("Unable to fetch exchange rate")
  }

  const responseBody = (await response.json()) as { rates?: { INR?: number } }
  const rate = responseBody.rates?.INR

  if (!rate || rate <= 0) {
    if (cachedRate) {
      return cachedRate.rate
    }

    throw new Error("Exchange rate response did not include INR")
  }

  window.localStorage.setItem(
    exchangeRateStorageKey,
    JSON.stringify({ rate, fetchedAt: Date.now() }),
  )

  return rate
}

export const convertAmount = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rate: number,
) => {
  if (fromCurrency === toCurrency) {
    return Number(amount.toFixed(2))
  }

  const convertedAmount =
    fromCurrency === "USD" && toCurrency === "INR"
      ? amount * rate
      : amount / rate

  return Number(convertedAmount.toFixed(2))
}

export const formatCurrency = (amount: number, currency: CurrencyCode) => {
  const normalizedAmount = Number(amount.toFixed(2))

  return normalizedAmount.toLocaleString(currencyConfig[currency].locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const formatCompactCurrency = (amount: number, currency: CurrencyCode) => {
  const symbol = currency === "INR" ? "₹" : "$"
  return `${symbol}${(amount / 1000).toFixed(0)}k`
}

export const getStoredCurrency = (): CurrencyCode => {
  if (!isBrowser()) {
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

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyCode>("INR")
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    setCurrency(getStoredCurrency())
    setIsExchangeRateLoading(true)

    getExchangeRate()
      .then((rate) => {
        if (isMounted) {
          setExchangeRate(rate)
        }
      })
      .catch(() => {
        if (isMounted) {
          setExchangeRate(84.5)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsExchangeRateLoading(false)
        }
      })

    const handleCurrencyChange = () => {
      setCurrency(getStoredCurrency())
    }

    window.addEventListener("storage", handleCurrencyChange)
    window.addEventListener("financeflow:currency-change", handleCurrencyChange)

    return () => {
      isMounted = false
      window.removeEventListener("storage", handleCurrencyChange)
      window.removeEventListener("financeflow:currency-change", handleCurrencyChange)
    }
  }, [])

  const updateCurrency = (nextCurrency: CurrencyCode) => {
    setStoredCurrency(nextCurrency)
    setCurrency(nextCurrency)
  }

  return { currency, setCurrency: updateCurrency, exchangeRate, isExchangeRateLoading }
}
