import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectsApi } from '../../api/projects'
import { Button, Input } from '../../components/ui'
import { TextareaField } from '../../components/forms/FormControls'
import { EditLoader } from '../../components/forms/EditLoader'
import { useMutation } from '../../hooks/useMutation'
import { focusFirstError, required, type FieldErrors } from '../../utils/validation'
import type { Project } from '../../types'
import styles from '../Pages.module.css'
export function ProjectForm() {
  return <EditLoader getById={projectsApi.getById} backTo="/projects">{(project) => <ProjectEditor key={project?.project_id || 'new'} project={project} />}</EditLoader>
}
function ProjectEditor({ project }: { project?: Project }) {
  const navigate = useNavigate()
  const form = useRef<HTMLFormElement>(null)
  const [draft, setDraft] = useState({ name: project?.name || '', description: project?.description || '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const mutation = useMutation()
  function submit(event: FormEvent) {
    event.preventDefault()
    const next: FieldErrors = {}
    const nameError = required(draft.name, 'Название')
    if (nameError) next.name = nameError
    if (draft.description.includes('\0')) next.description = 'Недопустимый символ в описании.'
    setErrors(next)
    if (Object.keys(next).length) { focusFirstError(form.current, next); return }
    const payload = { name: draft.name.trim(), description: draft.description.trim() }
    void mutation.run(() => project ? projectsApi.update(project.project_id, payload) : projectsApi.create(payload),
      project ? 'Проект обновлён.' : 'Проект создан.', () => navigate('/projects'), setErrors)
  }
  return <>
    <Link to="/projects" className={styles.back}>К списку проектов</Link>
    <div className={styles.heading}><div><h1>{project ? 'Редактирование проекта' : 'Новый проект'}</h1><p className={styles.subtitle}>Название и описание рабочего пространства.</p></div></div>
    <section className={styles.panel + ' ' + styles.formPanel}>
      <form ref={form} onSubmit={submit} className={styles.form} noValidate>
        <fieldset disabled={mutation.saving} className={styles.fieldset}>
          <Input label="Название" name="name" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} error={errors.name} />
          <TextareaField label="Описание" name="description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} error={errors.description} />
        </fieldset>
        {mutation.error && <p className={styles.formError} role="alert">{mutation.error}</p>}
        <div className={styles.formActions}><Button type="submit" disabled={mutation.saving}>{mutation.saving ? 'Сохранение…' : 'Сохранить'}</Button><Button variant="secondary" disabled={mutation.saving} onClick={() => navigate('/projects')}>Отмена</Button></div>
      </form>
    </section>
    {!project && <aside className={styles.notice}>Создание проекта не назначает участников. Чтобы создавать в нём задачи, нужны руководитель и исполнитель, назначенные средствами бэкенда.</aside>}
  </>
}
