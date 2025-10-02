import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Survey } from "@/types/survey"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient()
    // Buscar survey principal
    const { data: survey, error: surveyError } = await supabase.from("surveys").select("*").eq("id", params.id).single()

    if (surveyError || !survey) {
      console.error("Erro ao buscar survey:", surveyError)
      return NextResponse.json({ error: "Survey não encontrada" }, { status: 404 })
    }

    // Buscar elementos da survey
    const { data: elements, error: elementsError } = await supabase
      .from("survey_elements")
      .select("*")
      .eq("survey_id", params.id)
      .order("order_index", { ascending: true })

    if (elementsError) {
      console.error("Erro ao buscar elementos:", elementsError)
    }

    // Buscar regras da survey
    const { data: rules, error: rulesError } = await supabase
      .from("survey_page_rules")
      .select("*")
      .eq("survey_id", params.id)

    if (rulesError) {
      console.error("Erro ao buscar regras:", rulesError)
    }

    // Transformar dados
    const transformedSurvey: Survey = {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      project_id: survey.project_id,
      design: survey.design_settings || {
        colorTheme: "default",
        primaryColor: "#3b82f6",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        widgetPosition: "bottom-right",
      },
      target: survey.target_settings || {
        delay: 0,
        recurrence: "one_response",
        recurrenceConfig: {},
      },
      elements: (elements || []).map((element: any) => ({
        id: element.id,
        survey_id: element.survey_id,
        type: element.type,
        question: element.question,
        required: element.required,
        order_index: element.order_index,
        config: element.config || {},
      })),
      pageRules: (rules || []).map((rule: any) => ({
        id: rule.id,
        survey_id: rule.survey_id,
        rule_type: rule.rule_type,
        pattern: rule.pattern,
        is_regex: rule.is_regex,
      })),
      is_active: survey.is_active,
      created_at: survey.created_at,
      updated_at: survey.updated_at,
      created_by: survey.created_by,
    }

    return NextResponse.json({ survey: transformedSurvey })
  } catch (error) {
    console.error("Erro ao buscar survey:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient()
    const surveyData: Survey = await request.json()

    const { data: existingSurvey, error: checkError } = await supabase
      .from("surveys")
      .select("id, created_by")
      .eq("id", params.id)
      .single()

    if (checkError || !existingSurvey) {
      console.error("Survey não encontrada para atualização:", checkError)
      return NextResponse.json({ error: "Survey não encontrada" }, { status: 404 })
    }

    if (existingSurvey.created_by !== surveyData.created_by) {
      return NextResponse.json({ error: "Sem permissão para editar esta survey" }, { status: 403 })
    }

    // Atualizar survey principal
    const { error: surveyError } = await supabase
      .from("surveys")
      .update({
        title: surveyData.title,
        description: surveyData.description,
        design_settings: surveyData.design,
        target_settings: surveyData.target,
        is_active: surveyData.is_active,
      })
      .eq("id", params.id)

    if (surveyError) {
      throw surveyError
    }

    // Remover elementos existentes
    await supabase.from("survey_elements").delete().eq("survey_id", params.id)

    // Inserir novos elementos
    if (surveyData.elements && surveyData.elements.length > 0) {
      const elementsToInsert = surveyData.elements.map((element, index) => ({
        survey_id: params.id,
        type: element.type,
        question: element.question,
        required: element.required,
        order_index: index,
        config: element.config || {},
      }))

      const { error: elementsError } = await supabase.from("survey_elements").insert(elementsToInsert)

      if (elementsError) {
        throw elementsError
      }
    }

    // Remover regras existentes
    await supabase.from("survey_page_rules").delete().eq("survey_id", params.id)

    // Inserir novas regras
    if (surveyData.pageRules && surveyData.pageRules.length > 0) {
      const rulesToInsert = surveyData.pageRules.map((rule) => ({
        survey_id: params.id,
        rule_type: rule.rule_type,
        pattern: rule.pattern,
        is_regex: rule.is_regex,
      }))

      const { error: rulesError } = await supabase.from("survey_page_rules").insert(rulesToInsert)

      if (rulesError) {
        throw rulesError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar survey:", error)
    return NextResponse.json({ error: "Erro ao atualizar survey" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("surveys").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar survey:", error)
    return NextResponse.json({ error: "Erro ao deletar survey" }, { status: 500 })
  }
}
