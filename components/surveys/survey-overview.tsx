"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Palette, Target, Star, CheckCircle, Type, AlignLeft } from "lucide-react"
import type { Survey } from "@/types/survey"

interface SurveyOverviewProps {
  survey: Survey
  onPreview: () => void
}

export default function SurveyOverview({ survey, onPreview }: SurveyOverviewProps) {
  const getElementIcon = (type: string) => {
    switch (type) {
      case "text":
        return Type
      case "textarea":
        return AlignLeft
      case "multiple_choice":
        return CheckCircle
      case "rating":
        return Star
      default:
        return FileText
    }
  }

  const getElementLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Texto Simples"
      case "textarea":
        return "Texto Longo"
      case "multiple_choice":
        return "Múltipla Escolha"
      case "rating":
        return "Rating"
      default:
        return "Elemento"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{survey.title}</CardTitle>
              <p className="text-gray-600 mt-1">{survey.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Elementos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Elementos ({survey.elements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {survey.elements.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum elemento adicionado</p>
            ) : (
              <div className="space-y-3">
                {survey.elements.map((element, index) => {
                  const Icon = getElementIcon(element.type)
                  return (
                    <div key={element.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                      <Icon className="h-4 w-4 text-gray-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{element.question}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getElementLabel(element.type)}
                          </Badge>
                          {element.type === "rating" && (
                            <Badge variant="outline" className="text-xs">
                              {element.config?.ratingRange?.min || 5}-{element.config?.ratingRange?.max || 10}
                            </Badge>
                          )}
                          {element.type === "multiple_choice" && (
                            <Badge variant="outline" className="text-xs">
                              {element.config?.allowMultiple ? "Múltipla" : "Única"}
                            </Badge>
                          )}
                          {element.required && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Design */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Preview do Widget */}
              <div className="relative">
                <div className="w-full h-32 bg-gray-100 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute w-32 bg-white shadow-lg p-2 border rounded-lg bottom-2 right-2"
                    style={{
                      backgroundColor: survey.design.backgroundColor,
                    }}
                  >
                    {/* Progress bar sempre presente */}
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="h-1 rounded-full"
                          style={{ backgroundColor: survey.design.primaryColor, width: "60%" }}
                        />
                      </div>
                    </div>
                    <p className="text-xs font-medium mb-1" style={{ color: survey.design.textColor }}>
                      Exemplo
                    </p>
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3].map((star) => (
                        <span key={star} className="text-xs" style={{ color: survey.design.primaryColor }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <button
                      className="w-full text-xs px-2 py-1 rounded text-white"
                      style={{ backgroundColor: survey.design.primaryColor }}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>

              {/* Configurações */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tema</span>
                  <Badge variant="outline">{survey.design.colorTheme === "custom" ? "Personalizado" : "Padrão"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Posição</span>
                  <Badge variant="outline" className="text-xs">
                    {survey.design.widgetPosition.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cantos</span>
                  <Badge variant="secondary">Arredondados</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progresso</span>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alvo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Alvo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Timing</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {survey.target.delay === 0 ? "Imediato" : `Após ${survey.target.delay}s`}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Recorrência</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {survey.target.recurrence === "one_response"
                      ? "Uma vez"
                      : `A cada ${survey.target.recurrenceConfig?.interval || 30} dias`}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Páginas</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {survey.pageRules.length === 0 ? "Todas" : `${survey.pageRules.length} regra(s)`}
                  </Badge>
                  {survey.pageRules.some((rule) => rule.is_regex) && (
                    <Badge variant="secondary" className="ml-1">
                      Regex
                    </Badge>
                  )}
                </div>
              </div>

              {/* Lista de regras */}
              {survey.pageRules.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Regras Ativas</Label>
                  <div className="mt-2 space-y-1">
                    {survey.pageRules.slice(0, 3).map((rule, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge variant={rule.rule_type === "include" ? "default" : "destructive"} className="text-xs">
                          {rule.rule_type === "include" ? "INC" : "EXC"}
                        </Badge>
                        <code className="text-xs bg-gray-100 px-1 rounded truncate max-w-24">{rule.pattern}</code>
                      </div>
                    ))}
                    {survey.pageRules.length > 3 && (
                      <p className="text-xs text-gray-500">+{survey.pageRules.length - 3} mais...</p>
                    )}
                  </div>
                </div>
              )}

              {/* Resumo Textual */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  Survey será exibida {survey.target.delay === 0 ? "imediatamente" : `após ${survey.target.delay}s`}{" "}
                  {survey.pageRules.length === 0 ? "em todas as páginas" : "com regras de filtro"} e{" "}
                  {survey.target.recurrence === "one_response" ? "apenas uma vez por usuário" : "pode repetir"}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>
}
