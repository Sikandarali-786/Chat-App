import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Redirects logged-in users away from auth pages
export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  return <Outlet />
}
