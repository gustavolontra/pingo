import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import StudyPage from '@/pages/StudyPage'
import ExamSchedulePage from '@/pages/ExamSchedulePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import ProfilePage from '@/pages/ProfilePage'
import StudentLoginPage from '@/pages/StudentLoginPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminSubjectsPage from '@/pages/admin/AdminSubjectsPage'
import AdminStudentDetailPage from '@/pages/admin/AdminStudentDetailPage'
import AdminDisciplineContentPage from '@/pages/admin/AdminDisciplineContentPage'
import { useAdminStore } from '@/store/useAdminStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

function StudentGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStudentAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Login de estudante */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<StudentLoginPage />} />

      {/* App de estudante (protegido) */}
      <Route
        path="/"
        element={
          <StudentGuard>
            <Layout />
          </StudentGuard>
        }
      >
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
        <Route path="usuarios/:id" element={<AdminStudentDetailPage />} />
        <Route path="materias" element={<AdminSubjectsPage />} />
        <Route path="materias/:id" element={<AdminDisciplineContentPage />} />
      </Route>
    </Routes>
  )
}
