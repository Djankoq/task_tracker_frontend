import { analyticsApi } from '../../api/analytics'
import { useQuery } from '../../hooks/useQuery'
import { Badge, Loader, Table, type Column } from '../../components/ui'
import { ErrorState } from '../../components/ui/ErrorState'
import { statusLabels } from '../../types/labels'
import type { RankedProject } from '../../types'
import styles from '../Pages.module.css'
import report from './Reports.module.css'
async function loadReport(signal: AbortSignal) {
  const [summary, statuses, ranked] = await Promise.all([
    analyticsApi.summary(signal), analyticsApi.tasksByStatus(signal), analyticsApi.topProjects(5, signal),
  ])
  return { summary, statuses, ranked }
}
const columns: Column<RankedProject>[] = [
  { key: 'name', header: 'Проект', render: (project) => project.name },
  { key: 'count', header: 'Задач', align: 'right', render: (project) => <Badge tone="purple">{project.task_count}</Badge> },
]
export function Reports() {
  const query = useQuery(loadReport)
  const data = query.data
  return <>
    <div className={styles.heading}><div><p className={styles.eyebrow}>ОБЩАЯ КАРТИНА</p><h1>Отчёты</h1><p className={styles.subtitle}>Статистика проектов, доступных вашему сеансу.</p></div></div>
    {query.loading ? <Loader /> : query.error ? <ErrorState message={query.error} retry={query.refresh} /> : data && <>
      <div className={styles.cards}>
        <section className={styles.panel}><div className={styles.panelHeader}><h2>Задачи по статусам</h2></div><div className={report.statuses}>{Object.entries(statusLabels).map(([status, label]) => {
          const count = data.statuses.find((item) => item.status === status)?.task_count || 0
          return <div key={status}><div className={report.label}><span>{label}</span><strong>{count}</strong></div><div className={report.track + ' ' + report[status]} role="meter" aria-label={label} aria-valuenow={count} aria-valuemin={0} aria-valuemax={Math.max(1, data.summary.total_tasks)} aria-valuetext={count + ' из ' + data.summary.total_tasks}><span style={{ width: (data.summary.total_tasks ? count / data.summary.total_tasks * 100 : 0) + '%' }} /></div></div>
        })}{data.summary.total_tasks === 0 && <p className={styles.muted}>Задач пока нет.</p>}</div></section>
        <section className={styles.panel}><div className={styles.panelHeader}><h2>Топ проектов по числу задач</h2></div><Table columns={columns} rows={data.ranked} rowKey={(project) => project.project_id} caption="Загрузка проектов" emptyMessage="Доступных проектов пока нет." /></section>
      </div>
      <div className={styles.notice}>Всего проектов: {data.summary.total_projects} · Задач: {data.summary.total_tasks} · В среднем на проект: {data.summary.avg_tasks_per_project === null ? 'нет данных' : data.summary.avg_tasks_per_project.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</div>
    </>}
  </>
}
