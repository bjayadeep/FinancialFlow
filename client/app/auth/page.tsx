"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

type AuthView = "login" | "register" | "forgot-password"

export default function AuthPage() {
  const [activeView, setActiveView] = useState<AuthView>("login")

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* View Switcher */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 p-4">
          <button
            onClick={() => setActiveView("login")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeView === "login"
                ? "bg-emerald-500 text-zinc-950"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveView("register")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeView === "register"
                ? "bg-emerald-500 text-zinc-950"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setActiveView("forgot-password")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeView === "forgot-password"
                ? "bg-emerald-500 text-zinc-950"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            Forgot Password
          </button>
        </div>
      </div>

      {/* Form Display */}
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center p-8">
        {activeView === "login" && (
          <LoginForm
            onSwitchToRegister={() => setActiveView("register")}
            onSwitchToForgotPassword={() => setActiveView("forgot-password")}
          />
        )}
        {activeView === "register" && (
          <RegisterForm onSwitchToLogin={() => setActiveView("login")} />
        )}
        {activeView === "forgot-password" && (
          <ForgotPasswordForm onSwitchToLogin={() => setActiveView("login")} />
        )}
      </div>
    </div>
  )
}
