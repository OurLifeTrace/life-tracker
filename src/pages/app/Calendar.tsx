import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Utensils,
  Moon,
  Dumbbell,
  Droplets,
  Heart,
  Pill,
  Smile,
} from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'
import { useUIStore } from '@/stores/uiStore'
import { RECORD_TYPE_CONFIG } from '@/lib/constants'

const recordIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  meal: Utensils,
  sleep: Moon,
  exercise: Dumbbell,
  water: Droplets,
  mood: Smile,
  medication: Pill,
  intimacy: Heart,
}

const recordColors: Record<string, string> = {
  meal: 'bg-amber-400',
  sleep: 'bg-indigo-400',
  exercise: 'bg-emerald-400',
  water: 'bg-cyan-400',
  mood: 'bg-purple-400',
  medication: 'bg-blue-400',
  intimacy: 'bg-pink-400',
  bowel: 'bg-yellow-500',
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function Calendar() {
  const { records, fetchRecords, isLoading } = useRecordStore()
  const { openRecordModal, setSelectedDate } = useUIStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const { year, month, daysInMonth, firstDayOfMonth, today } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const today = new Date()
    return { year, month, daysInMonth, firstDayOfMonth, today }
  }, [currentDate])

  const recordsByDate = useMemo(() => {
    const map: Record<string, typeof records> = {}
    records.forEach((record) => {
      const dateKey = record.recorded_at.split('T')[0]
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(record)
    })
    return map
  }, [records])

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDay(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDay(new Date())
  }

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day)
    setSelectedDay(date)
    setSelectedDate(date)
  }

  const handleAddRecord = () => {
    if (selectedDay) {
      setSelectedDate(selectedDay)
    }
    openRecordModal()
  }

  const isToday = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  const isSelected = (day: number) => {
    return (
      selectedDay &&
      selectedDay.getFullYear() === year &&
      selectedDay.getMonth() === month &&
      selectedDay.getDate() === day
    )
  }

  const getDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const selectedDayRecords = selectedDay
    ? recordsByDate[getDateKey(selectedDay.getDate())] || []
    : []

  // Generate calendar grid
  const calendarDays = []
  // Empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">日曆</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddRecord}
          className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Calendar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Month Navigation */}
        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {year} 年 {month + 1} 月
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToToday}
                className="text-sm text-white/80 hover:text-white"
              >
                回到今天
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNextMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={`py-3 text-center text-sm font-medium ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="p-2 min-h-[80px]" />
            }

            const dateKey = getDateKey(day)
            const dayRecords = recordsByDate[dateKey] || []
            const recordTypes = [...new Set(dayRecords.map((r) => r.type))]

            return (
              <motion.button
                key={day}
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDayClick(day)}
                className={`p-2 min-h-[80px] border-b border-r border-gray-100 transition-colors text-left ${
                  isSelected(day)
                    ? 'bg-indigo-50'
                    : isToday(day)
                    ? 'bg-purple-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday(day)
                      ? 'w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center'
                      : isSelected(day)
                      ? 'text-indigo-600'
                      : index % 7 === 0
                      ? 'text-red-500'
                      : index % 7 === 6
                      ? 'text-blue-500'
                      : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>
                {/* Record indicators */}
                <div className="flex flex-wrap gap-1">
                  {recordTypes.slice(0, 4).map((type) => (
                    <div
                      key={type}
                      className={`w-2 h-2 rounded-full ${recordColors[type] || 'bg-gray-400'}`}
                    />
                  ))}
                  {recordTypes.length > 4 && (
                    <span className="text-xs text-gray-400">+{recordTypes.length - 4}</span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Selected Day Details */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                {selectedDay.toLocaleDateString('zh-TW', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </h3>
              <span className="text-sm text-gray-500">
                {selectedDayRecords.length} 筆記錄
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : selectedDayRecords.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">這天還沒有記錄</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddRecord}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl"
                >
                  新增記錄
                </motion.button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayRecords.map((record) => {
                  const config = RECORD_TYPE_CONFIG[record.type as keyof typeof RECORD_TYPE_CONFIG]
                  const Icon = recordIcons[record.type]

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className={`p-2 rounded-lg ${recordColors[record.type]} bg-opacity-20`}>
                        {Icon ? (
                          <Icon className={`w-4 h-4 ${recordColors[record.type].replace('bg-', 'text-').replace('-400', '-600').replace('-500', '-600')}`} />
                        ) : (
                          <span>{config?.icon}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">
                          {config?.label || record.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.recorded_at).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
