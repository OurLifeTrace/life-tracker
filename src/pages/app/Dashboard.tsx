import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Flame,
  Moon,
  Utensils,
  Dumbbell,
  Droplets,
  Heart,
  Pill,
  Smile,
  TrendingUp,
  Calendar,
  ChevronRight,
  CircleDot,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRecordStore } from '@/stores/recordStore'
import { useUIStore } from '@/stores/uiStore'
import { RECORD_TYPE_CONFIG } from '@/lib/constants'

// Order: 飲食、睡眠、運動、親密、心情、藥物、排便、飲水
const quickActions = [
  { type: 'meal', icon: Utensils, label: '飲食', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
  { type: 'sleep', icon: Moon, label: '睡眠', color: 'from-indigo-400 to-purple-500', bg: 'bg-indigo-50' },
  { type: 'exercise', icon: Dumbbell, label: '運動', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50' },
  { type: 'intimacy', icon: Heart, label: '親密', color: 'from-pink-400 to-rose-500', bg: 'bg-pink-50' },
  { type: 'mood', icon: Smile, label: '心情', color: 'from-purple-400 to-pink-500', bg: 'bg-purple-50' },
  { type: 'medication', icon: Pill, label: '藥物', color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50' },
  { type: 'bowel', icon: CircleDot, label: '排便', color: 'from-amber-600 to-yellow-700', bg: 'bg-amber-100' },
  { type: 'water', icon: Droplets, label: '飲水', color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { records, fetchRecords, isLoading } = useRecordStore()
  const { openRecordModal } = useUIStore()

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: '早安', emoji: '🌅' }
    if (hour < 18) return { text: '午安', emoji: '☀️' }
    return { text: '晚安', emoji: '🌙' }
  }

  const greeting = getGreeting()
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter((r) => r.recorded_at.startsWith(today))

  // Calculate streak (simplified for now)
  const streakDays = 7 // This would come from the database

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-6"
    >
      {/* Welcome Header */}
      <motion.div
        variants={item}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {greeting.emoji} {greeting.text}，{user?.username || '用戶'}！
              </h1>
              <p className="text-white/80">
                {new Date().toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openRecordModal()}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Stats Row */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{streakDays}</div>
                <div className="text-xs text-white/70">連續天數</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{todayRecords.length}</div>
                <div className="text-xs text-white/70">今日記錄</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">快速記錄</h2>
          <button className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openRecordModal(action.type)}
              className={`${action.bg} p-4 rounded-2xl flex flex-col items-center gap-2 transition-shadow hover:shadow-md`}
            >
              <div className={`p-2 bg-gradient-to-br ${action.color} rounded-xl shadow-sm`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Today's Records */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            今日記錄
          </h2>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : todayRecords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">今天還沒有任何記錄</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openRecordModal()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              新增第一筆記錄
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {todayRecords.map((record, index) => {
              const config = RECORD_TYPE_CONFIG[record.type as keyof typeof RECORD_TYPE_CONFIG]
              const action = quickActions.find(a => a.type === record.type)

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className={`p-3 bg-gradient-to-br ${action?.color || 'from-gray-400 to-gray-500'} rounded-xl shadow-sm`}>
                    {action?.icon ? <action.icon className="w-5 h-5 text-white" /> : <span className="text-xl">{config?.icon}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {config?.label || record.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.recorded_at).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
