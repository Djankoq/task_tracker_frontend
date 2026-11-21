import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectsApi } from '../../api/projects'
import { tasksApi } from '../../api/tasks'
import { collectPages } from '../../api/options'
import { EditLoader } from '../../components/forms/EditLoader'
import { SelectField, TextareaField } from '../../components/forms/FormControls'
import { Button, Input, Loader } from '../../components/ui'
import { ErrorState } from '../../components/ui/ErrorState'
import { useSession } from '../../contexts/SessionContext'
import { useQuery } from '../../hooks/useQuery'
import { useMutation } from '../../hooks/useMutation'
import { priorityLabels, roleLabels, statusLabels } from '../../types/labels'
import { positiveId } from '../../utils/listParams'
import { toApiDeadline, toLocalDateTime } from '../../utils/dates'
import { focusFirstError, required, type FieldErrors } from '../../utils/validation'
import type { Task, TaskPriority, TaskStatus } from '../../types'
import styles from '../Pages.module.css'
function loadProjects(signal: AbortSignal) {
  return collectPages((page) => projectsApi.getAll({ page, per_page: 100, sort_by: 'project_id' }, signal), signal)
}
export function TaskForm() {
  return <EditLoader getById={tasksApi.getById} backTo="/tasks">{(task) => <TaskEditor key={task?.task_id || 'new'} task={task} />}</EditLoader>
}
function TaskEditor({ task }: { task?: Task }) {
  const navigate = useNavigate()
  const { user } = useSession()
  const form = useRef<HTMLFormElement>(null)
  const [draft, setDraft] = useState({
    title: task?.title || '', description: task?.description || '',
    project_id: task ? String(task.project_id) : '', assignee_id: task ? String(task.assignee_id) : '',
    due_at: task ? toLocalDateTime(task.due_at) : '', priority: task?.priority || 'medium' as TaskPriority,
    status: task?.status || 'todo' as TaskStatus, review_reason: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const mutation = useMutation()
  const projects = useQuery(loadProjects)
  const projectId = positiveId(draft.project_id)
  const loadMembers = useCallback((signal: AbortSignal) => projectsApi.members(projectId!, signal), [projectId])
  const members = useQuery(loadMembers, Boolean(projectId))
  const role = members.data?.find((member) => member.user_id === user?.user_id)?.role
  const isManager = role === 'manager'
  const isExecutor = role === 'executor' && task?.assignee_id === user?.user_id
  const canSave = task ? isManager || isExecutor : isManager
  const executors = members.data?.filter((member) => member.role === 'executor') || []
  const statuses: TaskStatus[] = task ? [task.status] : ['todo']
  if (task && isExecutor && task.status === 'todo') statuses.push('in_progress')
  if (task && isExecutor && task.status === 'in_progress') statuses.push('in_review')
  if (task && isManager && task.status === 'in_review') statuses.push('in_progress', 'done')
  const needsReason = task?.status === 'in_review' && draft.status === 'in_progress'
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const dueAt = isManager ? String(new FormData(event.currentTarget).get('due_at') || '') : draft.due_at
    if (!canSave || members.loading || mutation.saving) return
    const next: FieldErrors = {}
    for (const [field, label] of [['title', 'Название'], ['description', 'Описание']] as const) {
      const issue = required(draft[field], label)
      if (issue) next[field] = issue
    }
    if (!projectId) next.project_id = 'Выберите проект.'
    const assignee = positiveId(draft.assignee_id)
    if (!assignee || !executors.some((member) => member.user_id === assignee)) next.assignee_id = 'Выберите действующего исполнителя проекта.'
    if (!dueAt || Number.isNaN(new Date(dueAt).getTime())) next.due_at = 'Укажите корректные дату и время.'
    if (needsReason) {
      const issue = required(draft.review_reason, 'Причина возврата')
      if (issue) next.review_reason = issue
    }
    if (!statuses.includes(draft.status)) next.status = 'Выберите допустимый статус.'
    setErrors(next)
    if (Object.keys(next).length) { focusFirstError(form.current, next); return }
    const payload = {
      title: draft.title.trim(), description: draft.description.trim(), assignee_id: assignee!,
      due_at: toApiDeadline(dueAt, task?.due_at), priority: draft.priority,
    }
    void mutation.run(
      () => task ? tasksApi.update(task.task_id, { ...payload, status: draft.status, ...(needsReason ? { review_reason: draft.review_reason.trim() } : {}) })
        : tasksApi.create({ ...payload, project_id: projectId! }),
      task ? 'Задача обновлена.' : 'Задача создана.', () => navigate('/tasks'), setErrors,
    )
  }
  if (projects.loading) return <Loader label="Загрузка проектов…" />
  if (projects.error) return <ErrorState message={projects.error} retry={projects.refresh} />
  return <>
    <Link to="/tasks" className={styles.back}>К списку задач</Link>
    <div className={styles.heading}><div><h1>{task ? 'Редактирование задачи' : 'Новая задача'}</h1><p className={styles.subtitle}>Новая задача создаётся в статусе «К выполнению». Срок указывается в часовом поясе браузера.</p></div></div>
    <section className={styles.panel + ' ' + styles.formPanel}>
      <form ref={form} onSubmit={submit} className={styles.form} noValidate>
        <SelectField name="project_id" label="Проект" required value={draft.project_id} disabled={Boolean(task) || mutation.saving}
          onChange={(event) => setDraft({ ...draft, project_id: event.target.value, assignee_id: '' })} error={errors.project_id}>
          <option value="">Выберите проект</option>{projects.data?.map((project) => <option key={project.project_id} value={project.project_id}>{project.name}</option>)}
        </SelectField>
        {members.loading && <Loader label="Загрузка участников…" />}
        {members.error && <ErrorState message={members.error} retry={members.refresh} />}
        {projectId && members.data && <p className={styles.muted}>Ваша роль: {role ? roleLabels[role] : 'нет участия в проекте'}. {!canSave && 'Недостаточно прав для сохранения этой задачи.'}</p>}
        <fieldset className={styles.fieldset} disabled={mutation.saving || !isManager || members.loading}>
          <Input name="title" label="Название" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} error={errors.title} />
          <TextareaField name="description" label="Описание" required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} error={errors.description} />
          <SelectField name="assignee_id" label="Исполнитель" required value={draft.assignee_id} onChange={(event) => setDraft({ ...draft, assignee_id: event.target.value })} error={errors.assignee_id}>
            <option value="">Выберите исполнителя</option>{executors.map((member) => <option key={member.user_id} value={member.user_id}>{member.display_name} (@{member.login})</option>)}
          </SelectField>
          <Input name="due_at" label="Срок" type="datetime-local" required defaultValue={draft.due_at} error={errors.due_at} />
          <SelectField name="priority" label="Приоритет" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskPriority })} error={errors.priority}>
            {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </SelectField>
        </fieldset>
        {task && <SelectField name="status" label="Статус" value={draft.status} disabled={!canSave || mutation.saving} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })} error={errors.status}>
          {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
        </SelectField>}
        {needsReason && <TextareaField name="review_reason" label="Причина возврата с проверки" required disabled={mutation.saving} value={draft.review_reason} onChange={(event) => setDraft({ ...draft, review_reason: event.target.value })} error={errors.review_reason} />}
        {projectId && !members.loading && !executors.length && <p className={styles.muted}>В проекте нет действующих исполнителей. Сначала назначьте участников средствами бэкенда.</p>}
        {mutation.error && <p className={styles.formError} role="alert">{mutation.error}</p>}
        <div className={styles.formActions}><Button type="submit" disabled={!canSave || members.loading || mutation.saving}>{mutation.saving ? 'Сохранение…' : 'Сохранить'}</Button><Button variant="secondary" disabled={mutation.saving} onClick={() => navigate('/tasks')}>Отмена</Button></div>
      </form>
    </section>
  </>
}
