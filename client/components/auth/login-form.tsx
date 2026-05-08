"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandLogo } from "@/components/brand-logo"
import { post } from "@/lib/api"
import { saveTokens } from "@/lib/auth"
import { Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToForgotPassword: () => void
}

export function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword }: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await post<{
        data: { accessToken: string; refreshToken: string }
      }>("/api/auth/login", { email, password })

      saveTokens(response.data.accessToken, response.data.refreshToken)
      router.push("/dashboard")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
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
        <h1 className="text-2xl font-semibold text-zinc-100">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to your account</p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-300">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-zinc-700 bg-zinc-800 pr-10 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-emerald-500 hover:text-emerald-400"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-zinc-400">
        {"Don't have an account? "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-emerald-500 hover:text-emerald-400"
        >
          Sign up
        </button>
      </p>
    </div>
  )
}
