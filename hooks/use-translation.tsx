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

// Load all translations
async function loadTranslations() {
  try {
    // English
    translations.en.common = (await import("@/locales/en/common.json")).default
    translations.en.projects = (await import("@/locales/en/projects.json")).default
    translations.en.surveys = (await import("@/locales/en/surveys.json")).default

    // Portuguese
    translations["pt-br"].common = (await import("@/locales/pt-br/common.json")).default
    translations["pt-br"].projects = (await import("@/locales/pt-br/projects.json")).default
    translations["pt-br"].surveys = (await import("@/locales/pt-br/surveys.json")).default

    // Spanish
    translations.es.common = (await import("@/locales/es/common.json")).default
    translations.es.projects = (await import("@/locales/es/projects.json")).default
    translations.es.surveys = (await import("@/locales/es/surveys.json")).default
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
