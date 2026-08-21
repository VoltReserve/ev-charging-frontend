import { format } from 'date-fns'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/src/lib/utils'

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled,
  calendarDisabled,
  ...calendarProps
}) {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          data-empty={!value}
          className={cn(
            'h-auto min-h-11 w-full justify-between rounded-xl border border-input bg-background px-4 py-2.5 text-left font-normal shadow-xs data-[empty=true]:text-muted-foreground',
            className,
          )}
        >
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
          <ChevronDownIcon className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          defaultMonth={value}
          disabled={calendarDisabled}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

export const toApiDate = (date) => format(date, 'yyyy-MM-dd')

export const startOfToday = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1)
