import { Link } from 'react-router-dom'
import { Menu, Plus, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

export default function Header() {
  const { user, isAuthenticated } = useAuthStore()
  const { toggleSidebar, openRecordModal } = useUIStore()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="text-xl font-bold text-indigo-600">
            Life Tracker
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => openRecordModal()}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">新增記錄</span>
              </button>
              <Link
                to="/app/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>
            </>
          ) : (
            <Link
              to="/auth/login"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              登入
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
