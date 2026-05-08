"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import type { AlertStatus } from "@/app/alerts/page"

interface AlertsHeaderProps {
  activeTab: AlertStatus
  isScanning: boolean
  onRunScan: () => void
  onTabChange: (tab: AlertStatus) => void
}

const tabs: { value: AlertStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unreviewed", label: "Unreviewed" },
  { value: "safe", label: "Safe" },
  { value: "dismissed", label: "Dismissed" },
]

export function AlertsHeader({
  activeTab,
  isScanning,
  onRunScan,
  onTabChange,
}: AlertsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Anomaly Alerts</h1>
          <p className="mt-1 text-muted-foreground">
            AI-powered unusual spending detection
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          disabled={isScanning}
          onClick={onRunScan}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isScanning ? "Scanning..." : "Run AI Scan"}
        </Button>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
