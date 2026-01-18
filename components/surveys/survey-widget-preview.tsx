"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { X, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Survey, SurveyElement } from "@/types/survey"
import { getDeviceType } from "@/lib/device-parser"
import { useTranslation } from "@/hooks/use-translation"

interface SurveyWidgetPreviewProps {
  survey: Survey
  onClose: () => void
}

export default function SurveyWidgetPreview({ survey, onClose }: SurveyWidgetPreviewProps) {
  const { t } = useTranslation("surveys")
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [exposureTracked, setExposureTracked] = useState(false)
  const [showSoftGate, setShowSoftGate] = useState(survey.design?.softGate !== false)
  const [hitTracked, setHitTracked] = useState(false)

  const trackHit = async () => {
    if (hitTracked) return

    try {
      const sessionId = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const hitData = {
        sessionId: sessionId,
        route: window.location.pathname + "?preview=true",
        device: getDeviceType(navigator.userAgent),
        userAgent: navigator.userAgent,
        custom_params: { preview: true, source: "widget_preview" },
        trigger_mode: survey.target.triggerMode || "time",
      }

      const response = await fetch(`/api/surveys/${survey.id}/hits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hitData),
      })

      if (response.ok) {
        console.log("Preview hit tracked successfully")
        setHitTracked(true)
      }
    } catch (error) {
      console.log("Error tracking preview hit:", error)
    }
  }

  const trackExposure = async () => {
    if (exposureTracked) return

    try {
      const sessionId = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const exposureData = {
        sessionId: sessionId,
        route: window.location.pathname + "?preview=true",
        device: getDeviceType(navigator.userAgent),
        userAgent: navigator.userAgent,
        custom_params: { preview: true, source: "widget_preview" },
        trigger_mode: survey.target.triggerMode || "time",
      }

      const response = await fetch(`/api/surveys/${survey.id}/exposures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exposureData),
      })

      if (response.ok) {
        console.log("Preview exposure tracked successfully")
        setExposureTracked(true)
      }
    } catch (error) {
      console.log("Error tracking preview exposure:", error)
    }
  }

  useEffect(() => {
    trackHit()
    
    // If soft gate is disabled, automatically track exposure and go directly to survey
    if (survey.design?.softGate === false) {
      trackExposure()
    }
  }, [])

  const handleSoftGateAccept = () => {
    setShowSoftGate(false)
    trackExposure()
  }

  const handleSoftGateReject = () => {
    onClose()
  }

  const handleResponse = (elementId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [elementId]: value }))
  }

  const nextStep = async () => {
    if (currentStep < survey.elements.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finalizar survey e salvar no banco
      console.log("Survey finalizada:", responses)

      try {
        // Gerar session ID único
        const sessionId = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Converter responses para o formato esperado pela API
        const formattedResponses: Record<string, any> = {}

        survey.elements.forEach((element, index) => {
          const response = responses[element.id || '']
          if (response !== null && response !== undefined && response !== "") {
            formattedResponses[index.toString()] = response
          }
        })

        const requestBody = {
          responses: formattedResponses,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          url: window.location.href + "?preview=true",
          timestamp: new Date().toISOString(),
          custom_params: { preview: true, source: "widget_preview" },
          trigger_mode: survey.target.triggerMode || "time",
        }

        console.log("Enviando dados:", requestBody)

        const response = await fetch(`/api/surveys/${survey.id}/responses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        const result = await response.json()
        console.log("Resposta da API:", result)

        if (response.ok) {
          console.log("Resposta salva com sucesso!")
        } else {
          console.error("Erro ao salvar resposta:", result.error)
        }
      } catch (error) {
        console.error("Erro ao salvar resposta:", error)
      }

      setIsCompleted(true)

      // Fechar automaticamente em 3 segundos
      setTimeout(() => {
        setIsClosing(true)
        setTimeout(() => {
          onClose()
        }, 300) // Tempo para animação de saída
      }, 3000)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderElement = (element: SurveyElement) => {
    const value = responses[element.id || '']

    switch (element.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleResponse(element.id || '', e.target.value)}
            placeholder={element.config?.placeholder || "Digite sua resposta..."}
            className="border-gray-300"
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => handleResponse(element.id || '', e.target.value)}
            placeholder={element.config?.placeholder || "Digite sua resposta..."}
            maxLength={element.config?.maxLength}
            className="border-gray-300"
            rows={3}
          />
        )

      case "multiple_choice":
        return (
          <div className="space-y-2">
            {element.config?.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type={element.config?.allowMultiple ? "checkbox" : "radio"}
                  name={element.id || `element_${idx}`}
                  value={option}
                  checked={element.config?.allowMultiple ? (value || []).includes(option) : value === option}
                  onChange={(e) => {
                    if (element.config?.allowMultiple) {
                      const currentValues = value || []
                      if (e.target.checked) {
                        handleResponse(element.id || '', [...currentValues, option])
                      } else {
                        handleResponse(
                          element.id || '',
                          currentValues.filter((v: string) => v !== option),
                        )
                      }
                    } else {
                      handleResponse(element.id || '', option)
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )

      case "rating":
        const min = element.config?.ratingRange?.min || 1
        const max = element.config?.ratingRange?.max || 10
        const currentValue = value || min

        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{min}</span>
              <span className="font-medium text-lg" style={{ color: (survey.design as any).primaryColor }}>
                {currentValue}
              </span>
              <span>{max}</span>
            </div>
            <Slider
              value={[currentValue]}
              onValueChange={([newValue]) => handleResponse(element.id || '', newValue)}
              min={min}
              max={max}
              step={1}
              className="w-full"
              style={
                {
                  "--slider-track": (survey.design as any).primaryColor,
                  "--slider-range": (survey.design as any).primaryColor,
                } as React.CSSProperties
              }
            />
          </div>
        )

      default:
        return null
    }
  }

  const getPositionStyles = (position: string) => {
    const positions: Record<string, React.CSSProperties> = {
      "top-left": { top: "20px", left: "20px" },
      "top-center": { top: "20px", left: "50%", transform: "translateX(-50%)" },
      "top-right": { top: "20px", right: "20px" },
      "center-left": { top: "50%", left: "20px", transform: "translateY(-50%)" },
      "center-center": { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      "center-right": { top: "50%", right: "20px", transform: "translateY(-50%)" },
      "bottom-left": { bottom: "20px", left: "20px" },
      "bottom-center": { bottom: "20px", left: "50%", transform: "translateX(-50%)" },
      "bottom-right": { bottom: "20px", right: "20px" },
    }
    return positions[position] || positions["bottom-right"]
  }

  if (showSoftGate) {
    return (
      <div
        className="fixed z-50 bg-white shadow-2xl border rounded-lg"
        style={{
          backgroundColor: survey.design.backgroundColor,
          ...getPositionStyles(survey.design.widgetPosition || "bottom-right"),
          padding: "12px 16px",
          minWidth: "280px",
          maxWidth: "400px",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs flex-1" style={{ color: (survey.design as any).textColor }}>
            {t("canMakeQuestions")}
          </p>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSoftGateAccept}
              size="sm"
              className="h-7 px-3 text-xs bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
            >
              <ThumbsUp className="h-3 w-3" />
              Sim
            </Button>
            <Button
              onClick={handleSoftGateReject}
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs bg-transparent flex items-center gap-1"
            >
              <ThumbsDown className="h-3 w-3" />
              Não
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (survey.elements.length === 0) {
    return (
      <div
        className="fixed z-50 w-80 bg-white shadow-2xl border rounded-lg p-4"
        style={{
          backgroundColor: survey.design.backgroundColor,
          ...getPositionStyles(survey.design.widgetPosition || "bottom-right"),
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold" style={{ color: (survey.design as any).textColor }}>
            {survey.title}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-gray-500">{t("noElementsInSurvey")}</p>
      </div>
    )
  }

  // Tela de conclusão
  if (isCompleted) {
    return (
      <div
        className={`fixed z-50 w-80 bg-white shadow-2xl border rounded-lg p-6 transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        style={{
          backgroundColor: survey.design.backgroundColor,
          ...getPositionStyles(survey.design.widgetPosition || "bottom-right"),
        }}
      >
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle
              className="h-16 w-16 mx-auto text-green-500 animate-pulse"
              style={{ color: (survey.design as any).primaryColor }}
            />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: (survey.design as any).textColor }}>
            Pesquisa Concluída!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Obrigado por sua participação. Suas respostas são muito importantes para nós.
          </p>
          <div className="text-xs text-gray-400">Fechando automaticamente em alguns segundos...</div>
        </div>
      </div>
    )
  }

  const currentElement = survey.elements[currentStep]
  const progress = ((currentStep + 1) / survey.elements.length) * 100

  return (
    <div
      className="fixed z-50 w-80 bg-white shadow-2xl border rounded-lg p-4"
      style={{
        backgroundColor: survey.design.backgroundColor,
        ...getPositionStyles(survey.design.widgetPosition || "bottom-right"),
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold" style={{ color: (survey.design as any).textColor }}>
          {survey.title}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: (survey.design as any).primaryColor,
              width: `${progress}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {currentStep + 1} de {survey.elements.length}
        </p>
      </div>

      {/* Question */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: survey.design.textColor }}>
          {currentElement.question}
          {currentElement.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {renderElement(currentElement)}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0}>
          Anterior
        </Button>
        <Button
          size="sm"
          onClick={nextStep}
          style={{
            backgroundColor: survey.design.primaryColor,
          }}
          className="text-white"
        >
          {currentStep === survey.elements.length - 1 ? "Finalizar" : "Próximo"}
        </Button>
      </div>
    </div>
  )
}
