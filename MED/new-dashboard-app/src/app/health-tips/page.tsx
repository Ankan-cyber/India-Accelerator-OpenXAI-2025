import HealthTipsPage from '@/components/pages/health-tips'
import ProtectedRoute from '@/components/protected-route'

export default function HealthTips() {
  return (
    <ProtectedRoute>
      <HealthTipsPage />
    </ProtectedRoute>
  )
}