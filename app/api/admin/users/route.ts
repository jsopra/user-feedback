import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"
import bcrypt from "bcryptjs"

// GET - Listar usuários (apenas para admins)
export async function GET(request: NextRequest) {
  try {
    const db = getDbClient()
    const sessionToken =
      request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("sessionToken")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Token de sessão obrigatório" }, { status: 401 })
    }

    // Verificar se o usuário é admin
    const { data: session } = await db
      .from("user_sessions")
      .select("user_id")
      .eq("session_token", sessionToken)
      .single()

    if (!session) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 })
    }

    const { data: currentUser } = await db.from("users").select("role").eq("id", session.user_id).single()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    console.log("Buscando usuários...")

    // Buscar todos os usuários
    const { data: users, error } = await db
      .from("users")
      .select("id, email, name, role, created_at")
      .order("created_at", { ascending: false })

    console.log("Usuários encontrados:", users?.length || 0)
    console.log("Primeiro usuário:", users?.[0])

    if (error) {
      console.error("Erro ao buscar usuários:", error)
      return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Criar usuário (apenas para admins)
export async function POST(request: NextRequest) {
  try {
    const db = getDbClient()
    const sessionToken =
      request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("sessionToken")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Token de sessão obrigatório" }, { status: 401 })
    }

    // Verificar se o usuário é admin
    const { data: session } = await db
      .from("user_sessions")
      .select("user_id")
      .eq("session_token", sessionToken)
      .single()

    if (!session) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 })
    }

    const { data: currentUser } = await db.from("users").select("role").eq("id", session.user_id).single()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Verificar se o email já existe
    const { data: existingUser } = await db.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    // Criar usuário
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const { data: newUser, error } = await db
      .from("users")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar usuário:", error)
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
    }

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
