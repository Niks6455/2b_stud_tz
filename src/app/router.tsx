import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { BoardPage } from '@/pages/BoardPage'
import { ObjectsPage } from '@/pages/ObjectsPage'
import { ObjectDetailPage } from '@/pages/ObjectDetailPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { MyTasksPage } from '@/pages/MyTasksPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/objects" element={<ObjectsPage />} />
            <Route path="/objects/:id" element={<ObjectDetailPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
