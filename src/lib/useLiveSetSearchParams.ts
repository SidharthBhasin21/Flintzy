import { useSearchParams, type NavigateOptions } from 'react-router'

/**
 * Like `setSearchParams` with an updater, but the updater always receives the
 * live URL. React Router hands it the params from the last render, which can
 * be stale while a navigation is still in a transition (fast typing starves
 * it), so back-to-back updates would otherwise drop each other's changes.
 */
export function useLiveSetSearchParams() {
  const [, setSearchParams] = useSearchParams()
  return (update: (current: URLSearchParams) => URLSearchParams, options?: NavigateOptions) =>
    setSearchParams(() => update(new URLSearchParams(window.location.search)), options)
}
