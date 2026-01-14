import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Trophy,
  Flame,
  Droplets,
  Moon,
  Dumbbell,
  Utensils,
  Heart,
  Pill,
  Smile,
  Crown,
  Medal,
  Award,
  Star,
  Users,
  Zap,
  CalendarDays,
  TrendingUp,
  CircleDot,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

interface LeaderboardUser {
  id: string
  username: string | null
  avatar_url: string | null
  streak: number
  total_records: number
  rank: number
}

interface UserActivity {
  user: {
    id: string
    username: string | null
    avatar_url: string | null
  }
  dailyRecords: Record<string, number>  // date string -> count
  dailyMeals: Record<string, number>    // date string -> meal count
  dailySleep: Record<string, number>    // date string -> sleep hours
  dailyExercise: Record<string, number> // date string -> exercise count
  dailyIntimacy: Record<string, number> // date string -> intimacy count
  totalRecords: number
}

interface TrendDataPoint {
  date: string
  [userId: string]: number | string  // user id -> value or date
}

interface TrendChartData {
  meal: TrendDataPoint[]
  sleep: TrendDataPoint[]
  exercise: TrendDataPoint[]
  water: TrendDataPoint[]
  intimacy: TrendDataPoint[]
  medication: TrendDataPoint[]
  bowel: TrendDataPoint[]
}

interface TrendUser {
  id: string
  username: string | null
  color: string
}

const categoryConfig = [
  { type: 'all', label: '總記錄', icon: Trophy, color: 'text-amber-500', gradient: 'from-amber-400 via-orange-500 to-red-500', bgLight: 'bg-amber-50' },
  { type: 'streak', label: '連續天數', icon: Flame, color: 'text-orange-500', gradient: 'from-orange-400 via-red-500 to-pink-500', bgLight: 'bg-orange-50' },
  { type: 'meal', label: '飲食達人', icon: Utensils, color: 'text-amber-600', gradient: 'from-amber-400 to-orange-500', bgLight: 'bg-amber-50' },
  { type: 'sleep', label: '睡眠專家', icon: Moon, color: 'text-indigo-500', gradient: 'from-indigo-400 to-purple-500', bgLight: 'bg-indigo-50' },
  { type: 'exercise', label: '運動健將', icon: Dumbbell, color: 'text-emerald-500', gradient: 'from-emerald-400 to-teal-500', bgLight: 'bg-emerald-50' },
  { type: 'water', label: '飲水冠軍', icon: Droplets, color: 'text-cyan-500', gradient: 'from-cyan-400 to-blue-500', bgLight: 'bg-cyan-50' },
  { type: 'mood', label: '心情記錄', icon: Smile, color: 'text-purple-500', gradient: 'from-purple-400 to-pink-500', bgLight: 'bg-purple-50' },
  { type: 'medication', label: '用藥追蹤', icon: Pill, color: 'text-blue-500', gradient: 'from-blue-400 to-indigo-500', bgLight: 'bg-blue-50' },
  { type: 'intimacy', label: '親密行為', icon: Heart, color: 'text-pink-500', gradient: 'from-pink-400 to-rose-500', bgLight: 'bg-pink-50' },
]

const rankIcons = [Crown, Medal, Award]
const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700']

// Colors for multi-user trend charts
const TREND_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4']

