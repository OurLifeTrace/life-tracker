import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'
import { MOOD_EMOTIONS } from '@/lib/constants'

interface MoodFormProps {
  onSuccess: () => void
  editingRecord?: { id: string; data: Record<string, unknown>; recorded_at?: string } | null
}

const formatDateTimeLocal = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

const moodEmojis = [
  { value: 1, emoji: '😢', label: '很差' },
  { value: 2, emoji: '😔', label: '不好' },
  { value: 3, emoji: '😐', label: '普通' },
  { value: 4, emoji: '😊', label: '不錯' },
  { value: 5, emoji: '😄', label: '很好' },
]

export default function MoodForm({ onSuccess, editingRecord }: MoodFormProps) {
  const { createRecord, updateRecord, isLoading } = useRecordStore()
  const [rating, setRating] = useState(3)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [recordedAt, setRecordedAt] = useState(formatDateTimeLocal(new Date()))

  useEffect(() => {
    if (editingRecord?.data) {
      const data = editingRecord.data
      setRating((data.rating as number) || 3)
      setSelectedEmotions((data.emotions as string[]) || [])
      setNotes((data.notes as string) || '')
    }
    if (editingRecord?.recorded_at) {
      setRecordedAt(formatDateTimeLocal(new Date(editingRecord.recorded_at)))
    }
  }, [editingRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recordData = {
      rating,
      emotions: selectedEmotions.length > 0 ? selectedEmotions : undefined,
      notes: notes || undefined,
    }

    if (editingRecord) {
      await updateRecord(editingRecord.id, { data: recordData, recorded_at: new Date(recordedAt).toISOString() })
    } else {
      await createRecord({
        type: 'mood',
        data: recordData,
        recorded_at: new Date(recordedAt).toISOString(),
      })
    }

    onSuccess()
  }

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    )
  }

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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
      </div>

      {/* Mood Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          今天心情如何？
        </label>
        <div className="flex justify-between gap-2">
          {moodEmojis.map((mood) => (
            <motion.button
              key={mood.value}
              type="button"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(mood.value)}
              className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition-all ${
                rating === mood.value
                  ? 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="text-3xl mb-1">{mood.emoji}</span>
              <span className={`text-xs font-medium ${rating === mood.value ? 'text-white' : 'text-gray-500'}`}>
                {mood.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          感受到的情緒 (可多選)
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_EMOTIONS.map((emotion) => (
            <motion.button
              key={emotion.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleEmotion(emotion.value)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                selectedEmotions.includes(emotion.value)
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {emotion.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          想說的話 (選填)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="記錄一下今天發生了什麼..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
