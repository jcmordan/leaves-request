'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { IconLogout, IconSettings } from '@tabler/icons-react'
import Link from 'next/link'
import { ComponentProps, useEffect, useMemo, useState } from 'react'
import InitialsAvatar from 'react-initials-avatar'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthContext } from '@/contexts/AuthProvider'
import { useNavigation } from '@/contexts/NavigationContext'

export const AppSidebar = ({ ...props }: ComponentProps<typeof Sidebar>) => {
  const { modules, selectedModule, setSelectedModule } = useNavigation()
  const { tenant, switchedTenant, hasSwitchedTenant } = useAuthContext()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleModuleClick = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (module) {
      setSelectedModule(module)
    }
  }

  const contentModules = modules.filter(module => module.location !== 'footer')
  const footerModules = modules.filter(module => module.location === 'footer')

  const logoUrl = useMemo(() => {
    const logo = hasSwitchedTenant ? switchedTenant?.logoUrl : tenant.logoUrl

    if (!logo) {
      return undefined
    }

    return logo
  }, [hasSwitchedTenant, switchedTenant?.logoUrl, tenant.logoUrl])

  return (
    <Sidebar
      id='app-sidebar'
      collapsible='icon'
      isOpen={false}
      {...props}
      className='h-full print:hidden'
    >
      <SidebarHeader className='h-16 flex items-center justify-center gap-2'>
        <Avatar>
          <AvatarFallback>
            <InitialsAvatar name={switchedTenant?.name ?? tenant.name} />
          </AvatarFallback>
          <AvatarImage src={logoUrl} />
        </Avatar>
      </SidebarHeader>
      <SidebarContent className='flex flex-col h-full'>
        <SidebarGroup>
          <SidebarMenu className='gap-2'>
            {contentModules.map(module => {
              const isActive = selectedModule?.id === module.id

              return (
                <SidebarMenuItem key={module.id}>
                  <SidebarMenuButton id='app-sidebar' tooltip={module.name} isActive={isActive}>
                    <Link href={module.url} onClick={() => handleModuleClick(module.id)}>
                      {module.icon}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {footerModules && isMounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' data-testid='settings-trigger'>
                <IconSettings className='size-[26px]' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='z-50 ml-6'
              style={{ minWidth: 'fit-content', width: 'auto' }}
            >
              {footerModules.map(module => (
                <DropdownMenuItem
                  key={module.id}
                  className='whitespace-nowrap'
                  data-testid={`footer-module-${module.id}`}
                >
                  <Link
                    href={module.url}
                    onClick={() => handleModuleClick(module.id)}
                    className='flex items-center gap-2 w-full'
                  >
                    {module.icon}
                    <span>{module.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className='whitespace-nowrap' data-testid='logout-button'>
                <Link href='#' onClick={() => undefined} className='flex items-center gap-2 w-full'>
                  <IconLogout />
                  <span>Logout</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
