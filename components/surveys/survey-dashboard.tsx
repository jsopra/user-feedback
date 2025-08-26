"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp, BarChart3, Filter, Eye, Target, MousePointer } from "lucide-react"
import AppHeader from "@/components/layout/app-header"
import SurveyMetricsCard from "./survey-metrics-card"
import SurveyResponsesTable from "./survey-responses-table"

interface SurveyDashboardProps {
  surveyId: string
  onBack: () => void
  onBackToHome: () => void
  survey?: {
    id: string
    title: string
    description: string
    created_at: string
    is_active: boolean
    project_id?: string
  }
}

interface BusinessMetrics {
  exposures: number
  responses: number
  responseRate: number
  xsScore: number
  bottom2Percentage: number
  hits?: number
  hitSuccessRate?: number
}

interface DeviceMetrics {
  device: string
  exposures: number
  responses: number
  responseRate: number
  hits?: number
  hitSuccessRate?: number
}

interface DashboardData {
  survey: {
    id: string
    title: string
    description: string
    created_at: string
    is_active: boolean
  }
  elements: any[]
  metrics: Record<string, any>
  timelineData: { date: string; count: number }[]
  tableData: any[]
  totalResponses: number
  totalHits?: number
  totalExposures?: number
  businessMetrics: BusinessMetrics
  trend: { date: string; exposures: number; responses: number; hits?: number }[]
  drivers: { option: string; avgXs: number }[]
  deviceMetrics: DeviceMetrics[]
}

