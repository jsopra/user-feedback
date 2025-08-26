"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import ProjectsDashboard from "@/components/projects/projects-dashboard"
import type { Project } from "@/types/project"
import type { Survey } from "@/types/survey"

type ViewMode = "projects" | "project-surveys" | "survey-builder" | "survey-dashboard"

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState<ViewMode>("projects")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)

  if (isLoading) {
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
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  // Renderizar dashboard de projetos
  return <ProjectsDashboard />
}

// Componente para mostrar surveys de um projeto específico
interface ProjectSurveysDashboardProps {
  project: Project
  onCreateSurvey: () => void
  onEditSurvey: (survey: Survey) => void
  onViewDashboard: (survey: Survey) => void
  onBackToProjects: () => void
}

function ProjectSurveysDashboard({
  project,
  onCreateSurvey,
  onEditSurvey,
  onViewDashboard,
  onBackToProjects,
}: ProjectSurveysDashboardProps) {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [errorSurveys, setErrorSurveys] = useState<string | null>(null)

  // Carregar surveys do projeto
  const loadSurveys = async () => {
    setLoadingSurveys(true)
    setErrorSurveys(null)

    try {
      const response = await fetch(`/api/surveys?projectId=${project.id}`)
      const data = await response.json()

      if (response.ok) {
        setSurveys(data.surveys || [])
      } else {
        throw new Error(data.error || "Erro ao carregar surveys")
      }
    } catch (error) {
      console.error("Erro ao carregar surveys:", error)
      setErrorSurveys(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setLoadingSurveys(false)
    }
  }

  // Carregar surveys quando o componente montar
  useEffect(() => {
    if (project.id) {
      loadSurveys()
    }
  }, [project.id])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={onBackToProjects} className="text-gray-500 hover:text-gray-700 transition-colors">
                ← Voltar para Projetos
              </button>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            </div>
            <button
              onClick={onCreateSurvey}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Nova Survey
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações do projeto */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">{project.name}</h2>
          {project.description && <p className="text-gray-600 mb-4">{project.description}</p>}
          {project.base_domain && (
            <p className="text-sm text-gray-500">
              <strong>Domínio:</strong> {project.base_domain}
            </p>
          )}
        </div>

        {/* Lista de surveys */}
        {loadingSurveys ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando surveys...</p>
          </div>
        ) : errorSurveys ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{errorSurveys}</p>
            <button onClick={loadSurveys} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Tentar Novamente
            </button>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma survey criada ainda</h3>
            <p className="text-gray-600 mb-6">Crie sua primeira survey para começar a coletar feedback</p>
            <button
              onClick={onCreateSurvey}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg"
            >
              Criar Primeira Survey
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 mb-2">{survey.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Status: <span className="capitalize">{survey.status}</span>
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditSurvey(survey)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onViewDashboard(survey)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
