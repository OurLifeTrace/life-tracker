import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      // Check for token_hash and type from Supabase email verification link
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      if (type === 'email' || type === 'signup') {
        // Supabase handles the verification automatically when the page loads
        // We just need to check the session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          setStatus('error')
          setErrorMessage(error.message)
          return
        }

        if (session) {
          setStatus('success')
        } else {
          // Try to exchange the token
          if (tokenHash) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'email',
            })

            if (verifyError) {
              setStatus('error')
              setErrorMessage(verifyError.message)
            } else {
              setStatus('success')
            }
          } else {
            // No token but also no session - might be already verified
            setStatus('success')
          }
        }
      } else {
        // No type parameter, just show success (user might have clicked an old link)
        setStatus('success')
      }
    }

    // Small delay to let Supabase process the verification
    setTimeout(verifyEmail, 500)
  }, [searchParams])

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
          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">驗證中...</h2>
              <p className="text-gray-500">正在確認您的電子郵件</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">驗證成功！</h2>
              <p className="text-gray-500 mb-8">
                您的電子郵件已成功驗證。現在可以開始使用 Life Tracker 了！
              </p>
              <Link
                to="/auth/login"
                className="inline-block w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                前往登入
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">驗證失敗</h2>
              <p className="text-gray-500 mb-2">
                {errorMessage || '驗證連結可能已過期或無效。'}
              </p>
              <p className="text-gray-400 text-sm mb-8">
                請嘗試重新註冊或聯繫客服。
              </p>
              <div className="space-y-3">
                <Link
                  to="/auth/register"
                  className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
                >
                  重新註冊
                </Link>
                <Link
                  to="/auth/login"
                  className="block w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  返回登入
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
