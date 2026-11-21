import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../../api/analytics'
import { tasksApi } from '../../api/tasks'
import { useSession } from '../../contexts/SessionContext'
import { useQuery } from '../../hooks/useQuery'
import { Badge, ButtonLink, Icon, Loader, Table, type Column, type IconName } from '../../components/ui'
import { ErrorState } from '../../components/ui/ErrorState'
import { statusLabels } from '../../types/labels'
import type { Task } from '../../types'
import common from '../Pages.module.css'
import styles from './Home.module.css'
const columns: Column<Task>[] = [
  { key: 'title', header: 'Задача', render: (task) => <Link to={'/tasks/' + task.task_id + '/edit'}>{task.title}</Link> },
  { key: 'project', header: 'Проект', render: (task) => '#' + task.project_id },
  { key: 'status', header: 'Статус', render: (task) => <Badge tone={task.status === 'done' ? 'green' : 'purple'}>{statusLabels[task.status]}</Badge> },
]
export function Home() {
  const { user } = useSession()
  const load = useCallback(async (signal: AbortSignal) => {
    const [summary, statuses, tasks] = await Promise.all([
      analyticsApi.summary(signal), analyticsApi.tasksByStatus(signal),
      tasksApi.getAll({ page: 1, per_page: 5, sort_by: 'task_id', sort_order: 'desc' }, signal),
    ])
    return { summary, statuses, tasks }
  }, [])
  const query = useQuery(load)
  const data = query.data
  const counts: { label: string; value: number; icon: IconName; to: string; color: string }[] = data ? [
    { label: 'Проекты', value: data.summary.total_projects, icon: 'folder', to: '/projects', color: 'purple' },
    { label: 'Всего задач', value: data.summary.total_tasks, icon: 'check', to: '/tasks', color: 'blue' },
    { label: 'В работе', value: data.statuses.find((item) => item.status === 'in_progress')?.task_count || 0, icon: 'clock', to: '/tasks?status=in_progress', color: 'amber' },
    { label: 'Завершено', value: data.statuses.find((item) => item.status === 'done')?.task_count || 0, icon: 'chart', to: '/tasks?status=done', color: 'teal' },
  ] : []
  return <>
    <div className={common.heading}><div><p className={common.eyebrow}>ВАШЕ РАБОЧЕЕ ПРОСТРАНСТВО</p><h1>Здравствуйте, {user?.display_name}.</h1><p className={common.subtitle}>Проекты, задачи и команда — в одном месте. Все показатели получены из API.</p></div></div>
    <section className={styles.hero} aria-label="Рабочее пространство">
      <div className={styles.heroContent}><span className={styles.heroTag}>Меньше хаоса. Больше результата.</span><h2>Большие идеи.<br />Понятные задачи.</h2><p>Распределяйте работу, следите за сроками<br />и двигайтесь к цели вместе.</p><ButtonLink to="/projects" variant="secondary"><Icon name="folder" size={17} />Открыть проекты</ButtonLink></div>
      <div className={styles.illustration} aria-hidden="true"><div className={styles.orbit} /><div className={styles.miniBoard}><div className={styles.boardTop}><span />Работа команды</div><div className={styles.boardRow}><b className={styles.done}>✓</b><span>Общая цель<small>Всё начинается с проекта</small></span></div><div className={styles.boardRow}><b className={styles.done}>✓</b><span>Понятные приоритеты<small>У каждой задачи свой срок</small></span></div><div className={styles.boardRow}><b className={styles.unchecked} /><span>Следующий шаг<small>Двигайтесь вперёд вместе</small></span></div></div></div>
    </section>
    {query.loading ? <Loader /> : query.error ? <ErrorState message={query.error} retry={query.refresh} /> : data && <>
      <section className={styles.stats} aria-label="Показатели API">{counts.map((stat) => <Link to={stat.to} key={stat.label} className={styles.stat}><div className={styles.statTop}><span>{stat.label}</span><span className={styles.statIcon + ' ' + styles[stat.color]}><Icon name={stat.icon} size={19} /></span></div><strong>{stat.value}</strong><p>Доступно для вашего сеанса</p></Link>)}</section>
      <section className={common.panel}><div className={common.panelHeader}><h2>Последние задачи</h2><Link to="/tasks">Все задачи</Link></div><Table columns={columns} rows={data.tasks.items} rowKey={(task) => task.task_id} caption="Последние задачи" emptyMessage="Задач пока нет. Создайте первую задачу в разделе «Задачи»." /></section>
    </>}
  </>
}
