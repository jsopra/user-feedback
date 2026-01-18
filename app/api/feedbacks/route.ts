import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"

export async function GET() {
  try {
    const db = getDbClient()
    const { data: feedbacks, error } = await db
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
    const db = getDbClient()
    const feedbackData = await request.json()

    const { data: feedback, error } = await db.from("feedbacks").insert(feedbackData).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar feedback" }, { status: 500 })
  }
}
