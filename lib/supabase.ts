// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "moderator" | "user"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  title: string
  content: string
  rating: number
  customer_name: string
  customer_email: string
  status: "pending" | "reviewed" | "resolved"
  created_by?: string
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}
