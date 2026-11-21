import type { Key, ReactNode } from 'react'
import styles from './Table.module.css'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right'
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => Key
  caption: string
  emptyMessage?: string
}

export function Table<T>({ columns, rows, rowKey, caption, emptyMessage = 'Записей пока нет.' }: TableProps<T>) {
  return (
    <div className={styles.scroll} role="region" aria-label={caption} tabIndex={0}>
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col" style={{ textAlign: column.align }}>{column.header}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => <tr key={rowKey(row)}>{columns.map((column) => <td key={column.key} style={{ textAlign: column.align }}>{column.render(row)}</td>)}</tr>)}
          {rows.length === 0 && <tr><td colSpan={columns.length} className={styles.empty}>{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
