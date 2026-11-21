import { useCallback, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '../../hooks/useQuery'
import { positiveId } from '../../utils/listParams'
import { ButtonLink, Loader } from '../ui'
import { ErrorState } from '../ui/ErrorState'
export function EditLoader<T>({ getById, backTo, children }: {
  getById: (id: number, signal?: AbortSignal) => Promise<T>
  backTo: string
  children: (item: T | undefined) => ReactNode
}) {
  const { id } = useParams()
  const recordId = positiveId(id)
  const load = useCallback((signal: AbortSignal) => getById(recordId!, signal), [getById, recordId])
  const query = useQuery(load, Boolean(recordId))
  if (id !== undefined && !recordId) return <><ErrorState message="Некорректный ID записи." /><ButtonLink to={backTo} variant="secondary">К списку</ButtonLink></>
  if (id === undefined) return children(undefined)
  if (query.loading) return <Loader />
  if (query.error) return <><ErrorState message={query.error} retry={query.refresh} /><ButtonLink to={backTo} variant="secondary">К списку</ButtonLink></>
  if (!query.data) return <Loader />
  return children(query.data)
}
