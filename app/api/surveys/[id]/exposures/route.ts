import { type NextRequest, NextResponse } from "next/server"
import { getDeviceType } from "@/lib/device-parser"
import { getDbServiceRoleClient } from "@/lib/dbClient"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }

  try {
    const db = getDbServiceRoleClient()
    const surveyId = params.id
    const body = await request.json()

    const { sessionId, route, device, userAgent, custom_params, trigger_mode } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400, headers })
    }

    const deviceType = userAgent ? getDeviceType(userAgent) : device || "unknown"

    const { error } = await db.from("survey_exposures").insert({
      survey_id: surveyId,
      session_id: sessionId,
      route: route || "unknown",
      device: deviceType,
      user_agent: userAgent || "unknown",
      custom_params: custom_params || null,
      trigger_mode: trigger_mode || "time",
    })

    if (error) {
      console.error("Error recording exposure:", error)
      return NextResponse.json({ error: "Failed to record exposure" }, { status: 500, headers })
    }

    return NextResponse.json({ success: true }, { status: 200, headers })
  } catch (error) {
    console.error("Error recording exposure:", error)
    return NextResponse.json({ error: "Failed to record exposure" }, { status: 500, headers })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
