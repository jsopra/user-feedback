"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useTranslation } from "@/hooks/use-translation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SurveyBuilder from "@/components/surveys/survey-builder"
import type { Project } from "@/types/project"

export default function CreateSurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const { t: t_common } = useTranslation("common")
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const projectId = searchParams.get("projectId")

  useEffect(() => {
    if (projectId && user) {
      loadProject()
    }
  }, [projectId, user])

  const loadProject = async () => {
    if (!projectId || !user?.id) return

    try {
      const response = await fetch(`/api/projects/${projectId}?userId=${user.id}`)
      const data = await response.json()

      if (response.ok) {
        setProject(data.project)
      } else {
        setError(data.error || t_common("messages.error"))
      }
    } catch (error) {
      console.error("Erro ao carregar projeto:", error)
      setError(t_common("messages.error"))
    }
  }

  const handleBack = () => {
    if (projectId) {
      router.push(`/projects/${projectId}/surveys`)
    } else {
      router.push("/")
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t_common("messages.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t_common("messages.accessDenied")}</h2>
          <p className="text-gray-600 mb-6">{t_common("messages.mustBeLoggedIn")}</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            {t_common("messages.login")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <SurveyBuilder
        onBack={handleBack}
        onBackToHome={handleBackToHome}
        projectId={projectId || undefined}
        project={project}
      />
    </div>
  )
}
