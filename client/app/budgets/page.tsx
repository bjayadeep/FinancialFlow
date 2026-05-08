"use client"

import { useCallback, useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { BudgetHeader } from "@/components/budgets/budget-header"
import { BudgetSummaryCards } from "@/components/budgets/budget-summary-cards"
import { BudgetGrid } from "@/components/budgets/budget-grid"
import { AISuggestions } from "@/components/budgets/ai-suggestions"
import { BudgetModal } from "@/components/budgets/budget-modal"
import { del, get, post, put } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export interface Budget {
  id: string
  category: string
  spent: number
  limit: number
  month: number
  year: number
}

export interface BudgetSuggestion {
  suggestion: string
  category: string
  type: "increase" | "decrease" | "new"
  suggestedLimit?: number
}

export type BudgetFormData = Omit<Budget, "id" | "spent">

interface BudgetsResponse {
  data: Budget[]
}

interface BudgetResponse {
  data: Budget
}

interface BudgetSuggestionsResponse {
  suggestions: BudgetSuggestion[]
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [suggestions, setSuggestions] = useState<BudgetSuggestion[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [suggestionsError, setSuggestionsError] = useState("")
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true)
  const [initialBudgetData, setInitialBudgetData] = useState<Partial<BudgetFormData> | null>(null)
  const [applyingSuggestionKey, setApplyingSuggestionKey] = useState<string | null>(null)

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.limit, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const remaining = totalBudgeted - totalSpent

  const loadBudgets = useCallback(
    async (options: { showLoading?: boolean } = {}) => {
      const { showLoading = true } = options

      if (showLoading) {
        setIsLoading(true)
      }
      setError("")

      try {
        const response = await get<BudgetsResponse>("/api/budgets")
        setBudgets(response.data)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load budgets")
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const loadSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true)
    setSuggestionsError("")

    try {
      const response = await post<BudgetSuggestionsResponse>("/api/budgets/suggestions", {})
      setSuggestions(response.suggestions)
    } catch (caughtError) {
      setSuggestionsError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load budget suggestions",
      )
    } finally {
      setIsLoadingSuggestions(false)
    }
  }, [])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  const handleNewBudget = () => {
    setEditingBudget(null)
    setInitialBudgetData(null)
    setIsModalOpen(true)
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setInitialBudgetData(null)
    setIsModalOpen(true)
  }

  const handleDeleteBudget = async (id: string) => {
    setError("")

    try {
      await del<{ success: true }>(`/api/budgets/${id}`)
      await loadBudgets({ showLoading: false })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete budget")
    }
  }

  const handleSaveBudget = async (budgetData: BudgetFormData) => {
    setError("")

    if (editingBudget) {
      await put<BudgetResponse>(`/api/budgets/${editingBudget.id}`, budgetData)
    } else {
      await post<BudgetResponse>("/api/budgets", budgetData)
      toast({ title: "Budget created" })
    }

    await loadBudgets({ showLoading: false })
    setIsModalOpen(false)
    setEditingBudget(null)
    setInitialBudgetData(null)
  }

  const getSuggestionLimit = (suggestion: BudgetSuggestion) => {
    if (typeof suggestion.suggestedLimit === "number" && suggestion.suggestedLimit > 0) {
      return suggestion.suggestedLimit
    }

    const amountMatches = Array.from(
      suggestion.suggestion.matchAll(/\d+(?:,\d{3})*(?:\.\d{1,2})?/g),
    )
    const lastAmount = amountMatches.at(-1)?.[0]
    const amount = lastAmount ? Number(lastAmount.replace(/,/g, "")) : NaN

    return Number.isFinite(amount) && amount > 0 ? amount : null
  }

  const handleApplySuggestion = async (suggestion: BudgetSuggestion, suggestionKey: string) => {
    setError("")
    setApplyingSuggestionKey(suggestionKey)

    try {
      const suggestedLimit = getSuggestionLimit(suggestion)

      if (!suggestedLimit) {
        throw new Error("Unable to determine the suggested budget amount")
      }

      if (suggestion.type === "new") {
        setEditingBudget(null)
        setInitialBudgetData({
          category: suggestion.category,
          limit: suggestedLimit,
        })
        setIsModalOpen(true)
        return
      }

      const matchingBudget = budgets.find(
        (budget) => budget.category.toLowerCase() === suggestion.category.toLowerCase(),
      )

      if (!matchingBudget) {
        throw new Error(`No existing ${suggestion.category} budget found`)
      }

      await put<BudgetResponse>(`/api/budgets/${matchingBudget.id}`, {
        category: matchingBudget.category,
        limit: suggestedLimit,
        month: matchingBudget.month,
        year: matchingBudget.year,
      })
      await loadBudgets({ showLoading: false })
      toast({ title: "Budget updated successfully" })
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to apply budget suggestion",
      )
    } finally {
      setApplyingSuggestionKey(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 h-screen min-w-0 overflow-y-auto px-6 py-6">
          <div className="w-full min-w-0">
            <BudgetHeader onNewBudget={handleNewBudget} />

            <BudgetSummaryCards
              totalBudgeted={totalBudgeted}
              totalSpent={totalSpent}
              remaining={remaining}
            />

            {error && (
              <p className="mb-4 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            {isLoading ? (
              <div className="mb-6 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
                Loading budgets...
              </div>
            ) : (
              <BudgetGrid
                budgets={budgets}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            )}

            <AISuggestions
              error={suggestionsError}
              isLoading={isLoadingSuggestions}
              suggestions={suggestions}
              applyingSuggestionKey={applyingSuggestionKey}
              onApplySuggestion={handleApplySuggestion}
            />
          </div>
        </main>

        <BudgetModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          budget={editingBudget}
          initialData={initialBudgetData}
          onSave={handleSaveBudget}
        />
      </div>
    </ProtectedRoute>
  )
}
