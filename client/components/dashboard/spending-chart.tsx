"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { formatCurrency, useCurrency } from "@/lib/currency"

interface SpendingChartProps {
  data: {
    category: string
    amount: number
  }[]
}

const chartConfig = {
  amount: { label: "Amount", color: "var(--color-chart-1)" },
} satisfies ChartConfig

const colors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export function SpendingChart({ data }: SpendingChartProps) {
  const { currency } = useCurrency()
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  const chartData = data.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }))

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="rounded-lg bg-secondary/50 p-6 text-sm text-muted-foreground">
            No expense transactions found.
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="category"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <span>
                          {name}: {formatCurrency(Number(value), currency)}
                        </span>
                      )}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            <div className="flex-1 space-y-3">
              {chartData.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-card-foreground">
                      {formatCurrency(item.amount, currency)}
                    </span>
                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {total > 0 ? ((item.amount / total) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
