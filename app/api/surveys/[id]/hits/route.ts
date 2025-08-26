import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const surveyId = params.id
    const body = await request.json()

    console.log("[v0] Tracking survey hit for:", surveyId)

    const { data, error } = await supabase.from("survey_hits").insert({
      survey_id: surveyId,
      session_id: body.sessionId,
      route: body.route,
      device: body.device,
      user_agent: body.userAgent,
      custom_params: body.custom_params || {},
      trigger_mode: body.trigger_mode || "time",
    })

    if (error) {
      console.error("[v0] Error tracking hit:", error)
      return NextResponse.json({ error: "Failed to track hit" }, { status: 500 })
    }

    console.log("[v0] Hit tracked successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in hits API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
