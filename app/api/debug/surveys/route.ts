import { NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"

export async function GET() {
  try {
    const db = getDbClient()
    console.log("=== DEBUG: VERIFICANDO SURVEYS NO BANCO ===")

    // Verificar se a tabela surveys existe e buscar dados
    const { data: surveys, error: surveysError } = await db
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false })

    if (surveysError) {
      console.error("Erro ao buscar surveys:", surveysError)
      return NextResponse.json({
        error: "Erro ao buscar surveys",
        details: surveysError,
        tablesExist: false,
      })
    }

    console.log("Surveys encontradas:", surveys?.length || 0)
    console.log("Dados das surveys:", surveys)

    // Verificar elementos
    const { data: elements, error: elementsError } = await db.from("survey_elements").select("*")

    if (elementsError) {
      console.error("Erro ao buscar elementos:", elementsError)
    }

    console.log("Elementos encontrados:", elements?.length || 0)

    // Verificar regras
    const { data: rules, error: rulesError } = await db.from("survey_page_rules").select("*")

    if (rulesError) {
      console.error("Erro ao buscar regras:", rulesError)
    }

    console.log("Regras encontradas:", rules?.length || 0)

    // Verificar se as tabelas existem consultando o schema
    const { data: tablesInfo, error: tablesError } = await db
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["surveys", "survey_elements", "survey_page_rules"])

    return NextResponse.json({
      success: true,
      surveys: surveys || [],
      elements: elements || [],
      rules: rules || [],
      tablesInfo: tablesInfo || [],
      counts: {
        surveys: surveys?.length || 0,
        elements: elements?.length || 0,
        rules: rules?.length || 0,
      },
      errors: {
        surveys: surveysError?.message || null,
        elements: elementsError?.message || null,
        rules: rulesError?.message || null,
        tables: tablesError?.message || null,
      },
    })
  } catch (error) {
    console.error("Erro no debug:", error)
    return NextResponse.json({
      error: "Erro no debug",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
