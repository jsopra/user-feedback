import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Survey } from "@/types/survey"

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    console.log("=== API GET SURVEYS ===")

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    console.log("Parâmetros recebidos:", { projectId })

    // Buscar surveys primeiro (sem JOIN)
    let surveysQuery = supabase.from("surveys").select("*").order("created_at", { ascending: false })

    if (projectId) {
      surveysQuery = surveysQuery.eq("project_id", projectId)
    }

    const { data: surveys, error: surveysError } = await surveysQuery

    if (surveysError) {
      console.error("Erro ao buscar surveys:", surveysError)
      return NextResponse.json(
        {
          error: "Erro ao buscar surveys",
          details: surveysError,
        },
        { status: 500 },
      )
    }

    console.log("Surveys encontradas no banco:", surveys?.length || 0)
    if (surveys && surveys.length > 0) {
      console.log("Primeira survey encontrada:", {
        id: surveys[0].id,
        title: surveys[0].title,
        project_id: surveys[0].project_id,
        created_by: surveys[0].created_by,
      })
    }

    if (!surveys || surveys.length === 0) {
      return NextResponse.json({ surveys: [] })
    }

    // Buscar elementos para todas as surveys
    const surveyIds = surveys.map((s) => s.id)
    const { data: elements, error: elementsError } = await supabase
      .from("survey_elements")
      .select("*")
      .in("survey_id", surveyIds)
      .order("order_index", { ascending: true })

    if (elementsError) {
      console.error("Erro ao buscar elementos:", elementsError)
    }

    // Buscar regras para todas as surveys
    const { data: rules, error: rulesError } = await supabase
      .from("survey_page_rules")
      .select("*")
      .in("survey_id", surveyIds)

    if (rulesError) {
      console.error("Erro ao buscar regras:", rulesError)
    }

    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data: recentActivity, error: activityError } = await supabase
      .from("survey_responses")
      .select("survey_id")
      .in("survey_id", surveyIds)
      .gte("created_at", twentyFourHoursAgo.toISOString())

    if (activityError) {
      console.error("Erro ao buscar atividade recente:", activityError)
    }

    const activityBySurvey = (recentActivity || []).reduce(
      (acc, response) => {
        acc[response.survey_id] = (acc[response.survey_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Agrupar elementos e regras por survey_id
    const elementsBySurvey = (elements || []).reduce(
      (acc, element) => {
        if (!acc[element.survey_id]) acc[element.survey_id] = []
        acc[element.survey_id].push(element)
        return acc
      },
      {} as Record<string, any[]>,
    )

    const rulesBySurvey = (rules || []).reduce(
      (acc, rule) => {
        if (!acc[rule.survey_id]) acc[rule.survey_id] = []
        acc[rule.survey_id].push(rule)
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Transformar dados para o formato esperado pelo frontend
    const transformedSurveys: Survey[] = surveys.map((survey) => ({
      id: survey.id,
      title: survey.title,
      description: survey.description,
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
      elements: (elementsBySurvey[survey.id] || []).map((element: any) => ({
        id: element.id,
        survey_id: element.survey_id,
        type: element.type,
        question: element.question,
        required: element.required,
        order_index: element.order_index,
        config: element.config || {},
      })),
      pageRules: (rulesBySurvey[survey.id] || []).map((rule: any) => ({
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
      project_id: survey.project_id,
      hasRecentActivity: (activityBySurvey[survey.id] || 0) > 0,
      activityCount: activityBySurvey[survey.id] || 0,
    }))

    console.log("Surveys transformadas:", transformedSurveys.length)
    if (transformedSurveys.length > 0) {
      console.log("Primeira survey transformada:", {
        id: transformedSurveys[0].id,
        title: transformedSurveys[0].title,
        elements: transformedSurveys[0].elements?.length || 0,
        rules: transformedSurveys[0].pageRules?.length || 0,
        project_id: transformedSurveys[0].project_id,
        created_by: transformedSurveys[0].created_by,
        hasRecentActivity: transformedSurveys[0].hasRecentActivity,
        activityCount: transformedSurveys[0].activityCount,
      })
    }

    return NextResponse.json({ surveys: transformedSurveys })
  } catch (error) {
    console.error("Erro geral ao buscar surveys:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const surveyData: Survey = await request.json()

    console.log("=== API POST SURVEY ===")
    console.log("Dados recebidos:", {
      title: surveyData.title,
      description: surveyData.description,
      created_by: surveyData.created_by,
      project_id: surveyData.project_id,
      elements_count: surveyData.elements?.length || 0,
      rules_count: surveyData.pageRules?.length || 0,
    })

    // Validações
    if (!surveyData.title?.trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }

    if (!surveyData.description?.trim()) {
      return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 })
    }

    if (!surveyData.created_by) {
      return NextResponse.json({ error: "created_by é obrigatório" }, { status: 400 })
    }

    if (!surveyData.project_id) {
      return NextResponse.json({ error: "project_id é obrigatório" }, { status: 400 })
    }

    const generateApiKey = () => {
      const crypto = require("crypto")
      return crypto.randomBytes(16).toString("hex")
    }

    // Preparar dados para inserção
    const surveyInsertData = {
      title: surveyData.title.trim(),
      description: surveyData.description.trim(),
      design_settings: surveyData.design || {
        colorTheme: "default",
        primaryColor: "#3b82f6",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        widgetPosition: "bottom-right",
      },
      target_settings: surveyData.target || {
        delay: 0,
        recurrence: "one_response",
        recurrenceConfig: {},
      },
      is_active: surveyData.is_active !== false, // true por padrão, false apenas se explicitamente definido
      created_by: surveyData.created_by,
      project_id: surveyData.project_id,
      api_key: generateApiKey(), // Adicionar API key gerada automaticamente
    }

    console.log("Dados preparados para inserção:", surveyInsertData)

    // Inserir survey principal
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .insert(surveyInsertData)
      .select()
      .single()

    if (surveyError) {
      console.error("Erro ao inserir survey:", surveyError)
      return NextResponse.json(
        {
          error: `Erro ao criar survey: ${surveyError.message}`,
          details: surveyError,
        },
        { status: 500 },
      )
    }

    if (!survey) {
      console.error("Survey não foi criada - resposta vazia")
      return NextResponse.json({ error: "Survey não foi criada" }, { status: 500 })
    }

    console.log("Survey inserida no banco:", {
      id: survey.id,
      title: survey.title,
      created_by: survey.created_by,
      project_id: survey.project_id,
    })

    // Verificar se a survey foi realmente salva
    const { data: verifyData, error: verifyError } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", survey.id)
      .single()

    if (verifyError || !verifyData) {
      console.error("Erro na verificação:", verifyError)
      return NextResponse.json({ error: "Survey não foi salva corretamente" }, { status: 500 })
    }

    console.log("Verificação - Survey existe no banco:", {
      id: verifyData.id,
      title: verifyData.title,
      created_by: verifyData.created_by,
      project_id: verifyData.project_id,
    })

    // Inserir elementos se existirem
    if (surveyData.elements && surveyData.elements.length > 0) {
      console.log(`Inserindo ${surveyData.elements.length} elementos...`)

      const elementsToInsert = surveyData.elements.map((element, index) => ({
        survey_id: survey.id,
        type: element.type,
        question: element.question,
        required: element.required || false,
        order_index: index,
        config: element.config || {},
      }))

      console.log("Elementos a inserir:", elementsToInsert)

      const { data: insertedElements, error: elementsError } = await supabase
        .from("survey_elements")
        .insert(elementsToInsert)
        .select()

      if (elementsError) {
        console.error("Erro ao inserir elementos:", elementsError)
        // Rollback - deletar survey criada
        await supabase.from("surveys").delete().eq("id", survey.id)
        return NextResponse.json({ error: "Erro ao criar elementos da survey" }, { status: 500 })
      }

      console.log("Elementos inseridos:", insertedElements?.length || 0)
    }

    // Inserir regras de páginas se existirem
    if (surveyData.pageRules && surveyData.pageRules.length > 0) {
      console.log(`Inserindo ${surveyData.pageRules.length} regras...`)

      const rulesToInsert = surveyData.pageRules.map((rule) => ({
        survey_id: survey.id,
        rule_type: rule.rule_type,
        pattern: rule.pattern,
        is_regex: rule.is_regex !== false,
      }))

      console.log("Regras a inserir:", rulesToInsert)

      const { data: insertedRules, error: rulesError } = await supabase
        .from("survey_page_rules")
        .insert(rulesToInsert)
        .select()

      if (rulesError) {
        console.error("Erro ao inserir regras:", rulesError)
        // Rollback - deletar survey criada
        await supabase.from("surveys").delete().eq("id", survey.id)
        return NextResponse.json({ error: "Erro ao criar regras da survey" }, { status: 500 })
      }

      console.log("Regras inseridas:", insertedRules?.length || 0)
    }

    // Verificação final - buscar a survey completa
    const { data: finalVerify, error: finalError } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", survey.id)
      .eq("created_by", surveyData.created_by)
      .eq("project_id", surveyData.project_id)
      .single()

    if (finalError || !finalVerify) {
      console.error("Erro na verificação final:", finalError)
      return NextResponse.json({ error: "Survey não foi encontrada após criação" }, { status: 500 })
    }

    console.log("=== SURVEY CRIADA E VERIFICADA COM SUCESSO ===")
    console.log("Survey final:", {
      id: finalVerify.id,
      title: finalVerify.title,
      created_by: finalVerify.created_by,
      project_id: finalVerify.project_id,
    })

    return NextResponse.json({
      survey: finalVerify,
      message: "Survey criada com sucesso!",
    })
  } catch (error) {
    console.error("Erro geral ao criar survey:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
