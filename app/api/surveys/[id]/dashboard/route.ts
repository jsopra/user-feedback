import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbClient()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const deviceFilter = searchParams.get("device")
    const responseFilter = searchParams.get("responseFilter")

    console.log("=== DASHBOARD API ===")
    console.log("Survey ID:", params.id)
    console.log("Filtros:", { startDate, endDate, deviceFilter, responseFilter })

    // Buscar informações da survey
    const { data: survey, error: surveyError } = await db.from("surveys").select("*").eq("id", params.id).single()

    if (surveyError || !survey) {
      return NextResponse.json({ error: "Survey não encontrada" }, { status: 404 })
    }

    // Buscar elementos da survey
    const { data: elements, error: elementsError } = await db
      .from("survey_elements")
      .select("*")
      .eq("survey_id", params.id)
      .order("order_index", { ascending: true })

    if (elementsError) {
      console.error("Erro ao buscar elementos:", elementsError)
    }

    // Construir query de respostas com filtro de data
    let responsesQuery = db
      .from("survey_responses")
      .select("*")
      .eq("survey_id", params.id)
      .eq("completed", true)

    if (startDate) {
      responsesQuery = responsesQuery.gte("created_at", startDate + "T00:00:00.000Z")
    }
    if (endDate) {
      responsesQuery = responsesQuery.lte("created_at", endDate + "T23:59:59.999Z")
    }
    if (deviceFilter && deviceFilter !== "all") {
      responsesQuery = responsesQuery.eq("device", deviceFilter)
    }
    if (responseFilter === "valid") {
      responsesQuery = responsesQuery.eq("is_test", false)
    } else if (responseFilter === "test") {
      responsesQuery = responsesQuery.eq("is_test", true)
    }

    const { data: allResponses, error: responsesError } = await responsesQuery.order("created_at", { ascending: false })

    if (responsesError) {
      console.error("Erro ao buscar respostas:", responsesError)
      return NextResponse.json({ error: "Erro ao buscar respostas" }, { status: 500 })
    }

    const responses = allResponses || []

    console.log("=== DEBUG RESPOSTAS ===")
    console.log("Total responses:", responses?.length || 0)
    console.log("Elements:", elements?.length || 0)

    // Buscar respostas de elementos para associar com as respostas principais
    console.log("Buscando respostas de elementos...")
    const { data: elementResponses, error: elementResponsesError } = await db
      .from("survey_element_responses")
      .select("*")
      .in(
        "response_id",
        (responses || []).map((r: any) => r.id),
      )

    if (elementResponsesError && !elementResponsesError.message.includes("does not exist")) {
      console.error("Erro ao buscar respostas de elementos:", elementResponsesError)
    }

    // Associar respostas de elementos com as respostas principais
    const responsesWithElements = (responses || []).map((response: any) => ({
      ...response,
      survey_element_responses: (elementResponses || []).filter(
        (er: any) => er.response_id === response.id,
      ),
    }))

    if (responsesWithElements.length > 0) {
      console.log("Primeira response:", JSON.stringify(responsesWithElements[0], null, 2))
      console.log("Survey element responses da primeira:", responsesWithElements[0]?.survey_element_responses?.length || 0)

      responsesWithElements.forEach((response: any, index: number) => {
        console.log(`Response ${index + 1}:`, {
          id: response.id,
          element_responses: response.survey_element_responses?.length || 0,
          element_responses_data: response.survey_element_responses,
        })
      })
    }

    console.log("Respostas encontradas:", responsesWithElements?.length || 0)

    // Buscar hits da survey
    let hitsQuery = db.from("survey_hits").select("*").eq("survey_id", params.id)

    if (startDate) {
      hitsQuery = hitsQuery.gte("created_at", startDate + "T00:00:00.000Z")
    }
    if (endDate) {
      hitsQuery = hitsQuery.lte("created_at", endDate + "T23:59:59.999Z")
    }
    if (deviceFilter && deviceFilter !== "all") {
      hitsQuery = hitsQuery.eq("device", deviceFilter)
    }

    const { data: hits, error: hitsError } = await hitsQuery.order("created_at", { ascending: false })

    // Buscar exposures da survey
    let exposuresQuery = db.from("survey_exposures").select("*").eq("survey_id", params.id)

    if (startDate) {
      exposuresQuery = exposuresQuery.gte("created_at", startDate + "T00:00:00.000Z")
    }
    if (endDate) {
      exposuresQuery = exposuresQuery.lte("created_at", endDate + "T23:59:59.999Z")
    }
    if (deviceFilter && deviceFilter !== "all") {
      exposuresQuery = exposuresQuery.eq("device", deviceFilter)
    }

    const { data: exposures, error: exposuresError } = await exposuresQuery.order("created_at", { ascending: false })

    if (exposuresError) {
      console.error("Erro ao buscar exposures:", exposuresError)
    }

    // Processar dados para métricas
    const metrics = processMetrics(responsesWithElements || [], elements || [], hits || [], exposures || [])

    // Processar dados para gráfico temporal
    const timelineData = processTimelineData(responsesWithElements || [], hits || [], exposures || [])

    // Processar dados para tabela
    const tableData = processTableData(responsesWithElements || [], elements || [])

    return NextResponse.json({
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        created_at: survey.created_at,
        is_active: survey.is_active,
      },
      elements: elements || [],
      metrics,
      timelineData,
      tableData,
      totalResponses: responses?.length || 0,
      totalHits: hits?.length || 0,
      totalExposures: exposures?.length || 0,
    })
  } catch (error) {
    console.error("Erro no dashboard:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

function processMetrics(responses: any[], elements: any[], hits: any[], exposures: any[]) {
  const metrics: Record<string, any> = {}

  const totalHits = hits.length
  const totalExposures = exposures.length
  const totalResponses = responses.length

  const hitSuccessRate = totalHits > 0 ? Math.round((totalExposures / totalHits) * 100) : 0
  const conversionRate = totalExposures > 0 ? Math.round((totalResponses / totalExposures) * 100) : 0

  metrics.funnel = {
    hits: totalHits,
    exposures: totalExposures,
    responses: totalResponses,
    hitSuccessRate,
    conversionRate,
  }

  const hitsByDevice = hits.reduce((acc: any, hit) => {
    const device = hit.device || "unknown"
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})

  const exposuresByDevice = exposures.reduce((acc: any, exposure) => {
    const device = exposure.device || "unknown"
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})

  const responsesByDevice = responses.reduce((acc: any, response) => {
    const device = response.device || "unknown"
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})

  metrics.deviceBreakdown = {
    hits: hitsByDevice,
    exposures: exposuresByDevice,
    responses: responsesByDevice,
  }

  elements.forEach((element: any) => {
    const elementResponses = responses.flatMap(
      (response) => response.survey_element_responses?.filter((er: any) => er.element_id === element.id) || [],
    )

    switch (element.type) {
      case "rating":
        const ratings = elementResponses.map((er: any) => Number(er.answer) || 0).filter((r: any) => r > 0)
        const average = ratings.length > 0 ? ratings.reduce((sum: any, rating) => sum + rating, 0) / ratings.length : 0
        const distribution = ratings.reduce(
          (acc, rating) => {
            acc[rating] = (acc[rating] || 0) + 1
            return acc
          },
          {} as Record<number, number>,
        )

        metrics[element.id] = {
          type: element.type,
          question: element.question,
          data: {
            average: Math.round(average * 10) / 10,
            total: ratings.length,
            distribution,
            min: element.config?.ratingRange?.min || 5,
            max: element.config?.ratingRange?.max || 10,
          },
        }
        break

      case "multiple_choice":
        const choices = elementResponses.map((er: any) => er.answer).filter(Boolean)
        const choiceCount: Record<string, number> = {}
        const total = choices.length

        choices.forEach((choice: any) => {
          if (Array.isArray(choice)) {
            choice.forEach((c: any) => {
              choiceCount[c] = (choiceCount[c] || 0) + 1
            })
          } else {
            choiceCount[choice] = (choiceCount[choice] || 0) + 1
          }
        })

        // Sempre incluir todas as opções, mesmo com 0 respostas
        const allOptions = element.config?.options || []
        const percentages = allOptions.map((option: any) => {
          const count = choiceCount[option] || 0
          return {
            option,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          }
        })

        metrics[element.id] = {
          type: element.type,
          question: element.question,
          data: {
            total,
            percentages,
            allowMultiple: element.config?.allowMultiple || false,
          },
        }
        break

      case "text":
      case "textarea":
        metrics[element.id] = {
          type: element.type,
          question: element.question,
          data: {
            total: elementResponses.length,
            responses: elementResponses.map((er: any) => er.answer).filter(Boolean),
          },
        }
        break
    }
  })

  return metrics
}

function processTimelineData(responses: any[], hits: any[], exposures: any[]) {
  // Agrupar por data
  const dataByDate: Record<string, { responses: number; hits: number; exposures: number }> = {}

  // Processar responses
  responses.forEach((response: any) => {
    const date = new Date(response.created_at).toISOString().split("T")[0]
    if (!dataByDate[date]) {
      dataByDate[date] = { responses: 0, hits: 0, exposures: 0 }
    }
    dataByDate[date].responses++
  })

  // Processar hits
  hits.forEach((hit: any) => {
    const date = new Date(hit.created_at).toISOString().split("T")[0]
    if (!dataByDate[date]) {
      dataByDate[date] = { responses: 0, hits: 0, exposures: 0 }
    }
    dataByDate[date].hits++
  })

  // Processar exposures
  exposures.forEach((exposure: any) => {
    const date = new Date(exposure.created_at).toISOString().split("T")[0]
    if (!dataByDate[date]) {
      dataByDate[date] = { responses: 0, hits: 0, exposures: 0 }
    }
    dataByDate[date].exposures++
  })

  // Converter para array ordenado
  return Object.entries(dataByDate)
    .map(([date, data]) => ({
      date,
      responses: data.responses,
      hits: data.hits,
      exposures: data.exposures,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function processTableData(responses: any[], elements: any[]) {
  return responses.map((response: any) => {
    const row: any = {
      id: response.id,
      created_at: response.created_at,
      session_id: response.session_id,
      page_url: response.page_url,
      user_agent: response.user_agent,
      device: response.device || "unknown",
      is_test: response.is_test || false,
    }

    // Adicionar respostas de cada elemento
    elements.forEach((element: any) => {
      const elementResponse = response.survey_element_responses?.find((er: any) => er.element_id === element.id)
      row[`element_${element.id}`] = elementResponse?.answer || null
    })

    return row
  })
}
