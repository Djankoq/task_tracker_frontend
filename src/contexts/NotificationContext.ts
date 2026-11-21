import { createContext, useContext } from 'react'
export type NotificationType = 'success' | 'error'
export interface Notification { id: number; type: NotificationType; message: string }
export const NotificationContext = createContext<((type: NotificationType, message: string) => void) | null>(null)
export function useNotifications() {
  const notify = useContext(NotificationContext)
  if (!notify) throw new Error('NotificationProvider is missing')
  return notify
}
