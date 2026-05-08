"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, TrendingDown, Wallet } from "lucide-react"
import { convertAmount, formatCurrency, useCurrency } from "@/lib/currency"

interface BudgetSummaryCardsProps {
  totalBudgeted: number
  totalSpent: number
  remaining: number
}

export function BudgetSummaryCards({
  totalBudgeted,
  totalSpent,
  remaining,
}: BudgetSummaryCardsProps) {
  const { currency, exchangeRate } = useCurrency()
  const toDisplayAmount = (amount: number) =>
    currency === "USD" && exchangeRate
      ? convertAmount(amount, "INR", "USD", exchangeRate)
      : amount
  const cards = [
    {
      title: "Total Budgeted",
      value: totalBudgeted,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Spent",
      value: totalSpent,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Remaining",
      value: remaining,
      icon: Wallet,
      color: remaining >= 0 ? "text-emerald-500" : "text-red-500",
      bgColor: remaining >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgColor}`}
              >
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={`text-2xl font-semibold ${card.color}`}>
                  {formatCurrency(toDisplayAmount(card.value), currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
