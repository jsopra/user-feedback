"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { Project } from "@/types/project"

interface EditProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (project: Project) => void
}

export default function EditProjectModal({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_domain: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Preencher formulário quando o projeto mudar
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        base_domain: project.base_domain || "",
      })
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !project?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.project)
      } else {
        setError(data.error || "Erro ao atualizar projeto")
      }
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err)
      setError("Erro ao atualizar projeto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Projeto *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Site Principal"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-domain">Domínio Base *</Label>
            <Input
              id="edit-domain"
              value={formData.base_domain}
              onChange={(e) => setFormData({ ...formData, base_domain: e.target.value })}
              placeholder="Ex: meusite.com"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">Domínio onde as surveys serão exibidas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição opcional do projeto..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
