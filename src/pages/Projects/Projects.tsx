import { Link } from 'react-router-dom'
import { demoProjects, demoTasks } from '../../mocks/data'
import { Badge, Icon } from '../../components/ui'
import styles from '../Pages.module.css'

export function Projects() {
  return (
    <>
      <div className={styles.heading}><div><p className={styles.eyebrow}>РАБОЧЕЕ ПРОСТРАНСТВО</p><h1>Проекты</h1><p className={styles.subtitle}>У каждой большой цели есть своё место.</p></div><Badge>{demoProjects.length} проекта</Badge></div>
      <section className={styles.cards} aria-label="Примеры проектов">{demoProjects.map((project) => <article key={project.project_id} className={`${styles.panel} ${styles.projectCard}`}><Icon name="folder" size={27} style={{ color: 'var(--primary)' }} /><h2>{project.name}</h2><p>{project.description}</p><div className={styles.projectBottom}><span>Задач: {demoTasks.filter((task) => task.project_id === project.project_id).length}</span><Link to={`/tasks?project_id=${project.project_id}`}>Открыть задачи</Link></div></article>)}</section>
      <aside className={styles.notice}><Icon name="info" /><p>Заготовка раздела с демонстрационными проектами. Следующий этап — загрузка списка из API, создание и редактирование проектов.</p></aside>
    </>
  )
}
