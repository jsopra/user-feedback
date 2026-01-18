import { getDbServiceRoleClient } from "@/lib/dbClient"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string; responseId: string } }) {
  try {
    const db = getDbServiceRoleClient()
    const { is_test } = await request.json()

    console.log("[v0] PATCH request received:", {
      surveyId: params.id,
      responseId: params.responseId,
      is_test,
    })

    const { error: updateError } = await db
      .from("survey_responses")
      .update({ is_test })
      .eq("id", params.responseId)
      .eq("survey_id", params.id)

    if (updateError) {
      console.log("[v0] Update error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Buscar o registro atualizado separadamente
    const { data, error: fetchError } = await db
      .from("survey_responses")
      .select("*")
      .eq("id", params.responseId)
      .single()

    if (fetchError) {
      console.log("[v0] Fetch error:", fetchError)
      // Mesmo com erro no fetch, update funcionou
      return NextResponse.json({ success: true })
    }

    console.log("[v0] Update successful:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.log("[v0] Server error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
