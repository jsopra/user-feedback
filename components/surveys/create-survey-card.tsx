"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Palette, Target } from "lucide-react"

interface CreateSurveyCardProps {
  onCreate: () => void
}

export default function CreateSurveyCard({ onCreate }: CreateSurveyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <Plus className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900">Criar Nova Survey</CardTitle>
        <p className="text-sm text-gray-600">Configure uma nova pesquisa de feedback</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="h-4 w-4 text-blue-500" />
            <span>Elementos personalizáveis</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Palette className="h-4 w-4 text-purple-500" />
            <span>Design customizável</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target className="h-4 w-4 text-green-500" />
            <span>Segmentação avançada</span>
          </div>
        </div>

        {/* Botão de Criação */}
        <Button onClick={onCreate} className="w-full bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Começar Agora
        </Button>
      </CardContent>
    </Card>
  )
}
