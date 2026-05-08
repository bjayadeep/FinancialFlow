import { AlertTriangle, ShieldAlert, XCircle } from "lucide-react"

interface AlertsStatsProps {
  stats: {
    newAlerts: number
    highPriority: number
    dismissedThisMonth: number
  }
}

export function AlertsStats({ stats }: AlertsStatsProps) {
  const statCards = [
    {
      label: "New Alerts",
      value: stats.newAlerts,
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "High Priority",
      value: stats.highPriority,
      icon: ShieldAlert,
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Dismissed This Month",
      value: stats.dismissedThisMonth,
      icon: XCircle,
      iconColor: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
    },
  ]

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
        >
          <div className={cn("rounded-lg p-3", stat.bgColor)}>
            <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
