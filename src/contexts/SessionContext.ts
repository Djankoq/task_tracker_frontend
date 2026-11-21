import { createContext, useContext } from 'react'
import type { User } from '../types'
interface Session { user: User | null; loading: boolean; connect: (token: string) => Promise<void>; disconnect: () => void }
export const SessionContext = createContext<Session | null>(null)
export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('SessionProvider is missing')
  return session
}
