"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, useCurrency } from "@/lib/currency"
import type { Budget } from "@/app/budgets/page"

interface BudgetGridProps {
  budgets: Budget[]
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

const formatBudgetMonth = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1)

  return date.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  })
}

const getDaysRemaining = (month: number, year: number) => {
  const now = new Date()
  const lastDay = new Date(year, month, 0)

  if (now.getFullYear() !== year || now.getMonth() + 1 !== month) {
    return null
  }

  return Math.max(lastDay.getDate() - now.getDate(), 0)
}

export function BudgetGrid({ budgets, onEdit, onDelete }: BudgetGridProps) {
  const { currency } = useCurrency()

  if (budgets.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
        No budgets yet. Create a budget to start tracking category spending.
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {budgets.map((budget) => {
        const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
        const cappedPercentage = Math.min(percentage, 100)
        const isOverBudget = budget.spent > budget.limit
        const daysRemaining = getDaysRemaining(budget.month, budget.year)

        let progressColor = "bg-emerald-500"
        if (percentage > 90 || isOverBudget) {
          progressColor = "bg-red-500"
        } else if (percentage >= 70) {
          progressColor = "bg-yellow-500"
        }

        return (
          <Card key={budget.id} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-card-foreground">
                    {budget.category}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatBudgetMonth(budget.month, budget.year)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(budget.spent, currency)} of {formatCurrency(budget.limit, currency)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(budget)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={() => onDelete(budget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      isOverBudget ? "text-red-500" : "text-muted-foreground",
                    )}
                  >
                    {percentage.toFixed(0)}% used
                  </span>
                  <span className="text-muted-foreground">
                    {daysRemaining === null
                      ? "Completed month"
                      : `${daysRemaining} days left`}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full transition-all", progressColor)}
                    style={{ width: `${cappedPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
