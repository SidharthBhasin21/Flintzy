import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Character count as a person perceives it (emoji and accented letters count once). */
const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

export function countCharacters(text: string): number {
  if (!segmenter) return [...text].length
  let count = 0
  for (const _ of segmenter.segment(text)) count++
  return count
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

const numberFormat = new Intl.NumberFormat()
export const formatNumber = (n: number) => numberFormat.format(n)
