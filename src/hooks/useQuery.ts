import { useCallback, useEffect, useState } from 'react'
import { ApiError, getApiErrorMessage, isCanceled } from '../api/client'
import { useNotifications } from '../contexts/NotificationContext'
interface Result<T> {
  load: (signal: AbortSignal) => Promise<T>
  version: number
  data?: T
  error: string
}
export function useQuery<T>(load: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const [result, setResult] = useState<Result<T> | null>(null)
  const [version, setVersion] = useState(0)
  const notify = useNotifications()
  const refresh = useCallback(() => setVersion((value) => value + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    if (!enabled) return () => controller.abort()
    load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ load, version, data, error: '' })
    }).catch((cause: unknown) => {
      if (controller.signal.aborted || isCanceled(cause)) return
      const message = getApiErrorMessage(cause)
      setResult({ load, version, error: message })
      if (!(cause instanceof ApiError && cause.status === 401)) notify('error', message)
    })
    return () => controller.abort()
  }, [load, enabled, version, notify])
  const current = enabled && result?.load === load && result?.version === version ? result : null
  return { data: current?.data, error: current?.error || '', loading: enabled && !current, refresh }
}
