import { useSearchParams } from 'react-router'
import { EMPTY_FILTERS, parseFilters, writeFilters, type PostFilters } from '../utils/filters'

export function usePostFilters() {
  const [params, setParams] = useSearchParams()
  const filters = parseFilters(params)

  const setFilters = (patch: Partial<PostFilters>) => {
    setParams((current) => writeFilters(current, { ...parseFilters(current), ...patch }), {
      replace: true,
    })
  }

  const replaceFilters = (next: PostFilters) => {
    setParams((current) => writeFilters(current, next), { replace: true })
  }

  const clearFilters = () => replaceFilters(EMPTY_FILTERS)

  return { filters, setFilters, replaceFilters, clearFilters }
}
