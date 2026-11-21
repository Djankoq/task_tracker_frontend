import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usersApi } from '../../api/users'
import { Button, Input } from '../../components/ui'
import { EditLoader } from '../../components/forms/EditLoader'
import { useSession } from '../../contexts/SessionContext'
import { useMutation } from '../../hooks/useMutation'
import { focusFirstError, required, type FieldErrors } from '../../utils/validation'
import type { User } from '../../types'
import styles from '../Pages.module.css'
export function UserForm() {
  return <EditLoader getById={usersApi.getById} backTo="/users">{(user) => <UserEditor key={user?.user_id || 'new'} user={user} />}</EditLoader>
}
function UserEditor({ user }: { user?: User }) {
  const navigate = useNavigate()
  const { user: actor } = useSession()
  const form = useRef<HTMLFormElement>(null)
  const [draft, setDraft] = useState({ login: user?.login || '', display_name: user?.display_name || '', is_admin: user?.is_admin || false, password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const mutation = useMutation()
  function submit(event: FormEvent) {
    event.preventDefault()
    const next: FieldErrors = {}
    const login = draft.login.trim()
    const name = draft.display_name.trim()
    const nameError = required(name, 'Имя пользователя')
    const loginError = required(login, 'Логин')
    if (nameError) next.display_name = nameError
    if (loginError) next.login = loginError
    else if (login !== login.toLowerCase()) next.login = 'Используйте строчные буквы.'
    if ((!user || draft.password) && (draft.password.length < 8 || draft.password.length > 128)) next.password = 'Пароль должен содержать от 8 до 128 символов.'
    setErrors(next)
    if (Object.keys(next).length) { focusFirstError(form.current, next); return }
    const common = { login, display_name: name, is_admin: draft.is_admin }
    void mutation.run(
      () => user ? usersApi.update(user.user_id, { ...common, ...(draft.password ? { password: draft.password } : {}) })
        : usersApi.create({ ...common, password: draft.password }),
      user ? 'Пользователь обновлён.' : 'Пользователь создан.',
      () => navigate('/users'), setErrors,
    )
  }
  return <>
    <Link to="/users" className={styles.back}>К списку пользователей</Link>
    <div className={styles.heading}><div><h1>{user ? 'Редактирование пользователя' : 'Новый пользователь'}</h1><p className={styles.subtitle}>Изменения сохраняются в базе данных.</p></div></div>
    <section className={styles.panel + ' ' + styles.formPanel}>
      <form ref={form} onSubmit={submit} className={styles.form} noValidate>
        <fieldset disabled={mutation.saving} className={styles.fieldset}>
          <Input name="display_name" label="Имя пользователя" required autoComplete="name" value={draft.display_name} onChange={(event) => setDraft({ ...draft, display_name: event.target.value })} error={errors.display_name} />
          <Input name="login" label="Логин" required autoComplete="username" autoCapitalize="none" spellCheck={false} value={draft.login} onChange={(event) => setDraft({ ...draft, login: event.target.value })} error={errors.login} hint="Уникальный логин в нижнем регистре." />
          <Input name="password" label={user ? 'Новый пароль' : 'Пароль'} type="password" required={!user} autoComplete="new-password" minLength={8} maxLength={128} value={draft.password} onChange={(event) => setDraft({ ...draft, password: event.target.value })} error={errors.password} hint={user ? 'Оставьте пустым, чтобы сохранить текущий пароль.' : 'От 8 до 128 символов. API сохраняет только хеш.'} />
          <label className={styles.checkbox}><input type="checkbox" checked={draft.is_admin} disabled={actor?.user_id === user?.user_id} onChange={(event) => setDraft({ ...draft, is_admin: event.target.checked })} /><span>Администратор<small>Нельзя снять с себя роль администратора.</small></span></label>
        </fieldset>
        {mutation.error && <p className={styles.formError} role="alert">{mutation.error}</p>}
        <div className={styles.formActions}><Button type="submit" disabled={mutation.saving}>{mutation.saving ? 'Сохранение…' : 'Сохранить'}</Button><Button variant="secondary" disabled={mutation.saving} onClick={() => navigate('/users')}>Отмена</Button></div>
      </form>
    </section>
  </>
}
