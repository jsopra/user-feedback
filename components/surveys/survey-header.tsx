"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Eye, BarChart3, Edit3, Check, X } from "lucide-react"
import { useState } from "react"

interface SurveyHeaderProps {
  title: string
  onTitleChange: (title: string) => void
  onBack: () => void
  onSave?: () => void
  onPreview: () => void
  onOverview: () => void
  isSaving?: boolean
  showSave?: boolean
  subtitle?: string
}

export default function SurveyHeader({
  title,
  onTitleChange,
  onBack,
  onSave,
  onPreview,
  onOverview,
  isSaving = false,
  showSave = true,
  subtitle = "Criando nova survey",
}: SurveyHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(title)

  const handleSaveTitle = () => {
    onTitleChange(tempTitle)
    setIsEditingTitle(false)
  }

  const handleCancelEdit = () => {
    setTempTitle(title)
    setIsEditingTitle(false)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-xl font-bold"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSaveTitle()
                      if (e.key === "Escape") handleCancelEdit()
                    }}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveTitle}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingTitle(true)} className="p-1 h-6 w-6">
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onOverview}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            {showSave && onSave && (
              <Button size="sm" onClick={onSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
