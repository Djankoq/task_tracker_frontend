import { usersApi, userSortFields } from '../../api/users'
import { Badge, type Column } from '../../components/ui'
import { ResourceList, type ListFilter } from '../../components/lists/ResourceList'
import { useSession } from '../../contexts/SessionContext'
import { booleanFilter, positiveId, readListParams } from '../../utils/listParams'
import type { User } from '../../types'
const columns: Column<User>[] = [
  { key: 'id', header: 'ID', sortKey: 'user_id', render: (user) => '#' + user.user_id },
  { key: 'name', header: 'Имя', sortKey: 'display_name', render: (user) => user.display_name },
  { key: 'login', header: 'Логин', sortKey: 'login', render: (user) => '@' + user.login },
  { key: 'role', header: 'Роль', sortKey: 'is_admin', render: (user) => <Badge tone={user.is_admin ? 'purple' : 'neutral'}>{user.is_admin ? 'Администратор' : 'Пользователь'}</Badge> },
]
const filters: ListFilter[] = [
  { name: 'is_admin', label: 'Роль', options: [{ value: 'true', label: 'Администратор' }, { value: 'false', label: 'Пользователь' }] },
  { name: 'is_active', label: 'Активность', options: [{ value: 'true', label: 'Активные' }, { value: 'false', label: 'Неактивные' }] },
  { name: 'project_id', label: 'ID проекта', type: 'number' },
]
function loadPage(query: URLSearchParams, signal: AbortSignal) {
  return usersApi.getAll({
    ...readListParams(query, userSortFields, 'user_id'),
    is_admin: booleanFilter(query.get('is_admin')), is_active: booleanFilter(query.get('is_active')),
    project_id: positiveId(query.get('project_id')),
  }, signal)
}
export function UsersList() {
  const { user } = useSession()
  return <ResourceList title="Пользователи" subtitle="Участники команды и их роли. Данные загружаются из API."
    basePath="/users" columns={columns} loadPage={loadPage} remove={usersApi.delete}
    rowId={(row) => row.user_id} rowName={(row) => row.display_name}
    filters={filters} sortFields={userSortFields} defaultSort="user_id"
    canDelete={(row) => row.user_id !== user?.user_id} />
}
