import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
    }

    // Obter token da sessão
    const sessionToken = request.cookies.get("session_token")?.value
    console.log("[v0] Session token:", sessionToken ? "exists" : "missing")

    if (!sessionToken) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data: session, error: sessionError } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    console.log("[v0] Session query result:", { session, sessionError })

    if (sessionError || !session) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 })
    }

    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", session.user_id).single()

    console.log("[v0] User query result:", { user: user ? "found" : "not found", userError })

    if (userError || !user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    console.log("[v0] Password validation:", isCurrentPasswordValid)

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: newPasswordHash })
      .eq("id", user.id)

    if (updateError) {
      console.log("[v0] Update error:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 })
    }

    console.log("[v0] Password changed successfully")
    return NextResponse.json({ message: "Senha alterada com sucesso" })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
