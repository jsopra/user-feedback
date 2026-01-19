"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Copy, ExternalLink, Info } from "lucide-react"
import { useSurveyTranslation } from "@/hooks/use-translation"
import type { Survey } from "@/types/survey"

interface SurveyEmbedCodeProps {
  survey: Survey
}

export default function SurveyEmbedCode({ survey }: SurveyEmbedCodeProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useSurveyTranslation("surveys", survey.language as "en" | "pt-br" | "es")

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
      console.error(t("embed.settings.copyError"), error)
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
            {t("embed.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{t("embed.settings.htmlCodeLabel")}:</label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleTestEmbed}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("embed.settings.testButton")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? t("embed.settings.copied") : t("embed.settings.copyButton")}
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
              <strong>{t("embed.settings.howToUse")}:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>{t("embed.settings.step1")}</li>
                <li>{t("embed.settings.step2")}</li>
                <li>{t("embed.settings.autoDisplay")}</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("embed.settings.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">{t("embed.settings.status")}</label>
              <div className="mt-1">
                <Badge variant={survey.is_active ? "default" : "secondary"}>
                  {survey.is_active ? t("embed.settings.active") : t("embed.settings.inactive")}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">{t("embed.settings.delay")}</label>
              <div className="mt-1">
                <Badge variant="outline">{survey.target?.delay === 0 ? t("embed.settings.immediate") : `${survey.target?.delay}s`}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">{t("embed.settings.recurrence")}</label>
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
                  {survey.pageRules?.length === 0 ? t("targeting.allPages") : `${survey.pageRules?.length} ${t("embed.settings.rules")}`}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">{t("embed.settings.elements")}</label>
              <div className="mt-1">
                <Badge variant="outline">{survey.elements?.length || 0} {t("embed.settings.elementsCount")}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!survey.is_active && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>{t("embed.settings.warning")}:</strong> {t("embed.settings.inactiveWarning")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
