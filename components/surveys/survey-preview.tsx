"use client"

import { Button } from "@/components/ui/button"
import { X, Star } from "lucide-react"
import type { Survey, SurveyElement } from "@/types/survey"

interface SurveyPreviewProps {
  survey: Survey
  onClose: () => void
}

export default function SurveyPreview({ survey, onClose }: SurveyPreviewProps) {
  const renderElement = (element: SurveyElement) => {
    switch (element.type) {
      case "text":
        return (
          <input
            type="text"
            placeholder={element.config?.placeholder || "Digite sua resposta..."}
            className="w-full p-2 border rounded"
            style={{ borderRadius: (survey.design as any).borderRadius }}
          />
        )

      case "textarea":
        return (
          <textarea
            placeholder={element.config?.placeholder || "Digite sua resposta..."}
            maxLength={element.config?.maxLength}
            className="w-full p-2 border rounded"
            style={{ borderRadius: (survey.design as any).borderRadius }}
            rows={4}
          />
        )

      case "multiple_choice":
        return (
          <div className="space-y-2">
            {element.config?.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-2">
                <input type="radio" name={element.id} value={option} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case "rating":
        return (
          <div className="flex space-x-1">
            {Array.from({ length: element.config?.ratingRange?.max || 5 }).map((_, idx) => (
              <Star
                key={idx}
                className="h-6 w-6 cursor-pointer hover:fill-current"
                style={{ color: (survey.design as any).primaryColor }}
              />
            ))}
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
