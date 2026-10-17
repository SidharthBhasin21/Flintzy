import { useSearchParams } from 'react-router'
import { useLiveSetSearchParams } from '@/lib/useLiveSetSearchParams'

/**
 * Keeps an open panel (post details, composer) in the URL so it is linkable
 * and the browser/hardware back button closes it.
 */
export function useOverlayParam(name: string) {
  const [params] = useSearchParams()
  const setParams = useLiveSetSearchParams()
  const value = params.get(name)

  const open = (next: string) => {
    setParams(
      (current) => {
        const nextParams = new URLSearchParams(current)
        nextParams.set(name, next)
        return nextParams
      },
      // Opening pushes a history entry (so Back closes it); switching between
      // items while already open replaces it.
      { replace: value !== null },
    )
  }

  const close = () => {
    setParams(
      (current) => {
        const nextParams = new URLSearchParams(current)
        nextParams.delete(name)
        return nextParams
      },
      { replace: true },
    )
  }

  return { value, open, close }
}
