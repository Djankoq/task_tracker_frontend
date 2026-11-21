import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/ui'
import { getApiErrorMessage } from '../../api/client'
import { useSession } from '../../contexts/SessionContext'
import { useNotifications } from '../../contexts/NotificationContext'
import styles from '../Pages.module.css'
export function Connection() {
  const { user, connect, disconnect } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const notify = useNotifications()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!token.trim()) { setError('Введите токен сеанса.'); return }
    setBusy(true)
    setError('')
    try {
      await connect(token.trim())
      setToken('')
      notify('success', 'Подключение к API установлено.')
      const from = typeof location.state?.from === 'string' ? location.state.from : '/'
      navigate(from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/connection') ? from : '/', { replace: true })
    } catch (cause) {
      const message = getApiErrorMessage(cause)
      setError(message)
      notify('error', message)
    } finally { setBusy(false) }
  }
  return <>
    <div className={styles.heading}><div><h1>Подключение к API</h1><p className={styles.subtitle}>Введите действующий Bearer-токен сеанса Task Tracker.</p></div></div>
    <section className={styles.panel + ' ' + styles.formPanel}>
      {user && <div className={styles.panelHeader}><span>Подключён: <strong>{user.display_name}</strong></span><Button variant="secondary" disabled={busy} onClick={disconnect}>Отключиться</Button></div>}
      <form className={styles.form} onSubmit={submit} noValidate>
        <Input label="Токен сеанса" name="token" type="password" required autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} error={error} disabled={busy} hint="Токен хранится только в этой вкладке (sessionStorage). Он не включён в исходный код." />
        <div className={styles.formActions}><Button type="submit" disabled={busy}>{busy ? 'Подключение…' : user ? 'Сменить сеанс' : 'Подключиться'}</Button></div>
      </form>
    </section>
    <aside className={styles.notice}>API не имеет маршрута входа по логину и паролю. Используйте токен действующего сеанса, выданный бэкендом. Для защиты проекта предусмотрен отдельный сценарий с временной демонстрационной базой — инструкция в README.</aside>
  </>
}
