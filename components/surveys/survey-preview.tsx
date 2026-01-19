"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Star } from "lucide-react"
import type { Survey, SurveyElement } from "@/types/survey"
import { useSurveyTranslation } from "@/hooks/use-translation"

interface SurveyPreviewProps {
  survey: Survey
  onClose: () => void
}

export default function SurveyPreview({ survey, onClose }: SurveyPreviewProps) {
  // IMPORTANTE: Usa o idioma configurado na survey, não do usuário
  const { t } = useSurveyTranslation("surveys", survey.language as "en" | "pt-br" | "es")
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const handleSubmit = () => {
    setAttemptedSubmit(true)
    const newErrors: Record<string, boolean> = {}
    
    survey.elements.forEach((element) => {
      if (!element.required || !element.id) {
        return // Pula elementos não obrigatórios
      }
      
      const value = formData[element.id]
      
      // Verifica se está vazio baseado no tipo
      if (value === undefined || value === null) {
        newErrors[element.id] = true
        return
      }
      
      if (Array.isArray(value) && value.length === 0) {
        newErrors[element.id] = true
        return
      }
      
      if (typeof value === 'string' && value.trim() === '') {
        newErrors[element.id] = true
        return
      }
      
      if (typeof value === 'number' && value <= 0) {
        newErrors[element.id] = true
        return
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Scroll para o primeiro erro
      const firstErrorElement = document.querySelector('.border-red-500')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return // IMPORTANTE: Não continua se houver erros
    }

    // Só chega aqui se não houver erros
    setErrors({})
    alert(`${t("builder.preview.title")}: ${t("builder.preview.success")}`)
  }

  const updateFormData = (elementId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [elementId]: value }))
    if (errors[elementId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[elementId]
        return newErrors
      })
    }
  }

  const renderElement = (element: SurveyElement) => {
    if (!element.id) return null
    const elementId = element.id // TypeScript type narrowing
    const hasError = errors[elementId]
    switch (element.type) {
      case "text":
        return (
          <div>
            <input
              type="text"
              placeholder={element.config?.placeholder || t("builder.preview.enterYourAnswer")}
              className={`w-full p-2 border rounded ${hasError ? "border-red-500" : ""}`}
              style={{ borderRadius: (survey.design as any).borderRadius }}
              value={formData[elementId] || ""}
              onChange={(e) => updateFormData(elementId, e.target.value)}
            />
            {hasError && <p className="text-red-500 text-sm mt-1">{t("builder.preview.requiredField")}</p>}
          </div>
        )

      case "textarea":
        return (
          <div>
            <textarea
              placeholder={element.config?.placeholder || t("builder.preview.enterYourAnswer")}
              maxLength={element.config?.maxLength}
              className={`w-full p-2 border rounded ${hasError ? "border-red-500" : ""}`}
              style={{ borderRadius: (survey.design as any).borderRadius }}
              rows={4}
              value={formData[elementId] || ""}
              onChange={(e) => updateFormData(elementId, e.target.value)}
            />
            {hasError && <p className="text-red-500 text-sm mt-1">{t("builder.preview.requiredField")}</p>}
          </div>
        )

      case "multiple_choice":
        const isMultiple = element.config?.allowMultiple
        return (
          <div>
            <div className="space-y-2">
              {element.config?.options?.map((option, idx) => (
                <label key={idx} className="flex items-center space-x-2">
                  <input
                    type={isMultiple ? "checkbox" : "radio"}
                    name={elementId}
                    value={option}
                    checked={isMultiple
                      ? (formData[elementId] || []).includes(option)
                      : formData[elementId] === option
                    }
                    onChange={(e) => {
                      if (isMultiple) {
                        const current = formData[elementId] || []
                        const newValue = e.target.checked
                          ? [...current, option]
                          : current.filter((v: string) => v !== option)
                        updateFormData(elementId, newValue)
                      } else {
                        updateFormData(elementId, option)
                      }
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-red-500 text-sm mt-1">{t("builder.preview.requiredField")}</p>}
          </div>
        )

      case "rating":
        const maxRating = element.config?.ratingRange?.max || 5
        return (
          <div>
            <div className="flex space-x-1">
              {Array.from({ length: maxRating }).map((_, idx) => {
                const rating = idx + 1
                const isSelected = formData[elementId] >= rating
                return (
                  <Star
                    key={idx}
                    className={`h-6 w-6 cursor-pointer hover:fill-current ${isSelected ? "fill-current" : ""}`}
                    style={{ color: (survey.design as any).primaryColor }}
                    onClick={() => updateFormData(elementId, rating)}
                  />
                )
              })}
            </div>
            {hasError && <p className="text-red-500 text-sm mt-1">{t("builder.preview.requiredField")}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{t("builder.preview.title")}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="p-6"
          style={{
            backgroundColor: survey.design.backgroundColor,
            fontFamily: (survey.design as any).fontFamily,
          }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: (survey.design as any).primaryColor }}>
              {survey.title}
            </h1>
            <p className="text-gray-600">{survey.description}</p>
          </div>

          <div className="space-y-6">
            {survey.elements.map((element) => (
              <div key={element.id}>
                <label className="block text-sm font-medium mb-2">
                  {element.question}
                  {element.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderElement(element)}
                {attemptedSubmit && element.required && element.id && !formData[element.id] && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-sm font-medium">⚠️ {t("builder.preview.requiredField")}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              style={{
                backgroundColor: (survey.design as any).primaryColor,
                borderRadius: (survey.design as any).borderRadius,
              }}
            >
              {t("builder.preview.submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
