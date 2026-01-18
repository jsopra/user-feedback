import { getDbClient } from "./dbClient"
import bcrypt from "bcryptjs"

/**
 * Sistema de autenticação customizado usando PostgreSQL (via driver pg) e bcrypt
 * Gerencia login, registro e validação de sessões
 */

const db = getDbClient()

/**
 * Autentica um usuário com email e senha
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @returns Objeto com dados do usuário e token de sessão
 */
export async function loginUser(email: string, password: string) {
  try {
    // Buscar usuário no banco de dados
    const { data: user, error } = await db
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single()

    if (error || !user) {
      throw new Error("Email ou senha incorretos")
    }

    let isValidPassword = false

    try {
      // Formato novo - bcrypt
      isValidPassword = await bcrypt.compare(password, user.password_hash)
    } catch (bcryptError) {
      throw new Error("Erro interno na validação de senha")
    }

    if (!isValidPassword) {
      throw new Error("Email ou senha incorretos")
    }

    // Criar sessão
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    const { error: sessionError } = await db.from("user_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      throw new Error("Erro ao criar sessão")
    }

    return {
      user,
      sessionToken,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Registra um novo usuário no sistema
 * @param userData - Dados do usuário (nome, email, senha, role opcional)
 * @returns Dados do usuário criado
 */
export async function registerUser(userData: {
  name: string
  email: string
  password: string
  role?: "admin" | "moderator" | "user"
}) {
  try {
    // Verificar se email já existe
    const { data: existingUser } = await db.from("users").select("id").eq("email", userData.email).single()

    if (existingUser) {
      throw new Error("Email já cadastrado")
    }

    const saltRounds = 12
    const passwordHash = await bcrypt.hash(userData.password, saltRounds)

    // Inserir usuário
    const { data: user, error } = await db
      .from("users")
      .insert({
        name: userData.name,
        email: userData.email,
        password_hash: passwordHash,
        role: userData.role || "user",
        is_active: true,
      })
      .single()

    if (error) {
      throw new Error("Erro ao criar usuário")
    }

    return user
  } catch (error) {
    throw error
  }
}

/**
 * Valida um token de sessão e retorna os dados do usuário
 * @param sessionToken - Token da sessão
 * @returns Dados da sessão e usuário
 */
export async function validateSession(sessionToken: string) {
  try {
    const { data: session, error } = await db
      .from("user_sessions")
      .select(`
        *,
        users (*)
      `)
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !session) {
      throw new Error("Sessão inválida ou expirada")
    }

    return session
  } catch (error) {
    throw error
  }
}

/**
 * Gera um token de sessão único
 * @returns Token de sessão gerado
 */
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
