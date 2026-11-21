import { demoProjects, demoTasks, statusLabels } from '../../mocks/data'
import { Badge, Icon, Table, type Column } from '../../components/ui'
import type { Project } from '../../types'
import styles from '../Pages.module.css'
import report from './Reports.module.css'

export function Reports() {
  const counts = Object.entries(statusLabels).map(([status, label]) => ({ status, label, count: demoTasks.filter((task) => task.status === status).length }))
  const ranked = [...demoProjects].sort((a, b) => demoTasks.filter((task) => task.project_id === b.project_id).length - demoTasks.filter((task) => task.project_id === a.project_id).length || a.project_id - b.project_id)
  const columns: Column<Project>[] = [
    { key: 'name', header: 'Проект', render: (project) => project.name },
    { key: 'tasks', header: 'Задач', align: 'right', render: (project) => <Badge tone="purple">{demoTasks.filter((task) => task.project_id === project.project_id).length}</Badge> },
  ]
  return (
    <>
      <div className={styles.heading}><div><p className={styles.eyebrow}>ОБЩАЯ КАРТИНА</p><h1>Отчёты</h1><p className={styles.subtitle}>Небольшой обзор того, как продвигается работа.</p></div><Badge>Демоданные</Badge></div>
      <div className={styles.cards}>
        <section className={styles.panel}><div className={styles.panelHeader}><h2>Задачи по статусам</h2><Icon name="chart" /></div><div className={report.statuses}>{counts.map(({ status, label, count }) => <div key={status}><div className={report.label}><span>{label}</span><strong>{count}</strong></div><div className={`${report.track} ${report[status]}`} role="meter" aria-label={label} aria-valuenow={count} aria-valuemin={0} aria-valuemax={demoTasks.length} aria-valuetext={`${count} из ${demoTasks.length} задач`}><span style={{ width: `${count / demoTasks.length * 100}%` }} /></div></div>)}</div></section>
        <section className={styles.panel}><div className={styles.panelHeader}><h2>Загрузка проектов</h2><Icon name="folder" /></div><Table columns={columns} rows={ranked} rowKey={(project) => project.project_id} caption="Проекты по количеству задач" /><div className={styles.tableFooter}>Всего проектов: {demoProjects.length} · Всего задач: {demoTasks.length}</div></section>
      </div>
      <aside className={styles.notice}><Icon name="info" /><p>Заготовка аналитики на демонстрационных данных. Подготовлен API-клиент для сводки, распределения задач по статусам и рейтинга проектов.</p></aside>
    </>
  )
}
