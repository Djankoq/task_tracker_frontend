import { useRef, useState } from 'react'
import { ApiError, getApiErrorMessage, getFieldErrors } from '../api/client'
import { useNotifications } from '../contexts/NotificationContext'
import type { FieldErrors } from '../utils/validation'
export function useMutation() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const locked = useRef(false)
  const notify = useNotifications()
  async function run(action: () => Promise<unknown>, message: string, success: () => void, fieldErrors: (errors: FieldErrors) => void) {
    if (locked.current) return
    locked.current = true
    setSaving(true)
    setError('')
    try {
      await action()
      notify('success', message)
      success()
    } catch (cause) {
      const text = getApiErrorMessage(cause)
      setError(text)
      fieldErrors(getFieldErrors(cause))
      if (!(cause instanceof ApiError && cause.status === 401)) notify('error', text)
    } finally { locked.current = false; setSaving(false) }
  }
  return { saving, error, run }
}
