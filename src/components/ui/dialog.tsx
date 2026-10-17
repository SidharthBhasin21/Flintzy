import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

function Overlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-40 bg-overlay data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
        className,
      )}
      {...props}
    />
  )
}

type SheetSide = 'right' | 'bottom' | 'full'

const sheetClasses: Record<SheetSide, string> = {
  // Docked panel on tablet/desktop, full screen on phones.
  right: cn(
    'inset-0 sm:inset-y-2 sm:right-2 sm:left-auto sm:w-[440px] sm:rounded-xl sm:border sm:border-line',
    'data-[state=open]:animate-up-in data-[state=closed]:animate-up-out',
    'sm:data-[state=open]:animate-sheet-in sm:data-[state=closed]:animate-sheet-out',
  ),
  bottom: cn(
    'inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl border-t border-line pb-[env(safe-area-inset-bottom)]',
    'data-[state=open]:animate-up-in data-[state=closed]:animate-up-out',
  ),
  full: 'inset-0 data-[state=open]:animate-up-in data-[state=closed]:animate-up-out',
}

interface SheetContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  side?: SheetSide
}

export function SheetContent({ side = 'right', className, children, ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden bg-surface shadow-sheet outline-none',
          sheetClasses[side],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2',
          'rounded-xl border border-line bg-surface p-5 shadow-pop outline-none',
          'data-[state=open]:animate-rise-in data-[state=closed]:animate-fade-out',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function SheetCloseButton({ className, label = 'Close', ...props }: ComponentProps<'button'> & { label?: string }) {
  return (
    <DialogPrimitive.Close
      aria-label={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-hover hover:text-ink',
        className,
      )}
      {...props}
    >
      <X className="size-4" strokeWidth={1.75} />
    </DialogPrimitive.Close>
  )
}
