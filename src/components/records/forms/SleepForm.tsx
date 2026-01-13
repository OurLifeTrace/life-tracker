import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'
import { SLEEP_AIDS } from '@/lib/constants'

interface SleepFormProps {
  onSuccess: () => void
  editingRecord?: { id: string; data: Record<string, unknown>; recorded_at?: string } | null
}

const formatDateTimeLocal = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export default function SleepForm({ onSuccess, editingRecord }: SleepFormProps) {
  const { createRecord, updateRecord, isLoading } = useRecordStore()
  const [bedtime, setBedtime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [quality, setQuality] = useState(3)
  const [selectedAids, setSelectedAids] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [recordedAt, setRecordedAt] = useState(formatDateTimeLocal(new Date()))

  useEffect(() => {
    if (editingRecord?.data) {
      const data = editingRecord.data
      setBedtime((data.bedtime as string) || '')
      setWakeTime((data.wake_time as string) || '')
      setQuality((data.quality as number) || 3)
      setSelectedAids((data.aids as string[]) || [])
      setNotes((data.notes as string) || '')
    }
    if (editingRecord?.recorded_at) {
      setRecordedAt(formatDateTimeLocal(new Date(editingRecord.recorded_at)))
    }
  }, [editingRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recordData = {
      bedtime,
      wake_time: wakeTime,
      quality,
      aids: selectedAids.length > 0 ? selectedAids : undefined,
      notes: notes || undefined,
    }

    if (editingRecord) {
      await updateRecord(editingRecord.id, { data: recordData, recorded_at: new Date(recordedAt).toISOString() })
    } else {
      await createRecord({
        type: 'sleep',
        data: recordData,
        recorded_at: new Date(recordedAt).toISOString(),
      })
    }

    onSuccess()
  }

  const toggleAid = (aid: string) => {
    setSelectedAids(prev =>
      prev.includes(aid)
        ? prev.filter(a => a !== aid)
        : [...prev, aid]
    )
  }

  const qualityLabels = ['很差', '差', '普通', '好', '很好']

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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Time inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            上床時間
          </label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            起床時間
          </label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            required
          />
        </div>
      </div>

      {/* Quality */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          睡眠品質
        </label>
        <div className="flex gap-2 justify-between">
          {[1, 2, 3, 4, 5].map((value) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuality(value)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                quality === value
                  ? 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {value}
            </motion.button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {qualityLabels[quality - 1]}
        </p>
      </div>

      {/* Sleep Aids */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          助眠方式 (選填)
        </label>
        <div className="flex flex-wrap gap-2">
          {SLEEP_AIDS.map((aid) => (
            <motion.button
              key={aid.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleAid(aid.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedAids.includes(aid.value)
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {aid.label}
            </motion.button>
          ))}
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
          placeholder="例如：做了奇怪的夢"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading || !bedtime || !wakeTime}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
