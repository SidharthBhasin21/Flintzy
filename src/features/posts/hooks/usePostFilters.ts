import { useSearchParams } from 'react-router'
import { useLiveSetSearchParams } from '@/lib/useLiveSetSearchParams'
import { EMPTY_FILTERS, parseFilters, writeFilters, type PostFilters } from '../utils/filters'

export function usePostFilters() {
  const [params] = useSearchParams()
  const setParams = useLiveSetSearchParams()
  const filters = parseFilters(params)

  const options = { replace: true }

  const setFilters = (patch: Partial<PostFilters>) => {
    setParams((current) => writeFilters(current, { ...parseFilters(current), ...patch }), options)
  }

  const replaceFilters = (next: PostFilters) => {
    setParams((current) => writeFilters(current, next), options)
  }

  const clearFilters = () => replaceFilters(EMPTY_FILTERS)

  return { filters, setFilters, replaceFilters, clearFilters }
}
