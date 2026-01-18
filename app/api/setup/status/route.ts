import { NextResponse } from "next/server"
import { count } from "@/lib/db"

export async function GET() {
  try {
    const userCount = await count("users")
    const needsSetup = userCount === 0

    return NextResponse.json({ needsSetup, userCount })
  } catch (error) {
    return NextResponse.json({ error: "Falha ao verificar status de setup" }, { status: 500 })
  }
}
