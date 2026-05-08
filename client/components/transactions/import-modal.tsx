"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, FileText, CheckCircle2, ArrowRight } from "lucide-react"
import { postForm } from "@/lib/api"
import { formatCurrency, type CurrencyCode } from "@/lib/currency"

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => Promise<void>
}

type Step = "upload" | "mapping" | "complete"

const samplePreviewData = [
  { date: "01/15/2024", description: "Grocery Store", amount: "-127.43" },
  { date: "01/14/2024", description: "Paycheck", amount: "3200.00" },
  { date: "01/13/2024", description: "Gas Station", amount: "-45.20" },
]

const csvColumns = ["date", "description", "amount", "category"]
const targetFields = ["Date", "Description", "Amount", "Category", "Account", "Skip"]
const sampleCsv = [
  "date,description,amount,account,category",
  "2024-01-15,Grocery Store,-127.43,Main Checking,Food",
  "2024-01-14,Paycheck,3200.00,Main Checking,Income",
  "2024-01-13,Gas Station,-45.20,Credit Card,Transport",
].join("\n")

const downloadSampleCsv = () => {
  const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "transactions-sample.csv"
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function ImportModal({ open, onOpenChange, onImported }: ImportModalProps) {
  const [step, setStep] = useState<Step>("upload")
  const [currency, setCurrency] = useState<CurrencyCode>("INR")
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState("")
  const [importedCount, setImportedCount] = useState(0)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    date: "Date",
    description: "Description",
    amount: "Amount",
    category: "Category",
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile)
      setStep("mapping")
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStep("mapping")
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Choose a CSV file before importing")
      return
    }

    setError("")
    setIsImporting(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("currency", currency)

      const response = await postForm<{
        imported: number
        transactions: unknown[]
      }>("/api/import/csv", formData)

      setImportedCount(response.imported)
      await onImported()
      setStep("complete")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to import CSV")
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setStep("upload")
    setFile(null)
    setError("")
    setImportedCount(0)
    setCurrency("INR")
    setIsImporting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import CSV"}
            {step === "mapping" && "Map Columns"}
            {step === "complete" && "Import Complete"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload a CSV file containing your transaction data."}
            {step === "mapping" &&
              "Match your CSV columns to the correct transaction fields."}
            {step === "complete" &&
              "Your transactions have been imported successfully."}
          </DialogDescription>
        </DialogHeader>

        {/* Upload Step */}
        {step === "upload" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-3 text-sm font-medium text-foreground">
                What currency are these transactions in?
              </p>
              <div className="inline-flex rounded-lg border border-border bg-background p-1">
                {(["INR", "USD"] as CurrencyCode[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCurrency(option)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      currency === option
                        ? "bg-emerald-500 text-zinc-950"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {option === "INR" ? "₹ INR" : "$ USD"}
                  </button>
                ))}
              </div>
            </div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                Drag and drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <Button variant="outline" className="pointer-events-none">
                Browse Files
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your CSV should have columns for: date, description, amount, and account.{" "}
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="font-medium text-emerald-400 underline-offset-4 hover:underline"
              >
                Download a sample template
              </button>
            </p>
          </div>
        )}

        {/* Mapping Step */}
        {step === "mapping" && (
          <div className="space-y-6">
            {/* File info */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {file?.name}
              </span>
            </div>

            {/* Column mapping */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">
                Column Mapping
              </h4>
              <div className="grid gap-3">
                {csvColumns.map((col) => (
                  <div key={col} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-muted-foreground">
                      {col}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={columnMapping[col]}
                      onValueChange={(value) =>
                        setColumnMapping({ ...columnMapping, [col]: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {targetFields.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Preview</h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {samplePreviewData.map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-4 py-2 text-foreground">{row.date}</td>
                        <td className="px-4 py-2 text-foreground">
                          {row.description}
                        </td>
                        <td
                          className={`px-4 py-2 text-right ${
                            row.amount.startsWith("-")
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {formatCurrency(Number(row.amount), currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 rounded-full bg-emerald-500/20 p-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Import Successful
            </h3>
            <p className="text-muted-foreground text-center">
              {importedCount} transactions imported.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? "AI Categorizing..." : "Import Transactions"}
              </Button>
            </>
          )}
          {step === "complete" && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
