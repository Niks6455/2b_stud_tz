import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/atoms'
import { useAuth } from '@/features/auth/AuthProvider'
import { saveReturnTo } from '@/features/auth/returnTo'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    const returnTo = `${location.pathname}${location.search}`
    saveReturnTo(returnTo)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: returnTo } }}
      />
    )
  }

  return <Outlet />
}
