import type { PageResponse } from '../types'
// Traverse every page instead of silently truncating a select to its first 100 options.
export async function collectPages<T>(load: (page: number) => Promise<PageResponse<T>>, signal: AbortSignal) {
  const first = await load(1)
  const items = [...first.items]
  for (let page = 2; page <= first.total_pages; page++) {
    signal.throwIfAborted()
    items.push(...(await load(page)).items)
  }
  return items
}
