import { type NextRequest, NextResponse } from "next/server"
import { getDbServiceRoleClient } from "@/lib/dbClient"

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

      const { count: exposuresCount, data: exposuresData } = await exposuresQuery

      exposures = exposuresCount || 0
      ;(exposuresData || []).forEach((row: any) => {
        const date = row.created_at.split("T")[0]
        if (!trendData[date]) {
          trendData[date] = { date, exposures: 0, responses: 0 }
        }
        trendData[date].exposures += 1
      })
    } catch (exposuresError) {
      console.log("Tabela survey_exposures não existe ainda, usando apenas responses")
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
      const date = row.created_at.split("T")[0]
      if (!trendData[date]) {
        trendData[date] = { date, exposures: 0, responses: 0 }
      }
      trendData[date].responses += 1
    })

    // Get all devices from both exposures and responses for comparison table
    const { data: allExposuresData } = await db
      .from("survey_exposures")
      .select("session_id, device, created_at")
      .eq("survey_id", surveyId)
      .gte("created_at", dateFrom)
      .lte("created_at", dateTo)

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

    let xsQuery = db
      .from("survey_response_answers")
      .select(`
        answer,
        survey_elements!inner(survey_id, type),
        survey_responses!inner(device)
      `)
      .eq("survey_elements.survey_id", surveyId)
      .eq("survey_elements.type", "rating")
      .gte("created_at", dateFrom)
      .lte("created_at", dateTo)

    if (deviceFilter && deviceFilter !== "all") {
      xsQuery = xsQuery.eq("survey_responses.device", deviceFilter)
    }
    if (responseFilter === "valid") {
      xsQuery = xsQuery.eq("survey_responses.is_test", false)
    } else if (responseFilter === "test") {
      xsQuery = xsQuery.eq("survey_responses.is_test", true)
    }

    const { data: xsResult } = await xsQuery

    const ratings = (xsResult || []).map((r: any) => Number(r.answer)).filter((r: number) => !isNaN(r))
    const xsScore = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0

    const bottom2Count = ratings.filter((r: number) => r <= 2).length
    const totalRatings = ratings.length
    const bottom2Percentage = totalRatings > 0 ? (bottom2Count / totalRatings) * 100 : 0

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
