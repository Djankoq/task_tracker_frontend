import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDemoUsers } from '../../app/DemoContext'
import { Button, ButtonLink, Icon, Input } from '../../components/ui'
import type { User, UserDraft } from '../../types'
import styles from '../Pages.module.css'

export function UserForm() {
  const { id } = useParams()
  const { users } = useDemoUsers()
  const userId = id === undefined ? undefined : Number(id)
  const user = users.find((item) => item.user_id === userId)
  if (id !== undefined && (!/^\d+$/.test(id) || !Number.isSafeInteger(userId) || !user)) {
    return <section className={styles.errorPage}><p className={styles.errorCode}>404</p><h1>Пользователь не найден</h1><p>В демонстрационном списке нет пользователя с таким ID. После перезагрузки страницы локальные изменения сбрасываются.</p><ButtonLink to="/users">К списку пользователей</ButtonLink></section>
  }
  return <UserEditor key={id || 'new'} user={user} />
}

function UserEditor({ user }: { user?: User }) {
  const { users, saveUser } = useDemoUsers()
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const [draft, setDraft] = useState<UserDraft>({ display_name: user?.display_name || '', login: user?.login || '', is_admin: user?.is_admin || false })
  const [errors, setErrors] = useState<Partial<Record<'display_name' | 'login', string>>>({})
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    const name = draft.display_name.trim()
    const login = draft.login.trim()
    if (!name) nextErrors.display_name = 'Введите имя пользователя.'
    else if (name.includes('\0')) nextErrors.display_name = 'Имя содержит недопустимый символ.'
    if (!login) nextErrors.login = 'Введите логин.'
    else if (login !== login.toLowerCase()) nextErrors.login = 'Используйте строчные буквы.'
    else if (login.includes('\0')) nextErrors.login = 'Логин содержит недопустимый символ.'
    else if (users.some((item) => item.login === login && item.user_id !== user?.user_id)) nextErrors.login = 'Пользователь с таким логином уже существует.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const firstField = nextErrors.display_name ? 'display_name' : 'login'
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstField}"]`)?.focus()
      return
    }
    saveUser({ ...draft, display_name: name, login }, user?.user_id)
    navigate('/users', { state: { message: user ? 'Изменения сохранены в деморежиме.' : 'Пользователь добавлен в деморежиме.' } })
  }
  return (
    <>
      <Link to="/users" className={styles.back}>К списку пользователей</Link>
      <div className={styles.heading}><div><h1>{user ? 'Редактирование пользователя' : 'Новый пользователь'}</h1><p className={styles.subtitle}>{user ? 'Измените данные участника команды.' : 'Добавьте нового участника в вашу команду.'}</p></div></div>
      <section className={`${styles.panel} ${styles.formPanel}`}>
        <div className={styles.panelHeader}><h2>Данные пользователя</h2></div>
        <form ref={formRef} className={styles.form} onSubmit={submit} noValidate>
          <Input name="display_name" label="Имя пользователя" placeholder="Например, Иван Петров" autoComplete="name" required value={draft.display_name} onChange={(event) => setDraft({ ...draft, display_name: event.target.value })} error={errors.display_name} />
          <Input name="login" label="Логин" placeholder="Например, ivan" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={draft.login} onChange={(event) => setDraft({ ...draft, login: event.target.value })} hint="Уникальный логин в нижнем регистре." error={errors.login} />
          <label className={styles.checkbox}><input type="checkbox" checked={draft.is_admin} onChange={(event) => setDraft({ ...draft, is_admin: event.target.checked })} /><span>Администратор<small>Роль администратора в демонстрационном списке пользователей.</small></span></label>
          <div className={styles.formActions}><Button type="submit">{user ? 'Сохранить в деморежиме' : 'Добавить в деморежиме'}</Button><ButtonLink to="/users" variant="secondary">Отмена</ButtonLink></div>
        </form>
      </section>
      <aside className={`${styles.notice} ${styles.formPanel}`}><Icon name="info" /><p>Это учебная форма. Бэкенд пока поддерживает только чтение пользователей. Данные этой формы остаются во фронтенде и сбрасываются при перезагрузке.</p></aside>
    </>
  )
}
