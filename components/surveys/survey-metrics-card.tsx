"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, BarChart3, Type, AlignLeft } from "lucide-react"

interface SurveyMetricsCardProps {
  element: any
  metric: any
  businessMetrics?: {
    exposures: number
    responses: number
    responseRate: number
    xsScore: number
    bottom2Percentage: number
  }
}

export default function SurveyMetricsCard({ element, metric, businessMetrics }: SurveyMetricsCardProps) {
  const getElementIcon = (type: string) => {
    switch (type) {
      case "rating":
        return Star
      case "multiple_choice":
        return BarChart3
      case "text":
        return Type
      case "textarea":
        return AlignLeft
      default:
        return BarChart3
    }
  }

  const Icon = getElementIcon(element.type)

  const renderRatingMetric = () => {
    const { average, total, distribution, min, max } = metric.data || {
      average: 0,
      total: 0,
      distribution: {},
      min: element.config?.ratingRange?.min || 5,
      max: element.config?.ratingRange?.max || 10,
    }

    const bottom2Count = (distribution[1] || 0) + (distribution[2] || 0)
    const bottom2Percentage = total > 0 ? ((bottom2Count / total) * 100).toFixed(1) : 0

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{average || 0}</div>
            <div className="text-xs text-gray-500">Média</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{bottom2Percentage}%</div>
            <div className="text-xs text-gray-500">Bottom2%</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500">{total > 0 ? `${total} respostas` : "Nenhuma resposta ainda"}</div>
        </div>

        <div className="space-y-2">
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const rating = min + i
            const count = distribution[rating] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0

            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="w-8 text-sm font-medium">{rating}</div>
                <div className="flex-1">
                  <Progress value={percentage} className="h-2" />
                </div>
                <div className="w-12 text-sm text-gray-600">{count}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMultipleChoiceMetric = () => {
    const { total, percentages, allowMultiple } = metric.data || {
      total: 0,
      percentages: element.config?.options?.map((option) => ({ option, count: 0, percentage: 0 })) || [],
      allowMultiple: element.config?.allowMultiple || false,
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">{total > 0 ? `${total} respostas` : "Nenhuma resposta ainda"}</div>
          <Badge variant="outline">{allowMultiple ? "Múltipla escolha" : "Escolha única"}</Badge>
        </div>

        <div className="space-y-3">
          {percentages.map((item: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate">{item.option}</span>
                <span className="text-gray-600">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
              <div className="text-xs text-gray-500">{item.count} respostas</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTextMetric = () => {
    const { total, responses } = metric.data

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{total}</div>
          <div className="text-sm text-gray-500">Respostas de texto</div>
        </div>

        {responses.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <div className="text-sm font-medium text-gray-700">Últimas respostas:</div>
            {responses.slice(0, 3).map((response: string, index: number) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                "{response.length > 100 ? response.substring(0, 100) + "..." : response}"
              </div>
            ))}
            {responses.length > 3 && (
              <div className="text-xs text-gray-500">+{responses.length - 3} respostas adicionais</div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderMetricContent = () => {
    switch (element.type) {
      case "rating":
        return renderRatingMetric()
      case "multiple_choice":
        return renderMultipleChoiceMetric()
      case "text":
      case "textarea":
        return renderTextMetric()
      default:
        return <div className="text-gray-500">Tipo não suportado</div>
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start space-x-2">
          <Icon className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-gray-900 line-clamp-2">{element.question}</div>
            <Badge variant="secondary" className="mt-1">
              {element.type === "rating" && "Rating"}
              {element.type === "multiple_choice" && "Múltipla Escolha"}
              {element.type === "text" && "Texto"}
              {element.type === "textarea" && "Texto Longo"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>{renderMetricContent()}</CardContent>
    </Card>
  )
}
