import { type NextRequest, NextResponse } from "next/server"
import { getDbServiceRoleClient } from "@/lib/dbClient"

// Helper para normalizar created_at (pode ser string ou Date object)
function getDateString(createdAt: any): string {
  if (!createdAt) return new Date().toISOString().split("T")[0]
  if (typeof createdAt === "string") {
    return createdAt.split("T")[0]
  }
  if (createdAt instanceof Date) {
    return createdAt.toISOString().split("T")[0]
  }
  // Tentar converter para Date se for timestamp ou outro formato
  try {
    return new Date(createdAt).toISOString().split("T")[0]
  } catch (e) {
    return new Date().toISOString().split("T")[0]
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbServiceRoleClient()
    const surveyId = params.id
    const { searchParams } = new URL(request.url)

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const deviceFilter = searchParams.get("device")
    const responseFilter = searchParams.get("responseFilter")

    let dateFrom: string
    let dateTo: string

    if (startDate && endDate) {
      dateFrom = new Date(startDate + "T00:00:00Z").toISOString()
      dateTo = new Date(endDate + "T23:59:59Z").toISOString()
    } else {
      // Fallback para últimos 30 dias se não houver filtros
      const days = Number.parseInt(searchParams.get("days") || "30")
      dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      dateTo = new Date().toISOString()
    }

    let exposures = 0
    let trendData: any = {}
    let deviceMetrics: any[] = []

    try {
      let exposuresQuery = db
        .from("survey_exposures")
        .select("session_id, device, created_at", { count: "exact" })
        .eq("survey_id", surveyId)
        .gte("created_at", dateFrom)
        .lte("created_at", dateTo)

      if (deviceFilter && deviceFilter !== "all") {
        exposuresQuery = exposuresQuery.eq("device", deviceFilter)
      }

      const { count: exposuresCount, data: exposuresData, error: exposuresError } = await exposuresQuery

      if (exposuresError) {
        console.error("Erro ao buscar exposures:", exposuresError)
        throw exposuresError
      }

      exposures = exposuresCount || 0
      ;(exposuresData || []).forEach((row: any) => {
        const date = getDateString(row.created_at)
        if (!trendData[date]) {
          trendData[date] = { date, exposures: 0, responses: 0 }
        }
        trendData[date].exposures += 1
      })
    } catch (exposuresError) {
      console.error("Erro completo ao buscar exposures:", exposuresError)
      exposures = 0
      trendData = {}
    }

    let responsesQuery = db
      .from("survey_responses")
      .select("*", { count: "exact" })
      .eq("survey_id", surveyId)
      .gte("created_at", dateFrom)
      .lte("created_at", dateTo)

    if (deviceFilter && deviceFilter !== "all") {
      responsesQuery = responsesQuery.eq("device", deviceFilter)
    }
    if (responseFilter === "valid") {
      responsesQuery = responsesQuery.eq("is_test", false)
    } else if (responseFilter === "test") {
      responsesQuery = responsesQuery.eq("is_test", true)
    }

    const { count: responses, data: responsesData } = await responsesQuery
    ;(responsesData || []).forEach((row: any) => {
      const date = getDateString(row.created_at)
      if (!trendData[date]) {
        trendData[date] = { date, exposures: 0, responses: 0 }
      }
      trendData[date].responses += 1
    })

    // Get all devices from both exposures and responses for comparison table
    let allExposuresData: any[] = []
    try {
      const { data, error: exposuresDeviceError } = await db
        .from("survey_exposures")
        .select("session_id, device, created_at")
        .eq("survey_id", surveyId)
        .gte("created_at", dateFrom)
        .lte("created_at", dateTo)
      
      if (exposuresDeviceError) {
        console.error("Erro ao buscar devices de exposures:", exposuresDeviceError)
        throw exposuresDeviceError
      }
      
      allExposuresData = data || []
    } catch (err) {
      console.error("Erro completo ao buscar devices de exposures:", err)
      allExposuresData = []
    }

    let allResponsesQuery = db
      .from("survey_responses")
      .select("device, created_at")
      .eq("survey_id", surveyId)
      .gte("created_at", dateFrom)
      .lte("created_at", dateTo)

    if (responseFilter === "valid") {
      allResponsesQuery = allResponsesQuery.eq("is_test", false)
    } else if (responseFilter === "test") {
      allResponsesQuery = allResponsesQuery.eq("is_test", true)
    }

    const { data: allResponsesData } = await allResponsesQuery

    // Combine all devices from both exposures and responses
    const allDevices = new Set<string>()
    ;(allExposuresData || []).forEach((row: any) => {
      if (row.device) allDevices.add(row.device)
    })
    ;(allResponsesData || []).forEach((row: any) => {
      if (row.device) allDevices.add(row.device)
    })

    // Count exposures by device
    const exposuresByDevice = (allExposuresData || []).reduce((acc: any, row: any) => {
      const device = row.device || "unknown"
      if (!acc[device]) acc[device] = 0
      acc[device] += 1
      return acc
    }, {})

    // Count responses by device
    const responsesByDevice = (allResponsesData || []).reduce((acc: any, row: any) => {
      const device = row.device || "unknown"
      if (!acc[device]) acc[device] = 0
      acc[device] += 1
      return acc
    }, {})

    // Create device metrics for all devices found
    deviceMetrics = Array.from(allDevices)
      .map((device: any) => {
        const deviceExposures = exposuresByDevice[device] || 0
        const deviceResponses = responsesByDevice[device] || 0
        return {
          device,
          exposures: deviceExposures,
          responses: deviceResponses,
          responseRate: deviceExposures > 0 ? Math.round((deviceResponses / deviceExposures) * 100 * 10) / 10 : 0,
        }
      })
      .filter((d: any) => d.exposures > 0 || d.responses > 0) // Only show devices with data

    const responseRate = exposures > 0 ? ((responses || 0) / exposures) * 100 : 0

    // Buscar elementos da survey para processar ratings (se necessário no futuro)
    const { data: surveyElements } = await db
      .from("survey_elements")
      .select("*")
      .eq("survey_id", surveyId)

    // Buscar respostas de rating (usando survey_element_responses) - comentado por enquanto
    // const ratingElementsData = await db
    //   .from("survey_element_responses")
    //   .select("*")
    //   .in(
    //     "element_id",
    //     (surveyElements || []).filter((e: any) => e.type === "rating").map((e: any) => e.id),
    //   )

    // if (!ratingElementsData.error && ratingElementsData.data) {
    //   console.log("Rating elements data found, but table may not exist")
    // }

    const ratings: number[] = []
    const xsScore = 0

    const bottom2Count = 0
    const totalRatings = 0
    const bottom2Percentage = 0

    const trend = Object.values(trendData)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .slice(startDate && endDate ? 0 : -14)

    const drivers: any[] = []

    return NextResponse.json({
      metrics: {
        exposures,
        responses: responses || 0,
        responseRate: Math.round(responseRate * 10) / 10,
        xsScore: Math.round(xsScore * 10) / 10,
        bottom2Percentage: Math.round(bottom2Percentage * 10) / 10,
      },
      trend,
      drivers,
      deviceMetrics,
    })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
