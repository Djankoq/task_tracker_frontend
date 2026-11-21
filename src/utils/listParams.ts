import type { ListParams } from '../types'
export function positiveId(value: string | null | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}
export function readListParams<T extends string>(query: URLSearchParams, sorts: readonly T[], fallback: T): ListParams & { sort_by: T } {
  const selected = query.get('sort_by')
  const perPage = Number(query.get('per_page') || 10)
  return {
    page: positiveId(query.get('page')) || 1,
    per_page: [5, 10, 20, 50, 100].includes(perPage) ? perPage : 10,
    search: query.get('search')?.trim() || undefined,
    sort_by: sorts.includes(selected as T) ? selected as T : fallback,
    sort_order: query.get('sort_order') === 'desc' ? 'desc' : 'asc',
  }
}
export function booleanFilter(value: string | null) {
  return value === 'true' ? true : value === 'false' ? false : undefined
}
