import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiClient, ApiError, getApiErrorMessage, getSessionToken, setSessionToken } from '../api/client'
import { usersApi } from '../api/users'
import { useNotifications } from './NotificationContext'
import { SessionContext } from './SessionContext'
import type { User } from '../types'
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(getSessionToken()))
  const notify = useNotifications()
  const disconnect = useCallback(() => { setSessionToken(null); setUser(null) }, [])
  useEffect(() => {
    const expired = () => {
      setUser(null)
      notify('error', 'Сеанс истёк. Подключитесь с действующим токеном.')
    }
    window.addEventListener('task-tracker:unauthorized', expired)
    return () => window.removeEventListener('task-tracker:unauthorized', expired)
  }, [notify])
  useEffect(() => {
    if (!getSessionToken()) return
    const controller = new AbortController()
    usersApi.me(controller.signal).then((profile) => {
      if (!controller.signal.aborted) setUser(profile)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        disconnect()
        if (!(error instanceof ApiError && error.status === 401)) notify('error', getApiErrorMessage(error))
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [disconnect, notify])
  async function connect(token: string) {
    const { data } = await apiClient.get<User>('/users/me', { headers: { Authorization: 'Bearer ' + token } })
    setSessionToken(token)
    setUser(data)
  }
  return <SessionContext.Provider value={{ user, loading, connect, disconnect }}>{children}</SessionContext.Provider>
}
