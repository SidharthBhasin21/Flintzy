import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const fieldClasses = cn(
  'w-full min-w-0 rounded-md border border-line-strong bg-surface text-sm text-ink',
  'placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150',
  'hover:border-ink-3/60 focus-visible:border-focus focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus/15',
  'aria-invalid:border-failed-dot aria-invalid:focus-visible:ring-failed-dot/15',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldClasses, 'h-8 px-2.5', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(fieldClasses, 'block resize-none px-3 py-2.5 leading-relaxed', className)}
      {...props}
    />
  )
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('text-[13px] font-medium text-ink', className)} {...props} />
}
