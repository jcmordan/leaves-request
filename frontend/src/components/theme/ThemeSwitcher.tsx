'use client'

import { PaletteIcon } from 'lucide-react'

import { useThemeContext } from '@/components/theme/ThemeProvider'
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { themes, type ThemeName } from '@/lib/themes'

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeContext()

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName as ThemeName)
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <PaletteIcon />
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          {themes.map(themeOption => (
            <DropdownMenuRadioItem
              key={themeOption.name}
              value={themeOption.name}
              className='gap-3'
            >
              <div className='flex items-center gap-2 flex-1'>
                <div className='flex gap-1'>
                  <div
                    className='size-3 rounded-full border border-border'
                    style={{ backgroundColor: themeOption.preview.primary }}
                  />
                  <div
                    className='size-3 rounded-full border border-border'
                    style={{ backgroundColor: themeOption.preview.secondary }}
                  />
                  <div
                    className='size-3 rounded-full border border-border'
                    style={{ backgroundColor: themeOption.preview.accent }}
                  />
                </div>
                <span>{themeOption.displayName}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
