'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Module } from '@/types/navigation'

interface ModuleNavBarProps extends React.ComponentProps<typeof Sidebar> {
  selectedModule: Module
  isOpen?: boolean
}

export const ModuleNavBar = ({ selectedModule, isOpen, ...props }: ModuleNavBarProps) => {
  const pathname = usePathname()

  const findActiveSubmodule = () => {
    const matchingSubmodules = selectedModule.subModules
      .map(submodule => ({
        submodule,
        isExactMatch: pathname === submodule.url,
        isPrefixMatch: pathname.startsWith(`${submodule.url}/`),
        urlLength: submodule.url.length,
      }))
      .filter(({ isExactMatch, isPrefixMatch }) => isExactMatch || isPrefixMatch)
      .sort((a, b) => {
        if (a.isExactMatch && !b.isExactMatch) {
          return -1
        }

        if (!a.isExactMatch && b.isExactMatch) {
          return 1
        }

        return b.urlLength - a.urlLength
      })

    return matchingSubmodules[0]?.submodule
  }

  const activeSubmodule = findActiveSubmodule()

  const isSubmoduleActive = (submoduleUrl: string) => {
    return activeSubmodule?.url === submoduleUrl
  }

  return (
    <Sidebar
      id='module-nav-bar'
      collapsible='offcanvas'
      isOpen={isOpen}
      offsetLeft='var(--sidebar-width-icon)'
      {...props}
      className='print:hidden'
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:p-1.5! h-10 flex items-center pt-0'
            >
              <Link href={selectedModule.url}>
                <div className='size-5'>{selectedModule.icon}</div>
                <span className='text-base font-semibold pt-2'>{selectedModule.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className='flex flex-col gap-2'>
            <SidebarMenu>
              {selectedModule.subModules.map(submodule => {
                const isActive = isSubmoduleActive(submodule.url)

                return (
                  <SidebarMenuItem key={submodule.id}>
                    <SidebarMenuButton tooltip={submodule.name} asChild>
                      <Link
                        href={submodule.url}
                        className={cn(
                          'relative block',
                          isActive &&
                            'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sidebar-primary after:content-[""]'
                        )}
                      >
                        {submodule.icon}
                        <span>{submodule.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
