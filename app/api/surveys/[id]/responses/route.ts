import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"
import { parseDeviceFromUserAgent } from "@/lib/device-parser"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbClient()
    console.log("[v0] === SURVEY RESPONSES API DEBUG ===")
    console.log("[v0] Survey ID:", params.id)

    // Validar UUID
    if (!params.id || params.id === "undefined") {
      return NextResponse.json({ error: "Survey ID is required" }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-fA-F-]{36}$/
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json({ error: "Invalid Survey ID" }, { status: 400 })
    }

    const body = await request.json()
    const { responses, session_id, user_agent, url, timestamp, custom_params, trigger_mode } = body

    console.log("[v0] Request body received:", JSON.stringify(body, null, 2))

    // Verificar se a survey existe e está ativa
    console.log("[v0] Checking if survey exists and is active...")
    const { data: survey, error: surveyError } = await db
      .from("surveys")
      .select("id, is_active")
      .eq("id", params.id)
      .single()

    if (surveyError || !survey) {
      console.error("[v0] Survey not found error:", surveyError)
      return NextResponse.json(
        { error: "Survey não encontrada" },
        {
          status: 404,
          headers: corsHeaders(),
        },
      )
    }

    if (!survey.is_active) {
      console.error("[v0] Survey is inactive")
      return NextResponse.json(
        { error: "Survey não está ativa" },
        {
          status: 400,
          headers: corsHeaders(),
        },
      )
    }

    console.log("[v0] Survey found and active:", survey)

    const deviceType = user_agent ? parseDeviceFromUserAgent(user_agent) : "unknown"
    console.log("[v0] Device type parsed:", deviceType)

    // Primeiro, criar o registro principal na tabela survey_responses
    console.log("[v0] Creating main response record...")
    const { data: mainResponse, error: mainResponseError } = await db
      .from("survey_responses")
      .insert({
        survey_id: params.id,
        session_id: session_id || `session_${Date.now()}`,
        page_url: url || "",
        user_agent: user_agent || "",
        device: deviceType,
        custom_params: custom_params || null,
        trigger_mode: trigger_mode || "time",
        completed: true,
        completed_at: timestamp || new Date().toISOString(),
      })
      .select()
      .single()

    if (mainResponseError || !mainResponse) {
      console.error("[v0] Main response creation error:", mainResponseError)
      return NextResponse.json(
        { error: "Erro ao salvar resposta principal" },
        {
          status: 500,
          headers: corsHeaders(),
        },
      )
    }

    console.log("[v0] Main response created successfully:", mainResponse)

    // Buscar os elementos da survey para mapear os IDs
    console.log("[v0] Fetching survey elements...")
    const { data: surveyElements, error: elementsError } = await db
      .from("survey_elements")
      .select("id, order_index")
      .eq("survey_id", params.id)
      .order("order_index")

    if (elementsError || !surveyElements) {
      console.error("[v0] Survey elements fetch error:", elementsError)
      return NextResponse.json(
        { error: "Erro ao buscar elementos da survey" },
        {
          status: 500,
          headers: corsHeaders(),
        },
      )
    }

    console.log("[v0] Survey elements found:", surveyElements)

    // Preparar respostas individuais para inserção na tabela survey_element_responses
    const elementResponsesToInsert = []

    console.log("[v0] Processing responses:", responses)
    for (const [elementIndex, responseValue] of Object.entries(responses)) {
      console.log("[v0] Processing element:", elementIndex, "value:", responseValue)

      if (responseValue !== null && responseValue !== undefined && responseValue !== "") {
        // Encontrar o element_id baseado no order_index
        const element = surveyElements.find((el: any) => el.order_index === Number.parseInt(elementIndex))
        console.log("[v0] Found element for index", elementIndex, ":", element)

        if (element) {
          // Converter arrays para JSON
          const finalValue = Array.isArray(responseValue) ? responseValue : responseValue

          elementResponsesToInsert.push({
            response_id: mainResponse.id,
            element_id: element.id,
            answer: finalValue,
          })
        } else {
          console.log("[v0] No element found for index:", elementIndex)
        }
      }
    }

    console.log("[v0] Element responses to insert:", elementResponsesToInsert)

    if (elementResponsesToInsert.length === 0) {
      console.error("[v0] No valid responses provided")
      return NextResponse.json(
        { error: "Nenhuma resposta válida fornecida" },
        {
          status: 400,
          headers: corsHeaders(),
        },
      )
    }

    // Inserir respostas individuais dos elementos
    console.log("[v0] Inserting element responses...")
    const { data: insertedElementResponses, error: insertElementError } = await db
      .from("survey_element_responses")
      .insert(elementResponsesToInsert)
      .select()

    if (insertElementError) {
      console.error("[v0] Element responses insertion error:", insertElementError)
      return NextResponse.json(
        { error: "Erro ao salvar respostas dos elementos" },
        {
          status: 500,
          headers: corsHeaders(),
        },
      )
    }

    console.log("[v0] Element responses saved successfully:", insertedElementResponses)
    console.log("[v0] === SURVEY RESPONSES API SUCCESS ===")

    return NextResponse.json(
      {
        success: true,
        message: "Respostas salvas com sucesso",
        response_id: mainResponse.id,
        element_responses: insertedElementResponses,
      },
      {
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("[v0] Internal server error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      {
        status: 500,
        headers: corsHeaders(),
      },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbClient()
    const { data: responses, error } = await db
      .from("survey_responses")
      .select(`
        *,
        survey_element_responses (
          id,
          answer,
          element_id,
          survey_elements (
            question,
            type,
            order_index
          )
        )
      `)
      .eq("survey_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar respostas:", error)
      return NextResponse.json(
        { error: "Erro ao buscar respostas" },
        {
          status: 500,
          headers: corsHeaders(),
        },
      )
    }

    return NextResponse.json(
      { responses },
      {
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      {
        status: 500,
        headers: corsHeaders(),
      },
    )
  }
}
