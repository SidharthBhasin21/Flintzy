import type { Platform, PostStatus } from '@/features/posts/types'

export interface PlatformConfig {
  id: Platform
  label: string
  /** Maximum caption length, in user-perceived characters. */
  charLimit: number
  /** Platforms that cannot publish a text-only post. */
  requiresMedia: boolean
  handle: string
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  x: { id: 'x', label: 'X', charLimit: 280, requiresMedia: false, handle: '@halfmooncoffee' },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    charLimit: 2200,
    requiresMedia: true,
    handle: '@halfmoon.coffee',
  },
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    charLimit: 5000,
    requiresMedia: false,
    handle: 'Halfmoon Coffee',
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok',
    charLimit: 2200,
    requiresMedia: true,
    handle: '@halfmooncoffee',
  },
}

/** Display order everywhere platforms are listed. */
export const PLATFORM_ORDER: Platform[] = ['x', 'instagram', 'facebook', 'tiktok']

export const STATUS_ORDER: PostStatus[] = ['scheduled', 'published', 'failed']

export const STATUS_LABELS: Record<PostStatus, string> = {
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
}

export const WORKSPACE = {
  name: 'Halfmoon Coffee',
  user: { name: 'Sidharth Bhasin', initials: 'SB' },
}

/** Posts must be scheduled at least this far ahead. */
export const MIN_LEAD_MINUTES = 5

/** Sample media bundled with the app, offered in the composer. */
export const MEDIA_LIBRARY = [
  { url: '/media/pour-over.jpg', alt: 'Pour-over coffee brewing at the bar' },
  { url: '/media/beans.jpg', alt: 'Roasted coffee beans' },
  { url: '/media/latte.jpg', alt: 'Latte with rosetta art' },
  { url: '/media/cafe-table.jpg', alt: 'Two cups on a long café table' },
  { url: '/media/flat-white.jpg', alt: 'Flat white on a red background' },
  { url: '/media/strawberries.jpg', alt: 'Fresh strawberries' },
  { url: '/media/tea-press.jpg', alt: 'Tea brewing in a glass press' },
  { url: '/media/ginger-tea.jpg', alt: 'Ginger and lemon tea' },
  { url: '/media/laptop-espresso.jpg', alt: 'Laptop next to an espresso' },
  { url: '/media/laptop-desk.jpg', alt: 'Laptop on a wooden desk' },
  { url: '/media/shop-wall.jpg', alt: 'Shop wall with framed prints' },
  { url: '/media/street.jpg', alt: 'Brick-lined street near the roastery' },
] as const
