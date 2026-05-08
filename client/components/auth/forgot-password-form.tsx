"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandLogo } from "@/components/brand-logo"
import { ArrowLeft, Mail } from "lucide-react"

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void
}

export function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        {/* Logo */}
        <BrandLogo
          className="mb-8 justify-center"
          iconClassName="h-12 w-12"
          textClassName="text-2xl"
          orientation="vertical"
        />

        {/* Success State */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <Mail className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100">Check your email</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {"We've sent a password reset link to "}
            <span className="font-medium text-zinc-300">{email}</span>
          </p>
          <p className="mt-4 text-xs text-zinc-500">
            {"Didn't receive the email? Check your spam folder or "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-emerald-500 hover:text-emerald-400"
            >
              try again
            </button>
          </p>
        </div>

        {/* Back to Login */}
        <Button
          variant="outline"
          className="mt-6 w-full border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          onClick={onSwitchToLogin}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
      {/* Logo */}
      <BrandLogo
        className="mb-8 justify-center"
        iconClassName="h-12 w-12"
        textClassName="text-2xl"
        orientation="vertical"
      />

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-100">Reset your password</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {"Enter your email address and we'll send you a link to reset your password."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resetEmail" className="text-zinc-300">Email</Label>
          <Input
            id="resetEmail"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
        >
          Send Reset Link
        </Button>
      </form>

      {/* Back to Login */}
      <button
        type="button"
        onClick={onSwitchToLogin}
        className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </button>
    </div>
  )
}
