import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabaseClient"

// GET - Buscar elementos ativos da survey
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { data: elements, error } = await supabase
      .from("survey_elements")
      .select("*")
      .eq("survey_id", params.id)
      .eq("is_active", true) // Filtrar apenas elementos ativos
      .order("order_index")

    if (error) {
      console.error("Error fetching survey elements:", error)
      return NextResponse.json({ error: "Failed to fetch elements" }, { status: 500 })
    }

    return NextResponse.json({ elements })
  } catch (error) {
    console.error("Error in GET /api/surveys/[id]/elements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Soft delete de elemento (NUNCA hard delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { elementId } = await request.json()

    const { error } = await supabase
      .from("survey_elements")
      .update({ is_active: false })
      .eq("id", elementId)
      .eq("survey_id", params.id)

    if (error) {
      console.error("Error soft deleting survey element:", error)
      return NextResponse.json({ error: "Failed to delete element" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/surveys/[id]/elements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
