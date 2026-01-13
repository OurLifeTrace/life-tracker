import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'

interface IntimacyFormProps {
  onSuccess: () => void
  editingRecord?: { id: string; data: Record<string, unknown>; recorded_at?: string } | null
}

const formatDateTimeLocal = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export default function IntimacyForm({ onSuccess, editingRecord }: IntimacyFormProps) {
  const { createRecord, updateRecord, isLoading } = useRecordStore()
  const [type, setType] = useState('intercourse')
  const [partner, setPartner] = useState('')
  const [protected_, setProtected_] = useState<boolean | null>(null)
  const [satisfaction, setSatisfaction] = useState(3)
  const [notes, setNotes] = useState('')
  const [recordedAt, setRecordedAt] = useState(formatDateTimeLocal(new Date()))

  useEffect(() => {
    if (editingRecord?.data) {
      const data = editingRecord.data
      setType((data.intimacy_type as string) || 'intercourse')
      setPartner((data.partner as string) || '')
      setProtected_(data.protected as boolean | null)
      setSatisfaction((data.satisfaction as number) || 3)
      setNotes((data.notes as string) || '')
    }
    if (editingRecord?.recorded_at) {
      setRecordedAt(formatDateTimeLocal(new Date(editingRecord.recorded_at)))
    }
  }, [editingRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recordData = {
      intimacy_type: type,
      partner: partner || undefined,
      protected: protected_,
      satisfaction,
      notes: notes || undefined,
    }

    if (editingRecord) {
      await updateRecord(editingRecord.id, { data: recordData, recorded_at: new Date(recordedAt).toISOString() })
    } else {
      await createRecord({
        type: 'intimacy',
        data: recordData,
        recorded_at: new Date(recordedAt).toISOString(),
      })
    }

    onSuccess()
  }

  const intimacyTypes = [
    { value: 'intercourse', label: '性行為' },
    { value: 'oral', label: '口交' },
    { value: 'masturbation', label: '自慰' },
    { value: 'other', label: '其他' },
  ]

  const satisfactionLabels = ['不滿意', '普通', '滿意', '很滿意', '非常滿意']

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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
          />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          類型
        </label>
        <div className="flex flex-wrap gap-2">
          {intimacyTypes.map((t) => (
            <motion.button
              key={t.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setType(t.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                type === t.value
                  ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Partner */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          對象 (選填)
        </label>
        <input
          type="text"
          value={partner}
          onChange={(e) => setPartner(e.target.value)}
          placeholder="對象名稱或暱稱"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
        />
      </div>

      {/* Protection */}
      {type !== 'masturbation' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            安全措施
          </label>
          <div className="flex gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProtected_(true)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                protected_ === true
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              有使用
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProtected_(false)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                protected_ === false
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              沒有使用
            </motion.button>
          </div>
        </div>
      )}

      {/* Satisfaction */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          滿意度
        </label>
        <div className="flex gap-2 justify-between">
          {[1, 2, 3, 4, 5].map((value) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSatisfaction(value)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                satisfaction === value
                  ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {value}
            </motion.button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {satisfactionLabels[satisfaction - 1]}
        </p>
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
