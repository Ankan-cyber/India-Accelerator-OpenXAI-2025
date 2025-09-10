import SchedulePage from '@/components/pages/schedule'
import ProtectedRoute from '@/components/protected-route'

export default function Schedule() {
  return (
    <ProtectedRoute>
      <SchedulePage />
    </ProtectedRoute>
  )
}