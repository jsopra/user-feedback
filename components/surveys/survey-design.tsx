"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Palette } from "lucide-react"
import type { Survey } from "@/types/survey"

interface SurveyDesignProps {
  survey: Survey
  setSurvey: (survey: Survey) => void
}

export default function SurveyDesign({ survey, setSurvey }: SurveyDesignProps) {
  const updateDesign = (key: keyof Survey["design"], value: any) => {
    setSurvey({
      ...survey,
      design: {
        ...survey.design,
        [key]: value,
      },
    })
  }

  const positions = [
    { value: "top-left", label: "Superior Esquerda" },
    { value: "top-center", label: "Superior Centro" },
    { value: "top-right", label: "Superior Direita" },
    { value: "center-left", label: "Centro Esquerda" },
    { value: "center-center", label: "Centro" },
    { value: "center-right", label: "Centro Direita" },
    { value: "bottom-left", label: "Inferior Esquerda" },
    { value: "bottom-center", label: "Inferior Centro" },
    { value: "bottom-right", label: "Inferior Direita" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configurações de Design */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Personalização Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tema de Cores */}
            <div>
              <Label className="text-base font-medium">Tema de Cores</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={survey.design.colorTheme === "default" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateDesign("colorTheme", "default")}
                >
                  Padrão
                </Button>
                <Button
                  variant={survey.design.colorTheme === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateDesign("colorTheme", "custom")}
                >
                  Personalizado
                </Button>
              </div>

              {survey.design.colorTheme === "custom" && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <Label htmlFor="primaryColor">Cor Principal</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={survey.design.primaryColor}
                        onChange={(e) => updateDesign("primaryColor", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={survey.design.primaryColor}
                        onChange={(e) => updateDesign("primaryColor", e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={survey.design.backgroundColor}
                        onChange={(e) => updateDesign("backgroundColor", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={survey.design.backgroundColor}
                        onChange={(e) => updateDesign("backgroundColor", e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="textColor">Cor do Texto</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="textColor"
                        type="color"
                        value={survey.design.textColor}
                        onChange={(e) => updateDesign("textColor", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={survey.design.textColor}
                        onChange={(e) => updateDesign("textColor", e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Posicionamento */}
            <div>
              <Label className="text-base font-medium">Posição do Widget</Label>
              <div className="grid grid-cols-3 gap-2 p-4 border rounded-lg bg-gray-50 mt-2">
                {positions.map((position) => (
                  <Button
                    key={position.value}
                    variant={survey.design.widgetPosition === position.value ? "default" : "outline"}
                    size="sm"
                    className="h-12 text-xs"
                    onClick={() => updateDesign("widgetPosition", position.value)}
                  >
                    {position.value === survey.design.widgetPosition && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Posição atual: {positions.find((p) => p.value === survey.design.widgetPosition)?.label}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Preview do Design
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Simulação da tela */}
            <div className="w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden">
              {/* Widget Preview */}
              <div
                className="absolute w-48 bg-white shadow-lg p-4 border rounded-lg"
                style={{
                  backgroundColor: survey.design.backgroundColor,
                  ...getPositionStyles(survey.design.widgetPosition),
                }}
              >
                {/* Progress bar automática */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="h-1 rounded-full"
                      style={{ backgroundColor: survey.design.primaryColor, width: "60%" }}
                    />
                  </div>
                </div>

                {/* Conteúdo da survey */}
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: survey.design.textColor }}>
                    Como você avalia nosso serviço?
                  </p>

                  {/* Slider preview */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs" style={{ color: survey.design.textColor }}>
                      <span>5</span>
                      <span>10</span>
                    </div>
                    <div className="relative">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: survey.design.primaryColor, width: "60%" }}
                        />
                      </div>
                      <div
                        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md"
                        style={{
                          backgroundColor: survey.design.primaryColor,
                          left: "60%",
                          top: "-4px",
                          transform: "translateX(-50%)",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    className="w-full text-sm px-3 py-2 rounded text-white"
                    style={{ backgroundColor: survey.design.primaryColor }}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Configurações ativas */}
            <div className="mt-4 flex flex-wrap gap-1">
              {survey.design.colorTheme === "custom" && <Badge variant="secondary">Tema Personalizado</Badge>}
              <Badge variant="secondary">Cantos Arredondados</Badge>
              <Badge variant="secondary">Barra de Progresso</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getPositionStyles(position: string) {
  const positions: Record<string, React.CSSProperties> = {
    "top-left": { top: "8px", left: "8px" },
    "top-center": { top: "8px", left: "50%", transform: "translateX(-50%)" },
    "top-right": { top: "8px", right: "8px" },
    "center-left": { top: "50%", left: "8px", transform: "translateY(-50%)" },
    "center-center": { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    "center-right": { top: "50%", right: "8px", transform: "translateY(-50%)" },
    "bottom-left": { bottom: "8px", left: "8px" },
    "bottom-center": { bottom: "8px", left: "50%", transform: "translateX(-50%)" },
    "bottom-right": { bottom: "8px", right: "8px" },
  }
  return positions[position] || positions["bottom-right"]
}
