import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cachedBrowserClient: SupabaseClient | null = null
let cachedServiceRoleClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!cachedBrowserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    cachedBrowserClient = createClient(url, anonKey)
  }

  return cachedBrowserClient
}

export function getSupabaseServiceRoleClient(): SupabaseClient {
  if (!cachedServiceRoleClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
      throw new Error("Missing Supabase service role environment variables")
    }

    cachedServiceRoleClient = createClient(url, serviceRoleKey)
  }

  return cachedServiceRoleClient
}
