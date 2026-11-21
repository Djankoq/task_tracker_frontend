import { useCallback, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, getApiErrorMessage } from '../../api/client'
import { useNotifications } from '../../contexts/NotificationContext'
import { useQuery } from '../../hooks/useQuery'
import { Badge, Button, ButtonLink, Input, Loader, Table, type Column } from '../ui'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { ErrorState } from '../ui/ErrorState'
import { readListParams } from '../../utils/listParams'
import type { PageResponse } from '../../types'
import styles from '../../pages/Pages.module.css'
export interface ListFilter {
  name: string; label: string; type?: 'number'
  options?: { value: string; label: string }[]
}
interface Props<T> {
  title: string; subtitle: string; basePath: string; columns: Column<T>[]
  loadPage: (query: URLSearchParams, signal: AbortSignal) => Promise<PageResponse<T>>
  remove: (id: number) => Promise<void>
  rowId: (row: T) => number; rowName: (row: T) => string
  filters?: ListFilter[]; canCreate?: boolean; canDelete?: (row: T) => boolean
  sortFields: readonly string[]; defaultSort: string
}
function SearchForm({ value, onSearch }: { value: string; onSearch: (text: string) => void }) {
  const [text, setText] = useState(value)
  function submit(event: FormEvent) { event.preventDefault(); onSearch(text.trim()) }
  return <form className={styles.searchForm} onSubmit={submit}><Input label="Поиск" type="search" placeholder="Введите запрос" value={text} onChange={(event) => setText(event.target.value)} /><Button type="submit" variant="secondary">Найти</Button></form>
}
export function ResourceList<T>({ title, subtitle, basePath, columns, loadPage, remove, rowId, rowName, filters = [], canCreate = true, canDelete = () => true, sortFields, defaultSort }: Props<T>) {
  const [params, setParams] = useSearchParams()
  const queryString = params.toString()
  const pageParams = readListParams(params, sortFields, defaultSort)
  const load = useCallback((signal: AbortSignal) => loadPage(new URLSearchParams(queryString), signal), [loadPage, queryString])
  const query = useQuery(load)
  const notify = useNotifications()
  const [target, setTarget] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  function setField(name: string, value: string, resetPage = true) {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    if (resetPage) next.set('page', '1')
    setParams(next)
  }
  function sort(key: string) {
    const next = new URLSearchParams(params)
    next.set('sort_by', key)
    next.set('sort_order', pageParams.sort_by === key && pageParams.sort_order === 'asc' ? 'desc' : 'asc')
    next.set('page', '1')
    setParams(next)
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
      <div className={styles.toolbar}>
        <SearchForm key={params.get('search') || ''} value={params.get('search') || ''} onSearch={(value) => setField('search', value)} />
        {filters.map((filter) => <div className={styles.selectField} key={filter.name}>
          <label htmlFor={'filter-' + filter.name}>{filter.label}</label>
          {filter.options
            ? <select id={'filter-' + filter.name} className={styles.select} value={params.get(filter.name) || ''} onChange={(event) => setField(filter.name, event.target.value)}><option value="">Все</option>{filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            : <input id={'filter-' + filter.name} className={styles.filterInput} type="number" min="1" step="1" placeholder="ID" value={params.get(filter.name) || ''} onChange={(event) => setField(filter.name, event.target.value)} />}
        </div>)}
        <Button variant="secondary" onClick={() => setParams({})}>Сбросить</Button>
      </div>
      {query.loading ? <Loader /> : query.error ? <ErrorState message={query.error} retry={query.refresh} /> : query.data && <>
        <Table columns={allColumns} rows={query.data.items} rowKey={rowId} caption={title}
          sortBy={pageParams.sort_by} sortOrder={pageParams.sort_order} onSort={sort}
          emptyMessage="Записей не найдено. Измените фильтры или добавьте новую запись." />
        <div className={styles.pagination}>
          <span role="status">Найдено: {query.data.total} · Страница {query.data.page} из {Math.max(1, query.data.total_pages)}</span>
          <label>На странице <select aria-label="Записей на странице" className={styles.select} value={pageParams.per_page} onChange={(event) => setField('per_page', event.target.value)}>{[5, 10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          <div className={styles.rowActions}><Button variant="secondary" disabled={query.data.page <= 1} onClick={() => setField('page', String(query.data!.page - 1), false)}>Назад</Button><Button variant="secondary" disabled={query.data.page >= query.data.total_pages} onClick={() => setField('page', String(query.data!.page + 1), false)}>Вперёд</Button></div>
        </div>
      </>}
    </section>
    {target && <ConfirmDialog name={rowName(target)} busy={busy} error={deleteError} onCancel={() => { if (!busy) setTarget(null) }} onConfirm={() => void confirmDelete()} />}
  </>
}
