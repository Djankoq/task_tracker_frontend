import { tasksApi, taskSortFields } from '../../api/tasks'
import { Badge, type Column } from '../../components/ui'
import { ResourceList } from '../../components/lists/ResourceList'
import type { ListFilter, RangeFilter } from '../../components/lists/FiltersPanel'
import { priorityLabels, statusLabels } from '../../types/labels'
import { positiveId, readListParams } from '../../utils/listParams'
import { deadlineBound } from '../../utils/filterParams'
import type { Task, TaskPriority, TaskStatus } from '../../types'
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeZone: 'UTC' })
const columns: Column<Task>[] = [
  { key: 'id', header: 'ID', sortKey: 'task_id', render: (task) => '#' + task.task_id },
  { key: 'title', header: 'Задача', sortKey: 'title', render: (task) => task.title },
  { key: 'project', header: 'Проект', sortKey: 'project_id', render: (task) => '#' + task.project_id },
  { key: 'assignee', header: 'Исполнитель', sortKey: 'assignee_id', render: (task) => '#' + task.assignee_id },
  { key: 'status', header: 'Статус', sortKey: 'status', render: (task) => <Badge tone={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'purple' : 'neutral'}>{statusLabels[task.status]}</Badge> },
  { key: 'priority', header: 'Приоритет', sortKey: 'priority', render: (task) => <Badge tone={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'neutral'}>{priorityLabels[task.priority]}</Badge> },
  { key: 'due', header: 'Срок (UTC)', sortKey: 'due_at', render: (task) => <time dateTime={task.due_at}>{dateFormat.format(new Date(task.due_at))}</time> },
]
const filters: ListFilter[] = [
  { name: 'project_id', label: 'ID проекта', type: 'number' },
  { name: 'assignee_id', label: 'ID исполнителя', type: 'number' },
  { name: 'status', label: 'Статус', options: Object.entries(statusLabels).map(([value, label]) => ({ value, label })) },
  { name: 'priority', label: 'Приоритет', options: Object.entries(priorityLabels).map(([value, label]) => ({ value, label })) },
]
const ranges: RangeFilter[] = [
  { label: 'ID задачи', lower: 'task_id_min', upper: 'task_id_max', type: 'number' },
  { label: 'Срок (UTC)', lower: 'due_from', upper: 'due_to', type: 'date' },
]
function loadPage(query: URLSearchParams, signal: AbortSignal) {
  const status = query.get('status')
  const priority = query.get('priority')
  return tasksApi.getAll({ ...readListParams(query, taskSortFields, 'task_id'),
    project_id: positiveId(query.get('project_id')), assignee_id: positiveId(query.get('assignee_id')),
    status: status && Object.hasOwn(statusLabels, status) ? status as TaskStatus : undefined,
    priority: priority && Object.hasOwn(priorityLabels, priority) ? priority as TaskPriority : undefined,
    task_id_min: positiveId(query.get('task_id_min')),
    task_id_max: positiveId(query.get('task_id_max')),
    due_from: deadlineBound(query.get('due_from'), 'from'),
    due_to: deadlineBound(query.get('due_to'), 'to'),
  }, signal)
}
export function Tasks() {
  return <ResourceList title="Задачи" subtitle="Приоритеты, исполнители и сроки. Права на изменения проверяет API."
    basePath="/tasks" columns={columns} loadPage={loadPage} remove={tasksApi.delete}
    rowId={(row) => row.task_id} rowName={(row) => row.title}
    filters={filters} ranges={ranges} sortFields={taskSortFields} defaultSort="task_id" />
}
