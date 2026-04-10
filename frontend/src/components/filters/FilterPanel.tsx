import { IconFilter2, IconX } from '@tabler/icons-react'
import {
  Activity,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUrlPagination } from '@/hooks/useUrlPagination'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type FilterRegistration = {
  /** Human-readable label for the chip, e.g. "Patient: John Doe" */
  activeLabel: string
  onClear: () => void
  /** The actual input element to render inside the popover */
  input: React.ReactNode
}

type FilterPanelContextValue = {
  register: (id: string, reg: FilterRegistration | null) => void
}

const FilterPanelContext = createContext<FilterPanelContextValue | null>(null)

const useFilterPanelContext = () => {
  const ctx = useContext(FilterPanelContext)
  if (!ctx) {
    throw new Error('FilterItem must be used inside FilterPanel')
  }

  return ctx
}

// ---------------------------------------------------------------------------
// FilterPanel
// ---------------------------------------------------------------------------

type FilterPanelProps = {
  /**
   * FilterItem children — rendered here for registration (always in DOM),
   * their input elements are collected and shown inside the popover.
   */
  children?: React.ReactNode
  /**
   * An always-visible search input slot to display alongside the active chips
   * but excluded from the clearable chip state registry.
   */
  searchInput?: React.ReactNode
  className?: string
}

/**
 * Filter panel with a trigger button, popover for inputs, and an active-filter
 * chip status bar. Wrap each filter input in `<FilterItem>` and the panel
 * automatically handles chip display and count badge.
 *
 * Architecture: FilterItem components render in the main tree (always mounted)
 * to track active state. They pass their input node via context so FilterPanel
 * can render it inside the Popover.
 */
export const FilterPanel = ({ children, className, searchInput }: FilterPanelProps) => {
  const [registrations, setRegistrations] = useState<Map<string, FilterRegistration>>(new Map())
  const { clearFilters } = useUrlPagination()

  const register = useCallback((id: string, reg: FilterRegistration | null) => {
    setRegistrations(prev => {
      const next = new Map(prev)
      if (reg) {
        next.set(id, reg)
      } else {
        next.delete(id)
      }

      return next
    })
  }, [])

  const contextValue = useMemo(() => ({ register }), [register])

  const entries = useMemo(() => Array.from(registrations.entries()), [registrations])
  const chips = entries.filter(([, r]) => r.activeLabel)
  const count = chips.length

  return (
    <FilterPanelContext.Provider value={contextValue}>
      {/*
       * FilterItem children render here — invisible, always in the DOM.
       * They register themselves (chip label + input node) via context.
       */}
      <div className='hidden'>{children}</div>

      <div className={cn('flex flex-row items-start justify-between gap-4 w-full', className)}>
        {/* Left side: Search Bar + Active filter chips */}
        <div className='flex flex-row flex-wrap items-center gap-2 flex-1'>
          {searchInput}
          {chips.map(([id, reg]) => (
            <span
              key={id}
              className='inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary'
            >
              {reg.activeLabel}
              <button
                type='button'
                onClick={reg.onClear}
                className='ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors'
                aria-label={`Remove ${reg.activeLabel} filter`}
              >
                <IconX size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>

        {/* Right side: Clear all + Filter button */}
        <div className='flex flex-row items-center gap-4 shrink-0'>
          {count > 0 && (
            <button
              type='button'
              onClick={() => clearFilters(entries.map(([id]) => id))}
              className='text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline'
            >
              Clear all
            </button>
          )}

          {/* Trigger button */}
          <Activity mode={children ? 'visible' : 'hidden'}>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant='outline' size='sm' className='relative gap-2'>
                    <IconFilter2 size={15} />
                    {count > 0 && (
                      <Badge className='absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0 text-[10px]'>
                        {count}
                      </Badge>
                    )}
                  </Button>
                }
              />
              <PopoverContent align='end' className='w-auto min-w-[280px] p-4'>
                <div className='flex flex-col gap-3'>
                  <p className='text-sm font-medium text-muted-foreground'>Filter by</p>
                  {/* Render the collected input nodes from all registered FilterItems */}
                  {entries.map(([id, reg]) => (
                    <div key={id}>{reg.input}</div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </Activity>
        </div>
      </div>
    </FilterPanelContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// FilterItem
// ---------------------------------------------------------------------------

type FilterItemProps = {
  /** Whether this filter currently has a value applied */
  active: boolean
  /**
   * Label shown in the chip when active, e.g. "Status: Pending".
   * Pass an empty string (or leave undefined when active=false) to suppress the chip.
   */
  activeLabel: string
  /** Clears this individual filter */
  onClear: () => void
  /**
   * The actual filter input (Combobox, Select, etc.).
   * This is rendered inside the FilterPanel popover — not here.
   */
  children: React.ReactNode
}

/**
 * Registers a filter input with the parent FilterPanel.
 * - Always renders in the main tree (never inside the popover) so registration
 *   effects run immediately on mount, regardless of popover open state.
 * - Passes `children` (the input node) to FilterPanel via context so it can
 *   render the inputs inside the popover.
 * - When `active` is true, a dismissible chip appears in the panel status bar.
 */
export const FilterItem = ({ active, activeLabel, onClear, children }: FilterItemProps) => {
  const { register } = useFilterPanelContext()
  const id = useId()

  // Keep onClear ref stable to avoid unnecessary re-registrations
  const onClearRef = useRef(onClear)
  useEffect(() => {
    onClearRef.current = onClear
  })

  useEffect(() => {
    register(id, {
      activeLabel: active ? activeLabel : '',
      onClear: () => onClearRef.current(),
      input: children,
    })
    // Re-register when active state, label OR input children change
  }, [active, activeLabel, id, register, children])

  // Unregister on unmount
  useEffect(() => {
    return () => register(id, null)
  }, [id, register])

  // Render nothing here — FilterPanel renders the input inside the popover
  return null
}
