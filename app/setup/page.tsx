"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, User, Mail, Lock, CheckCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export default function SetupPage() {
  const router = useRouter()
  const { t } = useTranslation("setup")
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/setup/status")
        const data = await response.json()

        if (!data?.needsSetup) {
          router.replace("/")
          return
        }

        setNeedsSetup(true)
      } catch (err) {
        setError(t("errors.setupCheckFailed"))
        setNeedsSetup(true)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    fetchStatus()
  }, [router, t])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError(t("validation.passwordMismatch"))
      return
    }

    if (formData.password.length < 6) {
      setError(t("validation.passwordMinChars"))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/setup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      })

      if (!response.ok) {
        const { error: apiError } = await response.json()
        throw new Error(apiError || t("messages.error"))
      }

      setSuccess(t("messages.success"))
      setFormData({ name: "", email: "", password: "", confirmPassword: "" })

      setTimeout(() => router.replace("/"), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("messages.error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-200">
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          {t("messages.checkingEnvironment")}
        </div>
      </div>
    )
  }

  if (!needsSetup) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8 text-slate-100">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-full">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">{t("title")}</span>
          </div>
          <h1 className="text-3xl font-bold mt-4">{t("subtitle")}</h1>
          <p className="text-slate-300 mt-2">{t("description")}</p>
        </div>

        <Card className="border-slate-700 bg-slate-900/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-slate-100">{t("adminSection")}</CardTitle>
            <CardDescription className="text-slate-400">{t("adminDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-100">
                  <AlertDescription className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">{t("labels.fullName")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder={t("placeholders.fullName")}
                      className="pl-10 bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">{t("labels.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder={t("placeholders.email")}
                      className="pl-10 bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">{t("labels.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder={t("placeholders.password")}
                      className="pl-10 bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200">{t("labels.confirmPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder={t("placeholders.confirmPassword")}
                      className="pl-10 bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("buttons.creating") : t("buttons.create")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
