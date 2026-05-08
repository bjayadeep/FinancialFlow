"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandLogo } from "@/components/brand-logo"
import { post } from "@/lib/api"
import { saveTokens } from "@/lib/auth"
import { Eye, EyeOff } from "lucide-react"

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" }
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" }
  if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" }
  if (score <= 4) return { score: 4, label: "Strong", color: "bg-emerald-500" }
  return { score: 5, label: "Very Strong", color: "bg-emerald-400" }
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await post<{
        data: { accessToken: string; refreshToken: string }
      }>("/api/auth/register", { name: fullName, email, password })

      saveTokens(response.data.accessToken, response.data.refreshToken)
      router.push("/dashboard")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Registration failed")
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
        <h1 className="text-2xl font-semibold text-zinc-100">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-400">Start managing your finances today</p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registerEmail" className="text-zinc-300">Email</Label>
          <Input
            id="registerEmail"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registerPassword" className="text-zinc-300">Password</Label>
          <div className="relative">
            <Input
              id="registerPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full ${
                      level <= passwordStrength.score ? passwordStrength.color : "bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${passwordStrength.color.replace("bg-", "text-")}`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-zinc-700 bg-zinc-800 pr-10 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
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
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-emerald-500 hover:text-emerald-400"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
