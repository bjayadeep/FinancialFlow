"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCurrency } from "@/lib/currency"
import type { Budget, BudgetFormData } from "@/app/budgets/page"

interface BudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget: Budget | null
  initialData?: Partial<BudgetFormData> | null
  onSave: (data: BudgetFormData) => Promise<void>
}

const categoryOptions = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Utilities",
  "Shopping",
  "Other",
]

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

const defaultBudgetMonth = "5"
const defaultBudgetYear = "2026"

export function BudgetModal({ open, onOpenChange, budget, initialData, onSave }: BudgetModalProps) {
  const { currency } = useCurrency()
  const [category, setCategory] = useState("")
  const [limit, setLimit] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (budget) {
      setCategory(budget.category)
      setLimit(budget.limit.toString())
      setMonth(String(budget.month))
      setYear(String(budget.year))
    } else {
      setCategory(initialData?.category ?? "")
      setLimit(initialData?.limit ? initialData.limit.toString() : "")
      setMonth(initialData?.month ? String(initialData.month) : defaultBudgetMonth)
      setYear(initialData?.year ? String(initialData.year) : defaultBudgetYear)
    }

    setError("")
  }, [budget, initialData, open])

  const availableCategoryOptions =
    category && !categoryOptions.includes(category)
      ? [category, ...categoryOptions]
      : categoryOptions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await onSave({
        category,
        limit: Number(limit),
        month: Number(month),
        year: Number(year),
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save budget")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {budget ? "Edit Budget" : "New Budget"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-card-foreground">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="bg-secondary border-border text-card-foreground">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {availableCategoryOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="text-card-foreground focus:bg-secondary"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit" className="text-card-foreground">
                Monthly Limit
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {currency === "INR" ? "₹" : "$"}
                </span>
                <Input
                  id="limit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="300"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="bg-secondary border-border pl-7 text-card-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="month" className="text-card-foreground">
                  Month
                </Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="month" className="bg-secondary border-border text-card-foreground">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {monthOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-card-foreground focus:bg-secondary"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-card-foreground">
                  Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-secondary border-border text-card-foreground"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border bg-transparent text-card-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!category || !limit || !month || !year || isSubmitting}
            >
              {isSubmitting ? "Saving..." : budget ? "Save Changes" : "Create Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
