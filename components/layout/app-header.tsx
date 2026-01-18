"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Home, MessageSquare, Settings, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import ChangePasswordModal from "./change-password-modal"
import { LanguageSelector } from "./language-selector"

interface AppHeaderProps {
  onHomeClick?: () => void
  showSurveysLink?: boolean
  showHomeLink?: boolean
  currentProject?: string
  onProjectClick?: () => void
}

export default function AppHeader({
  onHomeClick,
  showSurveysLink = true,
  showHomeLink = true,
  currentProject,
  onProjectClick,
}: AppHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const isAdmin = user?.role === "admin"

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick()
    } else {
      router.push("/")
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Navegação */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <button
                  onClick={handleHomeClick}
                  className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <MessageSquare className="h-8 w-8" />
                  <span>UserFeedback</span>
                </button>
              </div>

              {/* Navegação */}
              <nav className="hidden md:flex space-x-6">
                {showHomeLink && (
                  <Button variant="ghost" onClick={handleHomeClick} className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Projetos</span>
                  </Button>
                )}

                {/* Breadcrumb do projeto atual */}
                {currentProject && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>/</span>
                    {onProjectClick ? (
                      <button
                        onClick={onProjectClick}
                        className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {currentProject}
                      </button>
                    ) : (
                      <span className="font-medium text-gray-900">{currentProject}</span>
                    )}
                  </div>
                )}
              </nav>
            </div>

            {/* Menu do Usuário */}
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span
                        className="hidden sm:inline cursor-pointer hover:text-blue-600"
                        onClick={() => setShowChangePassword(true)}
                      >
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleHomeClick} className="cursor-pointer">
                      <Home className="h-4 w-4 mr-2" />
                      Meus Projetos
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => router.push("/admin/users")} className="cursor-pointer">
                        <Users className="h-4 w-4 mr-2" />
                        Gerenciar Usuários
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setShowChangePassword(true)} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? "Saindo..." : "Sair"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal de alterar senha */}
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </>
  )
}
