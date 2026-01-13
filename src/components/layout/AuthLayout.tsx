import { useEffect } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Loading } from '@/components/common'

export default function AuthLayout() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/app/dashboard')
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="載入中..." />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          Life Tracker
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        © 2024 Life Tracker. All rights reserved.
      </footer>
    </div>
  )
}
