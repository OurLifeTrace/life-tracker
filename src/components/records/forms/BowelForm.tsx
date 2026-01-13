import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'
import { BRISTOL_SCALE } from '@/lib/constants'

interface BowelFormProps {
  onSuccess: () => void
  editingRecord?: { id: string; data: Record<string, unknown>; recorded_at?: string } | null
}

const formatDateTimeLocal = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export default function BowelForm({ onSuccess, editingRecord }: BowelFormProps) {
  const { createRecord, updateRecord, isLoading } = useRecordStore()
  const [bristolScale, setBristolScale] = useState(4)
  const [urgency, setUrgency] = useState(3)
  const [pain, setPain] = useState(1)
  const [blood, setBlood] = useState(false)
  const [notes, setNotes] = useState('')
  const [recordedAt, setRecordedAt] = useState(formatDateTimeLocal(new Date()))

  useEffect(() => {
    if (editingRecord?.data) {
      const data = editingRecord.data
      setBristolScale((data.bristol_scale as number) || 4)
      setUrgency((data.urgency as number) || 3)
      setPain((data.pain as number) || 1)
      setBlood((data.blood as boolean) || false)
      setNotes((data.notes as string) || '')
    }
    if (editingRecord?.recorded_at) {
      setRecordedAt(formatDateTimeLocal(new Date(editingRecord.recorded_at)))
    }
  }, [editingRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recordData = {
      bristol_scale: bristolScale,
      urgency,
      pain,
      blood,
      notes: notes || undefined,
    }

    if (editingRecord) {
      await updateRecord(editingRecord.id, { data: recordData, recorded_at: new Date(recordedAt).toISOString() })
    } else {
      await createRecord({
        type: 'bowel',
        data: recordData,
        recorded_at: new Date(recordedAt).toISOString(),
      })
    }

    onSuccess()
  }

  const urgencyLabels = ['不急', '稍急', '中等', '較急', '非常急']
  const painLabels = ['無痛', '輕微', '中等', '較痛', '劇痛']

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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>
      </div>

      {/* Bristol Scale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          布里斯托大便分類 (Type {bristolScale})
        </label>
        <div className="space-y-2">
          {BRISTOL_SCALE.map((scale) => (
            <motion.button
              key={scale.value}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setBristolScale(scale.value)}
              className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                bristolScale === scale.value
                  ? 'bg-amber-100 border-2 border-amber-400'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: scale.color }}
              >
                {scale.value}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${bristolScale === scale.value ? 'text-amber-800' : 'text-gray-700'}`}>
                  {scale.label}
                </p>
                <p className="text-xs text-gray-500">{scale.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          急迫程度
        </label>
        <div className="flex gap-2 justify-between">
          {[1, 2, 3, 4, 5].map((value) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setUrgency(value)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                urgency === value
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {value}
            </motion.button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {urgencyLabels[urgency - 1]}
        </p>
      </div>

      {/* Pain */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          疼痛程度
        </label>
        <div className="flex gap-2 justify-between">
          {[1, 2, 3, 4, 5].map((value) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPain(value)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                pain === value
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {value}
            </motion.button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {painLabels[pain - 1]}
        </p>
      </div>

      {/* Blood */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          是否有血
        </label>
        <div className="flex gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBlood(false)}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              blood === false
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            沒有
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBlood(true)}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              blood === true
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            有
          </motion.button>
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
          placeholder="其他想記錄的"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
