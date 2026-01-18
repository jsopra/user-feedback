"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useTranslation } from "@/hooks/use-translation"
import { useRouter } from "next/navigation"
import AppHeader from "@/components/layout/app-header"
import ProjectCard from "./project-card"
import ProjectModal from "./project-modal"
import EditProjectModal from "./edit-project-modal"
import type { Project } from "@/types/project"

export default function ProjectsDashboard() {
  const { t } = useTranslation("projects")
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

  const loadProjects = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects?userId=${user.id}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error("Erro ao carregar projetos:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProject = (project: Project) => {
    router.push(`/projects/${project.id}/surveys`)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowEditModal(true)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/projects/${projectId}?userId=${user.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectId))
      } else {
        const data = await response.json()
        alert(`Erro ao excluir projeto: ${data.error}`)
      }
    } catch (error) {
      console.error("Erro ao excluir projeto:", error)
      alert("Erro ao excluir projeto")
    }
  }

  const handleProjectCreated = async (projectData: Project) => {
    if (!user?.id) return

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...projectData,
          created_by: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar projeto")
      }

      const data = await response.json()
      const newProject = data.project

      // Adicionar o projeto criado à lista
      setProjects([newProject, ...projects])
      setShowCreateModal(false)
    } catch (error) {
      console.error("Erro ao criar projeto:", error)
      alert(`Erro ao criar projeto: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)))
    setShowEditModal(false)
    setEditingProject(null)
  }

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
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
      {/* Header */}
      <AppHeader onHomeClick={() => router.push("/")} showSurveysLink={false} showHomeLink={false} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("myProjects")}</h1>
            <p className="text-gray-600 mt-2">Gerencie seus projetos e surveys de feedback</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={loadProjects} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {t("createProject")}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Cards */}
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t("noProjects")}</h3>
            <p className="text-gray-600 mb-6">{t("noProjectsDescription")}</p>
            <Button onClick={() => setShowCreateModal(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {t("createFirstProject")}
            </Button>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <ProjectModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleProjectCreated} />

      {/* Edit Project Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingProject(null)
        }}
        onSuccess={handleProjectUpdated}
      />
    </div>
  )
}
