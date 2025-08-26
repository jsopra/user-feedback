import { NextResponse } from "next/server"

// Esta API não deveria existir em produção
// O banco deve ser configurado uma vez via script SQL
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Esta funcionalidade foi removida. Execute o script setup-complete-database.sql diretamente no banco de dados.",
      instruction: "Use o script scripts/setup-complete-database.sql para configurar o banco",
    },
    { status: 410 },
  ) // Gone
}
