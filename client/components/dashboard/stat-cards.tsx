"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, useCurrency } from "@/lib/currency"

interface StatCardProps {
  title: string
  value: string
  meta: string
  trend: "up" | "down"
  icon: React.ElementType
}

function StatCard({ title, value, meta, trend, icon: Icon }: StatCardProps) {
  const isPositive = trend === "up"

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              isPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {meta}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-card-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardsProps {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  mostRecentMonth: string
  savingsRate: number
}

export function StatCards({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  mostRecentMonth,
  savingsRate,
}: StatCardsProps) {
  const { currency } = useCurrency()
  const stats: StatCardProps[] = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance, currency),
      meta: totalBalance >= 0 ? "positive" : "negative",
      trend: totalBalance >= 0 ? "up" : "down",
      icon: Wallet,
    },
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome, currency),
      meta: mostRecentMonth,
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(monthlyExpenses, currency),
      meta: mostRecentMonth,
      trend: "down",
      icon: CreditCard,
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      meta: monthlyIncome > 0 ? "of income" : "no income",
      trend: savingsRate >= 0 ? "up" : "down",
      icon: PiggyBank,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
