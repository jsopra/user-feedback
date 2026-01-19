"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Locale = "en" | "pt-br" | "es"

interface TranslationContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (namespace: string, key: string, params?: Record<string, string | number>) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const translations: Record<Locale, Record<string, any>> = {
  en: {},
  "pt-br": {},
  es: {},
}

let translationsLoaded = false

// Load all translations
async function loadTranslations() {
  if (translationsLoaded) return
  
  try {
    // English
    translations.en.common = (await import("@/locales/en/common.json")).default
    translations.en.projects = (await import("@/locales/en/projects.json")).default
    translations.en.surveys = (await import("@/locales/en/surveys.json")).default
    translations.en.auth = (await import("@/locales/en/auth.json")).default
    translations.en.users = (await import("@/locales/en/users.json")).default
    translations.en.setup = (await import("@/locales/en/setup.json")).default

    // Portuguese
    translations["pt-br"].common = (await import("@/locales/pt-br/common.json")).default
    translations["pt-br"].projects = (await import("@/locales/pt-br/projects.json")).default
    translations["pt-br"].surveys = (await import("@/locales/pt-br/surveys.json")).default
    translations["pt-br"].auth = (await import("@/locales/pt-br/auth.json")).default
    translations["pt-br"].users = (await import("@/locales/pt-br/users.json")).default
    translations["pt-br"].setup = (await import("@/locales/pt-br/setup.json")).default

    // Spanish
    translations.es.common = (await import("@/locales/es/common.json")).default
    translations.es.projects = (await import("@/locales/es/projects.json")).default
    translations.es.surveys = (await import("@/locales/es/surveys.json")).default
    translations.es.auth = (await import("@/locales/es/auth.json")).default
    translations.es.users = (await import("@/locales/es/users.json")).default
    translations.es.setup = (await import("@/locales/es/setup.json")).default
    
    translationsLoaded = true
  } catch (error) {
    console.error("Failed to load translations:", error)
  }
}

// Load translations immediately
loadTranslations()

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    // Load locale from localStorage
    const savedLocale = localStorage.getItem("locale") as Locale
    if (savedLocale && ["en", "pt-br", "es"].includes(savedLocale)) {
      setLocaleState(savedLocale)
    }

    // Listen for localeChange events from auth
    const handleLocaleChange = (event: Event) => {
      const customEvent = event as CustomEvent<Locale>
      if (customEvent.detail && ["en", "pt-br", "es"].includes(customEvent.detail)) {
        setLocaleState(customEvent.detail)
      }
    }

    window.addEventListener("localeChange", handleLocaleChange)
    return () => window.removeEventListener("localeChange", handleLocaleChange)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  const t = (namespace: string, key: string, params?: Record<string, string | number>): string => {
    try {
      const keys = key.split(".")
      let value: any = translations[locale]?.[namespace]

      for (const k of keys) {
        if (value && typeof value === "object") {
          value = value[k]
        } else {
          value = undefined
          break
        }
      }

      // Fallback to English if translation not found
      if (!value) {
        let fallback: any = translations.en?.[namespace]
        for (const k of keys) {
          if (fallback && typeof fallback === "object") {
            fallback = fallback[k]
          } else {
            fallback = undefined
            break
          }
        }
        value = fallback
      }

      // If still no translation, return the key
      if (typeof value !== "string") {
        return key
      }

      // Replace parameters {{param}}
      if (params) {
        Object.entries(params).forEach(([param, val]) => {
          value = value.replace(new RegExp(`{{${param}}}`, "g"), String(val))
        })
      }

      return value
    } catch (error) {
      console.error("Translation error:", error)
      return key
    }
  }

  return <TranslationContext.Provider value={{ locale, setLocale, t }}>{children}</TranslationContext.Provider>
}

export function useTranslation(namespace: string = "common") {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider")
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    return context.t(namespace, key, params)
  }

  return {
    locale: context.locale,
    setLocale: context.setLocale,
    t,
  }
}

// Helper para usar tradução com locale específico (útil para surveys)
export function useSurveyTranslation(namespace: string = "common", forceLocale?: Locale) {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useSurveyTranslation must be used within TranslationProvider")
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!forceLocale) {
      return context.t(namespace, key, params)
    }

    // Usa o locale forçado ao invés do contexto
    const locale = forceLocale
    const namespaceData = translations[locale]?.[namespace]
    if (!namespaceData) return key

    const keys = key.split(".")
    let value: any = namespaceData
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    if (typeof value !== "string") return key

    // Replace parameters {{param}}
    if (params) {
      Object.entries(params).forEach(([param, val]) => {
        value = value.replace(new RegExp(`{{${param}}}`, "g"), String(val))
      })
    }

    return value
  }

  return {
    locale: forceLocale || context.locale,
    setLocale: context.setLocale,
    t,
  }
}
