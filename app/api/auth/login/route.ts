import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const result = await loginUser(email, password)

    const response = NextResponse.json(result)
    response.cookies.set("session_token", result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 horas em segundos
      path: "/",
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 401 },
    )
  }
}
