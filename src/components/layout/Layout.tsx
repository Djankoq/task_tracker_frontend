import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Icon } from '../ui'
import styles from './Layout.module.css'

export function Layout() {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
    const titles: Record<string, string> = { '/': 'Обзор', '/users': 'Пользователи', '/users/new': 'Новый пользователь', '/projects': 'Проекты', '/tasks': 'Задачи', '/reports': 'Отчёты' }
    document.title = `${titles[pathname] || (/^\/users\/[^/]+\/edit$/.test(pathname) ? 'Редактирование пользователя' : 'Страница не найдена')} | Task Tracker`
  }, [pathname])

  return (
    <div className={styles.layout}>
      <a href="#main" className={styles.skip}>Перейти к содержимому</a>
      <Header />
      <main ref={main} id="main" tabIndex={-1} className={styles.main}>
        <div className={styles.demo}><Icon name="info" size={17} /><span><strong>Деморежим.</strong> Пример данных для знакомства с интерфейсом. Изменения пользователей хранятся до перезагрузки страницы.</span></div>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
