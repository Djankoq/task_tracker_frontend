import { Link, NavLink } from 'react-router-dom'
import { Icon, type IconName } from '../ui'
import { useSession } from '../../contexts/SessionContext'
import styles from './Layout.module.css'
const links: { to: string; label: string; icon: IconName; admin?: boolean }[] = [
  { to: '/', label: 'Обзор', icon: 'grid' },
  { to: '/projects', label: 'Проекты', icon: 'folder' },
  { to: '/tasks', label: 'Задачи', icon: 'check' },
  { to: '/users', label: 'Пользователи', icon: 'users', admin: true },
  { to: '/reports', label: 'Отчёты', icon: 'chart' },
  { to: '/connection', label: 'Сеанс', icon: 'code' },
]
export function Header() {
  const { user } = useSession()
  return <header className={styles.header}><div className={styles.headerInner}>
    <Link to="/" className={styles.brand} aria-label="Task Tracker — главная"><span className={styles.logo}><Icon name="check" size={21} /></span>task<span className={styles.brandLight}>tracker</span></Link>
    <nav className={styles.nav} aria-label="Основная навигация">{links.filter((link) => !link.admin || user?.is_admin).map(({ to, label, icon }) =>
      <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => styles.navLink + ' ' + (isActive ? styles.active : '')}><Icon name={icon} size={17} />{label}</NavLink>)}</nav>
  </div></header>
}
