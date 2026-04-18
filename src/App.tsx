import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import StudyPage from '@/pages/StudyPage'
import ExamSchedulePage from '@/pages/ExamSchedulePage'
import CreatePlanPage from '@/pages/CreatePlanPage'
import PlanViewPage from '@/pages/PlanViewPage'
import StudyDayPage from '@/pages/StudyDayPage'
import LibraryPage from '@/pages/LibraryPage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import ProfilePage from '@/pages/ProfilePage'
import BooksPage from '@/pages/BooksPage'
import FeedPage from '@/pages/FeedPage'
import FriendsPage from '@/pages/FriendsPage'
import StudentLoginPage from '@/pages/StudentLoginPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminSubjectsPage from '@/pages/admin/AdminSubjectsPage'
import AdminStudentDetailPage from '@/pages/admin/AdminStudentDetailPage'
import AdminDisciplineContentPage from '@/pages/admin/AdminDisciplineContentPage'
import AdminLearningsPage from '@/pages/admin/AdminLearningsPage'
import AdminActivityLogPage from '@/pages/admin/AdminActivityLogPage'
import ConvitePage from '@/pages/ConvitePage'
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
      {/* Página inicial pública */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<StudentLoginPage />} />
      <Route path="/registar" element={<StudentLoginPage />} />
      <Route path="/convite/:codigo" element={<ConvitePage />} />

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
        <Route path="criar-plano" element={<CreatePlanPage />} />
        <Route path="plano/:id" element={<PlanViewPage />} />
        <Route path="plano/:id/dia/:dia" element={<StudyDayPage />} />
        <Route path="biblioteca" element={<LibraryPage />} />
        <Route path="amigos" element={<FriendsPage />} />
        <Route path="leituras" element={<BooksPage />} />
        <Route path="feed" element={<FeedPage />} />
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
        <Route path="aprendizados" element={<AdminLearningsPage />} />
        <Route path="log" element={<AdminActivityLogPage />} />
      </Route>
    </Routes>
  )
}
