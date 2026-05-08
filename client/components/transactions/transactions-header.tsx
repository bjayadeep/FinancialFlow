"use client"

import { Button } from "@/components/ui/button"
import { Upload, Plus, Download } from "lucide-react"

interface TransactionsHeaderProps {
  totalCount: number
  onImport: () => void
  onExport: () => void
  onAdd: () => void
}

export function TransactionsHeader({ totalCount, onImport, onExport, onAdd }: TransactionsHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-1">
          {totalCount} transactions found
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onImport} className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
        <Button variant="outline" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>
    </div>
  )
}
