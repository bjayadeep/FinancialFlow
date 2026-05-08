"use client"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { convertAmount, formatCurrency, useCurrency } from "@/lib/currency"
import type { Alert } from "@/app/alerts/page"

interface AlertsListProps {
  alerts: Alert[]
  onUpdateAlert: (id: string, status: "safe" | "dismissed" | "unreviewed") => void
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  medium: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  low: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
}

export function AlertsList({ alerts, onUpdateAlert }: AlertsListProps) {
  const { currency, exchangeRate } = useCurrency()
  const toDisplayAmount = (amount: number) =>
    currency === "USD" && exchangeRate
      ? convertAmount(amount, "INR", "USD", exchangeRate)
      : amount

  if (alerts.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-border bg-card p-12 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No alerts found
        </h3>
        <p className="mt-1 text-muted-foreground">
          All clear! No anomalies detected in this category.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-8 space-y-4">
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity]
        const SeverityIcon = config.icon
        const isActioned = alert.status !== "unreviewed"
        const confidence = alert.confidence ?? 0

        return (
          <div
            key={alert.id}
            className={cn(
              "rounded-xl border bg-card transition-all",
              isActioned ? "border-border opacity-60" : config.border
            )}
          >
            <div className="p-6">
              <div className="flex gap-6">
                {/* Severity Icon */}
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    config.bg
                  )}
                >
                  <SeverityIcon className={cn("h-6 w-6", config.color)} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {alert.title}
                      </h3>
                      {isActioned && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "mt-1",
                            alert.status === "safe" &&
                              "border-green-500/30 bg-green-500/10 text-green-400",
                            alert.status === "dismissed" &&
                              "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                          )}
                        >
                          {alert.status === "safe" && "Marked Safe"}
                          {alert.status === "dismissed" && "Dismissed"}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {!isActioned && (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                          onClick={() => onUpdateAlert(alert.id, "safe")}
                        >
                          <ShieldCheck className="mr-1 h-4 w-4" />
                          Mark Safe
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-zinc-500/30 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 hover:text-zinc-300"
                          onClick={() => onUpdateAlert(alert.id, "dismissed")}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {alert.explanation}
                  </p>

                  {/* Transaction Details */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-foreground">
                      <span className="text-muted-foreground">Merchant:</span>{" "}
                      {alert.merchant ?? "Unknown"}
                    </span>
                    {alert.amount !== null && (
                      <span
                        className={cn(
                          "font-semibold",
                          alert.amount > 100 ? "text-red-400" : "text-foreground"
                        )}
                      >
                        {formatCurrency(toDisplayAmount(alert.amount), currency)}
                      </span>
                    )}
                    {alert.date && (
                      <span className="text-muted-foreground">{alert.date}</span>
                    )}
                    <Badge variant="outline" className="border-zinc-500/30 bg-zinc-500/10 text-zinc-400">
                      {alert.severity}
                    </Badge>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      AI Confidence:
                    </span>
                    <div className="flex-1 max-w-[200px]">
                      <Progress
                        value={confidence}
                        className="h-2 bg-zinc-700"
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        confidence >= 80
                          ? "text-primary"
                          : confidence >= 60
                            ? "text-yellow-400"
                            : "text-muted-foreground"
                      )}
                    >
                      {confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
