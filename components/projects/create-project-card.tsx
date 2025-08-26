"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CreateProjectCardProps {
  onCreate: () => void
}

export default function CreateProjectCard({ onCreate }: CreateProjectCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50"
      onClick={onCreate}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Criar Novo Projeto</h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Organize suas surveys por projeto para melhor gerenciamento
        </p>
        <Button
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            onCreate()
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </CardContent>
    </Card>
  )
}
