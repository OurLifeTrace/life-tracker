import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'
import { MEAL_TYPES } from '@/lib/constants'

interface MealFormProps {
  onSuccess: () => void
  editingRecord?: { id: string; data: Record<string, unknown>; recorded_at?: string } | null
}

// Helper to format date for datetime-local input
const formatDateTimeLocal = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export default function MealForm({ onSuccess, editingRecord }: MealFormProps) {
  const { createRecord, updateRecord, isLoading } = useRecordStore()
  const [mealType, setMealType] = useState('lunch')
  const [content, setContent] = useState('')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')
  const [recordedAt, setRecordedAt] = useState(formatDateTimeLocal(new Date()))

  useEffect(() => {
    if (editingRecord?.data) {
      const data = editingRecord.data
      setMealType((data.meal_type as string) || 'lunch')
      setContent((data.content as string) || '')
      setCalories(data.calories ? String(data.calories) : '')
      setNotes((data.notes as string) || '')
    }
    if (editingRecord?.recorded_at) {
      setRecordedAt(formatDateTimeLocal(new Date(editingRecord.recorded_at)))
    }
  }, [editingRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recordData = {
      meal_type: mealType,
      content,
      calories: calories ? parseInt(calories) : undefined,
      notes: notes || undefined,
    }

    if (editingRecord) {
      await updateRecord(editingRecord.id, { data: recordData, recorded_at: new Date(recordedAt).toISOString() })
    } else {
      await createRecord({
        type: 'meal',
        data: recordData,
        recorded_at: new Date(recordedAt).toISOString(),
      })
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Record Date/Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          記錄時間
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="datetime-local"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>
      </div>

      {/* Meal Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          餐點類型
        </label>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((type) => (
            <motion.button
              key={type.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMealType(type.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                mealType === type.value
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          吃了什麼
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="例如：雞肉飯、味噌湯、炒青菜..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
          required
        />
      </div>

      {/* Calories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          熱量 (選填)
        </label>
        <div className="relative">
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="估計卡路里"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-16"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            kcal
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          備註 (選填)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="其他想記錄的事項"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading || !content}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        ) : (
          '儲存記錄'
        )}
      </motion.button>
    </form>
  )
}
