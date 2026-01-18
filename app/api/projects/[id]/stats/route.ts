import { type NextRequest, NextResponse } from "next/server"
import { getDbServiceRoleClient } from "@/lib/dbClient"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbServiceRoleClient()
    console.log("=== API STATS ===")
    console.log("Project ID:", params?.id)

    const projectId = params?.id

    if (!projectId || projectId === "undefined") {
      return NextResponse.json({ error: "Project ID é obrigatório" }, { status: 400 })
    }

    // evitar erro de sintaxe de UUID
    const uuidRegex = /^[0-9a-fA-F-]{36}$/
    if (!uuidRegex.test(projectId)) {
      return NextResponse.json({ error: "Project ID inválido" }, { status: 400 })
    }

    const { data: allProjects, error: allProjectsError } = await db
      .from("projects")
      .select("id, name, created_by")
      .limit(10)

    if (allProjectsError) {
      console.error("Erro ao buscar todos os projetos:", allProjectsError)
    }

    // Verificar se o projeto existe
    const { data: project, error: projectError } = await db
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single()

    if (projectError) {
      console.error("Erro ao buscar projeto:", projectError)
    }

    if (projectError || !project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    // Buscar estatísticas das surveys
    const { data: surveys, error: surveysError } = await db
      .from("surveys")
      .select("is_active")
      .eq("project_id", projectId)

    if (surveysError) {
      console.error("Erro ao buscar surveys:", surveysError)
      return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
    }

    const total = surveys?.length || 0
    const active = surveys?.filter((s: any) => s.is_active).length || 0
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
