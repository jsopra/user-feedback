"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/auth/login-form"
import Dashboard from "@/components/dashboard/dashboard"
import { MessageSquare } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch("/api/setup/status")
        const data = await response.json()

        if (data?.needsSetup) {
          router.replace("/setup")
          return
        }
      } catch (error) {
        // Falha em checar setup não bloqueia o carregamento
      } finally {
        setIsCheckingSetup(false)
      }
    }

    checkSetup()
  }, [router])

  if (isLoading || isCheckingSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">UserFeedback</h1>
          <p className="text-gray-600 mt-2">Sistema de coleta de feedback</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-center">Entre com suas credenciais para acessar o painel</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
