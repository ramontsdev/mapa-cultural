import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({
  className,
  value,
  onChange,
  ...props
}: React.ComponentProps<'textarea'>) {
  // Mesmo tratamento defensivo aplicado ao <Input>: evita o warning
  // "uncontrolled to controlled" quando o textarea é spread com
  // react-hook-form e `value` vem undefined no primeiro render.
  const isControlled = onChange !== undefined || value !== undefined
  const resolvedValue = isControlled && value === undefined ? '' : value

  return (
    <textarea
      data-slot="textarea"
      value={resolvedValue}
      onChange={onChange}
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
