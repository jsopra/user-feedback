import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== API STATS ===")
    console.log("Project ID:", params.id)

    const projectId = params.id

    const { data: allProjects, error: allProjectsError } = await supabase
      .from("projects")
      .select("id, name, created_by")
      .limit(10)

    console.log("Todos os projetos disponíveis:", allProjects)
    console.log("Erro ao buscar todos os projetos:", allProjectsError)

    // Verificar se o projeto existe
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single()

    console.log("Projeto encontrado:", project)
    console.log("Erro do projeto:", projectError)

    if (projectError || !project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    // Buscar estatísticas das surveys
    const { data: surveys, error: surveysError } = await supabase
      .from("surveys")
      .select("is_active")
      .eq("project_id", projectId)

    console.log("Surveys encontradas:", surveys)
    console.log("Erro das surveys:", surveysError)

    if (surveysError) {
      console.error("Erro ao buscar surveys:", surveysError)
      return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
    }

    const total = surveys?.length || 0
    const active = surveys?.filter((s) => s.is_active).length || 0
    const inactive = total - active

    console.log("Estatísticas:", { total, active, inactive })

    return NextResponse.json({
      stats: {
        total,
        active,
        inactive,
      },
    })
  } catch (error) {
    console.error("Erro na API de estatísticas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
