import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('size-6', className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M17.6 6 9 18h6.2L13.8 26 23 13.4h-6.3L17.6 6Z" className="fill-primary-ink" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">Flintzy</span>
    </span>
  )
}
