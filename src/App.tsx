import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import StudyPage from '@/pages/StudyPage'
import ExamSchedulePage from '@/pages/ExamSchedulePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import ProfilePage from '@/pages/ProfilePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="study/:disciplineId" element={<StudyPage />} />
        <Route path="exames" element={<ExamSchedulePage />} />
        <Route path="ranking" element={<LeaderboardPage />} />
        <Route path="perfil" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
