import { DropdownMenu as Menu } from 'radix-ui'
import { Check } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger
export const DropdownMenuRadioGroup = Menu.RadioGroup

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = 'start',
  ...props
}: ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 min-w-[180px] overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-pop',
          'origin-(--radix-dropdown-menu-content-transform-origin) data-[state=open]:animate-rise-in',
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  )
}

const itemClasses = cn(
  'relative flex h-8 cursor-default select-none items-center gap-2 rounded-md px-2 text-[13px] text-ink outline-none',
  'data-[highlighted]:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-45',
  '[&_svg]:size-4 [&_svg]:shrink-0',
)

export function DropdownMenuItem({
  className,
  destructive,
  ...props
}: ComponentProps<typeof Menu.Item> & { destructive?: boolean }) {
  return (
    <Menu.Item
      className={cn(
        itemClasses,
        '[&_svg]:text-ink-3',
        destructive && 'text-failed-ink data-[highlighted]:bg-failed-bg [&_svg]:text-failed-ink',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Menu.CheckboxItem>) {
  return (
    <Menu.CheckboxItem className={cn(itemClasses, 'pr-8', className)} {...props}>
      {children}
      <Menu.ItemIndicator className="absolute right-2 inline-flex">
        <Check className="text-ink" strokeWidth={2} />
      </Menu.ItemIndicator>
    </Menu.CheckboxItem>
  )
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem className={cn(itemClasses, 'pr-8', className)} {...props}>
      {children}
      <Menu.ItemIndicator className="absolute right-2 inline-flex">
        <Check className="text-ink" strokeWidth={2} />
      </Menu.ItemIndicator>
    </Menu.RadioItem>
  )
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof Menu.Separator>) {
  return <Menu.Separator className={cn('-mx-1 my-1 h-px bg-line', className)} {...props} />
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Menu.Label>) {
  return (
    <Menu.Label
      className={cn('px-2 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-ink-3', className)}
      {...props}
    />
  )
}
