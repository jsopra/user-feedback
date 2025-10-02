import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    // Buscar respostas das últimas 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: recentResponses, error } = await supabase
      .from("survey_responses")
      .select("survey_id, created_at")
      .gte("created_at", twentyFourHoursAgo)

    if (error) {
      console.error("Erro ao buscar atividade:", error)
      return NextResponse.json({ error: "Erro ao buscar atividade" }, { status: 500 })
    }

    // Agrupar por survey_id
    const activityBySurvey = (recentResponses || []).reduce(
      (acc, response) => {
        if (!acc[response.survey_id]) {
          acc[response.survey_id] = 0
        }
        acc[response.survey_id]++
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({ activity: activityBySurvey })
  } catch (error) {
    console.error("Erro ao buscar atividade:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
