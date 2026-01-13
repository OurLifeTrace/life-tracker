import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Utensils,
  Moon,
  Dumbbell,
  Droplets,
  Heart,
  Pill,
  Smile,
  ChevronLeft,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import MealForm from './forms/MealForm'
import SleepForm from './forms/SleepForm'
import ExerciseForm from './forms/ExerciseForm'
import WaterForm from './forms/WaterForm'
import MoodForm from './forms/MoodForm'
import MedicationForm from './forms/MedicationForm'
import IntimacyForm from './forms/IntimacyForm'
import BowelForm from './forms/BowelForm'

const recordTypes = [
  { type: 'meal', icon: Utensils, label: '飲食', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
  { type: 'sleep', icon: Moon, label: '睡眠', color: 'from-indigo-400 to-purple-500', bg: 'bg-indigo-50' },
  { type: 'exercise', icon: Dumbbell, label: '運動', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50' },
  { type: 'water', icon: Droplets, label: '飲水', color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50' },
  { type: 'mood', icon: Smile, label: '心情', color: 'from-purple-400 to-pink-500', bg: 'bg-purple-50' },
  { type: 'medication', icon: Pill, label: '藥物', color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50' },
  { type: 'intimacy', icon: Heart, label: '親密', color: 'from-pink-400 to-rose-500', bg: 'bg-pink-50' },
  { type: 'bowel', icon: () => <span className="text-lg">💩</span>, label: '排便', color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50' },
]

interface FormProps {
  onSuccess: () => void
  editingRecord?: {
    id: string
    data: Record<string, unknown>
  } | null
}

const formComponents: Record<string, React.ComponentType<FormProps>> = {
  meal: MealForm,
  sleep: SleepForm,
  exercise: ExerciseForm,
  water: WaterForm,
  mood: MoodForm,
  medication: MedicationForm,
  intimacy: IntimacyForm,
  bowel: BowelForm,
}

export default function RecordModal() {
  const { isRecordModalOpen, selectedRecordType, editingRecord, closeRecordModal } = useUIStore()
  const [currentType, setCurrentType] = useState<string | null>(null)

  useEffect(() => {
    if (isRecordModalOpen) {
      setCurrentType(selectedRecordType)
    }
  }, [isRecordModalOpen, selectedRecordType])

  const handleClose = () => {
    closeRecordModal()
    setCurrentType(null)
  }

  const handleSelectType = (type: string) => {
    setCurrentType(type)
  }

  const handleBack = () => {
    setCurrentType(null)
  }

  const handleSuccess = () => {
    handleClose()
  }

  const selectedTypeConfig = recordTypes.find(t => t.type === currentType)
  const FormComponent = currentType ? formComponents[currentType] : null

  return (
    <AnimatePresence>
      {isRecordModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between border-b ${currentType ? `bg-gradient-to-r ${selectedTypeConfig?.color} text-white` : 'bg-gray-50'}`}>
              {currentType ? (
                <>
                  <button
                    onClick={handleBack}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {selectedTypeConfig?.icon && (
                      typeof selectedTypeConfig.icon === 'function' && selectedTypeConfig.icon.toString().includes('span')
                        ? <selectedTypeConfig.icon />
                        : <selectedTypeConfig.icon className="w-5 h-5" />
                    )}
                    {editingRecord ? '編輯' : '新增'}{selectedTypeConfig?.label}記錄
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800">選擇記錄類型</h2>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {!currentType ? (
                  <motion.div
                    key="type-selection"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {recordTypes.map((type, index) => (
                      <motion.button
                        key={type.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectType(type.type)}
                        className={`${type.bg} p-4 rounded-2xl flex flex-col items-center gap-3 transition-shadow hover:shadow-md`}
                      >
                        <div className={`p-3 bg-gradient-to-br ${type.color} rounded-xl shadow-sm`}>
                          {typeof type.icon === 'function' && type.icon.toString().includes('span')
                            ? <type.icon />
                            : <type.icon className="w-6 h-6 text-white" />
                          }
                        </div>
                        <span className="font-medium text-gray-700">{type.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : FormComponent ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <FormComponent
                      onSuccess={handleSuccess}
                      editingRecord={editingRecord ? { id: editingRecord.id, data: editingRecord.data } : null}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
