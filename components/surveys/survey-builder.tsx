"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Adicionando Input para editar nome da survey
import { ArrowLeft, Save, Eye, BarChart3, Edit2, Check, X } from "lucide-react" // Adicionando ícones para edição
import type { Survey } from "@/types/survey"
import AppHeader from "@/components/layout/app-header"
import SurveyElements from "./survey-elements"
import SurveyDesign from "./survey-design"
import SurveyTarget from "./survey-target"
import SurveyOverview from "./survey-overview"
import SurveyPreview from "./survey-preview"
import SurveyWidgetPreview from "./survey-widget-preview"
import { useAuth } from "@/hooks/use-auth"

interface SurveyBuilderProps {
  onBack: (savedSurveyId?: string) => void
  onBackToHome?: () => void
  surveyId?: string
  projectId?: string
  project?: any
  survey?: Survey // Adicionando prop survey para edição
  onSave?: (surveyData: Partial<Survey>) => Promise<void> // Adicionando prop onSave
  isLoading?: boolean // Adicionando prop isLoading
}

export default function SurveyBuilder({
  onBack,
  onBackToHome,
  surveyId,
  projectId,
  project,
  survey: initialSurvey, // Renomeando para evitar conflito
  onSave: externalOnSave, // Renomeando para evitar conflito
  isLoading: externalIsLoading,
}: SurveyBuilderProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState("")

  const [survey, setSurvey] = useState<Survey>(
    initialSurvey || {
      title: "Nova Survey",
      description: "Descrição da survey",
      elements: [],
      design: {
        colorTheme: "default",
        primaryColor: "#3b82f6",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        widgetPosition: "bottom-right",
      },
      target: {
        delay: 0,
        recurrence: "one_response",
        recurrenceConfig: {},
      },
      pageRules: [],
      is_active: false,
      project_id: projectId,
    },
  )

  const [activeTab, setActiveTab] = useState("elements")
  const [showPreview, setShowPreview] = useState(false)
  const [showOverview, setShowOverview] = useState(false)
  const [showWidgetPreview, setShowWidgetPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // Inicializar hasUnsavedChanges como false para não mostrar alerta inicial
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null)

  // Obter project_id da URL se não foi passado como prop
  const getProjectIdFromUrl = () => {
    if (projectId) return projectId

    // Tentar obter da URL atual
    const urlParams = new URLSearchParams(window.location.search)
    const urlProjectId = urlParams.get("projectId")
    if (urlProjectId) return urlProjectId

    // Tentar obter dos searchParams do Next.js
    const searchProjectId = searchParams.get("projectId")
    if (searchProjectId) return searchProjectId

    // Tentar extrair da URL path (ex: /projects/[id]/surveys/create)
    const pathParts = window.location.pathname.split("/")
    const projectIndex = pathParts.indexOf("projects")
    if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
      return pathParts[projectIndex + 1]
    }

    return null
  }

  // Carregar survey existente se houver ID
  useEffect(() => {
    if (surveyId) {
      loadSurvey(surveyId)
    } else {
      // Se não há surveyId, tentar obter projectId da URL
      const urlProjectId = getProjectIdFromUrl()
      if (urlProjectId) {
        setCurrentProjectId(urlProjectId)
        setSurvey((prev) => ({ ...prev, project_id: urlProjectId }))
      }
    }
  }, [surveyId])

  useEffect(() => {
    if (initialSurvey) {
      console.log("=== SURVEY RECEBIDA COMO PROP ===")
      console.log("Survey:", initialSurvey)
      console.log("Elementos:", initialSurvey.elements)

      setSurvey(initialSurvey)
      setCurrentProjectId(initialSurvey.project_id || null)
      setHasUnsavedChanges(false)
    }
  }, [initialSurvey])

  // useEffect(() => {
  //   if (surveyId && !isLoading) {
  //     setHasUnsavedChanges(true)
  //   }
  // }, [survey, surveyId, isLoading])

  const loadSurvey = async (id: string) => {
    setIsLoading(true)
    setError(null)

    console.log("=== CARREGANDO SURVEY ===")
    console.log("Survey ID:", id)

    try {
      const response = await fetch(`/api/surveys/${id}`)
      const responseData = await response.json()

      console.log("Resposta da API:", responseData)

      if (response.ok) {
        const loadedSurvey = responseData.survey

        console.log("Survey carregada:", loadedSurvey)
        console.log("Elementos:", loadedSurvey.elements)
        console.log("Design:", loadedSurvey.design)
        console.log("Target:", loadedSurvey.target)
        console.log("Page Rules:", loadedSurvey.pageRules)

        // Garantir que todos os campos necessários estão presentes
        const surveyWithDefaults = {
          ...loadedSurvey,
          elements: loadedSurvey.elements || [],
          design: {
            colorTheme: "default",
            primaryColor: "#3b82f6",
            backgroundColor: "#ffffff",
            textColor: "#000000",
            widgetPosition: "bottom-right",
            ...loadedSurvey.design,
          },
          target: {
            delay: 0,
            recurrence: "one_response",
            recurrenceConfig: {},
            ...loadedSurvey.target,
          },
          pageRules: loadedSurvey.pageRules || [],
        }

        console.log("Survey com defaults:", surveyWithDefaults)

        setSurvey(surveyWithDefaults)

        // Definir o project_id a partir da survey carregada
        if (loadedSurvey.project_id) {
          setCurrentProjectId(loadedSurvey.project_id)
        }

        setHasUnsavedChanges(false)
      } else {
        const errorMsg = responseData.error || "Erro desconhecido"
        console.error("Erro na resposta:", errorMsg)
        setError(`Erro ao carregar survey: ${errorMsg}`)
      }
    } catch (error) {
      console.error("Erro ao carregar survey:", error)
      setError("Erro de conexão ao carregar survey")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (externalOnSave) {
      try {
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        await externalOnSave(survey)

        setHasUnsavedChanges(false)
        setSuccess("Survey salva com sucesso!")
      } catch (error) {
        console.error("Erro ao salvar via externalOnSave:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setError(`Erro ao salvar survey: ${errorMessage}`)
      } finally {
        setIsSaving(false)
      }
      return
    }

    if (!user) {
      setError("Você precisa estar logado para salvar")
      return
    }

    // Verificar se temos project_id
    const finalProjectId = currentProjectId || survey.project_id
    if (!finalProjectId) {
      setError("ID do projeto não encontrado. Certifique-se de acessar a partir de um projeto.")
      return
    }

    // Validações básicas
    if (!survey.title.trim()) {
      setError("Título é obrigatório")
      return
    }

    if (!survey.description.trim()) {
      setError("Descrição é obrigatória")
      return
    }

    // Evitar múltiplos salvamentos simultâneos
    if (isSaving) {
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const surveyToSave = {
        ...survey,
        created_by: user.id,
        project_id: finalProjectId,
      }

      console.log("=== SALVANDO SURVEY ===")
      console.log("Survey ID:", surveyId)
      console.log("Project ID:", finalProjectId)
      console.log("User ID:", user.id)
      console.log("Dados completos:", JSON.stringify(surveyToSave, null, 2))

      const url = surveyId ? `/api/surveys/${surveyId}` : "/api/surveys"
      const method = surveyId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyToSave),
      })

      const responseData = await response.json()
      console.log("Resposta:", responseData)

      if (response.ok) {
        let finalSurveyId = surveyId

        // Se é uma nova survey, pegar o ID retornado
        if (!surveyId && responseData.survey) {
          finalSurveyId = responseData.survey.id
          setSurvey((prev) => ({ ...prev, id: finalSurveyId }))
        }

        setHasUnsavedChanges(false)
        setSuccess("Survey salva com sucesso!")
      } else {
        throw new Error(responseData.error || "Erro desconhecido")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Se for erro de tabela não encontrada, sugerir configuração
      if (errorMessage.includes("does not exist") || errorMessage.includes("42P01")) {
        setError(`${errorMessage}. Execute o script SQL para criar as tabelas necessárias.`)
      } else {
        setError(`Erro ao salvar survey: ${errorMessage}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleTitleChange = (newTitle: string) => {
    setSurvey({ ...survey, title: newTitle })
    setError(null)
  }

  const handleBack = () => {
    if (hasUnsavedChanges && !window.confirm("Você tem alterações não salvas. Deseja sair mesmo assim?")) {
      return
    }
    onBack()
  }

  const handleBackToHome = () => {
    if (hasUnsavedChanges && !window.confirm("Você tem alterações não salvas. Deseja sair mesmo assim?")) {
      return
    }
    if (onBackToHome) {
      onBackToHome()
    } else {
      onBack()
    }
  }

  const startEditingTitle = () => {
    setTempTitle(survey.title)
    setIsEditingTitle(true)
  }

  const saveTitle = () => {
    if (tempTitle.trim()) {
      setSurvey({ ...survey, title: tempTitle.trim() })
      setHasUnsavedChanges(true)
    }
    setIsEditingTitle(false)
  }

  const cancelEditTitle = () => {
    setTempTitle("")
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveTitle()
    } else if (e.key === "Escape") {
      cancelEditTitle()
    }
  }

  const finalIsLoading = externalIsLoading !== undefined ? externalIsLoading : isLoading

  if (finalIsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando survey...</p>
        </div>
      </div>
    )
  }

  if (showPreview) {
    return <SurveyPreview survey={survey} onClose={() => setShowPreview(false)} />
  }

  if (showOverview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader onHomeClick={handleBackToHome} showHomeLink={true} currentProject={project?.name} />
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setShowOverview(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{survey.title}</h1>
                  <p className="text-sm text-gray-500">Overview da survey</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowWidgetPreview(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SurveyOverview survey={survey} onPreview={() => setShowPreview(true)} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showWidgetPreview && <SurveyWidgetPreview survey={survey} onClose={() => setShowWidgetPreview(false)} />}

      {/* Header Principal */}
      <AppHeader onHomeClick={handleBackToHome} showHomeLink={true} currentProject={project?.name} />

      {/* Sub-header da Survey */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex-1">
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      className="text-xl font-bold"
                      placeholder="Nome da survey"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={saveTitle}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEditTitle}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 group">
                    <h1 className="text-xl font-bold text-gray-900">{survey.title}</h1>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={startEditingTitle}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {surveyId ? "Editando survey" : "Criando nova survey"}
                  {project && <span> • Projeto: {project.name}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowOverview(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowWidgetPreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button size="sm" onClick={(e) => { e.preventDefault(); handleSave(); }} disabled={finalIsLoading}>
                <Save className="h-4 w-4 mr-2" />
                {finalIsLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensagens de erro e sucesso */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Indicador de alterações não salvas */}
        {hasUnsavedChanges && !success && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              Você tem alterações não salvas. Lembre-se de salvar antes de sair.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="elements">Elementos</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="target">Alvo</TabsTrigger>
          </TabsList>

          <TabsContent value="elements">
            <SurveyElements survey={survey} setSurvey={setSurvey} />
          </TabsContent>

          <TabsContent value="design">
            <SurveyDesign survey={survey} setSurvey={setSurvey} />
          </TabsContent>

          <TabsContent value="target">
            <SurveyTarget survey={survey} setSurvey={setSurvey} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
