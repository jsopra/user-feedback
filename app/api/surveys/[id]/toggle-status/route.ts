import { type NextRequest, NextResponse } from "next/server"
import { getDbServiceRoleClient } from "@/lib/dbClient"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbServiceRoleClient()
    const { is_active } = await request.json()
    const surveyId = params.id

    if (typeof is_active !== "boolean") {
      return NextResponse.json({ error: "is_active deve ser boolean" }, { status: 400 })
    }

    // Verificar se a survey existe
    const { data: survey, error: fetchError } = await db.from("surveys").select("*").eq("id", surveyId).single()

    if (fetchError || !survey) {
      return NextResponse.json({ error: "Survey não encontrada" }, { status: 404 })
    }

    // Atualizar o status da survey
    const { data: updatedSurvey, error: updateError } = await db
      .from("surveys")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", surveyId)
      .select()
      .single()

    if (updateError) {
      console.error("Erro ao atualizar survey:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar survey" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      survey: updatedSurvey,
    })
  } catch (error) {
    console.error("Erro no toggle-status:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
