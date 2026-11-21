import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDemoUsers } from '../../app/DemoContext'
import { Badge, ButtonLink, Icon, Input, Table, type Column } from '../../components/ui'
import type { User } from '../../types'
import styles from '../Pages.module.css'

export function UsersList() {
  const { users } = useDemoUsers()
  const { state } = useLocation()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const query = search.trim().toLocaleLowerCase('ru')
  const filtered = users.filter((user) =>
    `${user.display_name} ${user.login}`.toLocaleLowerCase('ru').includes(query)
    && (role === 'all' || user.is_admin === (role === 'admin')),
  )
  const columns: Column<User>[] = [
    { key: 'name', header: 'Пользователь', render: (user) => <div className={styles.person}><span className={styles.avatar} aria-hidden="true">{user.display_name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span className={styles.personName}>{user.display_name}</span></div> },
    { key: 'login', header: 'Логин', render: (user) => <span className={styles.muted}>@{user.login}</span> },
    { key: 'role', header: 'Роль', render: (user) => <Badge tone={user.is_admin ? 'purple' : 'neutral'}>{user.is_admin ? 'Администратор' : 'Пользователь'}</Badge> },
    { key: 'id', header: 'ID', render: (user) => <span className={styles.muted}>#{user.user_id}</span> },
    { key: 'actions', header: 'Действия', align: 'right', render: (user) => <Link to={`/users/${user.user_id}/edit`} className={styles.edit} aria-label={`Редактировать: ${user.display_name}`}><Icon name="edit" size={15} />Изменить</Link> },
  ]
  return (
    <>
      <div className={styles.heading}><div><p className={styles.eyebrow}>КОМАНДА</p><h1>Пользователи</h1><p className={styles.subtitle}>Люди, которые превращают задачи в результат.</p></div><ButtonLink to="/users/new"><Icon name="plus" size={18} />Добавить пользователя</ButtonLink></div>
      {typeof state?.message === 'string' && <div className={styles.success} role="status">{state.message}</div>}
      <section className={styles.panel} aria-labelledby="users-title">
        <div className={styles.panelHeader}><h2 id="users-title">Участники команды</h2><Badge>{users.length} всего</Badge></div>
        <div className={styles.toolbar}><Input className={styles.search} label="Поиск пользователей" type="search" placeholder="Имя или логин" value={search} onChange={(event) => setSearch(event.target.value)} /><div className={styles.selectField}><label htmlFor="role-filter">Роль</label><select id="role-filter" className={styles.select} value={role} onChange={(event) => setRole(event.target.value)}><option value="all">Все роли</option><option value="admin">Администраторы</option><option value="user">Пользователи</option></select></div></div>
        <Table columns={columns} rows={filtered} rowKey={(user) => user.user_id} caption="Пользователи команды" emptyMessage="Пользователи не найдены. Измените поисковый запрос или фильтр." />
        <div className={styles.tableFooter} role="status">Показано {filtered.length} из {users.length} пользователей · Демонстрационные данные</div>
      </section>
      <aside className={styles.notice}><Icon name="info" /><p>Список и формы работают на примере локальных данных. Вы можете добавить или изменить пользователя; изменения будут доступны до перезагрузки страницы.</p></aside>
    </>
  )
}
