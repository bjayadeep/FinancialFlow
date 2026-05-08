"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { AlertsHeader } from "@/components/alerts/alerts-header"
import { AlertsStats } from "@/components/alerts/alerts-stats"
import { AlertsList } from "@/components/alerts/alerts-list"
import { AlertsSettings } from "@/components/alerts/alerts-settings"
import { get, post, put } from "@/lib/api"

export type AlertStatus = "all" | "unreviewed" | "safe" | "dismissed"

export interface Alert {
  id: string
  title: string
  explanation: string
  severity: "high" | "medium" | "low"
  merchant: string | null
  amount: number | null
  date: string | null
  confidence: number | null
  status: "unreviewed" | "safe" | "dismissed"
  createdAt: string
}

interface AlertsResponse {
  data: Alert[]
}

interface AlertResponse {
  data: Alert
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<AlertStatus>("all")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)

  const loadAlerts = useCallback(
    async (options: { showLoading?: boolean } = {}) => {
      const { showLoading = true } = options

      if (showLoading) {
        setIsLoading(true)
      }
      setError("")

      try {
        const query = activeTab === "all" ? "" : `?status=${activeTab}`
        const response = await get<AlertsResponse>(`/api/alerts${query}`)
        setAlerts(response.data)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load alerts")
      } finally {
        setIsLoading(false)
      }
    },
    [activeTab],
  )

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const stats = useMemo(
    () => ({
      newAlerts: alerts.filter((alert) => alert.status === "unreviewed").length,
      highPriority: alerts.filter((alert) => alert.severity === "high").length,
      dismissedThisMonth: alerts.filter((alert) => alert.status === "dismissed").length,
    }),
    [alerts],
  )

  const handleRunScan = async () => {
    setIsScanning(true)
    setError("")

    try {
      await post<AlertsResponse>("/api/alerts/scan", {})
      await loadAlerts({ showLoading: false })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to run AI scan")
    } finally {
      setIsScanning(false)
    }
  }

  const handleUpdateAlert = async (
    id: string,
    status: "safe" | "dismissed" | "unreviewed",
  ) => {
    setError("")

    try {
      const response = await put<AlertResponse>(`/api/alerts/${id}`, { status })
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? response.data : alert)),
      )
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update alert")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 h-screen min-w-0 overflow-y-auto px-6 py-6">
          <div className="w-full min-w-0">
            <AlertsHeader
              activeTab={activeTab}
              isScanning={isScanning}
              onRunScan={handleRunScan}
              onTabChange={setActiveTab}
            />
            <AlertsStats stats={stats} />

            {error && (
              <p className="mb-4 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            {isLoading ? (
              <div className="mb-8 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
                Loading alerts...
              </div>
            ) : (
              <AlertsList alerts={alerts} onUpdateAlert={handleUpdateAlert} />
            )}

            <AlertsSettings />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
