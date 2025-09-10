import ProgressPage from '@/components/pages/progress'
import ProtectedRoute from '@/components/protected-route'

export default function Progress() {
  return (
    <ProtectedRoute>
      <ProgressPage />
    </ProtectedRoute>
  )
}