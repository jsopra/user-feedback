import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "newest"
    // const userId = searchParams.get("userId")

    // if (!userId) {
    //   return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    // }

    let query = supabase.from("projects").select(`
        id,
        name,
        description,
        base_domain,
        created_by,
        created_at,
        updated_at
      `)
    // .eq("created_by", userId)

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,base_domain.ilike.%${search}%`)
    }

    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "name":
        query = query.order("name", { ascending: true })
        break
      case "newest":
      default:
        query = query.order("created_at", { ascending: false })
        break
    }

    const { data: projects, error } = await query

    if (error) {
      console.error("Erro ao buscar projetos:", error)

      if (error.message.includes("relation") || error.message.includes("does not exist")) {
        return NextResponse.json({ needsSetup: true, projects: [] }, { status: 500 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const projectsWithCounts = await Promise.all(
      (projects || []).map(async (project) => {
        const { count } = await supabase
          .from("surveys")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)

        return {
          ...project,
          survey_count: count || 0,
        }
      }),
    )

    return NextResponse.json({ projects: projectsWithCounts })
  } catch (error) {
    console.error("Erro na API de projetos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { name, description, base_domain, created_by } = body

    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: "Nome deve ter entre 2 e 100 caracteres" }, { status: 400 })
    }

    if (!base_domain || base_domain.trim().length < 3) {
      return NextResponse.json({ error: "Domínio base é obrigatório" }, { status: 400 })
    }

    if (!created_by) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: "Descrição deve ter no máximo 500 caracteres" }, { status: 400 })
    }

    let cleanDomain = base_domain.trim()
    cleanDomain = cleanDomain.replace(/^https?:\/\//, "")
    cleanDomain = cleanDomain.replace(/\/$/, "")

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ error: "Formato de domínio inválido" }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null,
          base_domain: cleanDomain,
          created_by,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar projeto:", error)

      if (error.message.includes("relation") || error.message.includes("does not exist")) {
        return NextResponse.json({ needsSetup: true }, { status: 500 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project: { ...project, survey_count: 0 } })
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
