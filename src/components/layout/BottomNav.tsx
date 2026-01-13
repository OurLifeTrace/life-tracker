import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: '首頁' },
  { path: '/app/calendar', icon: Calendar, label: '日曆' },
  { path: 'add', icon: Plus, label: '新增', isAction: true },
  { path: '/app/stats', icon: BarChart3, label: '統計' },
  { path: '/app/settings', icon: Settings, label: '設定' },
]

export default function BottomNav() {
  const location = useLocation()
  const { openRecordModal } = useUIStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => openRecordModal()}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </motion.button>
            )
          }

          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 py-2"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#6366f1' : '#9ca3af',
                }}
                className="flex flex-col items-center"
              >
                <item.icon className="w-6 h-6" />
                <span className={`text-xs mt-1 ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-12 h-0.5 bg-indigo-500 rounded-full"
                />
              )}
            </NavLink>
          )
        })}
      </div>
      {/* Safe area padding for notched phones */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  )
}
