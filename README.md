# Task Tracker — Frontend

Учебный React + TypeScript проект на Vite. Маршрутизация — React Router, HTTP-клиент — Axios, стили — CSS Modules. Это отдельный проект рядом с бэкендом:

```text
PycharmProjects/
├── task_tracker/            # Backend: FastAPI + PostgreSQL
└── task_tracker_frontend/   # Frontend: React + TypeScript + Vite
```

## Запуск

Нужен Node.js 22.12+ (или совместимая версия, указанная Vite).

```powershell
cd C:\Users\kurap\PycharmProjects\task_tracker_frontend
npm ci
npm run dev
```

Открыть http://localhost:5173. Для просмотра интерфейса бэкенд не требуется.

```powershell
npm run build    # Проверка TypeScript и production-сборка в dist
npm run lint     # Статический анализ
npm run preview  # Локальный просмотр production-сборки
```

## Структура

```text
task_tracker_frontend/
├── public/                 # Статические файлы
├── src/
│   ├── app/                # App, маршруты, провайдер демоданных
│   ├── api/                # Axios instance, типизированные API-модули
│   ├── components/
│   │   ├── layout/         # Layout, Header, Footer
│   │   └── ui/             # Button, Input, Table, Badge, Icon, Loader
│   ├── mocks/              # Демонстрационные данные отдельно от API
│   ├── pages/
│   │   ├── Home/
│   │   ├── Users/          # UsersList и UserForm
│   │   ├── Projects/
│   │   ├── Tasks/
│   │   ├── Reports/
│   │   └── NotFound/
│   ├── styles/             # Глобальные стили и CSS-переменные
│   ├── types/              # Типы данных бэкенда
│   └── main.tsx
├── .env.example
└── vite.config.ts
```

Слайд 5 не был приложен к заданию, поэтому выбрана стандартная структура с разделением страниц, компонентов и API. Вместо примеров Products/Orders созданы реальные разделы этого бэкенда: Projects, Tasks, Reports.

## Маршруты

| URL | Страница |
| --- | --- |
| `/` | Home: приветствие, демопоказатели, переходы в разделы |
| `/users` | UsersList: таблица, поиск по имени/логину, фильтр роли |
| `/users/new` | UserForm: создание пользователя в деморежиме |
| `/users/:id/edit` | UserForm: редактирование пользователя в деморежиме |
| `/projects` | Заготовка списка проектов |
| `/tasks` | Заготовка списка задач, локальные поиск и фильтры |
| `/tasks?project_id=1` | Задачи выбранного проекта |
| `/reports` | Заготовка аналитики |
| `*` | NotFound (404) |

Все страницы вложены в Layout с Header, навигацией через Link/NavLink и Footer. Несуществующий или некорректный ID в форме показывает сообщение «Пользователь не найден».

## Что уже работает

- Адаптивный интерфейс, навигация, активный пункт меню, заголовки вкладки.
- Универсальный `Table<T>`: описание колонок через `Column<T>`, render-функции, rowKey, пустое состояние, горизонтальная прокрутка.
- Button: `primary` и `secondary`, отдельный ButtonLink для переходов.
- Input: label, required, error, hint, доступные связи `aria-describedby`.
- Дополнительно: Badge, Icon, Loader с учётом reduced motion.
- Учебные формы: обязательные поля, нижний регистр и уникальность логина, ошибки полей, возврат к списку после сохранения.
- Пользователи хранятся в React Context (`useState`). Изменения действуют только до перезагрузки вкладки. В базу ничего не отправляется.
- useEffect в Layout обновляет заголовок вкладки, прокрутку и фокус после перехода.

## Подготовка к API

`src/api/client.ts` содержит общий Axios instance, timeout, установку Bearer-токена и преобразование ошибок API в сообщения. Модули `users.ts`, `projects.ts`, `tasks.ts`, `analytics.ts` используют существующие маршруты и формат пагинации `{ items, total, page, per_page, total_pages }`. Они подготовлены к подключению, но страницы пока используют демоданные. Произвольные query-параметры бэкенд отклоняет; интерфейсы параметров отражают разрешённые фильтры.

В режиме разработки Vite пересылает `/api/*` на `http://127.0.0.1:8001/*`: например, `/api/users/` → `/users/`. Поэтому для локальной разработки не нужно менять CORS бэкенда. При другом порте скопируйте `.env.example` в `.env` и измените `API_PROXY_TARGET`, затем перезапустите Vite.

Бэкенд запускается в отдельном терминале:

```powershell
cd C:\Users\kurap\PycharmProjects\task_tracker
.\start-dev.ps1
```

Токен устанавливается при выполнении приложения через `setSessionToken(token)`. Реальные токены нельзя класть в `VITE_*`: эти значения видны в браузерном bundle. Для списка пользователей нужен действующий сеанс администратора. В этом бэкенде пока отсутствуют POST/PUT/PATCH `/users` и GET `/users/{id}`; перед интеграцией UserForm их нужно реализовать или согласовать другой контракт. Фронтенд не отправляет запросы на несуществующие endpoints.

Для production Vite proxy не работает: сервер публикации должен отдавать `index.html` для клиентских маршрутов и проксировать `/api` к FastAPI. Либо укажите адрес API в `VITE_API_BASE_URL` при сборке и настройте CORS на бэкенде. `npm run preview` проверяет сборку интерфейса, а не production-развёртывание API.

### Пример следующего шага: загрузка через useEffect

```tsx
const [users, setUsers] = useState<User[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

useEffect(() => {
  const controller = new AbortController()
  usersApi.list({ page: 1, per_page: 10 }, controller.signal)
    .then((page) => setUsers(page.items))
    .catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(getApiErrorMessage(cause))
    })
    .finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
  return () => controller.abort()
}, [])
```

Подключите реальные данные вместо DemoProvider, показывайте Loader/ошибки/пустое состояние, добавьте пагинацию с `total_pages`. В примере предполагается, что действующий токен уже установлен, и добавлены импорты React, User, usersApi и getApiErrorMessage. Данные API и демоданные не следует смешивать незаметно для пользователя.

## К следующему занятию

1. [React: useState](https://react.dev/reference/react/useState) — состояние полей формы и фильтров.
2. [React: useEffect](https://react.dev/reference/react/useEffect) — загрузка данных и очистка через AbortController.
3. [Axios: общий instance](https://axios-http.com/docs/instance) — baseURL, timeout, конфигурация запросов.
4. [React Router: маршрутизация](https://reactrouter.com/start/declarative/routing) — вложенные маршруты, Outlet и параметры URL.
5. [Vite: начало работы](https://vite.dev/guide/) — dev server и production-сборка.
6. Swagger бэкенда: http://127.0.0.1:8001/docs — проверить контракт, роли, HTTP-коды и формат ошибок.

На следующем этапе: подключить списки к REST API, добавить состояния загрузки и ошибок, серверные фильтры и пагинацию; после согласования endpoints — сохранение пользователей.
