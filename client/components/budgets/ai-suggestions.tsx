"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BudgetSuggestion } from "@/app/budgets/page"

interface AISuggestionsProps {
  suggestions: BudgetSuggestion[]
  isLoading: boolean
  error: string
  applyingSuggestionKey: string | null
  onApplySuggestion: (suggestion: BudgetSuggestion, suggestionKey: string) => void
}

const typeStyles: Record<BudgetSuggestion["type"], string> = {
  increase: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  decrease: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  new: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
}

const typeLabels: Record<BudgetSuggestion["type"], string> = {
  increase: "Increase",
  decrease: "Decrease",
  new: "New",
}

export function AISuggestions({
  suggestions,
  isLoading,
  error,
  applyingSuggestionKey,
  onApplySuggestion,
}: AISuggestionsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          AI Budget Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
            Generating budget suggestions...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
            No budget suggestions available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const suggestionKey = `${suggestion.category}-${suggestion.type}-${index}`

              return (
                <div
                  key={suggestionKey}
                  className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4"
                >
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-border bg-card text-card-foreground">
                        {suggestion.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(typeStyles[suggestion.type])}
                      >
                        {typeLabels[suggestion.type]}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-card-foreground">
                      {suggestion.suggestion}
                    </p>
                    <Button
                      type="button"
                      className="mt-3 bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                      disabled={applyingSuggestionKey === suggestionKey}
                      onClick={() => onApplySuggestion(suggestion, suggestionKey)}
                    >
                      {applyingSuggestionKey === suggestionKey ? "Applying..." : "Apply Suggestion"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
