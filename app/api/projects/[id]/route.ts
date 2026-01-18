import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbClient()
    const { data: project, error } = await db
      .from("projects")
      .select(`
        id,
        name,
        description,
        base_domain,
        created_by,
        created_at,
        updated_at
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Erro ao buscar projeto:", error)

      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Buscar contagem de surveys
    const { count } = await db
      .from("surveys")
      .select("*", { count: "exact", head: true })
      .eq("project_id", project.id)

    return NextResponse.json({
      project: {
        ...project,
        survey_count: count || 0,
      },
    })
  } catch (error) {
    console.error("Erro na API de projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbClient()
    const projectId = params?.id

    if (!projectId || projectId === "undefined") {
      return NextResponse.json({ error: "Project ID é obrigatório" }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-fA-F-]{36}$/
    if (!uuidRegex.test(projectId)) {
      return NextResponse.json({ error: "Project ID inválido" }, { status: 400 })
    }
    const body = await request.json()
    const { name, description, base_domain } = body

    // Validações
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: "Nome deve ter entre 2 e 100 caracteres" }, { status: 400 })
    }

    if (!base_domain || base_domain.trim().length < 3) {
      return NextResponse.json({ error: "Domínio base é obrigatório" }, { status: 400 })
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: "Descrição deve ter no máximo 500 caracteres" }, { status: 400 })
    }

    // Limpar domínio
    let cleanDomain = base_domain.trim()
    cleanDomain = cleanDomain.replace(/^https?:\/\//, "")
    cleanDomain = cleanDomain.replace(/\/$/, "")

    // Validar formato de domínio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ error: "Formato de domínio inválido" }, { status: 400 })
    }

    const { data: project, error } = await db
      .from("projects")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        base_domain: cleanDomain,
      })
      .eq("id", projectId)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar projeto:", error)

      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Buscar contagem de surveys
    const { count } = await db
      .from("surveys")
      .select("*", { count: "exact", head: true })
      .eq("project_id", project.id)

    return NextResponse.json({
      project: {
        ...project,
        survey_count: count || 0,
      },
    })
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbClient()
    const projectId = params?.id

    if (!projectId || projectId === "undefined") {
      return NextResponse.json({ error: "Project ID é obrigatório" }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-fA-F-]{36}$/
    if (!uuidRegex.test(projectId)) {
      return NextResponse.json({ error: "Project ID inválido" }, { status: 400 })
    }

    const { data: existingProject, error: checkError } = await db
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single()

    if (checkError || !existingProject) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    // Excluir o projeto (surveys serão excluídas automaticamente por CASCADE)
    const { error } = await db.from("projects").delete().eq("id", projectId)

    if (error) {
      console.error("Erro ao excluir projeto:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Projeto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
