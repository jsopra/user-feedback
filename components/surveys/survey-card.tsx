"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye,
  Trash2,
  BarChart3,
  FileText,
  Lightbulb,
  LightbulbOff,
  Calendar,
  Users,
  Settings,
  Edit,
  Code,
} from "lucide-react"
import type { Survey } from "@/types/survey"
import { useTranslation } from "@/hooks/use-translation"

interface SurveyCardProps {
  survey: Survey
  hasRecentActivity?: boolean
  activityCount?: number
  onView: (survey: Survey) => void
  onEdit: (survey: Survey) => void
  onDelete: (surveyId: string) => void
  onDashboard: (surveyId: string) => void
  onEmbed: (surveyId: string) => void
  onStatusChange: (surveyId: string, isActive: boolean) => void
}

export default function SurveyCard({
  survey,
  hasRecentActivity = false,
  activityCount = 0,
  onView,
  onEdit,
  onDelete,
  onDashboard,
  onEmbed,
  onStatusChange,
}: SurveyCardProps) {
  const { t } = useTranslation("surveys")
  const [isToggling, setIsToggling] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleStatusToggle = async (checked: boolean) => {
    setIsToggling(true)
    try {
      await onStatusChange(survey.id!, checked)
    } catch (error) {
      console.error("Erro ao alterar status:", error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(survey.id!)
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
      // Auto-cancelar após 3 segundos
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 border-l-4"
      style={{ borderLeftColor: survey.is_active ? "#10b981" : "#6b7280" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">{survey.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{survey.description}</p>
          </div>

          {/* Indicador de Atividade */}
          <div className="flex items-center space-x-2 ml-4">
            {hasRecentActivity ? (
              <Lightbulb className="h-4 w-4 text-green-600" />
            ) : (
              <LightbulbOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações da Survey */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{survey.elements?.length || 0} {t("elementsCount").split("(")[0].trim()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{survey.created_at ? formatDate(survey.created_at) : "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{survey.pageRules?.length || 0} regras</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-400" />
            <Badge variant={survey.target?.recurrence === "one_response" ? "secondary" : "outline"} className="text-xs">
              {survey.target?.recurrence === "one_response" ? "Uma vez" : "Recorrente"}
            </Badge>
          </div>
        </div>

        {/* Status e Controles */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={survey.is_active}
                onCheckedChange={handleStatusToggle}
                disabled={isToggling}
                className="data-[state=checked]:bg-green-600"
              />
              <span className={`text-sm font-medium ${survey.is_active ? "text-green-600" : "text-gray-500"}`}>
                {survey.is_active ? t("publish") : t("unpublish")}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(survey)} title={t("editSurvey")}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onView(survey)} title={t("previewSurvey")}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDashboard(survey.id!)} title="Dashboard da Survey">
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEmbed(survey.id!)} title="Código de Incorporação">
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className={showDeleteConfirm ? "text-red-600 bg-red-50" : ""}
              title={showDeleteConfirm ? t("confirming") : t("deleteConfirm")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription className="text-sm">
              {t("confirmDeleteSurvey")}
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
