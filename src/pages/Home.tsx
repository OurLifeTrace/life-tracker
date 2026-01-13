import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Utensils,
  Moon,
  Dumbbell,
  Droplets,
  Heart,
  Pill,
  Smile,
  Calendar,
  BarChart3,
  Sparkles
} from 'lucide-react'

const features = [
  { icon: Utensils, label: '飲食', color: 'bg-amber-500' },
  { icon: Moon, label: '睡眠', color: 'bg-indigo-500' },
  { icon: Dumbbell, label: '運動', color: 'bg-emerald-500' },
  { icon: Droplets, label: '飲水', color: 'bg-cyan-500' },
  { icon: Heart, label: '親密', color: 'bg-pink-500' },
  { icon: Pill, label: '藥物', color: 'bg-blue-500' },
  { icon: Smile, label: '心情', color: 'bg-purple-500' },
  { icon: Calendar, label: '日曆', color: 'bg-orange-500' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">Life Tracker</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              to="/auth/login"
              className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-full hover:bg-white/30 transition-all"
            >
              登入
            </Link>
          </motion.div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              記錄生活
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                發現規律
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
            >
              追蹤您的日常作息，從飲食、睡眠到運動，
              用數據了解自己，打造更健康的生活方式。
            </motion.p>

            {/* Feature icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`p-3 ${feature.color} rounded-2xl shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-white/70">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-shadow"
                >
                  免費開始使用
                </motion.button>
              </Link>
              <Link to="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 transition-all"
                >
                  已有帳號？登入
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </main>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="py-8 px-6 bg-white/10 backdrop-blur-sm"
        >
          <div className="max-w-4xl mx-auto flex justify-center gap-12 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">8+</div>
              <div className="text-white/70">記錄類型</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white flex items-center gap-1">
                <BarChart3 className="w-6 h-6" />
                統計
              </div>
              <div className="text-white/70">數據分析</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-white/70">隱私保護</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
