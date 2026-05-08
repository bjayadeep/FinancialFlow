"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface BudgetHeaderProps {
  onNewBudget: () => void
}

export function BudgetHeader({ onNewBudget }: BudgetHeaderProps) {
  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
        <p className="text-sm text-muted-foreground">{currentMonth}</p>
      </div>
      <Button onClick={onNewBudget} className="bg-primary hover:bg-primary/90">
        <Plus className="mr-2 h-4 w-4" />
        New Budget
      </Button>
    </div>
  )
}
