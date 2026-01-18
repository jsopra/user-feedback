import { NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET() {
  try {
    // Add preferred_language to users table
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en'
    `)

    // Add language to surveys table  
    await db.query(`
      ALTER TABLE surveys 
      ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'en'
    `)

    return NextResponse.json({ 
      success: true, 
      message: "Language columns added successfully" 
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json({ 
      error: "Migration failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
