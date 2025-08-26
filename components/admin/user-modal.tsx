"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "member"
  created_at: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  user?: User | null
}

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member" as "admin" | "member",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "member",
      })
    }
    setError("")
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("sessionToken")
      if (!token) {
        setError("Sessão expirada. Faça login novamente.")
        return
      }

      const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users"
      const method = user ? "PUT" : "POST"

      const body: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }

      // Incluir senha apenas se for novo usuário ou se foi preenchida
      if (!user || formData.password) {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSave()
      } else {
        const { error } = await response.json()
        setError(error || "Erro ao salvar usuário")
      }
    } catch (error) {
      setError("Erro ao salvar usuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">{user ? "Nova Senha (deixe em branco para manter)" : "Senha"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
            />
          </div>

          <div>
            <Label htmlFor="role">Função</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "member") => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
