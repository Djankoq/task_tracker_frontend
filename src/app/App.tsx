import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { NotificationProvider } from '../contexts/NotificationProvider'
import { SessionProvider } from '../contexts/SessionProvider'
import { RequireSession } from './RequireSession'
import { Layout } from '../components/layout/Layout'
import { Home } from '../pages/Home/Home'
import { UsersList } from '../pages/Users/UsersList'
import { UserForm } from '../pages/Users/UserForm'
import { Projects } from '../pages/Projects/Projects'
import { ProjectForm } from '../pages/Projects/ProjectForm'
import { Tasks } from '../pages/Tasks/Tasks'
import { TaskForm } from '../pages/Tasks/TaskForm'
import { Reports } from '../pages/Reports/Reports'
import { Connection } from '../pages/Connection/Connection'
import { NotFound } from '../pages/NotFound/NotFound'
export function App() {
  return <BrowserRouter><NotificationProvider><SessionProvider>
    <Routes><Route element={<Layout />}>
      <Route path="connection" element={<Connection />} />
      <Route element={<RequireSession />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/new" element={<TaskForm />} />
        <Route path="tasks/:id/edit" element={<TaskForm />} />
        <Route path="reports" element={<Reports />} />
        <Route element={<RequireSession admin />}>
          <Route path="users" element={<UsersList />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/:id/edit" element={<UserForm />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route></Routes>
  </SessionProvider></NotificationProvider></BrowserRouter>
}
