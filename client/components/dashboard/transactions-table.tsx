"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  account: string
  amount: number
  currency: "INR" | "USD"
  type: "income" | "expense"
}

const categoryColors: Record<string, string> = {
  Income: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Food: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Housing: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Transport: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Entertainment: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Health: "bg-red-500/10 text-red-500 border-red-500/20",
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Recent Transactions
          </CardTitle>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="rounded-lg bg-secondary/50 p-6 text-sm text-muted-foreground">
            No transactions found.
          </div>
        ) : (
          <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="border-border hover:bg-secondary/50"
              >
                <TableCell className="text-muted-foreground">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="font-medium text-card-foreground">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      categoryColors[transaction.category]
                    )}
                  >
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    transaction.type === "income"
                      ? "text-emerald-500"
                      : "text-red-500"
                  )}
                  >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
