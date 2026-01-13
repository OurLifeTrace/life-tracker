import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'
import { WATER_TYPES } from '@/lib/constants'

interface WaterFormProps {
  onSuccess: () => void
  editingRecord?: { id: string; data: Record<string, unknown>; recorded_at?: string } | null
}

const formatDateTimeLocal = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

const quickAmounts = [100, 200, 250, 300, 500]

export default function WaterForm({ onSuccess, editingRecord }: WaterFormProps) {
  const { createRecord, updateRecord, isLoading } = useRecordStore()
  const [waterType, setWaterType] = useState('water')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [recordedAt, setRecordedAt] = useState(formatDateTimeLocal(new Date()))

  useEffect(() => {
    if (editingRecord?.data) {
      const data = editingRecord.data
      setWaterType((data.water_type as string) || 'water')
      setAmount(data.amount ? String(data.amount) : '')
      setNotes((data.notes as string) || '')
    }
    if (editingRecord?.recorded_at) {
      setRecordedAt(formatDateTimeLocal(new Date(editingRecord.recorded_at)))
    }
  }, [editingRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recordData = {
      water_type: waterType,
      amount: parseInt(amount),
      notes: notes || undefined,
    }

    if (editingRecord) {
      await updateRecord(editingRecord.id, { data: recordData, recorded_at: new Date(recordedAt).toISOString() })
    } else {
      await createRecord({
        type: 'water',
        data: recordData,
        recorded_at: new Date(recordedAt).toISOString(),
      })
    }

    onSuccess()
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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
      </div>

      {/* Water Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          飲品類型
        </label>
        <div className="flex flex-wrap gap-2">
          {WATER_TYPES.map((type) => (
            <motion.button
              key={type.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setWaterType(type.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                waterType === type.value
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          快速選擇
        </label>
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((amt) => (
            <motion.button
              key={amt}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmount(amt.toString())}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                amount === amt.toString()
                  ? 'bg-cyan-100 text-cyan-700 border-2 border-cyan-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {amt}ml
            </motion.button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          飲用量
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="輸入毫升數"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all pr-12"
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            ml
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
          placeholder="例如：冰的拿鐵"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading || !amount}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
