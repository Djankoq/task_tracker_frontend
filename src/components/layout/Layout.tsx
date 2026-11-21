import { useEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Icon } from '../ui'
import { useSession } from '../../contexts/SessionContext'
import styles from './Layout.module.css'
export function Layout() {
  const { pathname } = useLocation()
  const { user } = useSession()
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
    const titles: Record<string, string> = {
      '/': 'Обзор', '/users': 'Пользователи', '/users/new': 'Новый пользователь',
      '/projects': 'Проекты', '/projects/new': 'Новый проект', '/tasks': 'Задачи',
      '/tasks/new': 'Новая задача', '/reports': 'Отчёты', '/connection': 'Подключение к API',
    }
    const title = titles[pathname] || (/^\/(users|projects|tasks)\/[^/]+\/edit$/.test(pathname) ? 'Редактирование' : 'Страница не найдена')
    document.title = title + ' | Task Tracker'
  }, [pathname])
  return <div className={styles.layout}>
    <a href="#main" className={styles.skip}>Перейти к содержимому</a><Header />
    <main ref={main} id="main" tabIndex={-1} className={styles.main}>
      {user && <div className={styles.demo}><Icon name="info" size={17} /><span><strong>Подключено к API.</strong> {user.display_name} · {user.is_admin ? 'Администратор' : 'Участник проектов'} · <Link to="/connection">Сменить сеанс</Link></span></div>}
      <Outlet />
    </main><Footer />
  </div>
}
