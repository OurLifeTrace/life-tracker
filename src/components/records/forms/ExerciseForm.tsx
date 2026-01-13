import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'
import { EXERCISE_TYPES } from '@/lib/constants'

interface ExerciseFormProps {
  onSuccess: () => void
  editingRecord?: { id: string; data: Record<string, unknown>; recorded_at?: string } | null
}

const formatDateTimeLocal = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export default function ExerciseForm({ onSuccess, editingRecord }: ExerciseFormProps) {
  const { createRecord, updateRecord, isLoading } = useRecordStore()
  const [exerciseType, setExerciseType] = useState('running')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState(3)
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')
  const [recordedAt, setRecordedAt] = useState(formatDateTimeLocal(new Date()))

  useEffect(() => {
    if (editingRecord?.data) {
      const data = editingRecord.data
      setExerciseType((data.exercise_type as string) || 'running')
      setDuration(data.duration ? String(data.duration) : '')
      setIntensity((data.intensity as number) || 3)
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
      exercise_type: exerciseType,
      duration: parseInt(duration),
      intensity,
      calories: calories ? parseInt(calories) : undefined,
      notes: notes || undefined,
    }

    if (editingRecord) {
      await updateRecord(editingRecord.id, { data: recordData, recorded_at: new Date(recordedAt).toISOString() })
    } else {
      await createRecord({
        type: 'exercise',
        data: recordData,
        recorded_at: new Date(recordedAt).toISOString(),
      })
    }

    onSuccess()
  }

  const intensityLabels = ['很輕鬆', '輕鬆', '中等', '吃力', '很吃力']

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Record Time */}
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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Exercise Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          運動類型
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EXERCISE_TYPES.map((type) => (
            <motion.button
              key={type.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExerciseType(type.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                exerciseType === type.value
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          運動時長
        </label>
        <div className="relative">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="運動時間"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-16"
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            分鐘
          </span>
        </div>
      </div>

      {/* Intensity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          運動強度
        </label>
        <div className="flex gap-2 justify-between">
          {[1, 2, 3, 4, 5].map((value) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIntensity(value)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                intensity === value
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {value}
            </motion.button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {intensityLabels[intensity - 1]}
        </p>
      </div>

      {/* Calories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          消耗熱量 (選填)
        </label>
        <div className="relative">
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="估計消耗"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-16"
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
          placeholder="例如：今天跑了新路線"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading || !duration}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
