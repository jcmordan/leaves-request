import { IconSearch, IconX } from '@tabler/icons-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface FilterSearchInputProps {
  value?: string | null
  onChange: (value: string) => void
  onSearch?: (explicitValue?: string) => void
  placeholder?: string
  className?: string
}

export const FilterSearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className,
}: FilterSearchInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value ?? '')
    }
  }

  const handleClear = () => {
    onChange('')
    onSearch?.('')
  }

  return (
    <div className={cn('flex items-center shadow-sm rounded-md overflow-hidden', className)}>
      <div className='relative flex-1 h-full'>
        <IconSearch
          size={16}
          className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none'
        />
        <Input
          placeholder={placeholder}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className='w-full h-full pl-9 pr-9 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 bg-background'
        />
        {value && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none'
            aria-label='Clear search'
          >
            <IconX size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
