import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, getApiErrorMessage } from '../../api/client'
import { useNotifications } from '../../contexts/NotificationContext'
import { useQuery } from '../../hooks/useQuery'
import { Badge, Button, ButtonLink, Loader, Table, type Column } from '../ui'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { ErrorState } from '../ui/ErrorState'
import { EmptyState } from './EmptyState'
import { FiltersPanel, type ListFilter, type RangeFilter } from './FiltersPanel'
import { withFilters } from '../../utils/filterParams'
import { readListParams } from '../../utils/listParams'
import type { PageResponse } from '../../types'
import styles from '../../pages/Pages.module.css'
interface Props<T> {
  title: string; subtitle: string; basePath: string; columns: Column<T>[]
  loadPage: (query: URLSearchParams, signal: AbortSignal) => Promise<PageResponse<T>>
  remove: (id: number) => Promise<void>
  rowId: (row: T) => number; rowName: (row: T) => string
  filters?: ListFilter[]; ranges?: RangeFilter[]
  canCreate?: boolean; canDelete?: (row: T) => boolean
  sortFields: readonly string[]; defaultSort: string
}
export function ResourceList<T>({ title, subtitle, basePath, columns, loadPage, remove, rowId, rowName, filters = [], ranges = [], canCreate = true, canDelete = () => true, sortFields, defaultSort }: Props<T>) {
  const [params, setParams] = useSearchParams()
  const latestParams = useRef(params)
  useLayoutEffect(() => {
    latestParams.current = params
  }, [params])
  const queryString = params.toString()
  const pageParams = readListParams(params, sortFields, defaultSort)
  const load = useCallback((signal: AbortSignal) => loadPage(new URLSearchParams(queryString), signal), [loadPage, queryString])
  const query = useQuery(load)
  const notify = useNotifications()
  const [target, setTarget] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [resetVersion, setResetVersion] = useState(0)
  const filterNames = ['search', ...filters.map((filter) => filter.name), ...ranges.flatMap((range) => [range.lower, range.upper])]
  const filtered = filterNames.some((name) => Boolean(params.get(name)))

  function updateParams(update: (current: URLSearchParams) => URLSearchParams) {
    const current = latestParams.current
    const next = update(current)
    if (next.toString() === current.toString()) return
    // Compose consecutive actions even if the router hasn't rendered the first URL yet.
    latestParams.current = next
    setParams(next)
  }

  function changeFilters(changes: Record<string, string>) {
    if (changes.search === '') setResetVersion((version) => version + 1)
    updateParams((current) => withFilters(current, changes))
  }

  function resetFilters() {
    setResetVersion((version) => version + 1)
    updateParams((current) => {
      const next = withFilters(current, Object.fromEntries(filterNames.map((name) => [name, ''])))
      if (Number(current.get('page')) > 1) next.set('page', '1')
      return next
    })
  }

  function setField(name: string, value: string, resetPage = true) {
    updateParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(name, value)
      else next.delete(name)
      if (resetPage) next.set('page', '1')
      return next
    })
  }
  function sort(key: string) {
    updateParams((current) => {
      const { sort_by, sort_order } = readListParams(current, sortFields, defaultSort)
      return withFilters(current, {
        sort_by: key,
        sort_order: sort_by === key && sort_order === 'asc' ? 'desc' : 'asc',
      })
    })
  }
  async function confirmDelete() {
    if (!target || busy) return
    setBusy(true)
    setDeleteError('')
    try {
      await remove(rowId(target))
      setTarget(null)
      notify('success', 'Запись удалена.')
      if (query.data?.items.length === 1 && (pageParams.page || 1) > 1) setField('page', String(pageParams.page! - 1), false)
      else query.refresh()
    } catch (cause) {
      const message = getApiErrorMessage(cause)
      setDeleteError(message)
      if (!(cause instanceof ApiError && cause.status === 401)) notify('error', message)
    } finally { setBusy(false) }
  }
  const allColumns: Column<T>[] = [...columns, {
    key: 'actions', header: 'Действия', align: 'right',
    render: (row) => <div className={styles.rowActions}>
      <Link to={basePath + '/' + rowId(row) + '/edit'} aria-label={'Редактировать: ' + rowName(row)}>Редактировать</Link>
      <button type="button" disabled={!canDelete(row)} className={styles.deleteButton}
        aria-label={'Удалить: ' + rowName(row)} onClick={() => { setTarget(row); setDeleteError('') }}>Удалить</button>
    </div>,
  }]
  return <>
    <div className={styles.heading}><div><h1>{title}</h1><p className={styles.subtitle}>{subtitle}</p></div>
      {canCreate && <ButtonLink to={basePath + '/new'}>Добавить</ButtonLink>}</div>
    <section className={styles.panel} aria-label={title}>
      <div className={styles.panelHeader}><h2>{title}</h2><Badge>{query.data ? query.data.total + ' записей' : 'API'}</Badge></div>
      <FiltersPanel params={params} filters={filters} ranges={ranges} resetVersion={resetVersion}
        onChange={changeFilters} onReset={resetFilters} />
      {query.loading ? <Loader /> : query.error ? <ErrorState message={query.error} retry={query.refresh} /> : query.data && <>
        {query.data.items.length > 0
          ? <Table columns={allColumns} rows={query.data.items} rowKey={rowId} caption={title}
              sortBy={pageParams.sort_by} sortOrder={pageParams.sort_order} onSort={sort} />
          : <EmptyState filtered={filtered} total={query.data.total} onReset={resetFilters} />}
        <div className={styles.pagination}>
          <span role="status">Найдено: {query.data.total} · Страница {query.data.page} из {Math.max(1, query.data.total_pages)}</span>
          <label>На странице <select aria-label="Записей на странице" className={styles.select} value={pageParams.per_page} onChange={(event) => setField('per_page', event.target.value)}>{[5, 10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          <div className={styles.rowActions}>
            <Button variant="secondary" disabled={query.data.page <= 1}
              onClick={() => setField('page', String(Math.min(query.data!.page - 1, Math.max(1, query.data!.total_pages))), false)}>Назад</Button>
            <Button variant="secondary" disabled={query.data.page >= query.data.total_pages}
              onClick={() => setField('page', String(query.data!.page + 1), false)}>Вперёд</Button>
          </div>
        </div>
      </>}
    </section>
    {target && <ConfirmDialog name={rowName(target)} busy={busy} error={deleteError} onCancel={() => { if (!busy) setTarget(null) }} onConfirm={() => void confirmDelete()} />}
  </>
}
