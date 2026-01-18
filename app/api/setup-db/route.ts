import { NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"

export async function POST() {
  try {
    const db = getDbClient()
    console.log("=== CONFIGURANDO BANCO DE DADOS ===")

    // Verificar se a função update_updated_at_column existe
    const { data: functions, error: functionsError } = await db.rpc("version")

    if (functionsError) {
      console.log("Aviso: Não foi possível verificar funções do banco")
    }

    // Criar tabela surveys
    console.log("Criando tabela surveys...")
    const { error: surveysError } = await db.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS surveys (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          design_settings JSONB NOT NULL DEFAULT '{}',
          target_settings JSONB NOT NULL DEFAULT '{}',
          is_active BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID
        );
      `,
    })

    if (surveysError) {
      console.error("Erro ao criar tabela surveys:", surveysError)
    } else {
      console.log("Tabela surveys criada com sucesso")
    }

    // Criar tabela survey_elements
    console.log("Criando tabela survey_elements...")
    const { error: elementsError } = await db.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS survey_elements (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'textarea', 'multiple_choice', 'rating')),
          question TEXT NOT NULL,
          required BOOLEAN DEFAULT false,
          order_index INTEGER NOT NULL,
          config JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (elementsError) {
      console.error("Erro ao criar tabela survey_elements:", elementsError)
    } else {
      console.log("Tabela survey_elements criada com sucesso")
    }

    // Criar tabela survey_page_rules
    console.log("Criando tabela survey_page_rules...")
    const { error: rulesError } = await db.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS survey_page_rules (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
          rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('include', 'exclude')),
          pattern TEXT NOT NULL,
          is_regex BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (rulesError) {
      console.error("Erro ao criar tabela survey_page_rules:", rulesError)
    } else {
      console.log("Tabela survey_page_rules criada com sucesso")
    }

    // Verificar se as tabelas foram criadas
    const { data: tablesCheck, error: checkError } = await db
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["surveys", "survey_elements", "survey_page_rules"])

    if (checkError) {
      console.log("Não foi possível verificar tabelas, mas continuando...")
    }

    return NextResponse.json({
      success: true,
      message: "Banco de dados configurado com sucesso!",
      tables: tablesCheck || [],
    })
  } catch (error) {
    console.error("Erro ao configurar banco:", error)
    return NextResponse.json(
      {
        error: "Erro ao configurar banco de dados",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
