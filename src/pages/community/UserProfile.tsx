import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Flame,
  Calendar,
  Trophy,
  TrendingUp,
  Utensils,
  Moon,
  Dumbbell,
  Droplets,
  Smile,
  Pill,
  Heart,
  Lock,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { supabase } from '@/lib/supabase'

interface UserProfileData {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  settings: {
    public_profile?: boolean
    show_in_leaderboard?: boolean
  }
}

interface UserStats {
  totalRecords: number
  streak: number
  recordsByType: { type: string; count: number }[]
  weeklyActivity: { date: string; count: number }[]
  joinedDays: number
}

const typeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; textClass: string }> = {
  meal: { label: '飲食', icon: Utensils, color: '#f59e0b', textClass: 'text-amber-500' },
  sleep: { label: '睡眠', icon: Moon, color: '#6366f1', textClass: 'text-indigo-500' },
  exercise: { label: '運動', icon: Dumbbell, color: '#10b981', textClass: 'text-emerald-500' },
  water: { label: '飲水', icon: Droplets, color: '#06b6d4', textClass: 'text-cyan-500' },
  mood: { label: '心情', icon: Smile, color: '#8b5cf6', textClass: 'text-purple-500' },
  medication: { label: '藥物', icon: Pill, color: '#3b82f6', textClass: 'text-blue-500' },
  intimacy: { label: '親密', icon: Heart, color: '#ec4899', textClass: 'text-pink-500' },
  bowel: { label: '排便', icon: BarChart3, color: '#eab308', textClass: 'text-yellow-500' },
}

export default function UserProfile() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<UserProfileData | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (username) {
      fetchUserProfile()
    }
  }, [username])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (userError || !userData) {
        setError('找不到此用戶')
        setIsLoading(false)
        return
      }

      // Check if profile is public
      if (userData.settings?.public_profile === false) {
        setError('此用戶的個人檔案為私密')
        setUser(userData)
        setIsLoading(false)
        return
      }

      setUser(userData)

      // Fetch user's records (only if show_in_leaderboard is true)
      if (userData.settings?.show_in_leaderboard !== false) {
        const { data: recordsData } = await supabase
          .from('records')
          .select('type, recorded_at')
          .eq('user_id', userData.id)

        if (recordsData) {
          // Calculate stats
          const recordDates = new Set(recordsData.map(r => r.recorded_at.split('T')[0]))

          // Calculate streak
          let streak = 0
          const today = new Date()
          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today)
            checkDate.setDate(checkDate.getDate() - i)
            const dateStr = checkDate.toISOString().split('T')[0]
            if (recordDates.has(dateStr)) {
              streak++
            } else if (i > 0) {
              break
            }
          }

          // Records by type
          const typeCounts: Record<string, number> = {}
          recordsData.forEach(r => {
            typeCounts[r.type] = (typeCounts[r.type] || 0) + 1
          })
          const recordsByType = Object.entries(typeCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)

          // Weekly activity (last 4 weeks)
          const weeklyActivity: { date: string; count: number }[] = []
          for (let i = 27; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const count = recordsData.filter(r => r.recorded_at.startsWith(dateStr)).length
            weeklyActivity.push({
              date: date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
              count,
            })
          }

          // Days since joined
          const joinedDate = new Date(userData.created_at)
          const joinedDays = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))

          setStats({
            totalRecords: recordsData.length,
            streak,
            recordsByType,
            weeklyActivity,
            joinedDays,
          })
        }
      }
    } catch (err) {
      setError('載入失敗')
      console.error(err)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          <Link to="/community/leaderboard" className="text-indigo-600 hover:underline">
            返回排行榜
          </Link>
        </div>
      </div>
    )
  }

  if (error && user) {
    // Private profile
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-6">
          <Link to="/community/leaderboard" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            返回排行榜
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user.username || '匿名用戶'}</h1>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="bg-white rounded-2xl p-8 text-center">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">此用戶的個人檔案為私密</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/community/leaderboard" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            返回排行榜
          </Link>

          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white/30"
            >
              {user?.username?.[0]?.toUpperCase() || '?'}
            </motion.div>
            <div className="text-white">
              <motion.h1
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold"
              >
                {user?.username || '匿名用戶'}
              </motion.h1>
              {user?.bio && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 mt-1"
                >
                  {user.bio}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mt-2 text-sm text-white/70"
              >
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  加入 {stats?.joinedDays || 0} 天
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="px-4 -mt-6 relative z-10">
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 shadow-sm text-center"
            >
              <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-gray-800">{stats.totalRecords}</div>
              <div className="text-xs text-gray-500">總記錄</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm text-center"
            >
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-gray-800">{stats.streak}</div>
              <div className="text-xs text-gray-500">連續天數</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 shadow-sm text-center"
            >
              <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-gray-800">
                {stats.recordsByType.length}
              </div>
              <div className="text-xs text-gray-500">記錄類型</div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Content */}
      {stats && (
        <div className="px-4 py-6 space-y-6">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              近期活動
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={stats.weeklyActivity}>
                <defs>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => [`${value} 筆`, '記錄']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  fill="url(#activityGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Records by Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              記錄分布
            </h3>

            <div className="flex gap-4">
              {/* Pie Chart */}
              <div className="w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.recordsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
                      dataKey="count"
                    >
                      {stats.recordsByType.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={typeConfig[entry.type]?.color || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {stats.recordsByType.slice(0, 5).map((item, index) => {
                  const config = typeConfig[item.type]
                  const Icon = config?.icon || BarChart3
                  const percentage = Math.round((item.count / stats.totalRecords) * 100)

                  return (
                    <motion.div
                      key={item.type}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${config?.color}20` }}
                      >
                        <Icon className={`w-4 h-4 ${config?.textClass || 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {config?.label || item.type}
                          </span>
                          <span className="text-sm text-gray-500">{item.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: config?.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Achievements / Badges could go here */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white text-center"
          >
            <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
            <h3 className="font-bold text-lg mb-1">持續進步中！</h3>
            <p className="text-white/80 text-sm">
              {user?.username || '這位用戶'} 正在用心記錄生活
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
