"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TransactionsHeader } from "@/components/transactions/transactions-header"
import { TransactionsFilter } from "@/components/transactions/transactions-filter"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import {
  TransactionFormData,
  TransactionSheet,
} from "@/components/transactions/transaction-sheet"
import { ImportModal } from "@/components/transactions/import-modal"
import { del, get, post, put } from "@/lib/api"

export type Transaction = {
  id: string
  date: string
  description: string
  category: string
  account: string
  amount: number
  type: "income" | "expense"
  aiTagged: boolean
}

interface TransactionsResponse {
  data: Transaction[]
  total: number
  page: number
  totalPages: number
}

interface TransactionResponse {
  data: Transaction
}

const pageSize = 8
const csvHeaders = ["Date", "Description", "Category", "Account", "Type", "Amount"]

const escapeCsvValue = (value: string | number) => {
  const stringValue = String(value)

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

const buildTransactionsCsv = (items: Transaction[]) =>
  [
    csvHeaders.join(","),
    ...items.map((transaction) =>
      [
        transaction.date.split("T")[0],
        transaction.description,
        transaction.category,
        transaction.account,
        transaction.type,
        transaction.amount,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ].join("\n")

const downloadCsv = (csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "transactions.csv"
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function TransactionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") ?? "",
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    category: searchParams.get("category") ?? "all",
    type: searchParams.get("type") ?? "all",
  })

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", String(pageSize))

    if (filters.search) params.set("search", filters.search)
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) params.set("dateTo", filters.dateTo)
    if (filters.category !== "all") params.set("category", filters.category)
    if (filters.type !== "all") params.set("type", filters.type)

    return params.toString()
  }, [filters, page])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set("page", String(page))

    if (filters.search) params.set("search", filters.search)
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) params.set("dateTo", filters.dateTo)
    if (filters.category !== "all") params.set("category", filters.category)
    if (filters.type !== "all") params.set("type", filters.type)

    router.replace(`/transactions?${params.toString()}`, { scroll: false })
  }, [filters, page, router])

  const loadTransactions = useCallback(
    async (options: { showLoading?: boolean } = {}) => {
      const { showLoading = true } = options

      if (showLoading) {
        setIsLoading(true)
      }
      setError("")

      try {
        const response = await get<TransactionsResponse>(`/api/transactions?${queryString}`)

        setTransactions(response.data)
        setTotalCount(response.total)
        setTotalPages(response.totalPages || 1)
        setSelectedIds([])
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load transactions")
      } finally {
        setIsLoading(false)
      }
    },
    [queryString],
  )

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])


  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(nextPage))
    router.push(`/transactions?${params.toString()}`)
  }

  const handleFiltersChange = (nextFilters: typeof filters) => {
    setFilters(nextFilters)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")
    router.replace(`/transactions?${params.toString()}`, { scroll: false })
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction({
      ...transaction,
      date: transaction.date.split("T")[0],
    })
    setSheetOpen(true)
  }

  const handleAdd = () => {
    setEditingTransaction(null)
    setSheetOpen(true)
  }

  const handleExport = async () => {
    setError("")

    try {
      const response = await get<TransactionsResponse>("/api/transactions?all=true")
      downloadCsv(buildTransactionsCsv(response.data))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to export transactions")
    }
  }

  const handleSave = async (transaction: TransactionFormData) => {
    if (editingTransaction) {
      await put<TransactionResponse>(`/api/transactions/${editingTransaction.id}`, transaction)
    } else {
      await post<TransactionResponse>("/api/transactions", transaction)
    }

    await loadTransactions({ showLoading: false })
  }

  const handleDelete = async (id: string) => {
    await del<{ success: true }>(`/api/transactions/${id}`)

    await loadTransactions({ showLoading: false })
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
      category: "all",
      type: "all",
    })
    router.replace("/transactions?page=1", { scroll: false })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 h-screen min-w-0 overflow-y-auto px-6 py-6">
          <div className="w-full min-w-0">
            <TransactionsHeader
              totalCount={totalCount}
              onImport={() => setImportOpen(true)}
              onExport={handleExport}
              onAdd={handleAdd}
            />
            <TransactionsFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
            />
            {error && (
              <p className="mb-4 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            {isLoading ? (
              <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
                Loading transactions...
              </div>
            ) : (
              <TransactionsTable
                transactions={transactions}
                selectedIds={selectedIds}
                onSelectedChange={setSelectedIds}
                onEdit={handleEdit}
                onDelete={handleDelete}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setPage}
              />
            )}
          </div>
        </main>

        <TransactionSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          transaction={editingTransaction}
          onSave={handleSave}
        />

        <ImportModal
          open={importOpen}
          onOpenChange={setImportOpen}
          onImported={() => loadTransactions({ showLoading: false })}
        />
      </div>
    </ProtectedRoute>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsContent />
    </Suspense>
  )
}
