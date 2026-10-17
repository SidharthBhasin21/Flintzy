import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP)
gsap.defaults({ ease: 'power3.out', duration: 0.4 })

/*
 * Motion rules: transform and opacity only, short durations, and nothing at
 * all when the OS asks for reduced motion. Animation explains a change
 * (new list, new status); it never decorates.
 */

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Only the first screenful is staggered; anything below the fold appears at rest. */
const MAX_STAGGERED = 14

/**
 * Staggers `[data-enter]` children of `scope` in whenever `key` changes
 * (first load, a new filter, another calendar day).
 */
export function useStaggerIn(scope: RefObject<HTMLElement | null>, key: string, enabled = true) {
  useGSAP(
    () => {
      if (!enabled || prefersReducedMotion()) return
      const items = gsap.utils.toArray<HTMLElement>('[data-enter]', scope.current).slice(0, MAX_STAGGERED)
      if (!items.length) return
      gsap.from(items, {
        y: 10,
        autoAlpha: 0,
        duration: 0.45,
        stagger: 0.035,
        clearProps: 'transform,opacity,visibility',
      })
    },
    { scope, dependencies: [key, enabled], revertOnUpdate: true },
  )
}

export { gsap, useGSAP }
