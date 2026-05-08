"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Settings, Check } from "lucide-react"

interface ToggleSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

const initialSettings: ToggleSetting[] = [
  {
    id: "large-transactions",
    label: "Large transactions",
    description: "Flag transactions significantly above your average",
    enabled: true,
  },
  {
    id: "new-merchants",
    label: "New merchants",
    description: "Alert when you shop at a merchant for the first time",
    enabled: true,
  },
  {
    id: "category-spikes",
    label: "Category spikes",
    description: "Detect unusual spending increases in any category",
    enabled: true,
  },
  {
    id: "duplicate-charges",
    label: "Duplicate charges",
    description: "Identify potential double billing from merchants",
    enabled: true,
  },
  {
    id: "late-night",
    label: "Late night transactions",
    description: "Flag purchases made between 12 AM and 5 AM",
    enabled: false,
  },
]

const alertsSettingsStorageKey = "financeflow_alert_settings"

const isStoredSettings = (value: unknown): value is ToggleSetting[] => {
  if (!Array.isArray(value)) {
    return false
  }

  return value.every((setting) => {
    if (typeof setting !== "object" || setting === null) {
      return false
    }

    const candidate = setting as Record<string, unknown>
    return (
      typeof candidate.id === "string" &&
      typeof candidate.label === "string" &&
      typeof candidate.description === "string" &&
      typeof candidate.enabled === "boolean"
    )
  })
}

const readStoredSettings = () => {
  if (typeof window === "undefined") {
    return initialSettings
  }

  try {
    const storedSettings = window.localStorage.getItem(alertsSettingsStorageKey)

    if (!storedSettings) {
      return initialSettings
    }

    const parsedSettings = JSON.parse(storedSettings)

    if (!isStoredSettings(parsedSettings)) {
      return initialSettings
    }

    return initialSettings.map((setting) => ({
      ...setting,
      enabled:
        parsedSettings.find((storedSetting) => storedSetting.id === setting.id)?.enabled ??
        setting.enabled,
    }))
  } catch {
    return initialSettings
  }
}

export function AlertsSettings() {
  const [settings, setSettings] = useState(initialSettings)
  const [sensitivity, setSensitivity] = useState(65)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(readStoredSettings())
  }, [])

  useEffect(() => {
    window.localStorage.setItem(alertsSettingsStorageKey, JSON.stringify(settings))
  }, [settings])

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sensitivityLabel =
    sensitivity < 33 ? "Low" : sensitivity < 66 ? "Medium" : "High"

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            AI Anomaly Settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize how AI detects unusual activity
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
          >
            <div>
              <p className="font-medium text-foreground">{setting.label}</p>
              <p className="text-sm text-muted-foreground">
                {setting.description}
              </p>
            </div>
            <button
              onClick={() => handleToggle(setting.id)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                setting.enabled ? "bg-primary" : "bg-zinc-600"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  setting.enabled ? "left-[22px]" : "left-0.5"
                )}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Sensitivity Slider */}
      <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Detection Sensitivity</p>
            <p className="text-sm text-muted-foreground">
              Adjust how sensitive the AI is to anomalies
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              sensitivity < 33
                ? "bg-blue-500/20 text-blue-400"
                : sensitivity < 66
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
            )}
          >
            {sensitivityLabel}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Low</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sensitivity}
            onChange={(e) => {
              setSensitivity(Number(e.target.value))
              setSaved(false)
            }}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-primary"
          />
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          className={cn(
            "min-w-[160px]",
            saved && "bg-green-600 hover:bg-green-600"
          )}
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Settings are saved locally and applied during your next AI scan
      </p>
    </div>
  )
}
