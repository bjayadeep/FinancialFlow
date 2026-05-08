"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Bot, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import type { Transaction } from "@/app/transactions/page"

const categoryColors: Record<string, string> = {
  Food: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Transport: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Housing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Entertainment: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Health: "bg-red-500/20 text-red-400 border-red-500/30",
  Utilities: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Shopping: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Income: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
}

interface TransactionsTableProps {
  transactions: Transaction[]
  selectedIds: string[]
  onSelectedChange: (ids: string[]) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  page: number
  pageSize: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function TransactionsTable({
  transactions,
  selectedIds,
  onSelectedChange,
  onEdit,
  onDelete,
  page,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
}: TransactionsTableProps) {
  const allSelected =
    transactions.length > 0 &&
    transactions.every((t) => selectedIds.includes(t.id))

  const toggleAll = () => {
    if (allSelected) {
      onSelectedChange(
        selectedIds.filter(
          (id) => !transactions.some((t) => t.id === id)
        )
      )
    } else {
      onSelectedChange([
        ...selectedIds,
        ...transactions
          .filter((t) => !selectedIds.includes(t.id))
          .map((t) => t.id),
      ])
    }
  }

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectedChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectedChange([...selectedIds, id])
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatAmount = (transaction: Transaction) => {
    const amount = transaction.type === "expense" ? -transaction.amount : transaction.amount
    return amount >= 0
      ? `+${formatCurrency(Math.abs(amount), transaction.currency)}`
      : `-${formatCurrency(Math.abs(amount), transaction.currency)}`
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-12 p-4 text-left">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Date
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Description
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Category
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Account
              </th>
              <th className="p-4 text-right text-sm font-medium text-muted-foreground">
                Amount
              </th>
              <th className="w-12 p-4 text-center text-sm font-medium text-muted-foreground">
                <span className="sr-only">AI</span>
                <Bot className="h-4 w-4 mx-auto text-muted-foreground" />
              </th>
              <th className="w-24 p-4 text-center text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedIds.includes(transaction.id)}
                    onCheckedChange={() => toggleOne(transaction.id)}
                    aria-label={`Select ${transaction.description}`}
                  />
                </td>
                <td className="p-4 text-sm text-foreground">
                  {formatDate(transaction.date)}
                </td>
                <td className="p-4 text-sm font-medium text-foreground">
                  {transaction.description}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      categoryColors[transaction.category] ||
                      "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {transaction.category}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {transaction.account}
                </td>
                <td
                  className={`p-4 text-sm font-semibold text-right ${
                    transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatAmount(transaction)}
                </td>
                <td className="p-4 text-center">
                  {transaction.aiTagged && (
                    <Bot className="h-4 w-4 mx-auto text-primary" aria-label="Auto-categorized by AI" />
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(transaction)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
          {Math.min((page - 1) * pageSize + transactions.length, totalCount)} of{" "}
          {totalCount} transactions
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
