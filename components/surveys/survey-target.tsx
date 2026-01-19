"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Trash2, Info, Clock, Globe, Repeat, Zap, Code } from "lucide-react"
import type { Survey, SurveyPageRule } from "@/types/survey"
import { useTranslation } from "@/hooks/use-translation"

interface SurveyTargetProps {
  survey: Survey
  setSurvey: (survey: Survey) => void
}

export default function SurveyTarget({ survey, setSurvey }: SurveyTargetProps) {
  const { t } = useTranslation("surveys")
  const [newPattern, setNewPattern] = useState("")

  const updateTarget = (key: keyof Survey["target"], value: any) => {
    setSurvey({
      ...survey,
      target: {
        ...survey.target,
        [key]: value,
      },
    })
  }

  const updateRecurrenceConfig = (key: string, value: any) => {
    setSurvey({
      ...survey,
      target: {
        ...survey.target,
        recurrenceConfig: {
          ...survey.target.recurrenceConfig,
          [key]: value,
        },
      },
    })
  }

  const addPageRule = () => {
    if (newPattern.trim()) {
      const newRule: SurveyPageRule = {
        id: `rule_${Date.now()}`,
        rule_type: "include",
        pattern: newPattern.trim(),
        is_regex: true,
      }

      setSurvey({
        ...survey,
        pageRules: [...survey.pageRules, newRule],
      })
      setNewPattern("")
    }
  }

  const removePageRule = (index: number) => {
    const newRules = survey.pageRules.filter((_, i) => i !== index)
    setSurvey({
      ...survey,
      pageRules: newRules,
    })
  }

  const triggerMode = survey.target.triggerMode || "time"
  const recurrence = survey.target.recurrence || "one_response"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configurações */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              {t("builder.target.triggerType")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("builder.target.howSurveyTriggered")}</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={triggerMode === "time" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("triggerMode", "time")}
                  className="flex-1 flex items-center justify-center"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  {t("builder.target.timeDelay")}
                </Button>
                <Button
                  variant={triggerMode === "event" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("triggerMode", "event")}
                  className="flex-1 flex items-center justify-center"
                >
                  <Code className="h-4 w-4 mr-1" />
                  {t("builder.target.eventJavaScript")}
                </Button>
              </div>

              {triggerMode === "event" && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">{t("builder.target.eventTriggering")}</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {t("builder.target.eventInstructions", { surveyId: survey.id || "survey-id" })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timing - só mostra se triggerMode for 'time' */}
        {triggerMode === "time" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {t("builder.target.timing")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="delay">{t("builder.target.delay")}</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  value={survey.target.delay}
                  onChange={(e) => updateTarget("delay", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">{t("builder.target.delayDescription")}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Repeat className="h-5 w-5 mr-2" />
              {t("builder.target.recurrence")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("builder.target.recurrenceType")}</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <Button
                  variant={recurrence === "one_response" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("recurrence", "one_response")}
                  className="justify-start"
                >
                  {t("builder.target.oneResponsePerUser")}
                </Button>
                <Button
                  variant={recurrence === "time_sequence" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("recurrence", "time_sequence")}
                  className="justify-start"
                >
                  {t("builder.target.timeSequence")}
                </Button>
                <Button
                  variant={recurrence === "always" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("recurrence", "always")}
                  className="justify-start"
                >
                  {t("builder.target.always")}
                </Button>
              </div>
            </div>

            {recurrence === "time_sequence" && (
              <>
                <div>
                  <Label htmlFor="interval">{t("builder.target.interval")}</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={survey.target.recurrenceConfig?.interval || ""}
                    onChange={(e) => updateRecurrenceConfig("interval", Number.parseInt(e.target.value) || 1)}
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t("builder.target.intervalDescription")}</p>
                </div>
                <div>
                  <Label htmlFor="maxResponses">{t("builder.target.maxOccurrences")}</Label>
                  <Input
                    id="maxResponses"
                    type="number"
                    min="1"
                    value={survey.target.recurrenceConfig?.maxResponses || ""}
                    onChange={(e) => updateRecurrenceConfig("maxResponses", Number.parseInt(e.target.value) || 1)}
                    placeholder="3"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t("builder.target.maxOccurrencesDescription")}</p>
                </div>
              </>
            )}

            {recurrence === "always" && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">{t("builder.target.recurrenceAlways")}</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {t("builder.target.alwaysRecurrenceWarning")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regras de Páginas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              {t("builder.target.pageRules")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">{t("builder.target.defaultBehavior")}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    {t("builder.target.infoIncludes")}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label>{t("builder.target.addUrlPattern")}</Label>
              <div className="flex space-x-2 mt-2">
                <div className="w-32 flex items-center justify-center bg-gray-100 border rounded-md px-3 py-2 text-sm">
                  {t("builder.target.include")}
                </div>
                <Input
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  placeholder="^/produto/.*$ ou .*checkout.*"
                  onKeyPress={(e) => e.key === "Enter" && addPageRule()}
                  className="flex-1"
                />
                <Button onClick={addPageRule} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista de Regras */}
            <div className="space-y-2">
              {survey.pageRules.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>{t("targeting.noRulesDefined")}</p>
                  <p className="text-xs">{t("targeting.allPagesDisplay")}</p>
                </div>
              ) : (
                survey.pageRules.map((rule, index) => (
                  <div
                    key={rule.id || index}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Badge
                        variant={rule.rule_type === "include" ? "default" : "destructive"}
                        className="text-xs flex-shrink-0"
                      >
                        {rule.rule_type === "include" ? t("builder.target.include") : t("builder.target.exclude")}
                      </Badge>
                      <code className="text-sm bg-white px-2 py-1 rounded break-all flex-1">{rule.pattern}</code>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        REGEX
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removePageRule(index)} className="flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Dicas de Regex */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{t("builder.target.examplesOfPatterns")}</p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>
                      <code>{t("builder.target.allPagesPattern")}</code>
                    </li>
                    <li>
                      <code>{t("builder.target.homepagePattern")}</code>
                    </li>
                    <li>
                      <code>{t("builder.target.productPagesPattern")}</code>
                    </li>
                    <li>
                      <code>/categoria/(roupas|sapatos)/</code> - Categorias específicas
                    </li>
                    <li>
                      <code>^https://meusite\.com/.*$</code> - Domínio específico
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {t("builder.target.configPreview")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                {t("builder.target.triggerType")}
              </Label>
              <div className="mt-1">
                <Badge variant="outline">{triggerMode === "time" ? t("builder.target.byTime") : t("builder.target.byEventJavaScript")}</Badge>
              </div>
            </div>

            {triggerMode === "time" && (
              <div>
                <Label className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {t("builder.target.timing")}
                </Label>
                <div className="mt-1">
                  <Badge variant="outline">{survey.target.delay === 0 ? t("builder.target.immediately") : `${survey.target.delay}s`}</Badge>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium flex items-center">
                <Repeat className="h-4 w-4 mr-1" />
                {t("builder.target.recurrence")}
              </Label>
              <div className="mt-1">
                <Badge variant="outline">
                  {recurrence === "one_response" && t("builder.target.oneResponsePerUser")}
                  {recurrence === "time_sequence" && `${t("builder.target.interval")}: ${survey.target.recurrenceConfig?.interval || 30} ${t("targeting.days")}`}
                  {recurrence === "always" && t("builder.target.alwaysEveryTime")}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                {t("builder.target.pageRules")}
              </Label>
              <div className="mt-1">
                {survey.pageRules.length === 0 ? (
                  <Badge variant="destructive">{t("targeting.noPages")}</Badge>
                ) : (
                  <div className="space-y-1">
                    {survey.pageRules.map((rule, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <Badge variant={rule.rule_type === "include" ? "default" : "destructive"} className="text-xs">
                          {rule.rule_type === "include" ? t("builder.target.include") : t("builder.target.exclude")}
                        </Badge>
                        <code className="text-xs bg-gray-100 px-1 rounded">{rule.pattern}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview da Configuração */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800 mb-2">{t("builder.target.surveyWillTrigger")}</p>
            <div className="text-xs text-gray-600 space-y-1">
              {triggerMode === "time" && (
                <p>
                  • {t("builder.target.byTime")}:{" "}
                  {t("builder.target.afterSeconds", { delay: survey.target.delay || 0 })}
                </p>
              )}
              {triggerMode === "event" && <p>• {t("builder.target.byEventJavaScript")}</p>}
              <p>
                • {recurrence === "one_response" && t("builder.target.oneResponsePerUser")}
                {recurrence === "time_sequence" &&
                  `${t("builder.target.interval")}: ${survey.target.recurrenceConfig?.interval || 30} ${t("targeting.days")}`}
                {recurrence === "always" && t("builder.target.alwaysEveryTime")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
