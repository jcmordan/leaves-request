'use client'

import { camelCase } from 'lodash'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Card, CardAction, CardContent, CardHeader } from '../ui/card'

export type TabGroupItem = {
  label: string
  component: React.ReactNode
  action?: React.ReactNode
}

type Props = {
  tabs: Array<TabGroupItem>
}

const TabGroup = ({ tabs }: Props) => {
  const [mounted, setMounted] = useState(false)
  const firstTabValue = tabs.length > 0 ? camelCase(tabs[0].label) : ''
  const [activeValue, setActiveValue] = useState(firstTabValue)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeTab = tabs.find(tab => camelCase(tab.label) === activeValue)

  if (!mounted) {
    return <div className='flex flex-col gap-2'></div>
  }

  return (
    <Tabs value={activeValue} onValueChange={setActiveValue}>
      <Card>
        <CardHeader>
          <TabsList>
            {tabs.map(({ label }) => {
              const value = camelCase(label)

              return (
                <TabsTrigger key={value} value={value}>
                  {label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          <CardAction>{activeTab?.action && activeTab.action}</CardAction>
        </CardHeader>
        <CardContent>
          {tabs.map(({ label, component }) => {
            const value = camelCase(label)

            return (
              <TabsContent key={value} value={value} className='mt-0'>
                {component}
              </TabsContent>
            )
          })}
        </CardContent>
      </Card>
    </Tabs>
  )
}

const TabActionButton = (props: { label: string; onClick: () => void }) => {
  return (
    <Button variant='outline' size='sm' className='mr-5' onClick={props.onClick}>
      {props.label}
    </Button>
  )
}

TabGroup.TabActionButton = TabActionButton

export default TabGroup
