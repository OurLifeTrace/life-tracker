import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Calendar } from 'lucide-react'
import { useRecordStore } from '@/stores/recordStore'

interface MedicationFormProps {
  onSuccess: () => void
  editingRecord?: { id: string; data: Record<string, unknown>; recorded_at?: string } | null
}

interface Medication {
  name: string
  dosage: string
}

const formatDateTimeLocal = (date: Date) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export default function MedicationForm({ onSuccess, editingRecord }: MedicationFormProps) {
  const { createRecord, updateRecord, isLoading } = useRecordStore()
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '' }])
  const [notes, setNotes] = useState('')
  const [recordedAt, setRecordedAt] = useState(formatDateTimeLocal(new Date()))

  useEffect(() => {
    if (editingRecord?.data) {
      const data = editingRecord.data
      const meds = data.medications as Medication[] | undefined
      setMedications(meds && meds.length > 0 ? meds : [{ name: '', dosage: '' }])
      setNotes((data.notes as string) || '')
    }
    if (editingRecord?.recorded_at) {
      setRecordedAt(formatDateTimeLocal(new Date(editingRecord.recorded_at)))
    }
  }, [editingRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validMedications = medications.filter(m => m.name.trim())
    if (validMedications.length === 0) return

    const recordData = {
      medications: validMedications,
      notes: notes || undefined,
    }

    if (editingRecord) {
      await updateRecord(editingRecord.id, { data: recordData, recorded_at: new Date(recordedAt).toISOString() })
    } else {
      await createRecord({
        type: 'medication',
        data: recordData,
        recorded_at: new Date(recordedAt).toISOString(),
      })
    }

    onSuccess()
  }

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '' }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index][field] = value
    setMedications(updated)
  }

  const hasValidMedication = medications.some(m => m.name.trim())

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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Medications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          服用藥物
        </label>
        <div className="space-y-3">
          {medications.map((med, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={med.name}
                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                placeholder="藥物名稱"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <input
                type="text"
                value={med.dosage}
                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                placeholder="劑量"
                className="w-24 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {medications.length > 1 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeMedication(index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addMedication}
          className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增藥物
        </motion.button>
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
          placeholder="例如：飯後服用"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading || !hasValidMedication}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
