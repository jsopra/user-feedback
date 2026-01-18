"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import SurveyDashboard from "@/components/surveys/survey-dashboard"
import type { Survey } from "@/types/survey"

export default function SurveyDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const surveyId = params.id as string

  useEffect(() => {
    if (user && surveyId) {
      loadSurvey()
    }
  }, [user, surveyId])

  const loadSurvey = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/surveys/${surveyId}?userId=${user.id}`)
      const data = await response.json()

      if (response.ok) {
        setSurvey(data.survey)
      } else if (response.status === 404) {
        setError("Survey não encontrada")
      } else {
        throw new Error(data.error || "Erro ao carregar survey")
      }
    } catch (error) {
      console.error("Erro ao carregar survey:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (survey?.project_id) {
      router.push(`/projects/${survey.project_id}/surveys`)
    } else {
      router.push("/")
    }
  }

  const handleEdit = () => {
    router.push(`/surveys/${surveyId}/edit`)
  }

  const handlePreview = () => {
    // Implementar preview
  }

  const handleEmbed = () => {
    // Implementar embed
  }

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Verificar autenticação
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main>
        {/* Error State */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        ) : survey ? (
          <SurveyDashboard
            surveyId={surveyId}
            onBack={handleBack}
            onBackToHome={() => router.push("/")}
            survey={survey as any}
          />
        ) : null}
      </main>
    </div>
  )
}
