import { AlertDialog as AlertPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const AlertDialog = AlertPrimitive.Root
export const AlertDialogAction = AlertPrimitive.Action
export const AlertDialogCancel = AlertPrimitive.Cancel

export function AlertDialogContent({
  className,
  title,
  description,
  children,
  ...props
}: ComponentProps<typeof AlertPrimitive.Content> & { title: string; description: string }) {
  return (
    <AlertPrimitive.Portal>
      <AlertPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in" />
      <AlertPrimitive.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 -translate-y-1/2',
          'rounded-xl border border-line bg-surface p-5 shadow-pop outline-none data-[state=open]:animate-rise-in',
          className,
        )}
        {...props}
      >
        <AlertPrimitive.Title className="text-[15px] font-semibold tracking-tight">{title}</AlertPrimitive.Title>
        <AlertPrimitive.Description className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
          {description}
        </AlertPrimitive.Description>
        <div className="mt-5 flex justify-end gap-2">{children}</div>
      </AlertPrimitive.Content>
    </AlertPrimitive.Portal>
  )
}
