import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  List,
  BarChart3,
  Settings,
  Trophy,
  X,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

const navItems = [
  { path: '/app/dashboard', label: '儀表板', icon: LayoutDashboard },
  { path: '/app/calendar', label: '日曆', icon: Calendar },
  { path: '/app/records', label: '記錄', icon: List },
  { path: '/app/stats', label: '統計', icon: BarChart3 },
  { path: '/community/leaderboard', label: '排行榜', icon: Trophy },
  { path: '/app/settings', label: '設定', icon: Settings },
]

export default function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useUIStore()

  const SidebarContent = () => (
    <nav className="p-4">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-gray-100 md:bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 md:hidden"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
                <span className="text-xl font-bold text-indigo-600">
                  Life Tracker
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
