import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { LifeRecord, RecordData, RecordType, Visibility } from '@/lib/types'

interface RecordState {
  records: LifeRecord[]
  isLoading: boolean

  // Actions
  fetchRecords: (options?: {
    type?: RecordType
    startDate?: string
    endDate?: string
  }) => Promise<void>
  createRecord: (record: {
    type: RecordType
    data: RecordData
    visibility?: Visibility
    recorded_at: string
  }) => Promise<{ error: Error | null; record?: LifeRecord }>
  updateRecord: (id: string, updates: Partial<LifeRecord>) => Promise<{ error: Error | null }>
  deleteRecord: (id: string) => Promise<{ error: Error | null }>
  getRecordsByDate: (date: string) => LifeRecord[]
}

export const useRecordStore = create<RecordState>((set, get) => ({
  records: [],
  isLoading: false,

  fetchRecords: async (options = {}) => {
    set({ isLoading: true })

    try {
      let query = supabase
        .from('records')
        .select('*')
        .order('recorded_at', { ascending: false })

      if (options.type) {
        query = query.eq('type', options.type)
      }

      if (options.startDate) {
        query = query.gte('recorded_at', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('recorded_at', options.endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Fetch records error:', error)
        set({ isLoading: false })
        return
      }

      set({ records: data as LifeRecord[], isLoading: false })
    } catch (error) {
      console.error('Fetch records error:', error)
      set({ isLoading: false })
    }
  },

  createRecord: async (record) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: new Error('User not authenticated') }
      }

      const { data, error } = await supabase
        .from('records')
        .insert({
          user_id: user.id,
          type: record.type,
          data: record.data,
          visibility: record.visibility || 'private',
          recorded_at: record.recorded_at,
        })
        .select()
        .single()

      if (error) {
        return { error }
      }

      const newRecord = data as LifeRecord
      set((state) => ({
        records: [newRecord, ...state.records],
      }))

      return { error: null, record: newRecord }
    } catch (error) {
      return { error: error as Error }
    }
  },

  updateRecord: async (id: string, updates: Partial<LifeRecord>) => {
    try {
      const { error } = await supabase
        .from('records')
        .update(updates)
        .eq('id', id)

      if (error) {
        return { error }
      }

      set((state) => ({
        records: state.records.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      }))

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  deleteRecord: async (id: string) => {
    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id)

      if (error) {
        return { error }
      }

      set((state) => ({
        records: state.records.filter((r) => r.id !== id),
      }))

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  getRecordsByDate: (date: string) => {
    const { records } = get()
    return records.filter((r) => r.recorded_at.startsWith(date))
  },
}))
