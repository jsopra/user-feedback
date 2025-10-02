import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    console.log("=== TESTE DE CONFIGURAÇÃO DO BANCO ===")

    // Verificar variáveis de ambiente
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Definida" : "✗ Não definida")
    console.log("SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Definida" : "✗ Não definida")

    // Testar conexão básica
    console.log("Testando conexão básica...")
    const { data: users, error: usersError } = await supabase.from("users").select("id, email").limit(1)

    if (usersError) {
      console.error("Erro ao acessar tabela users:", usersError)
      return NextResponse.json(
        {
          error: "Erro de conexão com tabela users",
          details: usersError,
          suggestion: "Verifique se o banco foi configurado corretamente",
          env: {
            supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
        },
        { status: 500 },
      )
    }

    console.log("Conexão com users OK:", users?.length || 0, "usuários encontrados")

    // Verificar tabelas de surveys
    const tablesToCheck = ["surveys", "survey_elements", "survey_page_rules"]
    const tableStatus: Record<string, boolean> = {}

    for (const tableName of tablesToCheck) {
      console.log(`Verificando tabela ${tableName}...`)
      const { data, error } = await supabase.from(tableName).select("id").limit(1)

      if (error) {
        console.error(`Erro ao acessar tabela ${tableName}:`, error)
        tableStatus[tableName] = false
      } else {
        console.log(`Tabela ${tableName} OK`)
        tableStatus[tableName] = true
      }
    }

    const allTablesExist = Object.values(tableStatus).every((exists) => exists)

    if (!allTablesExist) {
      return NextResponse.json(
        {
          error: "Algumas tabelas não existem",
          tables: tableStatus,
          suggestion: "Execute o script create-surveys-tables.sql ou use o endpoint /api/setup-db",
          missingTables: Object.entries(tableStatus)
            .filter(([_, exists]) => !exists)
            .map(([table, _]) => table),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Todas as verificações passaram!",
      tables: tableStatus,
      userCount: users?.length || 0,
    })
  } catch (error) {
    console.error("Erro no teste:", error)
    return NextResponse.json(
      {
        error: "Erro no teste de configuração",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
