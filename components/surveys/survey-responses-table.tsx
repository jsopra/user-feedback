"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, Flag, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "@/hooks/use-translation"

interface SurveyResponsesTableProps {
  data: any[]
  elements: any[]
  surveyId: string
  onDataChange?: () => void
  onExport?: () => void
}

export default function SurveyResponsesTable({ data, elements, surveyId, onDataChange, onExport }: SurveyResponsesTableProps) {
  const { t } = useTranslation("surveys")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const itemsPerPage = 10

  // Filtrar dados
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      row.session_id?.toLowerCase().includes(searchLower) ||
      row.page_url?.toLowerCase().includes(searchLower) ||
      elements.some((element) => {
        const value = row[`element_${element.id}`]
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchLower)
        }
        if (Array.isArray(value)) {
          return value.some((v) => v.toLowerCase().includes(searchLower))
        }
        return false
      })
    )
  })

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const formatValue = (value: any, element: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-1">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="mr-1">
              {item}
            </Badge>
          ))}
        </div>
      )
    }

    if (element.type === "rating") {
      return (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    }

    if (typeof value === "string" && value.length > 50) {
      return (
        <div className="max-w-xs">
          <div className="truncate" title={value}>
            {value}
          </div>
        </div>
      )
    }

    return <span>{value}</span>
  }

  const toggleTestStatus = async (responseId: string, currentStatus: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [responseId]: true }))

    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_test: !currentStatus }),
      })

      if (response.ok) {
        toast.success(!currentStatus ? t("dashboard.markedAsTest") : t("dashboard.markedAsValid"))
        onDataChange?.()
      } else {
        toast.error(t("dashboard.errorUpdatingStatus"))
      }
    } catch (error) {
      console.error("Error toggling test status:", error)
      toast.error(t("dashboard.errorConnecting"))
    } finally {
      setLoadingStates((prev) => ({ ...prev, [responseId]: false }))
    }
  }

  const deleteResponse = async (responseId: string) => {
    if (!confirm(t("dashboard.confirmDelete"))) return

    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses/${responseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDataChange?.()
      }
    } catch (error) {
      console.error("Error deleting response:", error)
    }
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg font-medium">{t("dashboard.noResponsesFound")}</div>
        <div className="text-sm">{t("dashboard.responsesWillAppear")}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("dashboard.searchResponses")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredData.length} {t("dashboard.of")} {data.length} {t("dashboard.responses")}
        </div>
        {onExport && (
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t("dashboard.exportCSV")}
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("dashboard.dateTime")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("dashboard.session")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("dashboard.page")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("dashboard.device")}</th>
              {elements.map((element) => (
                <th
                  key={element.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="max-w-32 truncate" title={element.question}>
                    {element.question}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("dashboard.actions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={row.id} className={`hover:bg-gray-50 ${row.is_test ? "bg-yellow-50" : ""}`}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    {new Date(row.created_at).toLocaleString("pt-BR")}
                    {row.is_test && (
                      <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                        {t("dashboard.test")}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  <code className="text-xs bg-gray-100 px-1 rounded">{row.session_id?.substring(0, 8) || "-"}</code>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  <div className="max-w-48 truncate" title={row.page_url}>
                    {row.page_url || "-"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                  <Badge variant="outline" className="capitalize">
                    {row.device || "desktop"}
                  </Badge>
                </td>
                {elements.map((element) => (
                  <td key={element.id} className="px-4 py-4 text-sm text-gray-900">
                    {formatValue(row[`element_${element.id}`], element)}
                  </td>
                ))}
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTestStatus(row.id, row.is_test)}
                      disabled={loadingStates[row.id]}
                      className={
                        row.is_test
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                          : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      }
                      title={row.is_test ? t("dashboard.markAsValid") : t("dashboard.markAsTest")}
                    >
                      {loadingStates[row.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Flag className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t("dashboard.pageSummary").replace("{current}", String(currentPage)).replace("{total}", String(totalPages))}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
