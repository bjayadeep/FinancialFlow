"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { CurrencyCode } from "@/lib/currency"
import type { Transaction } from "@/app/transactions/page"

interface TransactionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  onSave: (transaction: TransactionFormData) => Promise<void>
}

export interface TransactionFormData {
  amount: number
  description: string
  date: string
  category: string
  account: string
  type: "income" | "expense"
  currency: CurrencyCode
}

const categories = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Utilities",
  "Shopping",
  "Income",
]

const accounts = ["Main Checking", "Credit Card", "Savings"]
const fieldClassName = "bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white"

export function TransactionSheet({
  open,
  onOpenChange,
  transaction,
  onSave,
}: TransactionSheetProps) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: "",
    category: "",
    account: "",
    type: "expense" as "income" | "expense",
    currency: "INR" as CurrencyCode,
    notes: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.description,
        date: transaction.date,
        category: transaction.category,
        account: transaction.account,
        type: transaction.type,
        currency: transaction.currency,
        notes: "",
      })
    } else {
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        account: "",
        type: "expense",
        currency: "INR",
        notes: "",
      })
    }

    setError("")
  }, [transaction, open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await onSave({
        amount: Number(formData.amount),
        description: formData.description,
        date: formData.date,
        category: formData.category,
        account: formData.account,
        type: formData.type,
        currency: formData.currency,
      })
      onOpenChange(false)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-900 p-6 text-white sm:max-w-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update the transaction details below."
              : "Enter the details for your new transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 py-2 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-zinc-300">Amount</Label>
            <div className="flex gap-2">
              <div className="inline-flex rounded-lg border border-zinc-700 bg-zinc-800 p-1">
                {(["INR", "USD"] as CurrencyCode[]).map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => setFormData({ ...formData, currency })}
                    className={cn(
                      "h-9 w-10 rounded-md text-sm font-semibold transition-colors",
                      formData.currency === currency
                        ? "bg-emerald-500 text-zinc-950"
                        : "text-zinc-400 hover:bg-zinc-700 hover:text-white",
                    )}
                    aria-label={`Use ${currency}`}
                  >
                    {currency === "INR" ? "₹" : "$"}
                  </button>
                ))}
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(event) =>
                  setFormData({ ...formData, amount: event.target.value })
                }
                required
                min="0.01"
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-zinc-300">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as "income" | "expense" })
              }
            >
              <SelectTrigger id="type" className={`${fieldClassName} w-full`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description" className="text-zinc-300">Description</Label>
            <Input
              id="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              required
              className={fieldClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-zinc-300">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(event) =>
                setFormData({ ...formData, date: event.target.value })
              }
              required
              className={fieldClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-zinc-300">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger id="category" className={`${fieldClassName} w-full`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="account" className="text-zinc-300">Account</Label>
            <Select
              value={formData.account}
              onValueChange={(value) =>
                setFormData({ ...formData, account: value })
              }
            >
              <SelectTrigger id="account" className={`${fieldClassName} w-full`}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes" className="text-zinc-300">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(event) =>
                setFormData({ ...formData, notes: event.target.value })
              }
              rows={3}
              className={fieldClassName}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400 sm:col-span-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:col-span-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {isSubmitting
                ? "Saving..."
                : transaction
                  ? "Save Changes"
                  : "Add Transaction"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
