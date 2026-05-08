"use client"

import { useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatCards } from "@/components/dashboard/stat-cards"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { CurrencySelector } from "@/components/dashboard/currency-selector"
import { get } from "@/lib/api"
import { convertAmount, type CurrencyCode, useCurrency } from "@/lib/currency"

interface DashboardData {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  mostRecentMonth: string
  savingsRate: number
  spendingByCategory: {
    category: string
    amount: number
  }[]
  monthlyTrend: {
    month: string
    income: number
    expenses: number
  }[]
  recentTransactions: {
    id: string
    date: string
    description: string
    category: string
    account: string
    amount: number
    currency: CurrencyCode
    type: "income" | "expense"
  }[]
  budgetProgress: {
    id: string
    category: string
    spent: number
    limit: number
    month: number
    year: number
  }[]
}

interface DashboardResponse {
  data: DashboardData
}

export default function DashboardPage() {
  const { currency, exchangeRate } = useCurrency()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await get<DashboardResponse>("/api/dashboard")
        setDashboardData(response.data)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const displayedDashboardData = useMemo(() => {
    if (!dashboardData) {
      return null
    }

    if (currency === "INR") {
      return dashboardData
    }

    if (!exchangeRate) {
      return null
    }

    const convertInrToSelectedCurrency = (amount: number) =>
      convertAmount(amount, "INR", currency, exchangeRate)

    return {
      ...dashboardData,
      totalBalance: convertInrToSelectedCurrency(dashboardData.totalBalance),
      monthlyIncome: convertInrToSelectedCurrency(dashboardData.monthlyIncome),
      monthlyExpenses: convertInrToSelectedCurrency(dashboardData.monthlyExpenses),
      spendingByCategory: dashboardData.spendingByCategory.map((item) => ({
        ...item,
        amount: convertInrToSelectedCurrency(item.amount),
      })),
      monthlyTrend: dashboardData.monthlyTrend.map((item) => ({
        ...item,
        income: convertInrToSelectedCurrency(item.income),
        expenses: convertInrToSelectedCurrency(item.expenses),
      })),
      recentTransactions: dashboardData.recentTransactions.map((transaction) => ({
        ...transaction,
        amount: convertAmount(transaction.amount, transaction.currency, currency, exchangeRate),
        currency,
      })),
      budgetProgress: dashboardData.budgetProgress.map((budget) => ({
        ...budget,
        spent: convertInrToSelectedCurrency(budget.spent),
        limit: convertInrToSelectedCurrency(budget.limit),
      })),
    }
  }, [currency, dashboardData, exchangeRate])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />

        <main className="ml-64 h-screen min-w-0 overflow-y-auto px-6 py-6">
          <div className="w-full min-w-0">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Financial Overview
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Track your income, expenses, and savings at a glance.
                </p>
              </div>
              <CurrencySelector />
            </div>

            {error && (
              <p className="mb-4 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            {isLoading || !displayedDashboardData ? (
              <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
                Loading dashboard...
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <StatCards
                    totalBalance={displayedDashboardData.totalBalance}
                    monthlyIncome={displayedDashboardData.monthlyIncome}
                    monthlyExpenses={displayedDashboardData.monthlyExpenses}
                    mostRecentMonth={displayedDashboardData.mostRecentMonth}
                    savingsRate={displayedDashboardData.savingsRate}
                  />
                </div>

                <div className="mb-6">
                  <IncomeExpenseChart data={displayedDashboardData.monthlyTrend} />
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <SpendingChart data={displayedDashboardData.spendingByCategory} />
                  <BudgetProgress items={displayedDashboardData.budgetProgress} />
                </div>

                <TransactionsTable transactions={displayedDashboardData.recentTransactions} />
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
