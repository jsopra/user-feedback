import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json({ error: "Token de sessão é obrigatório" }, { status: 400 })
    }

    const { user } = await validateSession(sessionToken)

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 })
  }
}
