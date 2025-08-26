// =====================================================
// TIPOS DEFINITIVOS DO BANCO DE DADOS
// =====================================================

// Tipos base
export type UUID = string
export type Timestamp = string

// =====================================================
// USUÁRIOS E AUTENTICAÇÃO
// =====================================================

export interface User {
  id: UUID
  email: string
  name: string
  password_hash: string
  role: "admin" | "moderator" | "user"
  is_active: boolean
  created_at: Timestamp
  updated_at: Timestamp
}

export interface UserSession {
  id: UUID
  user_id: UUID
  session_token: string
  expires_at: Timestamp
  created_at: Timestamp
}

// =====================================================
// FEEDBACKS
// =====================================================

export interface Feedback {
  id: UUID
  title: string
  content: string
  rating: number // 1-5
  customer_name: string
  customer_email: string
  status: "pending" | "reviewed" | "resolved"
  created_by?: UUID
  created_at: Timestamp
  updated_at: Timestamp
}

// =====================================================
// SURVEYS
// =====================================================

export interface Survey {
  id?: UUID
  title: string
  description: string
  design_settings: SurveyDesignSettings
  target_settings: SurveyTargetSettings
  is_active: boolean
  created_at?: Timestamp
  updated_at?: Timestamp
  created_by?: UUID

  // Relacionamentos (não estão no banco, mas são carregados via JOIN)
  elements?: SurveyElement[]
  pageRules?: SurveyPageRule[]
}

export interface SurveyDesignSettings {
  colorTheme: "default" | "custom"
  primaryColor: string
  backgroundColor: string
  textColor: string
  widgetPosition:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center-center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
}

export interface SurveyTargetSettings {
  delay: number // segundos
  recurrence: "one_response" | "time_sequence"
  recurrenceConfig?: {
    interval?: number // dias
    maxResponses?: number
  }
}

export interface SurveyElement {
  id?: UUID
  survey_id?: UUID
  type: "text" | "textarea" | "multiple_choice" | "rating"
  question: string
  required: boolean
  order_index: number
  config: SurveyElementConfig
  created_at?: Timestamp
}

export interface SurveyElementConfig {
  // Para text/textarea
  placeholder?: string
  maxLength?: number

  // Para multiple_choice
  options?: string[]
  allowMultiple?: boolean

  // Para rating
  ratingRange?: {
    min: number
    max: number
  }
}

export interface SurveyPageRule {
  id?: UUID
  survey_id?: UUID
  rule_type: "include" | "exclude"
  pattern: string
  is_regex: boolean
  created_at?: Timestamp
}

// =====================================================
// RESPOSTAS DAS SURVEYS
// =====================================================

export interface SurveyResponse {
  id?: UUID
  survey_id: UUID
  session_id: string
  user_agent?: string
  ip_address?: string
  page_url?: string
  completed: boolean
  completed_at?: Timestamp
  created_at?: Timestamp

  // Relacionamentos
  elementResponses?: SurveyElementResponse[]
}

export interface SurveyElementResponse {
  id?: UUID
  response_id: UUID
  element_id: UUID
  answer: any // JSONB - pode ser string, number, array, etc.
  created_at?: Timestamp
}

// =====================================================
// TIPOS PARA FRONTEND (COMPATIBILIDADE)
// =====================================================

// Tipo compatível com o frontend atual
export interface SurveyFrontend {
  id?: UUID
  title: string
  description: string
  elements: SurveyElement[]
  design: SurveyDesignSettings
  target: SurveyTargetSettings
  pageRules: SurveyPageRule[]
  is_active: boolean
  created_at?: Timestamp
  updated_at?: Timestamp
  created_by?: UUID
}

// =====================================================
// TIPOS PARA APIs
// =====================================================

export interface CreateSurveyRequest {
  title: string
  description: string
  design_settings: SurveyDesignSettings
  target_settings: SurveyTargetSettings
  elements: Omit<SurveyElement, "id" | "survey_id" | "created_at">[]
  pageRules: Omit<SurveyPageRule, "id" | "survey_id" | "created_at">[]
  is_active?: boolean
  created_by?: UUID
}

export interface UpdateSurveyRequest extends CreateSurveyRequest {
  id: UUID
}

export interface SurveyListResponse {
  surveys: Survey[]
  total: number
  page: number
  limit: number
}

export interface SurveyDetailResponse {
  survey: Survey & {
    elements: SurveyElement[]
    pageRules: SurveyPageRule[]
  }
}
