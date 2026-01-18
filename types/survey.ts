export interface Survey {
  id?: string
  title: string
  description: string
  elements: SurveyElement[]
  design: SurveyDesignSettings
  target: SurveyTargetSettings
  pageRules: SurveyPageRule[]
  is_active: boolean
  created_at?: string
  updated_at?: string
  created_by?: string
  project_id?: string
}

export interface SurveyElement {
  id?: string
  survey_id?: string
  type: "text" | "textarea" | "multiple_choice" | "rating"
  question: string
  required: boolean
  order_index: number
  config: SurveyElementConfig
  created_at?: string
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
    defaultValue?: number
  }
}

export interface SurveyDesignSettings {
  colorTheme: "default" | "custom"
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderRadius?: string
  fontFamily?: string
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
  softGate?: boolean
}

export interface SurveyTargetSettings {
  delay: number // segundos
  triggerMode?: "time" | "event" // Adicionando tipo de acionamento
  recurrence: "one_response" | "time_sequence" | "always" // Adicionando opção "always"
  recurrenceConfig?: {
    interval?: number // dias
    maxResponses?: number
  }
}

export interface SurveyPageRule {
  id?: string
  survey_id?: string
  rule_type: "include" | "exclude"
  pattern: string
  is_regex: boolean
  created_at?: string
}

// Tipos para APIs
export interface CreateSurveyRequest {
  title: string
  description: string
  design: SurveyDesignSettings
  target: SurveyTargetSettings
  elements: Omit<SurveyElement, "id" | "survey_id" | "created_at">[]
  pageRules: Omit<SurveyPageRule, "id" | "survey_id" | "created_at">[]
  is_active?: boolean
  created_by?: string
  project_id?: string
}

export interface UpdateSurveyRequest extends CreateSurveyRequest {
  id: string
}

export interface SurveyListResponse {
  surveys: Survey[]
  total: number
  page: number
  limit: number
}

export interface SurveyDetailResponse {
  survey: Survey
}
