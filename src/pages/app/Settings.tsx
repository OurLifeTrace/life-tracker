import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Mail,
  Save,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import AvatarUpload from '@/components/common/AvatarUpload'

type SettingsSection = 'profile' | 'notifications' | 'privacy' | 'security' | null

export default function Settings() {
  const { user, logout, updateProfile, updatePassword } = useAuthStore()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SettingsSection>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile form state
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')

  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Settings state
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true)
  const [publicProfile, setPublicProfile] = useState(user?.settings?.public_profile ?? false)
  const [showInLeaderboard, setShowInLeaderboard] = useState(user?.settings?.show_in_leaderboard ?? true)

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    setMessage(null)

    const { error } = await updateProfile({
      username: username || undefined,
      bio: bio || undefined,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: '個人資料已更新' })
    }

    setIsLoading(false)
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setMessage(null)

    const { error } = await updateProfile({
      settings: {
        default_visibility: user?.settings?.default_visibility || 'private',
        theme: user?.settings?.theme || 'system',
        language: user?.settings?.language || 'zh-TW',
        notifications,
        public_profile: publicProfile,
        show_in_leaderboard: showInLeaderboard,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: '設定已更新' })
    }

    setIsLoading(false)
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '密碼至少需要 6 個字元' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '兩次輸入的密碼不一致' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    const { error } = await updatePassword(newPassword)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: '密碼已成功更新' })
      setNewPassword('')
      setConfirmPassword('')
    }

    setIsLoading(false)
  }

  const menuItems = [
    {
      id: 'profile' as const,
      icon: User,
      label: '個人資料',
      description: '編輯名稱、頭像和簡介',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      id: 'notifications' as const,
      icon: Bell,
      label: '通知設定',
      description: '管理提醒和通知偏好',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      id: 'privacy' as const,
      icon: Shield,
      label: '隱私設定',
      description: '控制資料可見性',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      id: 'security' as const,
      icon: Lock,
      label: '帳號安全',
      description: '更改密碼',
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ]

  if (activeSection === 'profile') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">個人資料</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <AvatarUpload
              currentAvatarUrl={user?.avatar_url}
              username={user?.username}
              email={user?.email}
              size="md"
            />
            <p className="mt-2 text-sm text-gray-500">{user?.email}</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用者名稱
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="設定您的使用者名稱"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                個人簡介
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="介紹一下自己..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                儲存變更
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (activeSection === 'notifications') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">通知設定</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">推送通知</p>
              <p className="text-sm text-gray-500">接收記錄提醒</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                儲存變更
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (activeSection === 'privacy') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">隱私設定</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">公開個人檔案</p>
              <p className="text-sm text-gray-500">允許其他人查看您的個人頁面</p>
            </div>
            <button
              onClick={() => setPublicProfile(!publicProfile)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                publicProfile ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  publicProfile ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">顯示在排行榜</p>
              <p className="text-sm text-gray-500">在社群排行榜中顯示您的記錄</p>
            </div>
            <button
              onClick={() => setShowInLeaderboard(!showInLeaderboard)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                showInLeaderboard ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  showInLeaderboard ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                儲存變更
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (activeSection === 'security') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveSection(null)
              setMessage(null)
              setNewPassword('')
              setConfirmPassword('')
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">帳號安全</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="輸入新密碼（至少 6 個字元）"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                確認新密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次輸入新密碼"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleChangePassword}
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                更新密碼
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">設定</h1>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.username || '用戶'}</h2>
            <p className="text-white/80 text-sm flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveSection(item.id)}
            className="w-full bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100"
          >
            <div className={`p-3 ${item.bg} rounded-xl`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        ))}
      </div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleLogout}
        className="w-full bg-red-50 rounded-xl p-4 flex items-center gap-4 border border-red-100"
      >
        <div className="p-3 bg-red-100 rounded-xl">
          <LogOut className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-red-600">登出</p>
          <p className="text-sm text-red-400">登出您的帳號</p>
        </div>
      </motion.button>

      {/* App Info */}
      <div className="text-center text-sm text-gray-400 py-4">
        <p>Life Tracker v1.0.0</p>
        <p>Made with love</p>
      </div>
    </div>
  )
}
