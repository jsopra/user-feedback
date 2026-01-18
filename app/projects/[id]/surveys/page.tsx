"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import AppHeader from "@/components/layout/app-header"
import SurveyCard from "@/components/surveys/survey-card"
import SurveyWidgetPreview from "@/components/surveys/survey-widget-preview"
import SurveyEmbedModal from "@/components/surveys/survey-embed-modal"
import type { Project } from "@/types/project"
import type { Survey } from "@/types/survey"

export default function ProjectSurveysPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null)
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [embedSurvey, setEmbedSurvey] = useState<Survey | null>(null)

  const projectId = params.id as string

  useEffect(() => {
    if (user && projectId) {
      loadProjectAndSurveys()
    }
  }, [user, projectId])

  const loadProjectAndSurveys = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const projectResponse = await fetch(`/api/projects/${projectId}?userId=${user.id}`)
      const projectData = await projectResponse.json()

      if (projectResponse.ok) {
        setProject(projectData.project)
      } else if (projectResponse.status === 404) {
        setError("Projeto não encontrado")
        return
      } else {
        throw new Error(projectData.error || "Erro ao carregar projeto")
      }

      const surveysResponse = await fetch(`/api/surveys?projectId=${projectId}&userId=${user.id}`)
      const surveysData = await surveysResponse.json()

      if (surveysResponse.ok) {
        setSurveys(surveysData.surveys || [])
      } else {
        console.warn("Erro ao carregar surveys:", surveysData.error)
        setSurveys([])
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToProjects = () => {
    router.push("/")
  }

  const handleCreateSurvey = () => {
    router.push(`/surveys/create?projectId=${projectId}`)
  }

  const handleViewSurvey = (survey: Survey) => {
    setPreviewSurvey(survey)
    setShowPreview(true)
  }

  const handleEditSurvey = (survey: Survey) => {
    router.push(`/surveys/${survey.id}/edit`)
  }

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta survey?")) {
      return
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadProjectAndSurveys()
      } else {
        const data = await response.json()
        alert(`Erro ao excluir survey: ${data.error}`)
      }
    } catch (error) {
      console.error("Erro ao excluir survey:", error)
      alert("Erro ao excluir survey")
    }
  }

  const handleSurveyDashboard = (surveyId: string) => {
    router.push(`/surveys/${surveyId}/dashboard`)
  }

  const handleSurveyEmbed = (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId)
    if (survey) {
      setEmbedSurvey(survey)
      setShowEmbedModal(true)
    }
  }

  const handleSurveyStatusChange = async (surveyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: isActive,
          userId: user?.id,
        }),
      })

      if (response.ok) {
        setSurveys((prev) =>
          prev.map((survey) => (survey.id === surveyId ? { ...survey, is_active: isActive } : survey)),
        )
      } else {
        const data = await response.json()
        alert(`Erro ao alterar status: ${data.error}`)
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      alert("Erro ao alterar status da survey")
    }
  }

  const handleClosePreview = async () => {
    setShowPreview(false)
    // Recarregar surveys para atualizar indicadores de atividade
    await loadProjectAndSurveys()
  }

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
      <AppHeader onHomeClick={handleBackToProjects} showSurveysLink={false} showHomeLink={true} />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToProjects}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project?.name || "Carregando..."} - Surveys</h1>
                <p className="text-gray-600 mt-1">Gerencie as surveys deste projeto</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={loadProjectAndSurveys} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={handleCreateSurvey} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Survey
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando projeto...</p>
          </div>
        ) : project ? (
          <>
            {surveys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surveys.map((survey) => (
                  <SurveyCard
                    key={survey.id}
                    survey={survey}
                    hasRecentActivity={(survey as any).hasRecentActivity || false}
                    activityCount={(survey as any).activityCount || 0}
                    onView={handleViewSurvey}
                    onEdit={handleEditSurvey}
                    onDelete={handleDeleteSurvey}
                    onDashboard={handleSurveyDashboard}
                    onEmbed={handleSurveyEmbed}
                    onStatusChange={handleSurveyStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma survey criada ainda</h3>
                <p className="text-gray-600 mb-6">Crie sua primeira survey para este projeto</p>
                <Button onClick={handleCreateSurvey} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Survey
                </Button>
              </div>
            )}
          </>
        ) : null}
      </main>

      {showPreview && previewSurvey && <SurveyWidgetPreview survey={previewSurvey} onClose={handleClosePreview} />}

      {showEmbedModal && embedSurvey && (
        <SurveyEmbedModal
          survey={embedSurvey}
          isOpen={showEmbedModal}
          onClose={() => {
            setShowEmbedModal(false)
            setEmbedSurvey(null)
          }}
        />
      )}
    </div>
  )
}
