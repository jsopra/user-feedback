"use client"

import type { Survey } from "@/types/survey"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SurveyLanguageSelector } from "./survey-language-selector"
import { useTranslation } from "@/hooks/use-translation"

interface SurveySettingsProps {
  survey: Survey
  setSurvey: (survey: Survey) => void
}

export default function SurveySettings({ survey, setSurvey }: SurveySettingsProps) {
  const { t } = useTranslation("surveys")

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurvey({ ...survey, title: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSurvey({ ...survey, description: e.target.value })
  }

  const handleLanguageChange = (lang: string) => {
    setSurvey({ ...survey, language: lang })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.title")}</CardTitle>
          <CardDescription>{t("settings.basicInfo")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="survey-title">{t("surveyName")}</Label>
            <Input
              id="survey-title"
              placeholder={t("surveyName")}
              value={survey.title || ""}
              onChange={handleTitleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="survey-description">{t("surveyDescription")}</Label>
            <textarea
              id="survey-description"
              placeholder={t("surveyDescription")}
              value={survey.description || ""}
              onChange={handleDescriptionChange}
              className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <SurveyLanguageSelector
              value={survey.language || "en"}
              onChange={handleLanguageChange}
              label={t("surveyLanguage")}
            />
            <p className="text-sm text-gray-500">{t("selectLanguage")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
