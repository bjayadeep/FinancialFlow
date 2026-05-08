"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isLoggedIn } from "@/lib/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login")
      return
    }

    setAllowed(true)
  }, [router])

  if (!allowed) {
    return null
  }

  return <>{children}</>
}