export default function SurveyDashboard({ surveyId, onBack, onBackToHome, survey }: SurveyDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectData, setProjectData] = useState<{ id: string; name: string } | null>(null)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isFiltering, setIsFiltering] = useState(false)

  const [selectedDevice, setSelectedDevice] = useState<string>("all")
  const [responseFilter, setResponseFilter] = useState<string>("valid")

  useEffect(() => {
    const today = new Date()
    const fifteenDaysAgo = new Date(today)
    fifteenDaysAgo.setDate(today.getDate() - 15)

    setStartDate(fifteenDaysAgo.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])

    loadDashboardData()
    loadProjectData()
  }, [surveyId])

  const loadDashboardData = async (filters?: {
    startDate?: string
    endDate?: string
    device?: string
    responseFilter?: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const actualStartDate = filters?.startDate || startDate
      const actualEndDate = filters?.endDate || endDate
      const actualDevice = filters?.device || selectedDevice
      const actualResponseFilter = filters?.responseFilter || responseFilter

      const params = new URLSearchParams()
      if (actualStartDate) params.append("startDate", actualStartDate)
      if (actualEndDate) params.append("endDate", actualEndDate)
      if (actualDevice && actualDevice !== "all") params.append("device", actualDevice)
      if (actualResponseFilter && actualResponseFilter !== "all") params.append("responseFilter", actualResponseFilter)

      const [dashboardResponse, metricsResponse] = await Promise.all([
        fetch(`/api/surveys/${surveyId}/dashboard?${params}`),
        fetch(`/api/surveys/${surveyId}/metrics?${params}`),
      ])

      const dashboardData = await dashboardResponse.json()
      const metricsData = await metricsResponse.json()

      if (dashboardResponse.ok && metricsResponse.ok) {
        const totalHits = dashboardData.totalHits || 0
        const totalExposures = dashboardData.totalExposures || 0
        const totalResponses = dashboardData.totalResponses || 0

        const hitSuccessRate = totalHits > 0 ? Math.round((totalExposures / totalHits) * 100) : 0
        const responseRate = totalExposures > 0 ? Math.round((totalResponses / totalExposures) * 100) : 0

        const businessMetrics = {
          exposures: totalExposures,
          responses: totalResponses,
          responseRate: responseRate,
          xsScore: metricsData.metrics?.xsScore || 0,
          bottom2Percentage: metricsData.metrics?.bottom2Percentage || 0,
          hits: totalHits,
          hitSuccessRate: hitSuccessRate,
        }

        const trendData = dashboardData.timelineData || []
        const processedTrend = trendData.map((item: any) => ({
          date: item.date,
          exposures: item.exposures || 0,
          responses: item.responses || 0,
          hits: item.hits || 0,
        }))

        const processedDeviceMetrics = (metricsData.deviceMetrics || []).map((device: any) => {
          const deviceHits = dashboardData.metrics?.deviceBreakdown?.hits?.[device.device] || 0
          const deviceExposures = device.exposures || 0
          const deviceHitSuccess = deviceHits > 0 ? Math.round((deviceExposures / deviceHits) * 100) : 0

          return {
            ...device,
            hits: deviceHits,
            hitSuccessRate: deviceHitSuccess,
          }
        })

        setData({
          ...dashboardData,
          businessMetrics,
          trend: processedTrend,
          drivers: metricsData.drivers || [],
          deviceMetrics: processedDeviceMetrics,
        })
      } else {
        throw new Error(dashboardData.error || metricsData.error || "Erro ao carregar dashboard")
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
      setIsFiltering(false)
    }
  }

  const loadProjectData = async () => {
    if (!survey?.project_id) return

    try {
      const response = await fetch(`/api/projects/${survey.project_id}`)
      const data = await response.json()

      if (response.ok) {
        setProjectData({ id: data.project.id, name: data.project.name })
      }
    } catch (error) {
      console.error("Erro ao carregar projeto:", error)
    }
  }

  const handleApplyFilters = () => {
    setIsFiltering(true)
    loadDashboardData({ startDate, endDate, device: selectedDevice, responseFilter })
  }

  const handleClearFilters = () => {
    setStartDate("")
    setEndDate("")
    setSelectedDevice("all")
    setResponseFilter("valid")
    setIsFiltering(true)
    loadDashboardData()
  }

  const handleDeviceFilter = (device: string) => {
    setSelectedDevice(device)
    setIsFiltering(true)
    loadDashboardData({ startDate, endDate, device, responseFilter })
  }

  const handleResponseFilter = (filter: string) => {
    setResponseFilter(filter)
    setIsFiltering(true)
    loadDashboardData({ startDate, endDate, device: selectedDevice, responseFilter: filter })
  }

  const handleDataChange = () => {
    loadDashboardData({ startDate, endDate, device: selectedDevice, responseFilter })
  }

  const fillMissingDays = (trendData: { date: string; exposures: number; responses: number; hits?: number }[]) => {
    if (!startDate || !endDate) return trendData

    const filledData = []
    const start = new Date(startDate + "T00:00:00Z")
    const end = new Date(endDate + "T00:00:00Z")

    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split("T")[0]

      const existingData = trendData.find((item) => item.date === dateString)

      filledData.push({
        date: dateString,
        exposures: existingData?.exposures || 0,
        responses: existingData?.responses || 0,
        hits: existingData?.hits || 0,
      })

      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    return filledData
  }

  const handleExportData = () => {
    if (!data || !data.tableData.length) {
      alert("Não há dados para exportar")
      return
    }

    const headers = [
      "Data/Hora",
      "Session ID",
      "Página",
      "Device",
      "User Agent",
      "Parâmetros Customizados",
      ...data.elements.map((element) => element.question),
    ]

    const csvData = data.tableData.map((row) => {
      const baseData = [
        new Date(row.created_at).toLocaleString("pt-BR"),
        row.session_id || "",
        row.page_url || "",
        row.device || "",
        row.user_agent || "",
        row.custom_params ? JSON.stringify(row.custom_params) : "",
      ]

      const elementResponses = data.elements.map((element) => {
        const value = row[`element_${element.id}`]
        if (value === null || value === undefined) return ""
        if (Array.isArray(value)) return value.join("; ")
        return String(value)
      })

      return [...baseData, ...elementResponses]
    })

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row
          .map((cell) => {
            const escaped = String(cell).replace(/"/g, '""')
            return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `survey_${data.survey.title.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader onSurveysClick={onBackToHome} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "Erro ao carregar dados"}</AlertDescription>
          </Alert>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        onHomeClick={onBackToHome}
        showSurveysLink={false}
        showHomeLink={true}
        currentProject={projectData?.name || "Projeto"}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleApplyFilters} disabled={isFiltering}>
                    {isFiltering ? "Aplicando..." : "Aplicar"}
                  </Button>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpar
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Responses</Label>
                  <Select value={responseFilter} onValueChange={handleResponseFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo de response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valid">Apenas Válidas</SelectItem>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="test">Apenas Teste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Device</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedDevice === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDeviceFilter("all")}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={selectedDevice === "desktop" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDeviceFilter("desktop")}
                    >
                      Desktop
                    </Button>
                    <Button
                      variant={selectedDevice === "mobile" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDeviceFilter("mobile")}
                    >
                      Mobile
                    </Button>
                    <Button
                      variant={selectedDevice === "tablet" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDeviceFilter("tablet")}
                    >
                      Tablet
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MousePointer className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hits</p>
                  <p className="text-2xl font-bold text-gray-900">{data.businessMetrics.hits || 0}</p>
                  <p className="text-xs text-gray-500">soft gate aparições</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Exposures</p>
                  <p className="text-2xl font-bold text-gray-900">{data.businessMetrics.exposures}</p>
                  <p className="text-xs text-gray-500">usuários únicos que viram</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hit Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{data.businessMetrics.hitSuccessRate || 0}%</p>
                  <p className="text-xs text-gray-500">soft gate → survey</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{data.businessMetrics.responses}</p>
                  <p className="text-xs text-gray-500">total de respostas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{data.businessMetrics.responseRate || 0}%</p>
                  <p className="text-xs text-gray-500">exposure → response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Trend Diário: Hits vs Exposures vs Respostas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 relative">
              <svg width="100%" height="100%" viewBox="0 0 800 300" className="overflow-visible">
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="60"
                    y1={60 + (i * 180) / 4}
                    x2="740"
                    y2={60 + (i * 180) / 4}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}

                {(() => {
                  const chartData = fillMissingDays(data.trend)
                  const maxResponses = Math.max(...chartData.map((d) => d.responses), 1)
                  const maxExposures = Math.max(...chartData.map((d) => d.exposures), 1)
                  const maxHits = Math.max(...chartData.map((d) => d.hits || 0), 1)
                  const barWidth = Math.max(20, 680 / chartData.length - 4)

                  return chartData.map((item, index) => {
                    const x = 60 + index * (680 / chartData.length) + (680 / chartData.length - barWidth) / 2
                    const barHeight = (item.responses / maxResponses) * 180
                    const lineY = 240 - (item.exposures / maxExposures) * 180
                    const hitsLineY = 240 - ((item.hits || 0) / maxHits) * 180

                    const date = new Date(item.date + "T00:00:00Z")
                    const day = date.getUTCDate().toString().padStart(2, "0")
                    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")

                    return (
                      <g key={index}>
                        <rect
                          x={x}
                          y={240 - barHeight}
                          width={barWidth}
                          height={barHeight}
                          fill="#10b981"
                          opacity="0.8"
                        />
                        <circle cx={x + barWidth / 2} cy={lineY} r="4" fill="#3b82f6" />
                        <circle cx={x + barWidth / 2} cy={hitsLineY} r="4" fill="#f97316" />
                        {index > 0 && (
                          <>
                            <line
                              x1={
                                60 +
                                (index - 1) * (680 / chartData.length) +
                                (680 / chartData.length - barWidth) / 2 +
                                barWidth / 2
                              }
                              y1={240 - (chartData[index - 1].exposures / maxExposures) * 180}
                              x2={x + barWidth / 2}
                              y2={lineY}
                              stroke="#3b82f6"
                              strokeWidth="2"
                            />
                            <line
                              x1={
                                60 +
                                (index - 1) * (680 / chartData.length) +
                                (680 / chartData.length - barWidth) / 2 +
                                barWidth / 2
                              }
                              y1={240 - ((chartData[index - 1].hits || 0) / maxHits) * 180}
                              x2={x + barWidth / 2}
                              y2={hitsLineY}
                              stroke="#f97316"
                              strokeWidth="2"
                            />
                          </>
                        )}
                        <text x={x + barWidth / 2} y={270} textAnchor="middle" fontSize="10" fill="#6b7280">
                          {day}/{month}
                        </text>
                        <rect
                          x={x}
                          y={60}
                          width={barWidth}
                          height={180}
                          fill="transparent"
                          style={{ cursor: "pointer" }}
                        >
                          <title>{`${day}/${month}: ${item.hits || 0} hits, ${item.exposures} exposures, ${item.responses} respostas`}</title>
                        </rect>
                      </g>
                    )
                  })
                })()}

                <text x="20" y="70" fontSize="10" fill="#6b7280" textAnchor="middle">
                  {Math.max(...fillMissingDays(data.trend).map((d) => d.responses), 1)}
                </text>
                <text x="20" y="150" fontSize="10" fill="#6b7280" textAnchor="middle">
                  {Math.round(Math.max(...fillMissingDays(data.trend).map((d) => d.responses), 1) / 2)}
                </text>
                <text x="20" y="240" fontSize="10" fill="#6b7280" textAnchor="middle">
                  0
                </text>

                <text x="780" y="70" fontSize="10" fill="#6b7280" textAnchor="middle">
                  {Math.max(...fillMissingDays(data.trend).map((d) => d.exposures), 1)}
                </text>
                <text x="780" y="150" fontSize="10" fill="#6b7280" textAnchor="middle">
                  {Math.round(Math.max(...fillMissingDays(data.trend).map((d) => d.exposures), 1) / 2)}
                </text>
                <text x="780" y="240" fontSize="10" fill="#6b7280" textAnchor="middle">
                  0
                </text>
              </svg>
            </div>
            <div className="flex justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Hits (linha)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Exposures (linha)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Respostas (barras)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.drivers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Drivers: Média de XS por Opção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.drivers.map((driver, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex-1">{driver.option}</span>
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="bg-gray-200 rounded-full h-2 flex-1">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(driver.avgXs / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-8">{driver.avgXs}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {data.elements.map((element) => {
            const metric = data.metrics[element.id]
            if (!metric?.data) return null

            return (
              <SurveyMetricsCard
                key={element.id}
                element={element}
                metric={metric}
                businessMetrics={data.businessMetrics}
              />
            )
          })}
        </div>

        {data.deviceMetrics && data.deviceMetrics.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Comparativo por Device
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-700">Device</th>
                      <th className="text-right py-2 font-medium text-gray-700">Hits</th>
                      <th className="text-right py-2 font-medium text-gray-700">Exposures</th>
                      <th className="text-right py-2 font-medium text-gray-700">Responses</th>
                      <th className="text-right py-2 font-medium text-gray-700">Hit Success</th>
                      <th className="text-right py-2 font-medium text-gray-700">Response Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deviceMetrics.map((deviceData, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium capitalize">{deviceData.device}</td>
                        <td className="text-right py-2">{deviceData.hits || 0}</td>
                        <td className="text-right py-2">{deviceData.exposures}</td>
                        <td className="text-right py-2">{deviceData.responses}</td>
                        <td className="text-right py-2">{deviceData.hitSuccessRate || 0}%</td>
                        <td className="text-right py-2">{deviceData.responseRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Todas as Respostas ({data.totalResponses})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SurveyResponsesTable
              data={data.tableData}
              elements={data.elements}
              surveyId={surveyId}
              onDataChange={handleDataChange}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
