"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt-br", name: "Português (BR)", flag: "🇧🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
] as const

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLocale(lang.code)
              setOpen(false)
            }}
            className={locale === lang.code ? "bg-gray-100" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