export default function Leaderboard() {
  const { user } = useAuthStore()
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardUser[]>>({})
  const [activityData, setActivityData] = useState<UserActivity[]>([])
  const [trendData, setTrendData] = useState<TrendChartData>({
    meal: [],
    sleep: [],
    exercise: [],
    water: [],
    intimacy: [],
    medication: [],
    bowel: [],
  })
  const [trendUsers, setTrendUsers] = useState<TrendUser[]>([])
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalRecords: 0,
    avgRecordsPerUser: 0,
    mostActiveDay: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    setIsLoading(true)
    try {
      // Use the database function to get leaderboard stats (bypasses RLS)
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_leaderboard_stats')

      if (statsError) {
        console.error('Error fetching leaderboard stats:', statsError)
        // Fallback to old method if function doesn't exist
      }

      // Also get current user's own records for comparison
      const { data: recordsData } = await supabase
        .from('records')
        .select('user_id, type, recorded_at')

      const { data: usersData } = await supabase
        .from('users')
        .select('id, username, avatar_url, settings')

      // Build user map from stats data if available, otherwise use usersData
      let publicUsers: Array<{ id: string; username: string | null; avatar_url: string | null; settings?: any }> = []
      let userRecordsMap: Map<string, Array<{ type: string; recorded_at: string }>> = new Map()

      if (statsData && statsData.length > 0) {
        // Use stats data from function
        const userIds = new Set<string>()
        statsData.forEach((row: any) => {
          if (row.user_id && !userIds.has(row.user_id)) {
            userIds.add(row.user_id)
            publicUsers.push({
              id: row.user_id,
              username: row.username,
              avatar_url: row.avatar_url,
            })
          }
          // Build records from stats
          if (row.user_id && row.record_type) {
            if (!userRecordsMap.has(row.user_id)) {
              userRecordsMap.set(row.user_id, [])
            }
            // Add fake records based on dates
            if (row.record_dates) {
              row.record_dates.forEach((date: string) => {
                userRecordsMap.get(row.user_id)!.push({
                  type: row.record_type,
                  recorded_at: date,
                })
              })
            }
          }
        })
      } else if (usersData) {
        // Fallback to old method
        publicUsers = usersData.filter(u =>
          u.settings?.show_in_leaderboard !== false
        )
      }

      if (publicUsers.length === 0 && (!recordsData || recordsData.length === 0)) {
        setIsLoading(false)
        return
      }

      const userMap = new Map(publicUsers.map(u => [u.id, u]))

      // Merge own records if not in stats
      if (recordsData) {
        recordsData.forEach(record => {
          if (!userRecordsMap.has(record.user_id)) {
            userRecordsMap.set(record.user_id, [])
          }
          // Check if this record is already counted
          const existingRecords = userRecordsMap.get(record.user_id)!
          const dateStr = record.recorded_at.split('T')[0]
          const exists = existingRecords.some(r =>
            r.type === record.type && r.recorded_at === dateStr
          )
          if (!exists) {
            userRecordsMap.get(record.user_id)!.push({
              type: record.type,
              recorded_at: dateStr,
            })
          }
        })
      }

      // Convert to array format for processing
      const allRecords: Array<{ user_id: string; type: string; recorded_at: string }> = []
      userRecordsMap.forEach((records, odl_user_id) => {
        records.forEach(r => {
          allRecords.push({ user_id: odl_user_id, type: r.type, recorded_at: r.recorded_at })
        })
      })

      const userStats: Record<string, Record<string, number>> = {}
      const userRecordDates: Record<string, Set<string>> = {}

      // Use allRecords which combines stats data and own records
      allRecords.forEach(record => {
        // Add user to map if not exists (from stats data)
        if (!userMap.has(record.user_id)) {
          const existingUser = publicUsers.find(u => u.id === record.user_id)
          if (existingUser) {
            userMap.set(record.user_id, existingUser)
          } else {
            return
          }
        }

        if (!userStats[record.user_id]) {
          userStats[record.user_id] = { all: 0 }
          userRecordDates[record.user_id] = new Set()
        }

        userStats[record.user_id].all = (userStats[record.user_id].all || 0) + 1
        userStats[record.user_id][record.type] = (userStats[record.user_id][record.type] || 0) + 1
        userRecordDates[record.user_id].add(record.recorded_at.split('T')[0])
      })

      const calculateStreak = (dates: Set<string>) => {
        if (dates.size === 0) return 0
        let streak = 0
        const today = new Date()

        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today)
          checkDate.setDate(checkDate.getDate() - i)
          const dateStr = checkDate.toISOString().split('T')[0]

          if (dates.has(dateStr)) {
            streak++
          } else if (i > 0) {
            break
          }
        }
        return streak
      }

      const leaderboards: Record<string, LeaderboardUser[]> = {}

      categoryConfig.forEach(cat => {
        const users = Object.entries(userStats).map(([userId, stats]) => {
          const userData = userMap.get(userId)
          let value = 0

          if (cat.type === 'streak') {
            value = calculateStreak(userRecordDates[userId] || new Set())
          } else if (cat.type === 'all') {
            value = stats.all || 0
          } else {
            value = stats[cat.type] || 0
          }

          return {
            id: userId,
            username: userData?.username || null,
            avatar_url: userData?.avatar_url || null,
            streak: calculateStreak(userRecordDates[userId] || new Set()),
            total_records: value,
            rank: 0,
          }
        })
        .filter(u => u.total_records > 0)
        .sort((a, b) => b.total_records - a.total_records)
        .slice(0, 5)
        .map((u, index) => ({ ...u, rank: index + 1 }))

        leaderboards[cat.type] = users
      })

      setLeaderboardData(leaderboards)

      const totalRecords = allRecords.length
      const totalUsers = publicUsers.length

      const dayCounts: Record<string, number> = {}
      const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      allRecords.forEach(r => {
        const dayIndex = new Date(r.recorded_at).getDay()
        const day = weekdayNames[dayIndex]
        dayCounts[day] = (dayCounts[day] || 0) + 1
      })
      const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

      setGlobalStats({
        totalUsers,
        totalRecords,
        avgRecordsPerUser: totalUsers > 0 ? Math.round(totalRecords / totalUsers) : 0,
        mostActiveDay,
      })

      if (user) {
        const allLeaderboard = leaderboards['all'] || []
        const userEntry = allLeaderboard.find(u => u.id === user.id)
        setUserRank(userEntry?.rank || null)
      }

      // Build activity data for top 5 users (past 30 days)
      const top5Users = leaderboards['all']?.slice(0, 5) || []
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const activityList: UserActivity[] = top5Users.map(topUser => {
        const userData = userMap.get(topUser.id)
        const dailyRecords: Record<string, number> = {}
        const dailyMeals: Record<string, number> = {}
        const dailySleep: Record<string, number> = {}
        const dailyExercise: Record<string, number> = {}
        const dailyIntimacy: Record<string, number> = {}

        // Initialize all days with 0
        for (let i = 0; i <= 30; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          dailyRecords[dateStr] = 0
          dailyMeals[dateStr] = 0
          dailySleep[dateStr] = 0
          dailyExercise[dateStr] = 0
          dailyIntimacy[dateStr] = 0
        }

        // Count records per day for this user by type
        allRecords.forEach(record => {
          if (record.user_id === topUser.id) {
            const dateStr = record.recorded_at.split('T')[0]
            if (dailyRecords.hasOwnProperty(dateStr)) {
              dailyRecords[dateStr] = (dailyRecords[dateStr] || 0) + 1

              // Count by type
              if (record.type === 'meal') {
                dailyMeals[dateStr] = (dailyMeals[dateStr] || 0) + 1
              } else if (record.type === 'sleep') {
                // For sleep, we could track duration but for simplicity count records
                dailySleep[dateStr] = (dailySleep[dateStr] || 0) + 1
              } else if (record.type === 'exercise') {
                dailyExercise[dateStr] = (dailyExercise[dateStr] || 0) + 1
              } else if (record.type === 'intimacy') {
                dailyIntimacy[dateStr] = (dailyIntimacy[dateStr] || 0) + 1
              }
            }
          }
        })

        return {
          user: {
            id: topUser.id,
            username: userData?.username || null,
            avatar_url: userData?.avatar_url || null,
          },
          dailyRecords,
          dailyMeals,
          dailySleep,
          dailyExercise,
          dailyIntimacy,
          totalRecords: topUser.total_records,
        }
      })

      setActivityData(activityList)

      // Build trend data for top 5 users (past 30 days)
      const trendUserList: TrendUser[] = top5Users.map((u, index) => ({
        id: u.id,
        username: userMap.get(u.id)?.username || null,
        color: TREND_COLORS[index % TREND_COLORS.length],
      }))
      setTrendUsers(trendUserList)

      // Initialize date arrays for past 30 days
      const getLast30Days = () => {
        const days: string[] = []
        for (let i = 29; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          days.push(date.toISOString().split('T')[0])
        }
        return days
      }
      const last30Days = getLast30Days()

      // Helper to initialize trend data structure
      const initTrendData = (): TrendDataPoint[] => {
        return last30Days.map(date => {
          const point: TrendDataPoint = {
            date: new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
          }
          top5Users.forEach(u => {
            point[u.id] = 0
          })
          return point
        })
      }

      // Calculate trend data for each type
      const mealTrend = initTrendData()
      const sleepTrend = initTrendData()
      const exerciseTrend = initTrendData()
      const waterTrend = initTrendData()
      const intimacyTrend = initTrendData()
      const medicationTrend = initTrendData()
      const bowelTrend = initTrendData()

      allRecords.forEach(record => {
        const userId = record.user_id
        if (!top5Users.find(u => u.id === userId)) return

        const dateStr = record.recorded_at.split('T')[0]
        const dayIndex = last30Days.indexOf(dateStr)
        if (dayIndex === -1) return

        switch (record.type) {
          case 'meal':
            mealTrend[dayIndex][userId] = ((mealTrend[dayIndex][userId] as number) || 0) + 1
            break
          case 'sleep':
            sleepTrend[dayIndex][userId] = ((sleepTrend[dayIndex][userId] as number) || 0) + 1
            break
          case 'exercise':
            exerciseTrend[dayIndex][userId] = ((exerciseTrend[dayIndex][userId] as number) || 0) + 1
            break
          case 'water':
            waterTrend[dayIndex][userId] = ((waterTrend[dayIndex][userId] as number) || 0) + 1
            break
          case 'intimacy':
            intimacyTrend[dayIndex][userId] = ((intimacyTrend[dayIndex][userId] as number) || 0) + 1
            break
          case 'medication':
            medicationTrend[dayIndex][userId] = ((medicationTrend[dayIndex][userId] as number) || 0) + 1
            break
          case 'bowel':
            bowelTrend[dayIndex][userId] = ((bowelTrend[dayIndex][userId] as number) || 0) + 1
            break
        }
      })

      setTrendData({
        meal: mealTrend,
        sleep: sleepTrend,
        exercise: exerciseTrend,
        water: waterTrend,
        intimacy: intimacyTrend,
        medication: medicationTrend,
        bowel: bowelTrend,
      })

    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
    setIsLoading(false)
  }

  // Generate array of dates for past 31 days (including today)
  const getLast31Days = () => {
    const days: string[] = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  // Get activity level color (green scale)
  const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    if (count <= 2) return 'bg-emerald-200'
    if (count <= 5) return 'bg-emerald-400'
    return 'bg-emerald-600'
  }

  // Get meal compliance color (3 meals = green, less = red, more = yellow)
  const getMealColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    if (count < 3) return count === 1 ? 'bg-red-300' : 'bg-red-400'
    if (count === 3) return 'bg-emerald-500'
    return count === 4 ? 'bg-yellow-400' : 'bg-yellow-500'
  }

  // Get sleep compliance color (1 record = good)
  const getSleepColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    return 'bg-indigo-500'
  }

  // Get exercise color (green scale)
  const getExerciseColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    if (count === 1) return 'bg-emerald-300'
    if (count === 2) return 'bg-emerald-500'
    return 'bg-emerald-700'
  }

  // Get intimacy color (pink scale)
  const getIntimacyColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    if (count === 1) return 'bg-pink-300'
    if (count === 2) return 'bg-pink-500'
    return 'bg-pink-700'
  }

  // Single Heatmap Card Component
  const HeatmapCard = ({
    title,
    icon: Icon,
    gradient,
    dataKey,
    colorFn,
    legendItems,
    tooltipSuffix,
  }: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
    dataKey: 'dailyRecords' | 'dailyMeals' | 'dailySleep' | 'dailyExercise' | 'dailyIntimacy'
    colorFn: (count: number) => string
    legendItems: { color: string; label: string }[]
    tooltipSuffix: string
  }) => {
    const days = getLast31Days()
    const today = new Date()
    const monthStart = new Date(today)
    monthStart.setDate(today.getDate() - 30)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${gradient} p-3 text-white`}>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
        </div>

        <div className="p-3">
          {activityData.length === 0 ? (
            <div className="py-4 text-center text-gray-400 text-sm">
              暫無數據
            </div>
          ) : (
            <div className="space-y-2">
              {/* Date labels */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <div className="w-24 shrink-0" />
                <div className="flex-1 flex justify-between px-1">
                  <span>{monthStart.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}</span>
                  <span>今天</span>
                </div>
              </div>

              {/* User rows */}
              {activityData.map((activity) => (
                <div key={activity.user.id} className="flex items-center gap-2">
                  <div className="w-24 shrink-0 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {activity.user.avatar_url ? (
                        <img src={activity.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        activity.user.username?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <span className="text-xs text-gray-700 truncate font-medium">
                      {activity.user.username || '匿名'}
                    </span>
                  </div>
                  <div className="flex-1 flex gap-[2px]">
                    {days.map((day) => {
                      const count = activity[dataKey][day] || 0
                      return (
                        <div
                          key={day}
                          className={`flex-1 h-5 rounded-sm ${colorFn(count)} cursor-default group relative`}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {new Date(day).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}: {count}{tooltipSuffix}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                {legendItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-sm ${item.color}`} />
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Activity Calendar Section with 5 heatmaps
  const ActivityCalendars = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <CalendarDays className="w-6 h-6 text-emerald-500" />
        本月活躍度分析 (Top 5)
      </h2>
      <div className="space-y-4">
        <HeatmapCard
          title="本月記錄活躍度"
          icon={CalendarDays}
          gradient="from-emerald-500 to-teal-500"
          dataKey="dailyRecords"
          colorFn={getActivityColor}
          legendItems={[
            { color: 'bg-gray-100', label: '0' },
            { color: 'bg-emerald-200', label: '1-2' },
            { color: 'bg-emerald-400', label: '3-5' },
            { color: 'bg-emerald-600', label: '6+' },
          ]}
          tooltipSuffix=" 筆"
        />
        <HeatmapCard
          title="本月飲食達標度"
          icon={Utensils}
          gradient="from-amber-400 to-orange-500"
          dataKey="dailyMeals"
          colorFn={getMealColor}
          legendItems={[
            { color: 'bg-gray-100', label: '無' },
            { color: 'bg-red-400', label: '<3餐' },
            { color: 'bg-emerald-500', label: '3餐' },
            { color: 'bg-yellow-400', label: '>3餐' },
          ]}
          tooltipSuffix=" 餐"
        />
        <HeatmapCard
          title="本月睡眠記錄"
          icon={Moon}
          gradient="from-indigo-400 to-purple-500"
          dataKey="dailySleep"
          colorFn={getSleepColor}
          legendItems={[
            { color: 'bg-gray-100', label: '無記錄' },
            { color: 'bg-indigo-500', label: '有記錄' },
          ]}
          tooltipSuffix=" 筆"
        />
        <HeatmapCard
          title="本月運動活躍度"
          icon={Dumbbell}
          gradient="from-emerald-400 to-teal-500"
          dataKey="dailyExercise"
          colorFn={getExerciseColor}
          legendItems={[
            { color: 'bg-gray-100', label: '0' },
            { color: 'bg-emerald-300', label: '1' },
            { color: 'bg-emerald-500', label: '2' },
            { color: 'bg-emerald-700', label: '3+' },
          ]}
          tooltipSuffix=" 次"
        />
        <HeatmapCard
          title="本月親密活躍度"
          icon={Heart}
          gradient="from-pink-400 to-rose-500"
          dataKey="dailyIntimacy"
          colorFn={getIntimacyColor}
          legendItems={[
            { color: 'bg-gray-100', label: '0' },
            { color: 'bg-pink-300', label: '1' },
            { color: 'bg-pink-500', label: '2' },
            { color: 'bg-pink-700', label: '3+' },
          ]}
          tooltipSuffix=" 次"
        />
      </div>
    </div>
  )

  // Multi-user Trend Chart Component
  const TrendChart = ({
    title,
    icon: Icon,
    gradient,
    data,
    yAxisLabel,
    chartType = 'line',
  }: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
    data: TrendDataPoint[]
    yAxisLabel: string
    chartType?: 'line' | 'bar'
  }) => {
    const hasData = data.some(d =>
      trendUsers.some(u => (d[u.id] as number) > 0)
    )

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-white/80 text-xs">過去30天趨勢</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {!hasData ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Icon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暫無數據</p>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                {chartType === 'bar' ? (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      interval={6}
                    />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      formatter={(value, name) => {
                        const trendUser = trendUsers.find(u => u.id === name)
                        return [value ?? 0, trendUser?.username || '匿名']
                      }}
                      labelFormatter={(label) => `日期: ${label}`}
                    />
                    {trendUsers.map((trendUser) => (
                      <Bar
                        key={trendUser.id}
                        dataKey={trendUser.id}
                        fill={trendUser.color}
                        name={trendUser.id}
                        radius={[2, 2, 0, 0]}
                      />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      interval={6}
                    />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      formatter={(value, name) => {
                        const trendUser = trendUsers.find(u => u.id === name)
                        return [value ?? 0, trendUser?.username || '匿名']
                      }}
                      labelFormatter={(label) => `日期: ${label}`}
                    />
                    {trendUsers.map((trendUser) => (
                      <Line
                        key={trendUser.id}
                        type="monotone"
                        dataKey={trendUser.id}
                        stroke={trendUser.color}
                        strokeWidth={2}
                        dot={false}
                        name={trendUser.id}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                {trendUsers.map((trendUser) => (
                  <div key={trendUser.id} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: trendUser.color }}
                    />
                    <span className="text-gray-600">{trendUser.username || '匿名'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    )
  }

  // Component for mini leaderboard card
  const LeaderboardCard = ({ config, data }: { config: typeof categoryConfig[0], data: LeaderboardUser[] }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <config.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{config.label}</h3>
            <p className="text-white/80 text-sm">Top 5 排行</p>
          </div>
        </div>
      </div>

      {/* Card Content */}
      {data.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          <config.icon className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">暫無數據</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {data.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                entry.id === user?.id ? 'bg-indigo-50/50' : ''
              }`}
            >
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-gradient-to-br from-amber-100 to-yellow-100' :
                index === 1 ? 'bg-gradient-to-br from-gray-100 to-slate-100' :
                index === 2 ? 'bg-gradient-to-br from-amber-50 to-orange-50' :
                'bg-gray-100'
              }`}>
                {index < 3 ? (
                  React.createElement(rankIcons[index], { className: `w-4 h-4 ${rankColors[index]}` })
                ) : (
                  <span className="text-gray-500">{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden`}>
                {entry.avatar_url ? (
                  <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  entry.username?.[0]?.toUpperCase() || '?'
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate flex items-center gap-1">
                  {entry.username || '匿名用戶'}
                  {entry.id === user?.id && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">你</span>
                  )}
                </p>
              </div>

              {/* Score */}
              <div className={`text-right font-bold ${config.color}`}>
                {entry.total_records}
                <span className="text-xs text-gray-400 font-normal ml-1">
                  {config.type === 'streak' ? '天' : '次'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative px-4 py-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{globalStats.totalUsers} 位用戶參與</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            <Trophy className="inline w-8 h-8 mr-2 text-yellow-300" />
            社群排行榜
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-md mx-auto mb-6"
          >
            與其他用戶一起追蹤生活，互相激勵成長
          </motion.p>

          {/* Global Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <div className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-xl font-bold">{globalStats.totalRecords.toLocaleString()}</div>
              <div className="text-xs text-white/70">總記錄數</div>
            </div>
            <div className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-xl font-bold">{globalStats.mostActiveDay}</div>
              <div className="text-xs text-white/70">最活躍</div>
            </div>
            {userRank && (
              <div className="px-5 py-2 bg-yellow-400/20 backdrop-blur-sm rounded-xl border border-yellow-400/30">
                <div className="text-xl font-bold flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-300" />
                  #{userRank}
                </div>
                <div className="text-xs text-white/70">你的排名</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500">載入排行榜...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Rankings - Total & Streak */}
            <div className="grid md:grid-cols-2 gap-4">
              <LeaderboardCard config={categoryConfig[0]} data={leaderboardData['all'] || []} />
              <LeaderboardCard config={categoryConfig[1]} data={leaderboardData['streak'] || []} />
            </div>

            {/* Activity Heatmaps (5 categories) */}
            <ActivityCalendars />

            {/* Multi-User Trend Charts Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
                多人趨勢對比 (Top 5)
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TrendChart
                  title="飲食趨勢"
                  icon={Utensils}
                  gradient="from-amber-400 to-orange-500"
                  data={trendData.meal}
                  yAxisLabel="次"
                />
                <TrendChart
                  title="睡眠記錄趨勢"
                  icon={Moon}
                  gradient="from-indigo-400 to-purple-500"
                  data={trendData.sleep}
                  yAxisLabel="次"
                />
                <TrendChart
                  title="運動頻率趨勢"
                  icon={Dumbbell}
                  gradient="from-emerald-400 to-teal-500"
                  data={trendData.exercise}
                  yAxisLabel="次"
                />
                <TrendChart
                  title="親密趨勢"
                  icon={Heart}
                  gradient="from-pink-400 to-rose-500"
                  data={trendData.intimacy}
                  yAxisLabel="次"
                />
                <TrendChart
                  title="藥物趨勢"
                  icon={Pill}
                  gradient="from-blue-400 to-indigo-500"
                  data={trendData.medication}
                  yAxisLabel="次"
                />
                <TrendChart
                  title="排便趨勢"
                  icon={CircleDot}
                  gradient="from-amber-500 to-yellow-600"
                  data={trendData.bowel}
                  yAxisLabel="次"
                />
                <TrendChart
                  title="飲水趨勢"
                  icon={Droplets}
                  gradient="from-cyan-400 to-blue-500"
                  data={trendData.water}
                  yAxisLabel="次"
                />
              </div>
            </div>

            {/* Category Rankings */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-500" />
                各類別排行榜
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryConfig.slice(2).filter(c => c.type !== 'mood').map((config, index) => (
                  <motion.div
                    key={config.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <LeaderboardCard config={config} data={leaderboardData[config.type] || []} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Motivation Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <Zap className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
                <h3 className="text-xl font-bold mb-2">持續記錄，挑戰自我！</h3>
                <p className="text-white/80 text-sm mb-4">
                  每天記錄一點，累積驚人進步
                </p>
                <Link to="/app/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg"
                  >
                    開始記錄
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
