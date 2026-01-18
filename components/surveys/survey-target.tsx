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
              Tipo de Acionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Como a survey será acionada</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={triggerMode === "time" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("triggerMode", "time")}
                  className="flex-1 flex items-center justify-center"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Tempo (Delay)
                </Button>
                <Button
                  variant={triggerMode === "event" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("triggerMode", "event")}
                  className="flex-1 flex items-center justify-center"
                >
                  <Code className="h-4 w-4 mr-1" />
                  Evento (JavaScript)
                </Button>
              </div>

              {triggerMode === "event" && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Acionamento por Evento</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Use:{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          window.UserFeedback.trigger(&apos;{survey.id}&apos;, {`{userId: 123, pedidoId: 456}`})
                        </code>
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
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="delay">Delay (segundos)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  value={survey.target.delay}
                  onChange={(e) => updateTarget("delay", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">{t("targeting.delayDescription")}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Repeat className="h-5 w-5 mr-2" />
              Recorrência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de Recorrência</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <Button
                  variant={recurrence === "one_response" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("recurrence", "one_response")}
                  className="justify-start"
                >
                  Uma vez por usuário
                </Button>
                <Button
                  variant={recurrence === "time_sequence" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("recurrence", "time_sequence")}
                  className="justify-start"
                >
                  Sequência temporal
                </Button>
                <Button
                  variant={recurrence === "always" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateTarget("recurrence", "always")}
                  className="justify-start"
                >
                  Sempre (toda vez que for chamada)
                </Button>
              </div>
            </div>

            {recurrence === "time_sequence" && (
              <>
                <div>
                  <Label htmlFor="interval">Intervalo (dias)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={survey.target.recurrenceConfig?.interval || ""}
                    onChange={(e) => updateRecurrenceConfig("interval", Number.parseInt(e.target.value) || 1)}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="maxResponses">Máximo de Respostas</Label>
                  <Input
                    id="maxResponses"
                    type="number"
                    min="1"
                    value={survey.target.recurrenceConfig?.maxResponses || ""}
                    onChange={(e) => updateRecurrenceConfig("maxResponses", Number.parseInt(e.target.value) || 1)}
                    placeholder="3"
                  />
                </div>
              </>
            )}

            {recurrence === "always" && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Recorrência "Sempre"</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {t("targeting.alwaysRecurrence")}
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
              {t("targeting.pageRules")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">{t("targeting.defaultBehavior")}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    {t("targeting.defaultBehaviorDescription")}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label>{t("targeting.addNewRule")}</Label>
              <div className="flex space-x-2 mt-2">
                <div className="w-32 flex items-center justify-center bg-gray-100 border rounded-md px-3 py-2 text-sm">
                  {t("showIn")}
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
            <div className="space-y-2">não será exibida em nenhuma página
              {survey.pageRules.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma regra definida</p>
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
                        {rule.rule_type === "include" ? t("showIn") : t("hideFrom")}
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
                  <p className="text-sm font-medium text-blue-800">{t("targeting.regexExamples")}</p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>
                      <code>^/$</code> - Apenas página inicial
                    </li>
                    <li>
                      <code>^/produto/.*$</code> - Páginas que começam com /produto/
                    </li>
                    <li>
                      <code>.*checkout.*</code> - Páginas que contêm &quot;checkout&quot;
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
            Resumo da Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                Acionamento
              </Label>
              <div className="mt-1">
                <Badge variant="outline">{triggerMode === "time" ? "Por Tempo" : "Por Evento JavaScript"}</Badge>
              </div>
            </div>

            {triggerMode === "time" && (
              <div>
                <Label className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Timing
                </Label>
                <div className="mt-1">
                  <Badge variant="outline">{survey.target.delay === 0 ? "Imediato" : `${survey.target.delay}s`}</Badge>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium flex items-center">
                <Repeat className="h-4 w-4 mr-1" />
                Recorrência
              </Label>
              <div className="mt-1">
                <Badge variant="outline">
                  {recurrence === "one_response" && "Uma vez por usuário"}
                  {recurrence === "time_sequence" && `A cada ${survey.target.recurrenceConfig?.interval || 30} dias`}
                  {recurrence === "always" && "Sempre (toda vez)"}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                Regras de Páginas
              </Label>
              <div className="mt-1">
                {survey.pageRules.length === 0 ? (
                  <Badge variant="destructive">Nenhuma página</Badge>
                ) : (
                  <div className="space-y-1">
                    {survey.pageRules.map((rule, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <Badge variant={rule.rule_type === "include" ? "default" : "destructive"} className="text-xs">
                          {rule.rule_type === "include" ? "INCLUIR" : "EXCLUIR"}
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
            <p className="text-sm font-medium text-gray-800 mb-2">{t("targeting.howItWorks")}</p>
            <div className="text-xs text-gray-600 space-y-1">
              {triggerMode === "time" && (
                <p>
                  • {t("targeting.surveyWillDisplay")}{" "}
                  {survey.target.delay === 0 ? "imediatamente" : `após ${survey.target.delay} segundos`}
                </p>
              )}
              {triggerMode === "event" && <p>• Será exibida toda vez que for chamada pelo site externo</p>}
              <p>
                • {survey.pageRules.length === 0 ? "Em nenhuma página (precisa adicionar regras)" : `Com ${survey.pageRules.length} regra(s) de exibição`}
              </p>
              <p>
                • {recurrence === "one_response" && "Apenas uma vez por usuário"}
                {recurrence === "time_sequence" &&
                  `Pode repetir a cada ${survey.target.recurrenceConfig?.interval || 30} dias`}
                {recurrence === "always" && "Toda vez que for acionada (ignora histórico)"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
