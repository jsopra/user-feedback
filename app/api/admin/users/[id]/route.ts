import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"
import bcrypt from "bcryptjs"

// PUT - Atualizar usuário (apenas para admins)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const userId = params.id

    console.log("=== ATUALIZANDO USUÁRIO ===")
    console.log("User ID:", userId)
    console.log("Dados recebidos:", { name, email, role, hasPassword: !!password })

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Nome, email e função são obrigatórios" }, { status: 400 })
    }

    // Verificar se o email já existe (exceto para o próprio usuário)
    const { data: existingUser } = await db
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", userId)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: any = { name, email, role }

    if (password && password.trim() !== "") {
      const saltRounds = 12
      const newPasswordHash = await bcrypt.hash(password, saltRounds)
      updateData.password_hash = newPasswordHash
    }

    console.log("Dados para atualização:", updateData)

    // Atualizar usuário
    const { data: updatedUser, error } = await db
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Erro do Supabase:", error)
      return NextResponse.json({ error: `Erro ao atualizar usuário: ${error.message}` }, { status: 500 })
    }

    console.log("Usuário atualizado com sucesso:", updatedUser)
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE - Excluir usuário (apenas para admins)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userId = params.id

    // Não permitir que o admin exclua a si mesmo
    if (userId === session.user_id) {
      return NextResponse.json({ error: "Você não pode excluir sua própria conta" }, { status: 400 })
    }

    // Excluir usuário
    const { error } = await db.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Erro do Supabase:", error)
      return NextResponse.json({ error: `Erro ao excluir usuário: ${error.message}` }, { status: 500 })
    }

    console.log("Usuário excluído com sucesso:", userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
