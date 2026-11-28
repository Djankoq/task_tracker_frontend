import { Link } from 'react-router-dom'
import { projectsApi, projectSortFields } from '../../api/projects'
import { ResourceList } from '../../components/lists/ResourceList'
import type { ListFilter, RangeFilter } from '../../components/lists/FiltersPanel'
import { useSession } from '../../contexts/SessionContext'
import { booleanFilter, positiveId, readListParams } from '../../utils/listParams'
import { nonNegativeInteger } from '../../utils/filterParams'
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
const ranges: RangeFilter[] = [
  { label: 'Количество задач', lower: 'task_count_min', upper: 'task_count_max', type: 'number', min: 0 },
]
function loadPage(query: URLSearchParams, signal: AbortSignal) {
  return projectsApi.getAll({ ...readListParams(query, projectSortFields, 'project_id'),
    has_tasks: booleanFilter(query.get('has_tasks')),
    member_id: positiveId(query.get('member_id')),
    task_count_min: nonNegativeInteger(query.get('task_count_min')),
    task_count_max: nonNegativeInteger(query.get('task_count_max')),
  }, signal)
}
export function Projects() {
  const { user } = useSession()
  return <ResourceList title="Проекты" subtitle="Создавайте проекты и переходите к их задачам."
    basePath="/projects" columns={columns} loadPage={loadPage} remove={projectsApi.delete}
    rowId={(row) => row.project_id} rowName={(row) => row.name} filters={filters} ranges={ranges}
    sortFields={projectSortFields} defaultSort="project_id"
    canCreate={Boolean(user?.is_admin)} canDelete={() => Boolean(user?.is_admin)} />
}
