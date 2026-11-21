import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DemoProvider } from './DemoProvider'
import { Layout } from '../components/layout/Layout'
import { Home } from '../pages/Home/Home'
import { UsersList } from '../pages/Users/UsersList'
import { UserForm } from '../pages/Users/UserForm'
import { Projects } from '../pages/Projects/Projects'
import { Tasks } from '../pages/Tasks/Tasks'
import { Reports } from '../pages/Reports/Reports'
import { NotFound } from '../pages/NotFound/NotFound'

export function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/:id/edit" element={<UserForm />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </DemoProvider>
    </BrowserRouter>
  )
}
