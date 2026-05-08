"use client"

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <LoginForm
        onSwitchToRegister={() => {
          window.location.href = "/register"
        }}
        onSwitchToForgotPassword={() => {
          window.location.href = "/auth"
        }}
      />
    </div>
  )
}
