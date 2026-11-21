import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../contexts/SessionContext'
import { Loader } from '../components/ui'
import { ErrorState } from '../components/ui/ErrorState'
export function RequireSession({ admin = false }: { admin?: boolean }) {
  const { user, loading } = useSession()
  const location = useLocation()
  if (loading) return <Loader label="Проверка сеанса…" />
  if (!user) return <Navigate to="/connection" replace state={{ from: location.pathname + location.search }} />
  if (admin && !user.is_admin) return <ErrorState message="Этот раздел доступен только администратору. Смените сеанс на странице подключения." />
  return <Outlet />
}
