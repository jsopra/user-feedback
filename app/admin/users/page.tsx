"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import AppHeader from "@/components/layout/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import UserModal from "@/components/admin/user-modal"

interface UserInterface {
  id: string
  email: string
  name: string
  role: "admin" | "member"
  created_at: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserInterface | null>(null)

  // Verificar se é admin
  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    if (user.role !== "admin") {
      router.push("/")
      return
    }
    loadUsers()
  }, [user, router])

  const loadUsers = async () => {
    try {
      const sessionToken = localStorage.getItem("sessionToken")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`
      }

      const response = await fetch("/api/admin/users", { headers })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setShowUserModal(true)
  }

  const handleEditUser = (user: UserInterface) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return

    try {
      const sessionToken = localStorage.getItem("sessionToken")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers,
      })
      if (response.ok) {
        loadUsers()
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
    }
  }

  const handleUserSaved = () => {
    setShowUserModal(false)
    setEditingUser(null)
    loadUsers()
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader showHomeLink={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
              <p className="text-gray-600 mt-2">Gerencie usuários e suas permissões no sistema</p>
            </div>
            <Button onClick={handleCreateUser} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Usuário</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {/* User icon component */}
              <span>Usuários do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado no sistema.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Administrador" : "Membro"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSave={handleUserSaved}
        user={editingUser}
      />
    </div>
  )
}
