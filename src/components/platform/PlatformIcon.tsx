import { useId } from 'react'
import { PLATFORMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Platform } from '@/features/posts/types'
import { BRAND_PATHS } from './brandPaths'


interface PlatformIconProps {
  platform: Platform
  className?: string
  /** "brand" uses the platform's colours; "mono" inherits currentColor. */
  tone?: 'brand' | 'mono'
  title?: string
  /** Hide from assistive tech when a visible text label sits next to the icon. */
  decorative?: boolean
}

export function PlatformIcon({ platform, className, tone = 'brand', title, decorative }: PlatformIconProps) {
  const gradientId = useId()
  const label = title ?? PLATFORMS[platform].label

  let fill = 'currentColor'
  if (tone === 'brand') {
    if (platform === 'facebook') fill = '#0866FF'
    if (platform === 'instagram') fill = `url(#${CSS.escape(gradientId)})`
  }

  return (
    <svg
      viewBox="0 0 24 24"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn('size-4 shrink-0', tone === 'brand' && 'text-ink', className)}
    >
      {!decorative && <title>{label}</title>}
      {tone === 'brand' && platform === 'instagram' && (
        <defs>
          <radialGradient id={gradientId} cx="0.3" cy="1.07" r="1.2">
            <stop offset="0" stopColor="#FFD776" />
            <stop offset="0.25" stopColor="#F3A554" />
            <stop offset="0.45" stopColor="#F13F79" />
            <stop offset="0.8" stopColor="#C33CBE" />
            <stop offset="1" stopColor="#6A5BE0" />
          </radialGradient>
        </defs>
      )}
      <path d={BRAND_PATHS[platform]} fill={fill} />
    </svg>
  )
}

export function PlatformIconList({
  platforms,
  className,
  iconClassName,
}: {
  platforms: Platform[]
  className?: string
  iconClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {platforms.map((p) => (
        <PlatformIcon key={p} platform={p} className={iconClassName} />
      ))}
    </span>
  )
}
