import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Utensils,
  Moon,
  Dumbbell,
  Droplets,
  Heart,
  Pill,
  Smile,
  Trash2,
  Pencil,
  X,
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

const recordColors: Record<string, { bg: string; text: string; gradient: string }> = {
  meal: { bg: 'bg-amber-50', text: 'text-amber-600', gradient: 'from-amber-400 to-orange-500' },
  sleep: { bg: 'bg-indigo-50', text: 'text-indigo-600', gradient: 'from-indigo-400 to-purple-500' },
  exercise: { bg: 'bg-emerald-50', text: 'text-emerald-600', gradient: 'from-emerald-400 to-teal-500' },
  water: { bg: 'bg-cyan-50', text: 'text-cyan-600', gradient: 'from-cyan-400 to-blue-500' },
  mood: { bg: 'bg-purple-50', text: 'text-purple-600', gradient: 'from-purple-400 to-pink-500' },
  medication: { bg: 'bg-blue-50', text: 'text-blue-600', gradient: 'from-blue-400 to-indigo-500' },
  intimacy: { bg: 'bg-pink-50', text: 'text-pink-600', gradient: 'from-pink-400 to-rose-500' },
  bowel: { bg: 'bg-yellow-50', text: 'text-yellow-600', gradient: 'from-yellow-400 to-amber-500' },
}

const allTypes = [
  { value: 'all', label: '全部' },
  { value: 'meal', label: '飲食' },
  { value: 'sleep', label: '睡眠' },
  { value: 'exercise', label: '運動' },
  { value: 'water', label: '飲水' },
  { value: 'mood', label: '心情' },
  { value: 'medication', label: '藥物' },
  { value: 'intimacy', label: '親密' },
  { value: 'bowel', label: '排便' },
]

export default function Records() {
  const { records, fetchRecords, deleteRecord, isLoading } = useRecordStore()
  const { openRecordModal, openEditModal } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const filteredRecords = useMemo(() => {
    let filtered = [...records]

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((r) => r.type === selectedType)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((r) => {
        const config = RECORD_TYPE_CONFIG[r.type as keyof typeof RECORD_TYPE_CONFIG]
        const typeLabel = config?.label || r.type
        const dataStr = JSON.stringify(r.data).toLowerCase()
        return typeLabel.toLowerCase().includes(query) || dataStr.includes(query)
      })
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())

    return filtered
  }, [records, selectedType, searchQuery])

  // Group records by date
  const groupedRecords = useMemo(() => {
    const groups: Record<string, typeof records> = {}
    filteredRecords.forEach((record) => {
      const dateKey = record.recorded_at.split('T')[0]
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(record)
    })
    return groups
  }, [filteredRecords])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteRecord(id)
    setDeletingId(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天'
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天'
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    }
  }

  const getRecordSummary = (record: typeof records[0]) => {
    const data = record.data as Record<string, unknown>
    switch (record.type) {
      case 'meal':
        return data.content as string || data.meal_type as string || ''
      case 'sleep':
        return `${data.bedtime} - ${data.wake_time}`
      case 'exercise':
        return `${data.duration}分鐘 ${data.exercise_type || ''}`
      case 'water':
        return `${data.amount}ml`
      case 'mood':
        return `評分 ${data.rating}/5`
      case 'medication':
        const meds = data.medications as Array<{ name: string }> | undefined
        return meds?.map(m => m.name).join(', ') || ''
      case 'bowel':
        return `Type ${data.bristol_scale}`
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">記錄列表</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openRecordModal()}
          className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋記錄..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-colors ${
              showFilters || selectedType !== 'all'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Filter Tags */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl">
                {allTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedType === type.value
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Indicator */}
        {selectedType !== 'all' && !showFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">篩選:</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-lg flex items-center gap-1">
              {allTypes.find(t => t.value === selectedType)?.label}
              <button onClick={() => setSelectedType('all')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Records List */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedType !== 'all' ? '沒有找到符合的記錄' : '還沒有任何記錄'}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openRecordModal()}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl"
          >
            新增第一筆記錄
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([date, dayRecords]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">
                {formatDate(date)}
              </h3>
              <div className="space-y-2">
                {dayRecords.map((record, index) => {
                  const config = RECORD_TYPE_CONFIG[record.type as keyof typeof RECORD_TYPE_CONFIG]
                  const colors = recordColors[record.type] || { bg: 'bg-gray-50', text: 'text-gray-600', gradient: 'from-gray-400 to-gray-500' }
                  const Icon = recordIcons[record.type]
                  const summary = getRecordSummary(record)

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${colors.bg} rounded-xl p-4 flex items-center gap-4`}
                    >
                      <div className={`p-3 bg-gradient-to-br ${colors.gradient} rounded-xl shadow-sm`}>
                        {Icon ? (
                          <Icon className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-lg">{config?.icon || '📝'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">
                          {config?.label || record.type}
                        </p>
                        {summary && (
                          <p className="text-sm text-gray-500 truncate">{summary}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(record.recorded_at).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal({
                            id: record.id,
                            type: record.type,
                            data: record.data as Record<string, unknown>,
                            recorded_at: record.recorded_at,
                          })}
                          className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === record.id ? (
                            <div className="w-5 h-5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {filteredRecords.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          共 {filteredRecords.length} 筆記錄
        </div>
      )}
    </div>
  )
}
