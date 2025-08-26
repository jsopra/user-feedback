import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    const user = await registerUser(userData)

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 400 },
    )
  }
}
