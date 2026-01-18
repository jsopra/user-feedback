import { type NextRequest, NextResponse } from "next/server"
import { getDbClient, getDbServiceRoleClient } from "@/lib/dbClient"
import type { Survey } from "@/types/survey"

export async function GET(request: NextRequest) {
  try {
    const db = getDbClient()
    console.log("=== API GET SURVEYS ===")

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    console.log("Parâmetros recebidos:", { projectId })

    // Buscar surveys primeiro (sem JOIN)
    let surveysQuery = db.from("surveys").select("*").order("created_at", { ascending: false })

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
    const surveyIds = surveys.map((s: any) => s.id)
    const { data: elements, error: elementsError } = await db
      .from("survey_elements")
      .select("*")
      .in("survey_id", surveyIds)
      .order("order_index", { ascending: true })

    if (elementsError) {
      console.error("Erro ao buscar elementos:", elementsError)
    }

    // Buscar regras para todas as surveys
    const { data: rules, error: rulesError } = await db
      .from("survey_page_rules")
      .select("*")
      .in("survey_id", surveyIds)

    if (rulesError) {
      console.error("Erro ao buscar regras:", rulesError)
    }

    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data: recentActivity, error: activityError } = await db
      .from("survey_responses")
      .select("survey_id")
      .in("survey_id", surveyIds)
      .gte("created_at", twentyFourHoursAgo.toISOString())

    if (activityError) {
      console.error("Erro ao buscar atividade recente:", activityError)
    }

    const activityBySurvey = (recentActivity || []).reduce(
      (acc: any, response: any) => {
        acc[response.survey_id] = (acc[response.survey_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Agrupar elementos e regras por survey_id
    const elementsBySurvey = (elements || []).reduce(
      (acc: any, element: any) => {
        if (!acc[element.survey_id]) acc[element.survey_id] = []
        acc[element.survey_id].push(element)
        return acc
      },
      {} as Record<string, any[]>,
    )

    const rulesBySurvey = (rules || []).reduce(
      (acc: any, rule: any) => {
        if (!acc[rule.survey_id]) acc[rule.survey_id] = []
        acc[rule.survey_id].push(rule)
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Transformar dados para o formato esperado pelo frontend
    const transformedSurveys: Survey[] = surveys.map((survey: any) => ({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      language: survey.language || "en",
      design: survey.design_settings || {
        colorTheme: "default",
        primaryColor: "#3b82f6",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        widgetPosition: "bottom-right",
        softGate: true,
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
    } as any))

    console.log("Surveys transformadas:", transformedSurveys.length)
    if (transformedSurveys.length > 0) {
      console.log("Primeira survey transformada:", {
        id: transformedSurveys[0].id,
        title: transformedSurveys[0].title,
        elements: transformedSurveys[0].elements?.length || 0,
        rules: transformedSurveys[0].pageRules?.length || 0,
        project_id: transformedSurveys[0].project_id,
        created_by: transformedSurveys[0].created_by,
        hasRecentActivity: (transformedSurveys[0] as any).hasRecentActivity,
        activityCount: (transformedSurveys[0] as any).activityCount,
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
    const db = getDbServiceRoleClient()
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

    // Validar UUID do created_by
    const uuidRegex = /^[0-9a-fA-F-]{36}$/
    if (!uuidRegex.test(surveyData.created_by)) {
      return NextResponse.json({ error: "created_by é um UUID inválido" }, { status: 400 })
    }

    if (!surveyData.project_id) {
      return NextResponse.json({ error: "project_id é obrigatório" }, { status: 400 })
    }

    // Validar UUID do project_id
    if (!uuidRegex.test(surveyData.project_id)) {
      return NextResponse.json({ error: "project_id é um UUID inválido" }, { status: 400 })
    }

    const generateApiKey = () => {
      const crypto = require("crypto")
      return crypto.randomBytes(16).toString("hex")
    }

    // Preparar dados para inserção
    const surveyInsertData = {
      title: surveyData.title.trim(),
      description: surveyData.description.trim(),
      language: surveyData.language || "en",
      design_settings: surveyData.design || {
        colorTheme: "default",
        primaryColor: "#3b82f6",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        widgetPosition: "bottom-right",
        softGate: true,
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

    // Inserir survey principal - usar insert() sem select() por causa de problema no QueryBuilder
    let insertResult: any
    try {
      insertResult = await db
        .from("surveys")
        .insert(surveyInsertData)
        .then((res: any) => res, (err: any) => ({ data: null, error: err }))
      
      console.log("Resposta do insert:", insertResult)
    } catch (err) {
      console.error("Erro ao inserir survey:", err)
      return NextResponse.json(
        {
          error: `Erro ao criar survey: ${err instanceof Error ? err.message : String(err)}`,
        },
        { status: 500 },
      )
    }

    if (insertResult.error) {
      console.error("Erro ao inserir survey:", insertResult.error)
      console.error("Erro detalhado:", {
        code: (insertResult.error as any).code,
        message: insertResult.error.message,
        details: (insertResult.error as any).details,
      })
      return NextResponse.json(
        {
          error: `Erro ao criar survey: ${insertResult.error.message}`,
          details: insertResult.error,
        },
        { status: 500 },
      )
    }

    // Buscar a survey inserida usando o created_by e project_id como referência
    console.log("Buscando survey inserida...")
    const { data: surveyArray, error: searchError } = await db
      .from("surveys")
      .select("*")
      .eq("created_by", surveyData.created_by)
      .eq("project_id", surveyData.project_id)
      .order("created_at", { ascending: false })
      .limit(1)

    console.log("Resultado da busca:", { surveyArray, searchError })

    if (searchError) {
      console.error("Erro ao buscar survey inserida:", searchError)
      return NextResponse.json({ error: "Erro ao recuperar survey criada" }, { status: 500 })
    }

    const survey = surveyArray && surveyArray.length > 0 ? surveyArray[0] : null

    if (!survey) {
      console.error("Survey não foi encontrada após inserção")
      return NextResponse.json({ error: "Survey não foi criada" }, { status: 500 })
    }

    console.log("Survey inserida no banco:", {
      id: survey.id,
      title: survey.title,
      created_by: survey.created_by,
      project_id: survey.project_id,
    })

    // Verificar se a survey foi realmente salva
    const { data: verifyData, error: verifyError } = await db
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

      // Inserir elementos um por um para garantir que funcionam
      let insertedCount = 0
      for (const elementData of elementsToInsert) {
        const { error: elemError } = await db
          .from("survey_elements")
          .insert(elementData)

        if (elemError) {
          console.error("Erro ao inserir elemento:", elemError, "Dados:", elementData)
          // Rollback - deletar survey criada
          await db.from("surveys").delete().eq("id", survey.id)
          return NextResponse.json({ error: "Erro ao criar elementos da survey" }, { status: 500 })
        }
        insertedCount++
      }

      console.log("Elementos inseridos:", insertedCount)
    }

    // Inserir regras de páginas se existirem
    if (surveyData.pageRules && surveyData.pageRules.length > 0) {
      console.log(`Inserindo ${surveyData.pageRules.length} regras...`)

      const rulesToInsert = surveyData.pageRules.map((rule: any) => ({
        survey_id: survey.id,
        rule_type: rule.rule_type,
        pattern: rule.pattern,
        is_regex: rule.is_regex !== false,
      }))

      console.log("Regras a inserir:", rulesToInsert)

      // Inserir regras uma por uma para garantir que funcionam
      let insertedRulesCount = 0
      for (const ruleData of rulesToInsert) {
        const { error: ruleError } = await db
          .from("survey_page_rules")
          .insert(ruleData)

        if (ruleError) {
          console.error("Erro ao inserir regra:", ruleError, "Dados:", ruleData)
          // Rollback - deletar survey criada
          await db.from("surveys").delete().eq("id", survey.id)
          return NextResponse.json({ error: "Erro ao criar regras da survey" }, { status: 500 })
        }
        insertedRulesCount++
      }

      console.log("Regras inseridas:", insertedRulesCount)
    }

    // Verificação final - buscar a survey completa
    const { data: finalVerify, error: finalError } = await db
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
