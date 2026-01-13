export const RECORD_TYPES = {
  MEAL: 'meal',
  BOWEL: 'bowel',
  SLEEP: 'sleep',
  EXERCISE: 'exercise',
  INTIMACY: 'intimacy',
  MEDICATION: 'medication',
  WATER: 'water',
  MOOD: 'mood',
} as const

export const RECORD_TYPE_CONFIG = {
  meal: {
    label: '飲食',
    icon: '🍽️',
    color: '#f59e0b',
  },
  bowel: {
    label: '排便',
    icon: '💩',
    color: '#92400e',
  },
  sleep: {
    label: '睡眠',
    icon: '😴',
    color: '#6366f1',
  },
  exercise: {
    label: '運動',
    icon: '🏃',
    color: '#10b981',
  },
  intimacy: {
    label: '親密',
    icon: '💕',
    color: '#ec4899',
  },
  medication: {
    label: '藥物',
    icon: '💊',
    color: '#3b82f6',
  },
  water: {
    label: '飲水',
    icon: '💧',
    color: '#06b6d4',
  },
  mood: {
    label: '心情',
    icon: '😊',
    color: '#8b5cf6',
  },
} as const

export const VISIBILITY_OPTIONS = {
  private: { label: '私密', icon: '🔒' },
  stats_only: { label: '僅統計', icon: '📊' },
  public: { label: '公開', icon: '🌐' },
} as const

export const BRISTOL_SCALE = [
  { value: 1, label: '分離硬塊', description: '便秘嚴重', color: '#dc2626' },
  { value: 2, label: '香腸狀凹凸', description: '輕微便秘', color: '#ea580c' },
  { value: 3, label: '香腸有裂痕', description: '正常', color: '#65a30d' },
  { value: 4, label: '光滑香腸狀', description: '理想', color: '#16a34a' },
  { value: 5, label: '軟塊', description: '缺乏纖維', color: '#65a30d' },
  { value: 6, label: '糊狀', description: '輕微腹瀉', color: '#ea580c' },
  { value: 7, label: '水狀', description: '腹瀉', color: '#dc2626' },
] as const

export const MEAL_TYPES = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '點心' },
  { value: 'drink', label: '飲品' },
] as const

export const EXERCISE_TYPES = [
  { value: 'running', label: '跑步' },
  { value: 'walking', label: '走路' },
  { value: 'cycling', label: '騎車' },
  { value: 'swimming', label: '游泳' },
  { value: 'gym', label: '健身房' },
  { value: 'yoga', label: '瑜伽' },
  { value: 'basketball', label: '籃球' },
  { value: 'badminton', label: '羽毛球' },
  { value: 'hiking', label: '登山' },
  { value: 'other', label: '其他' },
] as const

export const MOOD_EMOTIONS = [
  { value: 'happy', label: '開心' },
  { value: 'sad', label: '難過' },
  { value: 'anxious', label: '焦慮' },
  { value: 'calm', label: '平靜' },
  { value: 'angry', label: '生氣' },
  { value: 'excited', label: '興奮' },
  { value: 'bored', label: '無聊' },
  { value: 'grateful', label: '感恩' },
  { value: 'frustrated', label: '沮喪' },
  { value: 'hopeful', label: '充滿希望' },
  { value: 'lonely', label: '孤獨' },
  { value: 'content', label: '滿足' },
] as const

export const WATER_TYPES = [
  { value: 'water', label: '白開水' },
  { value: 'tea', label: '茶' },
  { value: 'coffee', label: '咖啡' },
  { value: 'other', label: '其他' },
] as const

export const SLEEP_AIDS = [
  { value: 'white_noise', label: '白噪音' },
  { value: 'eye_mask', label: '眼罩' },
  { value: 'melatonin', label: '褪黑激素' },
  { value: 'meditation', label: '冥想' },
  { value: 'reading', label: '閱讀' },
  { value: 'music', label: '音樂' },
] as const
