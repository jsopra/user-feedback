import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"
import { count } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const userCount = await count("users")
    if (userCount > 0) {
      return NextResponse.json({ error: "Já existe um usuário cadastrado" }, { status: 409 })
    }

    const user = await registerUser({ name, email, password, role: "admin" })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 400 },
    )
  }
}
