"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/database"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há sessão salva
    const sessionToken = localStorage.getItem("sessionToken")
    if (sessionToken) {
      validateStoredSession(sessionToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateStoredSession = async (sessionToken: string) => {
    try {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      })

      if (response.ok) {
        const { user } = await response.json()
        setUser(user)
      } else {
        localStorage.removeItem("sessionToken")
      }
    } catch (error) {
      localStorage.removeItem("sessionToken")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const { error } = await response.json()
      throw new Error(error)
    }

    const { user, sessionToken } = await response.json()
    localStorage.setItem("sessionToken", sessionToken)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("sessionToken")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}
