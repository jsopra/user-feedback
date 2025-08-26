"use client"

import { useMemo } from "react"

interface SurveyTimelineChartProps {
  data: { date: string; count: number }[]
}

export default function SurveyTimelineChart({ data }: SurveyTimelineChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { maxCount: 0 }

    const maxCount = Math.max(...data.map((d) => d.count))
    return { maxCount }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium">Nenhuma resposta encontrada</div>
          <div className="text-sm">Não há dados para exibir no gráfico</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <div className="flex items-end justify-between h-48 space-x-2 px-2">
        {data.map((item, index) => {
          // Calcular altura em pixels, não porcentagem
          let heightPx = 0
          if (item.count > 0 && chartData.maxCount > 0) {
            const maxHeight = 180 // altura máxima em pixels (h-48 = 192px - margem)
            heightPx = (item.count / chartData.maxCount) * maxHeight
            heightPx = Math.max(heightPx, 20) // altura mínima de 20px para ser visível
          }

          return (
            <div key={item.date} className="flex-1 flex flex-col items-center">
              {/* Container da barra com altura fixa */}
              <div className="relative w-full flex items-end justify-center" style={{ height: "180px" }}>
                {item.count > 0 && (
                  <div
                    className="w-full max-w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 relative group"
                    style={{ height: `${heightPx}px` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.count} {item.count === 1 ? "resposta" : "respostas"}
                    </div>
                  </div>
                )}
              </div>

              {/* Data */}
              <div className="mt-2 text-xs text-gray-600 text-center">
                {new Date(item.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-4 px-2">
        <span>0</span>
        <span className="text-center font-medium">Respostas por dia</span>
        <span>{chartData.maxCount}</span>
      </div>
    </div>
  )
}
