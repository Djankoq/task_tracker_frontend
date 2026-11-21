import { useState, type ReactNode } from 'react'
import { DemoContext } from './DemoContext'
import { demoUsers } from '../mocks/data'
import type { UserDraft } from '../types'

export function DemoProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState(demoUsers)

  function saveUser(draft: UserDraft, id?: number) {
    setUsers((current) => id === undefined
      ? [...current, { ...draft, user_id: Math.max(0, ...current.map((user) => user.user_id)) + 1 }]
      : current.map((user) => user.user_id === id ? { ...draft, user_id: id } : user))
  }

  return <DemoContext.Provider value={{ users, saveUser }}>{children}</DemoContext.Provider>
}
