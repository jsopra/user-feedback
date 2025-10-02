import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data: feedbacks, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ feedbacks })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar feedbacks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const feedbackData = await request.json()

    const { data: feedback, error } = await supabase.from("feedbacks").insert(feedbackData).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar feedback" }, { status: 500 })
  }
}
