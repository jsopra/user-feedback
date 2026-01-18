"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Type, AlignLeft, CheckCircle, BarChart3, Trash2, GripVertical, Edit3 } from "lucide-react"
import type { Survey, SurveyElement } from "@/types/survey"

interface SurveyElementsProps {
  survey: Survey
  setSurvey: (survey: Survey) => void
}

export default function SurveyElements({ survey, setSurvey }: SurveyElementsProps) {
  const [editingElement, setEditingElement] = useState<string | null>(null)

  const elementTypes = [
    {
      type: "text" as const,
      label: "Texto Simples",
      icon: Type,
      description: "Campo de texto de uma linha",
    },
    {
      type: "textarea" as const,
      label: "Texto Longo",
      icon: AlignLeft,
      description: "Campo de texto de múltiplas linhas",
    },
    {
      type: "multiple_choice" as const,
      label: "Múltipla Escolha",
      icon: CheckCircle,
      description: "Opções de escolha única ou múltipla",
    },
    {
      type: "rating" as const,
      label: "Rating",
      icon: BarChart3,
      description: "Slider de avaliação numérica",
    },
  ]

  const addElement = (type: SurveyElement["type"]) => {
    const newElement: SurveyElement = {
      id: `element_${Date.now()}`,
      type,
      question: `Nova pergunta ${type}`,
      required: false,
      order_index: survey.elements.length,
      config:
        type === "multiple_choice"
          ? { options: ["Opção 1", "Opção 2"], allowMultiple: false }
          : type === "rating"
            ? { ratingRange: { min: 1, max: 10, defaultValue: undefined } }
            : {},
    }

    setSurvey({
      ...survey,
      elements: [...survey.elements, newElement],
    })
    setEditingElement(newElement.id ?? null)
  }

  const updateElement = (elementId: string, updates: Partial<SurveyElement>) => {
    setSurvey({
      ...survey,
      elements: survey.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
    })
  }

  const removeElement = (elementId: string) => {
    setSurvey({
      ...survey,
      elements: survey.elements.filter((el) => el.id !== elementId),
    })
  }

  const moveElement = (elementId: string, direction: "up" | "down") => {
    const elements = [...survey.elements]
    const index = elements.findIndex((el) => el.id === elementId)

    if (direction === "up" && index > 0) {
      ;[elements[index], elements[index - 1]] = [elements[index - 1], elements[index]]
    } else if (direction === "down" && index < elements.length - 1) {
      ;[elements[index], elements[index + 1]] = [elements[index + 1], elements[index]]
    }

    elements.forEach((el, idx) => (el.order_index = idx))
    setSurvey({ ...survey, elements })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Elementos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {elementTypes.map((elementType) => {
              const Icon = elementType.icon
              return (
                <Button
                  key={elementType.type}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 bg-transparent"
                  onClick={() => addElement(elementType.type)}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-left">
                      <div className="font-medium">{elementType.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{elementType.description}</div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Elementos da Survey ({survey.elements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {survey.elements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum elemento adicionado ainda</p>
                <p className="text-sm">Clique em um tipo de elemento para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {survey.elements.map((element, index) => (
                  <ElementEditor
                    key={element.id}
                    element={element}
                    index={index}
                    isEditing={editingElement === element.id}
                    onEdit={() => setEditingElement(element.id || null)}
                    onSave={() => setEditingElement(null)}
                    onUpdate={(updates) => updateElement(element.id!, updates)}
                    onRemove={() => removeElement(element.id!)}
                    onMove={(direction) => moveElement(element.id!, direction)}
                    canMoveUp={index > 0}
                    canMoveDown={index < survey.elements.length - 1}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface ElementEditorProps {
  element: SurveyElement
  index: number
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onUpdate: (updates: Partial<SurveyElement>) => void
  onRemove: () => void
  onMove: (direction: "up" | "down") => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function ElementEditor({
  element,
  index,
  isEditing,
  onEdit,
  onSave,
  onUpdate,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}: ElementEditorProps) {
  const getElementIcon = (type: SurveyElement["type"]) => {
    switch (type) {
      case "text":
        return Type
      case "textarea":
        return AlignLeft
      case "multiple_choice":
        return CheckCircle
      case "rating":
        return BarChart3
      default:
        return Type
    }
  }

  const getElementLabel = (type: SurveyElement["type"]) => {
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

  const Icon = getElementIcon(element.type)

  if (isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{getElementLabel(element.type)}</span>
              </div>
              <Button size="sm" onClick={onSave}>
                Salvar
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor={`question-${element.id}`}>Pergunta</Label>
                <Input
                  id={`question-${element.id}`}
                  value={element.question}
                  onChange={(e) => onUpdate({ question: e.target.value })}
                  placeholder="Digite sua pergunta..."
                />
              </div>

              {element.type === "rating" && (
                <div>
                  <Label>Escala de Rating</Label>
                  <div className="space-y-4 mt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Valor Mínimo</Label>
                        <Input
                          type="number"
                          min="1"
                          max="9"
                          value={element.config?.ratingRange?.min || 1}
                          onChange={(e) => {
                            const min = Number.parseInt(e.target.value) || 1
                            const max = element.config?.ratingRange?.max || 10
                            const defaultValue = element.config?.ratingRange?.defaultValue
                            onUpdate({
                              config: {
                                ...element.config,
                                ratingRange: {
                                  min,
                                  max,
                                  defaultValue:
                                    defaultValue && (defaultValue < min || defaultValue > max)
                                      ? undefined
                                      : defaultValue,
                                },
                              },
                            })
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Valor Máximo</Label>
                        <Input
                          type="number"
                          min="2"
                          max="10"
                          value={element.config?.ratingRange?.max || 10}
                          onChange={(e) => {
                            const min = element.config?.ratingRange?.min || 1
                            const max = Number.parseInt(e.target.value) || 10
                            const defaultValue = element.config?.ratingRange?.defaultValue
                            onUpdate({
                              config: {
                                ...element.config,
                                ratingRange: {
                                  min,
                                  max,
                                  defaultValue:
                                    defaultValue && (defaultValue < min || defaultValue > max)
                                      ? undefined
                                      : defaultValue,
                                },
                              },
                            })
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Valor Padrão (opcional)</Label>
                      <Input
                        type="number"
                        min={element.config?.ratingRange?.min || 1}
                        max={element.config?.ratingRange?.max || 10}
                        value={element.config?.ratingRange?.defaultValue || ""}
                        onChange={(e) => {
                          const value = e.target.value ? Number.parseInt(e.target.value) : undefined
                          onUpdate({
                            config: {
                              ...element.config,
                              ratingRange: {
                                min: element.config?.ratingRange?.min || 1,
                                max: element.config?.ratingRange?.max || 10,
                                defaultValue: value,
                              },
                            },
                          })
                        }}
                        placeholder="Deixe vazio para não ter valor padrão"
                      />
                      <p className="text-xs text-gray-500 mt-1">Valor inicial que aparecerá selecionado no slider</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${element.id}`}
                  checked={element.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                />
                <Label htmlFor={`required-${element.id}`}>Campo obrigatório</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">#{index + 1}</span>
            </div>
            <Icon className="h-4 w-4 text-gray-600" />
            <div>
              <div className="font-medium">{element.question}</div>
              <div className="text-sm text-gray-500">
                {getElementLabel(element.type)}
                {element.type === "rating" &&
                  ` (${element.config?.ratingRange?.min || 1}-${element.config?.ratingRange?.max || 10})`}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={() => onMove("up")} disabled={!canMoveUp}>
              ↑
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onMove("down")} disabled={!canMoveDown}>
              ↓
            </Button>
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onRemove} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
