import { type NextRequest, NextResponse } from "next/server"
import { getDbServiceRoleClient } from "@/lib/dbClient"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbServiceRoleClient()
    const { is_active } = await request.json()
    const surveyId = params.id

    console.log("=== TOGGLE SURVEY STATUS ===")
    console.log("Survey ID:", surveyId)
    console.log("Novo status:", is_active)

    if (typeof is_active !== "boolean") {
      return NextResponse.json({ error: "is_active deve ser boolean" }, { status: 400 })
    }

    // Validar UUID
    const uuidRegex = /^[0-9a-fA-F-]{36}$/
    if (!uuidRegex.test(surveyId)) {
      return NextResponse.json({ error: "Survey ID inválido" }, { status: 400 })
    }

    // Verificar se a survey existe
    const { data: surveyArray, error: fetchError } = await db
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .limit(1)

    if (fetchError || !surveyArray || surveyArray.length === 0) {
      console.error("Survey não encontrada:", fetchError)
      return NextResponse.json({ error: "Survey não encontrada" }, { status: 404 })
    }

    const survey = surveyArray[0]
    console.log("Survey encontrada:", survey.id, survey.is_active)

    // Atualizar o status da survey
    const { error: updateError } = await db
      .from("surveys")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", surveyId)

    if (updateError) {
      console.error("Erro ao atualizar survey:", updateError)
      return NextResponse.json(
        { error: `Erro ao atualizar survey: ${updateError.message}` },
        { status: 500 },
      )
    }

    console.log("Survey atualizada com sucesso, novo status:", is_active)

    // Buscar a survey atualizada para confirmar
    const { data: updatedSurveyArray, error: fetchUpdatedError } = await db
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .limit(1)

    if (fetchUpdatedError || !updatedSurveyArray || updatedSurveyArray.length === 0) {
      console.error("Erro ao buscar survey atualizada:", fetchUpdatedError)
      return NextResponse.json({ error: "Erro ao recuperar survey atualizada" }, { status: 500 })
    }

    const updatedSurvey = updatedSurveyArray[0]
    console.log("Confirmação - Survey agora está:", updatedSurvey.is_active)

    return NextResponse.json({
      success: true,
      survey: updatedSurvey,
    })
  } catch (error) {
    console.error("Erro no toggle-status:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
