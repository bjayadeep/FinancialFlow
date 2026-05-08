"use client"

import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <RegisterForm
        onSwitchToLogin={() => {
          window.location.href = "/login"
        }}
      />
    </div>
  )
}
