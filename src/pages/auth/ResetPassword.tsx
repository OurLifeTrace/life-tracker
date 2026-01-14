import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, Sparkles, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

const resetPasswordSchema = z.object({
  password: z.string().min(6, '密碼至少需要 6 個字元'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)

  useEffect(() => {
    const handleRecoveryToken = async () => {
      // Parse the hash fragment for access_token
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (type === 'recovery' && accessToken && refreshToken) {
        // Set the session with the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setTokenError(error.message)
        }
      }

      setIsVerifying(false)
    }

    handleRecoveryToken()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true)
    setError(null)

    const { error } = await updatePassword(data.password)

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)

    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate('/auth/login')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-8 h-8 text-white" />
          <span className="text-2xl font-bold text-white">Life Tracker</span>
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
        >
          {isVerifying ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">驗證中...</h2>
              <p className="text-gray-500">正在確認您的重設連結</p>
            </div>
          ) : tokenError ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">連結無效</h2>
              <p className="text-gray-500 mb-2">{tokenError}</p>
              <p className="text-gray-400 text-sm mb-8">重設連結可能已過期，請重新申請。</p>
              <Link
                to="/auth/forgot-password"
                className="inline-block w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                重新申請重設連結
              </Link>
            </div>
          ) : isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">密碼重設成功</h2>
              <p className="text-gray-500 mb-4">
                您的密碼已成功更新。正在跳轉至登入頁面...
              </p>
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">重設密碼</h1>
                <p className="text-gray-500">請輸入您的新密碼</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新密碼
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        errors.password
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-indigo-500'
                      }`}
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    確認新密碼
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        errors.confirmPassword
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-indigo-500'
                      }`}
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    '更新密碼'
                  )}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
