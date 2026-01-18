"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SurveyBuilder from "@/components/surveys/survey-builder"
import type { Survey } from "@/types/survey"
import type { Project } from "@/types/project"

export default function EditSurveyPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const surveyId = params.id as string

  useEffect(() => {
    if (surveyId && user) {
      loadSurvey()
    }
  }, [surveyId, user])

  const loadSurvey = async () => {
    if (!surveyId || !user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/surveys/${surveyId}?userId=${user.id}`)
      const data = await response.json()

      if (response.ok) {
        setSurvey(data.survey)
        if (data.survey.project_id) {
          await loadProject(data.survey.project_id)
        }
      } else {
        throw new Error(data.error || "Erro ao carregar survey")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao carregar survey")
    } finally {
      setIsLoading(false)
    }
  }

  const loadProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}?userId=${user?.id}`)
      const data = await response.json()

      if (response.ok) {
        setProject(data.project)
      }
    } catch (error) {
    }
  }

  const handleSaveSurvey = async (surveyData: Partial<Survey>) => {
    if (!user?.id || !surveyId) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...surveyData,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update survey state if API returns updated survey data
        if (data.survey) {
          setSurvey(data.survey)
        }
        setSuccess("Survey atualizada com sucesso!")
        
        return data.survey || survey
      } else {
        throw new Error(data.error || "Erro ao atualizar survey")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao atualizar survey")
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (survey?.project_id) {
      router.push(`/projects/${survey.project_id}/surveys`)
    } else {
      router.push("/")
    }
  }

  const handlePreview = () => {
    // Implementar preview da survey
    console.log("Preview survey:", surveyId)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para editar surveys.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey não encontrada</h2>
          <p className="text-gray-600 mb-6">A survey que você está tentando editar não foi encontrada.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Survey Builder */}
      <SurveyBuilder
        survey={survey}
        onSave={handleSaveSurvey}
        isLoading={isSaving}
        project={project}
        surveyId={surveyId}
        onBack={handleBack}
        onBackToHome={() => router.push("/")}
      />
    </div>
  )
}
