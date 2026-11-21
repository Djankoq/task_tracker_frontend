import { Link } from 'react-router-dom'
import { projectsApi, projectSortFields } from '../../api/projects'
import { ResourceList, type ListFilter } from '../../components/lists/ResourceList'
import { useSession } from '../../contexts/SessionContext'
import { booleanFilter, positiveId, readListParams } from '../../utils/listParams'
import type { Column } from '../../components/ui'
import type { Project } from '../../types'
const columns: Column<Project>[] = [
  { key: 'id', header: 'ID', sortKey: 'project_id', render: (project) => '#' + project.project_id },
  { key: 'name', header: 'Название', sortKey: 'name', render: (project) => <Link to={'/tasks?project_id=' + project.project_id}>{project.name}</Link> },
  { key: 'description', header: 'Описание', sortKey: 'description', render: (project) => <span className="table-description">{project.description || 'Без описания'}</span> },
]
const filters: ListFilter[] = [
  { name: 'has_tasks', label: 'Задачи', options: [{ value: 'true', label: 'С задачами' }, { value: 'false', label: 'Без задач' }] },
  { name: 'member_id', label: 'ID участника', type: 'number' },
]
function loadPage(query: URLSearchParams, signal: AbortSignal) {
  return projectsApi.getAll({ ...readListParams(query, projectSortFields, 'project_id'),
    has_tasks: booleanFilter(query.get('has_tasks')), member_id: positiveId(query.get('member_id')) }, signal)
}
export function Projects() {
  const { user } = useSession()
  return <ResourceList title="Проекты" subtitle="Создавайте проекты и переходите к их задачам."
    basePath="/projects" columns={columns} loadPage={loadPage} remove={projectsApi.delete}
    rowId={(row) => row.project_id} rowName={(row) => row.name} filters={filters}
    sortFields={projectSortFields} defaultSort="project_id"
    canCreate={Boolean(user?.is_admin)} canDelete={() => Boolean(user?.is_admin)} />
}
