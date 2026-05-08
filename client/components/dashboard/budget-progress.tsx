"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { formatCurrency, useCurrency } from "@/lib/currency"

interface BudgetItem {
  id: string
  category: string
  spent: number
  limit: number
  month: number
  year: number
}

interface BudgetProgressProps {
  items: BudgetItem[]
}

export function BudgetProgress({ items }: BudgetProgressProps) {
  const { currency } = useCurrency()

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Budget Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-lg bg-secondary/50 p-6 text-sm text-muted-foreground">
            No budget goals found.
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => {
            const percentage = Math.min((item.spent / item.limit) * 100, 100)
            const remaining = item.limit - item.spent
            const isOverBudget = remaining < 0

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">
                    {item.category}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      isOverBudget ? "text-red-500" : "text-muted-foreground"
                    )}
                  >
                    {isOverBudget ? (
                      <span className="text-red-500">
                        {formatCurrency(Math.abs(remaining), currency)} over
                      </span>
                    ) : (
                      <span>{formatCurrency(remaining, currency)} left</span>
                    )}
                  </span>
                </div>
                <div className="relative">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full transition-all",
                        percentage >= 90 ? "bg-red-500" : percentage >= 70 ? "bg-yellow-500" : "bg-emerald-500",
                        isOverBudget && "bg-red-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(item.spent, currency)} spent</span>
                  <span>{formatCurrency(item.limit, currency)} budget</span>
                </div>
              </div>
            )
          })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
