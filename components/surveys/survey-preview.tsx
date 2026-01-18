"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Star } from "lucide-react"
import type { Survey, SurveyElement } from "@/types/survey"

interface SurveyPreviewProps {
  survey: Survey
  onClose: () => void
}

export default function SurveyPreview({ survey, onClose }: SurveyPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {}
    
    survey.elements.forEach((element) => {
      if (element.required && element.id) {
        const value = formData[element.id]
        if (!value || (Array.isArray(value) && value.length === 0) || value === "") {
          newErrors[element.id] = true
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Preview apenas - não submete de verdade
    alert("Preview: Respostas validadas com sucesso!")
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
    const hasError = errors[element.id]
    switch (element.type) {
      case "text":
        return (
          <div>
            <input
              type="text"
              placeholder={element.config?.placeholder || "Digite sua resposta..."}
              className={`w-full p-2 border rounded ${hasError ? "border-red-500" : ""}`}
              style={{ borderRadius: (survey.design as any).borderRadius }}
              value={formData[element.id] || ""}
              onChange={(e) => updateFormData(element.id, e.target.value)}
            />
            {hasError && <p className="text-red-500 text-sm mt-1">Este campo é obrigatório</p>}
          </div>
        )

      case "textarea":
        return (
          <div>
            <textarea
              placeholder={element.config?.placeholder || "Digite sua resposta..."}
              maxLength={element.config?.maxLength}
              className={`w-full p-2 border rounded ${hasError ? "border-red-500" : ""}`}
              style={{ borderRadius: (survey.design as any).borderRadius }}
              rows={4}
              value={formData[element.id] || ""}
              onChange={(e) => updateFormData(element.id, e.target.value)}
            />
            {hasError && <p className="text-red-500 text-sm mt-1">Este campo é obrigatório</p>}
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
                    name={element.id}
                    value={option}
                    checked={isMultiple
                      ? (formData[element.id] || []).includes(option)
                      : formData[element.id] === option
                    }
                    onChange={(e) => {
                      if (isMultiple) {
                        const current = formData[element.id] || []
                        const newValue = e.target.checked
                          ? [...current, option]
                          : current.filter((v: string) => v !== option)
                        updateFormData(element.id, newValue)
                      } else {
                        updateFormData(element.id, option)
                      }
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-red-500 text-sm mt-1">Este campo é obrigatório</p>}
          </div>
        )

      case "rating":
        const maxRating = element.config?.ratingRange?.max || 5
        return (
          <div>
            <div className="flex space-x-1">
              {Array.from({ length: maxRating }).map((_, idx) => {
                const rating = idx + 1
                const isSelected = formData[element.id] >= rating
                return (
                  <Star
                    key={idx}
                    className={`h-6 w-6 cursor-pointer hover:fill-current ${isSelected ? "fill-current" : ""}`}
                    style={{ color: (survey.design as any).primaryColor }}
                    onClick={() => updateFormData(element.id, rating)}
                  />
                )
              })}
            </div>
            {hasError && <p className="text-red-500 text-sm mt-1">Este campo é obrigatório</p>}
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
          <h2 className="text-lg font-semibold">Preview da Survey</h2>
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
              Enviar Respostas
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
