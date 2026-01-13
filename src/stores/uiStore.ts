import { create } from 'zustand'

interface EditingRecord {
  id: string
  type: string
  data: Record<string, unknown>
  recorded_at: string
}

interface UIState {
  isSidebarOpen: boolean
  isRecordModalOpen: boolean
  selectedRecordType: string | null
  selectedDate: Date
  editingRecord: EditingRecord | null

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openRecordModal: (type?: string) => void
  openEditModal: (record: EditingRecord) => void
  closeRecordModal: () => void
  setSelectedDate: (date: Date) => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isRecordModalOpen: false,
  selectedRecordType: null,
  selectedDate: new Date(),
  editingRecord: null,

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open })
  },

  openRecordModal: (type?: string) => {
    set({ isRecordModalOpen: true, selectedRecordType: type || null, editingRecord: null })
  },

  openEditModal: (record: EditingRecord) => {
    set({ isRecordModalOpen: true, selectedRecordType: record.type, editingRecord: record })
  },

  closeRecordModal: () => {
    set({ isRecordModalOpen: false, selectedRecordType: null, editingRecord: null })
  },

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date })
  },
}))
