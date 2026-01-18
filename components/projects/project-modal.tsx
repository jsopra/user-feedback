"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Globe, FileText, Type } from "lucide-react"
import type { Project } from "@/types/project"

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: Project) => void
  project?: Project | null
}

export default function ProjectModal({ isOpen, onClose, onSave, project }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_domain: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        base_domain: project.base_domain || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        base_domain: "",
      })
    }
    setErrors({})
  }, [project, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres"
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Nome deve ter no máximo 100 caracteres"
    }

    // Validar domínio
    if (!formData.base_domain.trim()) {
      newErrors.base_domain = "Domínio base é obrigatório"
    } else {
      const domain = formData.base_domain
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "")
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/

      if (domain.length < 3) {
        newErrors.base_domain = "Domínio deve ter pelo menos 3 caracteres"
      } else if (!domainRegex.test(domain)) {
        newErrors.base_domain = "Formato de domínio inválido"
      }
    }

    // Validar descrição (opcional)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Descrição deve ter no máximo 500 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const projectData: any = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        base_domain: formData.base_domain.trim(),
      }

      if (project?.id) {
        projectData.id = project.id
      }

      await onSave(projectData)
      onClose()
    } catch (error) {
      console.error("Erro ao salvar projeto:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formatDomainPreview = (domain: string) => {
    if (!domain) return ""
    const cleaned = domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
    return cleaned
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? "Editar Projeto" : "Criar Novo Projeto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Projeto */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              <Type className="h-4 w-4 mr-2" />
              Nome do Projeto *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Site Institucional, E-commerce, App Mobile"
              className={errors.name ? "border-red-500" : ""}
              maxLength={100}
            />
            {errors.name && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.name}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-gray-500">{formData.name.length}/100 caracteres</p>
          </div>

          {/* Domínio Base */}
          <div className="space-y-2">
            <Label htmlFor="base_domain" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Domínio Base *
            </Label>
            <Input
              id="base_domain"
              value={formData.base_domain}
              onChange={(e) => handleInputChange("base_domain", e.target.value)}
              placeholder="exemplo.com ou https://app.exemplo.com"
              className={errors.base_domain ? "border-red-500" : ""}
            />
            {errors.base_domain && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.base_domain}</AlertDescription>
              </Alert>
            )}
            {formData.base_domain && !errors.base_domain && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Preview:</strong> {formatDomainPreview(formData.base_domain)}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Aceita domínios como "exemplo.com" ou URLs completas como "https://app.exemplo.com"
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o objetivo deste projeto..."
              className={errors.description ? "border-red-500" : ""}
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.description}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-gray-500">{formData.description.length}/500 caracteres</p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : project ? (
                "Atualizar Projeto"
              ) : (
                "Criar Projeto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
