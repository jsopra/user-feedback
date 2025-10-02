import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabaseClient"

const CREATE_PROJECTS_TABLE_SQL = `-- Execute este SQL no Supabase SQL Editor:

-- Criar tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_domain VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Atualizar tabela surveys para incluir project_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surveys' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE surveys ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_surveys_project_id ON surveys(project_id);
  END IF;
END $$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir projeto de exemplo (opcional)
INSERT INTO projects (name, description, base_domain, created_by) 
SELECT 
  'Projeto Exemplo',
  'Projeto criado automaticamente para teste',
  'exemplo.com',
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);`

export async function POST() {
  try {
    const supabase = getSupabaseServiceRoleClient()
    // Verificar se a tabela projects já existe
    const { data: existingProjects, error: checkError } = await supabase.from("projects").select("id").limit(1)

    if (!checkError && existingProjects) {
      return NextResponse.json({
        success: true,
        message: "Tabela de projetos já existe e está funcionando!",
      })
    }

    // Se chegou aqui, a tabela não existe
    // Como não podemos executar DDL via Supabase client, retornamos o SQL para execução manual
    return NextResponse.json({
      success: false,
      requiresManualSetup: true,
      sql: CREATE_PROJECTS_TABLE_SQL,
      message: "Execute o SQL abaixo no Supabase SQL Editor para configurar as tabelas:",
    })
  } catch (error) {
    console.error("Erro no setup de projetos:", error)

    return NextResponse.json(
      {
        success: false,
        requiresManualSetup: true,
        sql: CREATE_PROJECTS_TABLE_SQL,
        error: "Tabela não encontrada. Execute o SQL manualmente no Supabase SQL Editor.",
      },
      { status: 500 },
    )
  }
}
