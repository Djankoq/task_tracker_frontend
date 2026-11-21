import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { NotificationContext, type Notification, type NotificationType } from './NotificationContext'
import styles from './Notifications.module.css'
function Toast({ item, dismiss }: { item: Notification; dismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(item.id), item.type === 'error' ? 12_000 : 6_000)
    return () => window.clearTimeout(timer)
  }, [item.id, item.type, dismiss])
  return <div className={styles.toast + ' ' + styles[item.type]} role={item.type === 'error' ? 'alert' : 'status'}>
    <span>{item.message}</span>
    <button type="button" aria-label="Закрыть уведомление" onClick={() => dismiss(item.id)}>×</button>
  </div>
}
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([])
  const nextId = useRef(0)
  const notify = useCallback((type: NotificationType, message: string) => {
    const id = ++nextId.current
    setItems((current) => [...current.slice(-3), { id, type, message }])
  }, [])
  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), [])
  return <NotificationContext.Provider value={notify}>{children}
    <div className={styles.notifications} aria-label="Уведомления">{items.map((item) => <Toast key={item.id} item={item} dismiss={dismiss} />)}</div>
  </NotificationContext.Provider>
}
