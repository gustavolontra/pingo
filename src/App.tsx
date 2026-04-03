import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import StudyPage from '@/pages/StudyPage'
import ExamSchedulePage from '@/pages/ExamSchedulePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminSubjectsPage from '@/pages/admin/AdminSubjectsPage'
import { useAdminStore } from '@/store/useAdminStore'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Student app */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="study/:disciplineId" element={<StudyPage />} />
        <Route path="exames" element={<ExamSchedulePage />} />
        <Route path="ranking" element={<LeaderboardPage />} />
        <Route path="perfil" element={<ProfilePage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsersPage />} />
        <Route path="materias" element={<AdminSubjectsPage />} />
      </Route>
    </Routes>
  )
}
