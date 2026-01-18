"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/hooks/use-translation"

interface SurveyLanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt-br", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

export function SurveyLanguageSelector({ value, onChange, label }: SurveyLanguageSelectorProps) {
  const { t } = useTranslation("surveys")

  return (
    <div className="space-y-2">
      <Label>{label || t("language")}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("language")} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
