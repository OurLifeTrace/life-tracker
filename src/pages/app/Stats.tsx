import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts'
import {
  TrendingUp,
  Droplets,
  Moon,
  Dumbbell,
  Flame,
  Utensils,
  Heart,
} from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'
import { RECORD_TYPE_CONFIG } from '@/lib/constants'

const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#06b6d4', '#8b5cf6', '#3b82f6', '#ec4899', '#eab308']

const typeColors: Record<string, string> = {
  meal: '#f59e0b',
  sleep: '#6366f1',
  exercise: '#10b981',
  water: '#06b6d4',
  mood: '#8b5cf6',
  medication: '#3b82f6',
  intimacy: '#ec4899',
  bowel: '#eab308',
}

// Helper for heatmap colors
const getExerciseHeatmapColor = (count: number) => {
  if (count === 0) return 'bg-gray-100'
  if (count === 1) return 'bg-emerald-200'
  if (count === 2) return 'bg-emerald-400'
  return 'bg-emerald-600'
}

const getIntimacyHeatmapColor = (count: number) => {
  if (count === 0) return 'bg-gray-100'
  if (count === 1) return 'bg-pink-200'
  if (count === 2) return 'bg-pink-400'
  return 'bg-pink-600'
}

export default function Stats() {
  const { records, fetchRecords, isLoading } = useRecordStore()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    const start = new Date()

    switch (timeRange) {
      case 'week':
        start.setDate(now.getDate() - 7)
        break
      case 'month':
        start.setMonth(now.getMonth() - 1)
        break
      case 'year':
        start.setFullYear(now.getFullYear() - 1)
        break
    }

    return { start, end: now }
  }, [timeRange])

  // Filter records by date range
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const date = new Date(r.recorded_at)
      return date >= dateRange.start && date <= dateRange.end
    })
  }, [records, dateRange])

  // Records by type (for pie chart)
  const recordsByType = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredRecords.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1
    })
    return Object.entries(counts).map(([type, count]) => ({
      name: RECORD_TYPE_CONFIG[type as keyof typeof RECORD_TYPE_CONFIG]?.label || type,
      value: count,
      type,
    }))
  }, [filteredRecords])

  // Records by day (for bar chart)
  const recordsByDay = useMemo(() => {
    const days: Record<string, number> = {}
    const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

    // Initialize all days
    for (let i = 0; i < 7; i++) {
      days[dayLabels[i]] = 0
    }

    filteredRecords.forEach((r) => {
      const date = new Date(r.recorded_at)
      const day = dayLabels[date.getDay()]
      days[day] = (days[day] || 0) + 1
    })

    return dayLabels.map((day) => ({
      name: day,
      count: days[day],
    }))
  }, [filteredRecords])

  // Water intake trend (for line chart)
  const waterTrend = useMemo(() => {
    const waterRecords = filteredRecords.filter((r) => r.type === 'water')
    const dailyWater: Record<string, number> = {}

    waterRecords.forEach((r) => {
      const date = r.recorded_at.split('T')[0]
      const data = r.data as { amount?: number }
      dailyWater[date] = (dailyWater[date] || 0) + (data.amount || 0)
    })

    return Object.entries(dailyWater)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
        amount,
      }))
  }, [filteredRecords])

  // Sleep quality trend
  const sleepTrend = useMemo(() => {
    const sleepRecords = filteredRecords.filter((r) => r.type === 'sleep')

    return sleepRecords
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .slice(-7)
      .map((r) => {
        const data = r.data as { quality?: number }
        return {
          date: new Date(r.recorded_at).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
          quality: data.quality || 0,
        }
      })
  }, [filteredRecords])

  // Sleep duration trend (past 30 days)
  const sleepDurationTrend = useMemo(() => {
    const sleepRecords = records.filter((r) => r.type === 'sleep')
    console.log('Sleep records:', sleepRecords)
    console.log('Sleep records data:', sleepRecords.map(r => r.data))
    const dailySleep: Record<string, { duration: number; count: number }> = {}

    // Helper to calculate duration from bedtime and wake_time
    const calculateDuration = (bedtime: string, wakeTime: string): number => {
      if (!bedtime || !wakeTime) return 0
      const [bedHour, bedMin] = bedtime.split(':').map(Number)
      const [wakeHour, wakeMin] = wakeTime.split(':').map(Number)

      let bedMinutes = bedHour * 60 + bedMin
      let wakeMinutes = wakeHour * 60 + wakeMin

      // If wake time is earlier than bed time, assume it's the next day
      if (wakeMinutes <= bedMinutes) {
        wakeMinutes += 24 * 60
      }

      return (wakeMinutes - bedMinutes) / 60 // Return hours
    }

    // Get past 30 days
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailySleep[dateStr] = { duration: 0, count: 0 }
    }

    sleepRecords.forEach((r) => {
      const date = r.recorded_at.split('T')[0]
      if (dailySleep.hasOwnProperty(date)) {
        const data = r.data as { bedtime?: string; wake_time?: string }
        if (data.bedtime && data.wake_time) {
          const duration = calculateDuration(data.bedtime, data.wake_time)
          if (duration > 0) {
            dailySleep[date].duration += duration
            dailySleep[date].count += 1
          }
        }
      }
    })

    return Object.entries(dailySleep)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { duration }]) => ({
        date: new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        duration: Math.round(duration * 10) / 10, // Round to 1 decimal
      }))
  }, [records])

  // Meal trend (past 30 days)
  const mealTrend = useMemo(() => {
    const mealRecords = records.filter((r) => r.type === 'meal')
    const dailyMeals: Record<string, number> = {}

    // Get past 30 days
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyMeals[dateStr] = 0
    }

    mealRecords.forEach((r) => {
      const date = r.recorded_at.split('T')[0]
      if (dailyMeals.hasOwnProperty(date)) {
        dailyMeals[date] = (dailyMeals[date] || 0) + 1
      }
    })

    return Object.entries(dailyMeals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        count,
      }))
  }, [records])

  // Exercise daily heatmap (past 30 days)
  const exerciseHeatmap = useMemo(() => {
    const dailyExercise: Record<string, number> = {}

    // Initialize past 30 days
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyExercise[dateStr] = 0
    }

    records.forEach((r) => {
      if (r.type !== 'exercise') return
      const date = r.recorded_at.split('T')[0]
      if (dailyExercise.hasOwnProperty(date)) {
        dailyExercise[date] = (dailyExercise[date] || 0) + 1
      }
    })

    return Object.entries(dailyExercise)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  }, [records])

  // Intimacy daily heatmap (past 30 days)
  const intimacyHeatmap = useMemo(() => {
    const dailyIntimacy: Record<string, number> = {}

    // Initialize past 30 days
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyIntimacy[dateStr] = 0
    }

    records.forEach((r) => {
      if (r.type !== 'intimacy') return
      const date = r.recorded_at.split('T')[0]
      if (dailyIntimacy.hasOwnProperty(date)) {
        dailyIntimacy[date] = (dailyIntimacy[date] || 0) + 1
      }
    })

    return Object.entries(dailyIntimacy)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  }, [records])

  // Calculate streak
  const streak = useMemo(() => {
    const dates = new Set(
      records.map((r) => r.recorded_at.split('T')[0])
    )

    let count = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      if (dates.has(dateStr)) {
        count++
      } else if (i > 0) {
        break
      }
    }

    return count
  }, [records])

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalRecords = filteredRecords.length
    const waterRecords = filteredRecords.filter((r) => r.type === 'water')
    const totalWater = waterRecords.reduce((sum, r) => {
      const data = r.data as { amount?: number }
      return sum + (data.amount || 0)
    }, 0)
    const avgWaterPerDay = waterRecords.length > 0 ? Math.round(totalWater / 7) : 0

    const exerciseRecords = filteredRecords.filter((r) => r.type === 'exercise')
    const totalExercise = exerciseRecords.reduce((sum, r) => {
      const data = r.data as { duration?: number }
      return sum + (data.duration || 0)
    }, 0)

    return { totalRecords, avgWaterPerDay, totalExercise, exerciseCount: exerciseRecords.length }
  }, [filteredRecords])

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">統計分析</h1>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['week', 'month', 'year'] as const).map((range) => (
            <motion.button
              key={range}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              {range === 'week' ? '週' : range === 'month' ? '月' : '年'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-4 text-white"
        >
          <Flame className="w-6 h-6 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{streak}</div>
          <div className="text-sm opacity-80">連續天數</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-4 text-white"
        >
          <Droplets className="w-6 h-6 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{summaryStats.avgWaterPerDay}</div>
          <div className="text-sm opacity-80">平均每日飲水 (ml)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 text-white"
        >
          <Dumbbell className="w-6 h-6 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{summaryStats.totalExercise}</div>
          <div className="text-sm opacity-80">總運動時間 (分)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-4 text-white"
        >
          <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{summaryStats.totalRecords}</div>
          <div className="text-sm opacity-80">總記錄數</div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Records by Type - Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">記錄類型分布</h3>
          {recordsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={recordsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {recordsByType.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={typeColors[entry.type] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} 筆`, '記錄數']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              暫無數據
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {recordsByType.map((entry, index) => (
              <div key={entry.type} className="flex items-center gap-1 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeColors[entry.type] || COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Records by Day - Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">每週記錄分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={recordsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} 筆`, '記錄數']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Water Intake Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-500" />
            飲水趨勢
          </h3>
          {waterTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={waterTrend}>
                <defs>
                  <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value} ml`, '飲水量']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#06b6d4"
                  fill="url(#waterGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              暫無飲水記錄
            </div>
          )}
        </motion.div>

        {/* Sleep Quality Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            睡眠品質趨勢
          </h3>
          {sleepTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sleepTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value}/5`, '睡眠品質']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              暫無睡眠記錄
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts Row 3 - Meal Trend (Full Width) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-amber-500" />
          飲食趨勢 (過去30天)
        </h3>
        {mealTrend.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={mealTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} 餐`, '用餐次數']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="count" fill="#fcd34d" radius={[2, 2, 0, 0]} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400">
            暫無飲食記錄
          </div>
        )}
      </motion.div>

      {/* Charts Row 3.5 - Sleep Duration Trend (Full Width) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-500" />
          睡眠時長趨勢 (過去30天)
        </h3>
        {sleepDurationTrend.some(d => d.duration > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={sleepDurationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={[0, 12]}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                formatter={(value) => [`${value} 小時`, '睡眠時長']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="duration" fill="#a5b4fc" radius={[2, 2, 0, 0]} />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400">
            暫無睡眠記錄
          </div>
        )}
      </motion.div>

      {/* Charts Row 4 - Exercise & Intimacy Heatmaps */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Exercise Frequency Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-500" />
            運動頻率 (過去30天)
          </h3>
          <div className="space-y-2">
            {/* Date labels */}
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>{exerciseHeatmap[0]?.date ? new Date(exerciseHeatmap[0].date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }) : ''}</span>
              <span>今天</span>
            </div>
            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {exerciseHeatmap.map(({ date, count }) => (
                <div
                  key={date}
                  className={`flex-1 h-8 rounded-sm ${getExerciseHeatmapColor(count)} transition-colors cursor-default group relative`}
                  title={`${new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}: ${count} 次運動`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}: {count} 次
                  </div>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">少</span>
              <div className="w-4 h-4 rounded-sm bg-gray-100" />
              <div className="w-4 h-4 rounded-sm bg-emerald-200" />
              <div className="w-4 h-4 rounded-sm bg-emerald-400" />
              <div className="w-4 h-4 rounded-sm bg-emerald-600" />
              <span className="text-xs text-gray-400">多</span>
            </div>
            {/* Total count */}
            <div className="text-center text-sm text-gray-500">
              總計: <span className="font-bold text-emerald-600">{exerciseHeatmap.reduce((sum, d) => sum + d.count, 0)}</span> 次運動
            </div>
          </div>
        </motion.div>

        {/* Intimacy Frequency Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            親密頻率 (過去30天)
          </h3>
          <div className="space-y-2">
            {/* Date labels */}
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>{intimacyHeatmap[0]?.date ? new Date(intimacyHeatmap[0].date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }) : ''}</span>
              <span>今天</span>
            </div>
            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {intimacyHeatmap.map(({ date, count }) => (
                <div
                  key={date}
                  className={`flex-1 h-8 rounded-sm ${getIntimacyHeatmapColor(count)} transition-colors cursor-default group relative`}
                  title={`${new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}: ${count} 次`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}: {count} 次
                  </div>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">少</span>
              <div className="w-4 h-4 rounded-sm bg-gray-100" />
              <div className="w-4 h-4 rounded-sm bg-pink-200" />
              <div className="w-4 h-4 rounded-sm bg-pink-400" />
              <div className="w-4 h-4 rounded-sm bg-pink-600" />
              <span className="text-xs text-gray-400">多</span>
            </div>
            {/* Total count */}
            <div className="text-center text-sm text-gray-500">
              總計: <span className="font-bold text-pink-600">{intimacyHeatmap.reduce((sum, d) => sum + d.count, 0)}</span> 次
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
