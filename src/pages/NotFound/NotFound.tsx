import { ButtonLink } from '../../components/ui'
import styles from '../Pages.module.css'

export function NotFound() {
  return <section className={styles.errorPage}><p className={styles.errorCode}>404</p><h1>Кажется, вы свернули не туда</h1><p>Этой страницы нет. Проверьте адрес или вернитесь в рабочее пространство.</p><ButtonLink to="/">На главную</ButtonLink></section>
}
