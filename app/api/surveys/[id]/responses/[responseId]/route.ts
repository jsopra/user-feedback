import { getSupabaseServiceRoleClient } from "@/lib/supabaseClient"

export async function PATCH(request: Request, { params }: { params: { id: string; responseId: string } }) {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { is_test } = await request.json()

    console.log("[v0] PATCH request received:", {
      surveyId: params.id,
      responseId: params.responseId,
      is_test,
    })

    const { data, error } = await supabase
      .from("survey_responses")
      .update({ is_test })
      .eq("id", params.responseId)
      .eq("survey_id", params.id)
      .select()
      .single()

    if (error) {
      console.log("[v0] Supabase error:", error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Update successful:", data)
    return Response.json({ success: true, data })
  } catch (error) {
    console.log("[v0] Server error:", error)
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
