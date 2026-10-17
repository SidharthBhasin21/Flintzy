import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Label + control + hint/error, with the error wired up for screen readers.
 * Pass `group` when the control is a set of buttons rather than one input.
 */
export function Field({
  id,
  label,
  htmlFor,
  hint,
  error,
  aside,
  group,
  children,
  className,
}: {
  id: string
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: string
  aside?: ReactNode
  group?: boolean
  children: ReactNode
  className?: string
}) {
  const labelId = `${id}-label`
  const labelClasses = 'text-[13px] font-medium text-ink'
  return (
    <div
      className={cn('min-w-0', className)}
      role={group ? 'group' : undefined}
      aria-labelledby={group ? labelId : undefined}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        {group ? (
          <span id={labelId} className={labelClasses}>
            {label}
          </span>
        ) : (
          <label id={labelId} htmlFor={htmlFor} className={labelClasses}>
            {label}
          </label>
        )}
        {aside && <span className="text-[12px] text-ink-3">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-start gap-1.5 text-[12.5px] leading-snug text-failed-ink"
        >
          <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" strokeWidth={2} />
          {error}
        </p>
      ) : (
        hint && <div className="mt-2 text-[12.5px] leading-snug text-ink-3">{hint}</div>
      )}
    </div>
  )
}
