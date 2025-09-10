import Dashboard from '@/components/pages/dashboard'
import ProtectedRoute from '@/components/protected-route'

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}