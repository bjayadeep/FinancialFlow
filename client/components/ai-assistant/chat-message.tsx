"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bot, User } from "lucide-react"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { Message } from "@/app/ai-assistant/page"

interface ChatMessageProps {
  message: Message
}

const CHART_COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#0ea5e9"]

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      <Avatar
        className={cn(
          "h-8 w-8 shrink-0",
          isUser ? "bg-emerald-700" : "bg-primary/20"
        )}
      >
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-emerald-700 text-emerald-100"
              : "bg-primary/20 text-primary"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn("flex flex-col gap-2 max-w-[80%]", isUser && "items-end")}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "rounded-tr-sm bg-emerald-700 text-emerald-50"
              : "rounded-tl-sm bg-card border border-border text-foreground"
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>

          {/* Inline Table */}
          {message.table && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    {message.table.headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-medium text-muted-foreground"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {message.table.rows.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Inline Chart */}
          {message.chart && (
            <div className="mt-3 h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={message.chart.data} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    width={70}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {message.chart.data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Action Chips */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="h-7 rounded-full text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              >
                {action}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground">
          {message.timestamp}
        </span>
      </div>
    </div>
  )
}
