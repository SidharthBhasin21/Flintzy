import { cn } from '@/lib/utils'

/** Ember tile with a four-point spark: the "flint" in Flintzy. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('size-6', className)}>
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <path
        d="M16 6.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z"
        fill="#fff"
        transform="translate(0 2)"
      />
      <circle cx="23" cy="9" r="1.6" fill="#fff" opacity="0.85" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-[17px] leading-none font-bold tracking-[-0.035em]">Flintzy</span>
    </span>
  )
}
