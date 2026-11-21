import { Link } from 'react-router-dom'
import { useDemoUsers } from '../../app/DemoContext'
import { demoProjects, demoTasks, statusLabels } from '../../mocks/data'
import { Badge, ButtonLink, Icon, type IconName } from '../../components/ui'
import common from '../Pages.module.css'
import styles from './Home.module.css'

export function Home() {
  const { users } = useDemoUsers()
  const complete = demoTasks.filter((task) => task.status === 'done').length
  const stats: { label: string; value: number; detail: string; icon: IconName; to: string; color: string }[] = [
    { label: 'Проекты', value: demoProjects.length, detail: 'Пространства для ваших идей', icon: 'folder', to: '/projects', color: 'purple' },
    { label: 'Всего задач', value: demoTasks.length, detail: 'От идеи до результата', icon: 'check', to: '/tasks', color: 'blue' },
    { label: 'Пользователи', value: users.length, detail: 'Люди, с которыми всё получается', icon: 'users', to: '/users', color: 'teal' },
    { label: 'Завершено', value: complete, detail: `${Math.round(complete / demoTasks.length * 100)}% от всех задач`, icon: 'chart', to: '/reports', color: 'amber' },
  ]

  return (
    <>
      <div className={common.heading}><div><p className={common.eyebrow}>ВАШЕ РАБОЧЕЕ ПРОСТРАНСТВО</p><h1>Всё начинается с плана.</h1><p className={common.subtitle}>Добро пожаловать в Task Tracker. Проекты, задачи и команда — в одном месте.</p></div></div>
      <section className={styles.hero} aria-label="Знакомство с проектом">
        <div className={styles.heroContent}><span className={styles.heroTag}>Меньше хаоса. Больше результата.</span><h2>Большие идеи.<br />Понятные задачи.</h2><p>Соберите команду, распределите работу<br className={styles.desktopBreak} /> и двигайтесь к цели вместе.</p><ButtonLink to="/projects" variant="secondary"><Icon name="folder" size={17} />Открыть проекты</ButtonLink></div>
        <div className={styles.illustration} aria-hidden="true"><div className={styles.orbit} /><div className={styles.miniBoard}><div className={styles.boardTop}><span />План проекта<i>•••</i></div><div className={styles.boardRow}><b className={styles.done}>✓</b><span>Собрать команду<small>Отличное начало</small></span><em>Готово</em></div><div className={styles.boardRow}><b className={styles.done}>✓</b><span>Определить задачи<small>Всё по полочкам</small></span></div><div className={styles.boardRow}><b className={styles.unchecked} /><span>Создать что-то классное<small>Следующий шаг</small></span></div><div className={styles.progress}><span /></div><div className={styles.boardBottom}>План превращается в результат <span>2 / 3</span></div></div><div className={styles.floatingCheck}><Icon name="check" size={25} /></div></div>
      </section>
      <section className={styles.stats} aria-label="Демонстрационные показатели">
        {stats.map((stat) => <Link to={stat.to} key={stat.label} className={styles.stat}><div className={styles.statTop}><span>{stat.label}</span><span className={`${styles.statIcon} ${styles[stat.color]}`}><Icon name={stat.icon} size={19} /></span></div><strong>{stat.value}</strong><p>{stat.detail}</p></Link>)}
      </section>
      <div className={styles.lowerGrid}>
        <section className={common.panel}><div className={common.panelHeader}><h2>Задачи команды</h2><Link to="/tasks">Все задачи</Link></div><div className={styles.taskList}>{demoTasks.slice(0, 3).map((task) => <div className={styles.task} key={task.task_id}><span className={`${styles.taskCheck} ${task.status === 'done' ? styles.taskDone : ''}`}>{task.status === 'done' ? '✓' : ''}</span><div><span className={styles.taskTitle}>{task.title}</span><small>{demoProjects.find((project) => project.project_id === task.project_id)?.name}</small></div><Badge tone={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'purple' : 'neutral'}>{statusLabels[task.status]}</Badge></div>)}</div></section>
        <section className={`${common.panel} ${styles.team}`}><span className={styles.teamIcon}><Icon name="users" size={23} /></span><h2>Хорошая работа — командная.</h2><p>Познакомьтесь с участниками и подготовьте команду к новым проектам.</p><div className={styles.avatars} aria-label={`${users.length} пользователей`}>{users.slice(0, 4).map((user) => <span key={user.user_id} title={user.display_name}>{user.display_name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>)}</div><Link to="/users">Перейти к пользователям</Link></section>
      </div>
    </>
  )
}
