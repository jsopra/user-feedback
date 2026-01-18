"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Edit, Trash2, MoreHorizontal, Globe, BarChart3, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useTranslation } from "@/hooks/use-translation"
import type { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
}

interface ProjectStats {
  total: number
  active: number
  inactive: number
}

export default function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const { t } = useTranslation("projects")
  const { user } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [stats, setStats] = useState<ProjectStats>({ total: 0, active: 0, inactive: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    loadProjectStats()
  }, [project.id, user?.id])

  const loadProjectStats = async () => {
    if (!user?.id) return

    try {
      console.log("Carregando stats para projeto:", project.id, "usuário:", user.id)

      const response = await fetch(`/api/projects/${project.id}/stats?userId=${user.id}`)

      if (response.ok) {
        const data = await response.json()
        console.log("Stats carregadas:", data.stats)
        setStats(data.stats)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        console.error("Erro ao carregar estatísticas:", response.status, errorData)
        setStats({ total: 0, active: 0, inactive: 0 })
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
      setStats({ total: 0, active: 0, inactive: 0 })
    } finally {
      setLoadingStats(false)
    }
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(project.id!)
      setShowDeleteConfirm(false)
      setDropdownOpen(false)
    } else {
      setShowDeleteConfirm(true)
      setDropdownOpen(false)
      // Auto-cancelar após 3 segundos
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const handleView = () => {
    setDropdownOpen(false)
    onView(project)
  }

  const handleEdit = () => {
    setDropdownOpen(false)
    onEdit(project)
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">{project.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">{project.base_domain}</span>
            </div>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleView} className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                {t("viewSurveys")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                {t("editProject")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {t("deleteProject")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição */}
        {project.description && <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>}

        {/* Estatísticas das Surveys */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t("stats.surveys")}</span>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </div>

          {loadingStats ? (
            <div className="flex items-center space-x-2">
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{stats.total}</div>
                <div className="text-gray-500">{t("total")}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.active}
                </div>
                <div className="text-gray-500">{t("active")}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-500 flex items-center justify-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  {stats.inactive}
                </div>
                <div className="text-gray-500">{t("inactive")}</div>
              </div>
            </div>
          )}
        </div>

        {/* Botão Principal */}
        <div className="pt-2 border-t">
          <Button onClick={handleView} className="w-full bg-blue-600 hover:bg-blue-700">
            <Eye className="h-4 w-4 mr-2" />
            {t("viewSurveys")} ({stats.total})
          </Button>
        </div>

        {/* Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription className="text-sm">
              {t("confirmDelete")}
              <div className="flex space-x-2 mt-2">
                <Button size="sm" variant="destructive" onClick={handleDelete} className="h-7 text-xs">
                  {t("confirm")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="h-7 text-xs">
                  {t("cancel")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
