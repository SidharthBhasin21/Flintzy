import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border px-1 font-mono text-[10.5px] font-medium leading-none',
        'border-current/20 text-current/70',
        className,
      )}
      {...props}
    />
  )
}
