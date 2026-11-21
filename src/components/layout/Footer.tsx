import styles from './Layout.module.css'

const year = new Date().getFullYear()

export function Footer() {
  return <footer className={styles.footer}><span>© {year} Task Tracker</span><span>React + TypeScript <span aria-hidden="true">·</span> Сделано для командной работы</span></footer>
}
