"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Copy, ExternalLink, Info } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import type { Survey } from "@/types/survey"

interface SurveyEmbedCodeProps {
  survey: Survey
}

export default function SurveyEmbedCode({ survey }: SurveyEmbedCodeProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation("surveys")

  const recurrence = survey.target?.recurrence || "one_response"
  const recurrenceLabel = (() => {
    switch (recurrence) {
      case "time_sequence":
        return t("builder.target.timeSequence")
      case "always":
        return t("builder.target.always")
      default:
        return t("builder.target.oneResponsePerUser")
    }
  })()

  const embedUrl = `${window.location.origin}/api/embed/${survey.id}`
  const embedCode = `<script src="${embedUrl}" async></script>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erro ao copiar:", error)
    }
  }

  const handleTestEmbed = () => {
    window.open(embedUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Código de Incorporação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Código HTML para incorporar:</label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleTestEmbed}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Testar
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {embedCode}
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Como usar:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Copie o código acima</li>
                <li>Cole no HTML do seu site, preferencialmente antes do fechamento da tag &lt;/body&gt;</li>
                <li>{t("embed.autoDisplay")}</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                <Badge variant={survey.is_active ? "default" : "secondary"}>
                  {survey.is_active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Delay</label>
              <div className="mt-1">
                <Badge variant="outline">{survey.target?.delay === 0 ? "Imediato" : `${survey.target?.delay}s`}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Recorrência</label>
              <div className="mt-1">
                <Badge variant="outline">{recurrenceLabel}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">{t("embed.position")}</label>
              <div className="mt-1">
                <Badge variant="outline">{survey.design?.widgetPosition?.replace("-", " ") || "bottom-right"}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">{t("targeting.pageRules")}</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {survey.pageRules?.length === 0 ? t("targeting.allPages") : `${survey.pageRules?.length} regra(s)`}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Elementos</label>
              <div className="mt-1">
                <Badge variant="outline">{survey.elements?.length || 0} elementos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!survey.is_active && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Atenção:</strong> Esta survey está inativa e não será exibida nos sites. Ative-a no dashboard para
            começar a coletar respostas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
