"use client"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  orientation?: "horizontal" | "vertical"
}

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  orientation = "horizontal",
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        orientation === "vertical" && "flex-col gap-2 text-center",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        aria-hidden="true"
        className={cn("h-9 w-9 shrink-0", iconClassName)}
      >
        <rect width="120" height="120" rx="24" fill="#10b981" />
        <polyline
          points="20,95 40,68 60,80 82,48 102,60"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="102,60 112,50 112,70" fill="white" />
        <circle cx="40" cy="68" r="5" fill="white" />
        <circle cx="60" cy="80" r="5" fill="white" />
        <circle cx="82" cy="48" r="5" fill="white" />
        <rect x="20" y="98" width="5" height="14" rx="2" fill="rgba(255,255,255,0.5)" />
        <rect x="34" y="92" width="5" height="20" rx="2" fill="rgba(255,255,255,0.5)" />
        <rect x="48" y="102" width="5" height="10" rx="2" fill="rgba(255,255,255,0.5)" />
      </svg>
      <span className={cn("text-xl font-bold text-white", textClassName)}>FinanceFlow</span>
    </div>
  )
}
