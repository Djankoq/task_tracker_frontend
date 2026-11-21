import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDemoUsers } from '../../app/DemoContext'
import { demoProjects, demoTasks, priorityLabels, statusLabels } from '../../mocks/data'
import { Badge, Icon, Input, Table, type Column } from '../../components/ui'
import type { Task } from '../../types'
import styles from '../Pages.module.css'

export function Tasks() {
  const { users } = useDemoUsers()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const projectId = searchParams.get('project_id') || 'all'
  const rows = demoTasks.filter((task) => task.title.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru')) && (projectId === 'all' || String(task.project_id) === projectId) && (status === 'all' || task.status === status))
  const columns: Column<Task>[] = [
    { key: 'title', header: 'Задача', render: (task) => <span className={styles.personName}>{task.title}</span> },
    { key: 'assignee', header: 'Исполнитель', render: (task) => users.find((user) => user.user_id === task.assignee_id)?.display_name || `#${task.assignee_id}` },
    { key: 'status', header: 'Статус', render: (task) => <Badge tone={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'purple' : task.status === 'in_review' ? 'amber' : 'neutral'}>{statusLabels[task.status]}</Badge> },
    { key: 'priority', header: 'Приоритет', render: (task) => <Badge tone={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'neutral'}>{priorityLabels[task.priority]}</Badge> },
    { key: 'due', header: 'Срок', render: (task) => <time dateTime={task.due_at}>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Istanbul' }).format(new Date(task.due_at))}</time> },
  ]
  return (
    <>
      <div className={styles.heading}><div><p className={styles.eyebrow}>РАБОТА КОМАНДЫ</p><h1>Задачи</h1><p className={styles.subtitle}>Понятные приоритеты и следующий шаг для каждого.</p></div></div>
      <section className={styles.panel} aria-labelledby="tasks-title"><div className={styles.panelHeader}><h2 id="tasks-title">Список задач</h2><Badge>Демоданные</Badge></div>
        <div className={styles.toolbar}><Input className={styles.search} label="Поиск задач" type="search" placeholder="Название задачи" value={search} onChange={(event) => setSearch(event.target.value)} /><div className={styles.selectField}><label htmlFor="project-filter">Проект</label><select id="project-filter" className={styles.select} value={projectId} onChange={(event) => { const next = new URLSearchParams(searchParams); if (event.target.value === 'all') next.delete('project_id'); else next.set('project_id', event.target.value); setSearchParams(next) }}><option value="all">Все проекты</option>{demoProjects.map((project) => <option key={project.project_id} value={project.project_id}>{project.name}</option>)}</select></div><div className={styles.selectField}><label htmlFor="status-filter">Статус</label><select id="status-filter" className={styles.select} value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Все статусы</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
        <Table columns={columns} rows={rows} rowKey={(task) => task.task_id} caption="Задачи команды" emptyMessage="Задачи не найдены. Попробуйте изменить фильтры." /><div className={styles.tableFooter} role="status">Найдено задач: {rows.length} · Демонстрационные данные</div>
      </section>
      <aside className={styles.notice}><Icon name="info" /><p>Заготовка раздела. Поиск и фильтры работают на демоданных. Загрузка, создание и редактирование задач через API будут добавлены на следующем этапе.</p></aside>
    </>
  )
}
