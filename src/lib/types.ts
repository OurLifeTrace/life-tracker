// Record Types
export type RecordType =
  | 'meal'
  | 'bowel'
  | 'sleep'
  | 'exercise'
  | 'intimacy'
  | 'medication'
  | 'water'
  | 'mood'
  | `custom_${string}`

export type Visibility = 'private' | 'stats_only' | 'public'

// User Types
export interface User {
  id: string
  email: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  settings: UserSettings
  created_at: string
  updated_at: string
}

export interface UserSettings {
  default_visibility: Visibility
  theme: 'light' | 'dark' | 'system'
  language: 'zh-TW' | 'en'
  notifications: boolean
  public_profile: boolean
  show_in_leaderboard: boolean
}

// Life Record (renamed from Record to avoid conflict with TypeScript built-in)
export interface LifeRecord {
  id: string
  user_id: string
  type: RecordType
  data: RecordData
  visibility: Visibility
  recorded_at: string
  created_at: string
  updated_at: string
}

export type RecordData =
  | MealData
  | BowelData
  | SleepData
  | ExerciseData
  | IntimacyData
  | MedicationData
  | WaterData
  | MoodData
  | CustomData

// Meal Data
export interface MealData {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'
  content: string
  photo_url?: string
  calories?: number
  location?: string
  tags?: string[]
  rating?: number
  notes?: string
}

// Bowel Data
export interface BowelData {
  bristol_scale: 1 | 2 | 3 | 4 | 5 | 6 | 7
  duration?: number
  strain_level?: number
  blood?: boolean
  color?: 'brown' | 'dark_brown' | 'green' | 'yellow' | 'black' | 'red'
  notes?: string
}

// Sleep Data
export interface SleepData {
  sleep_time: string
  wake_time: string
  quality?: number
  dream?: boolean
  dream_content?: string
  interruptions?: number
  aids?: string[]
  notes?: string
}

// Exercise Data
export interface ExerciseData {
  exercise_type: string
  duration: number
  intensity?: 'light' | 'moderate' | 'vigorous'
  calories_burned?: number
  distance?: number
  heart_rate_avg?: number
  heart_rate_max?: number
  location?: string
  notes?: string
}

// Intimacy Data
export interface IntimacyData {
  type: 'solo' | 'partnered'
  duration?: number
  satisfaction?: number
  protection?: boolean
  partner_initiate?: boolean
  mood_before?: string
  mood_after?: string
  notes?: string
}

// Medication Data
export interface MedicationData {
  medication_name: string
  dosage: string
  purpose?: string
  prescription?: boolean
  taken: boolean
  scheduled_time?: string
  actual_time?: string
  side_effects?: string
  notes?: string
}

// Water Data
export interface WaterData {
  amount: number
  type?: 'water' | 'tea' | 'coffee' | 'other'
  temperature?: 'cold' | 'room' | 'warm' | 'hot'
}

// Mood Data
export interface MoodData {
  mood_level: number
  emotions?: string[]
  energy_level?: number
  stress_level?: number
  triggers?: string
  notes?: string
}

// Custom Data
export interface CustomData {
  [key: string]: unknown
}

// Custom Record Type Definition
export interface CustomRecordType {
  id: string
  user_id: string
  name: string
  slug: string
  icon: string
  color: string
  fields: CustomField[]
  is_active: boolean
  created_at: string
}

export interface CustomField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'datetime' | 'rating'
  unit?: string
  required: boolean
  options?: string[]
}

// Streak
export interface Streak {
  id: string
  user_id: string
  type: string
  current_streak: number
  longest_streak: number
  last_record_date: string | null
  updated_at: string
}
