import type { Project, Task, User } from '../types'

// Independent demo data. These records are never sent to the backend.
export const demoUsers: User[] = [
  { user_id: 1, login: 'alexey', display_name: 'Алексей Волков', is_admin: true },
  { user_id: 2, login: 'olga', display_name: 'Ольга Соколова', is_admin: false },
  { user_id: 3, login: 'anna', display_name: 'Анна Орлова', is_admin: false },
  { user_id: 4, login: 'mikhail', display_name: 'Михаил Лебедев', is_admin: false },
]

export const demoProjects: Project[] = [
  { project_id: 1, name: 'Разработка Task Tracker', description: 'Всё для удобной работы команды: от первого экрана до готового API.' },
  { project_id: 2, name: 'Внутренние инструменты', description: 'Автоматизация процессов и небольшие улучшения, которые экономят время.' },
]

export const demoTasks: Task[] = [
  { task_id: 1, project_id: 1, assignee_id: 2, title: 'Подготовить структуру приложения', description: 'Страницы, компоненты и маршрутизация.', due_at: '2026-12-01T12:00:00+03:00', priority: 'high', status: 'done' },
  { task_id: 2, project_id: 1, assignee_id: 3, title: 'Создать библиотеку UI-компонентов', description: 'Кнопки, поля ввода и универсальная таблица.', due_at: '2026-12-03T12:00:00+03:00', priority: 'medium', status: 'in_progress' },
  { task_id: 3, project_id: 1, assignee_id: 4, title: 'Подключить Backend API', description: 'Загрузка данных через Axios и обработка ошибок.', due_at: '2026-12-05T12:00:00+03:00', priority: 'high', status: 'todo' },
  { task_id: 4, project_id: 2, assignee_id: 2, title: 'Согласовать формат отчёта', description: 'Определить показатели для аналитики.', due_at: '2026-12-04T12:00:00+03:00', priority: 'low', status: 'in_review' },
]

export const statusLabels = { todo: 'К выполнению', in_progress: 'В работе', in_review: 'На проверке', done: 'Готово' } as const
export const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' } as const
