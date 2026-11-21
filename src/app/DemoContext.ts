import { createContext, useContext } from 'react'
import type { User, UserDraft } from '../types'

interface DemoStore {
  users: User[]
  saveUser: (draft: UserDraft, id?: number) => void
}

export const DemoContext = createContext<DemoStore | null>(null)

export function useDemoUsers() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemoUsers must be used inside DemoProvider')
  return context
}
