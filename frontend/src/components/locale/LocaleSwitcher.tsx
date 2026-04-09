'use client'

import { Languages } from 'lucide-react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'

import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'

const locales = ['en', 'es'] as const
type Locale = (typeof locales)[number]

const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
}

export const LocaleSwitcher = () => {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Locale })
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages />
        <span>Language</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
          {locales.map(loc => (
            <DropdownMenuRadioItem key={loc} value={loc}>
              {localeLabels[loc]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
