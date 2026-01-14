import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import { AppLayout, AuthLayout } from './components/layout'

// Components
import PWAInstallPrompt from './components/common/PWAInstallPrompt'

// Pages
import Home from './pages/Home'
import { Login, Register, ForgotPassword, ResetPassword, VerifyEmail } from './pages/auth'
import { Dashboard, Calendar, Records, Stats, Settings } from './pages/app'
import { Leaderboard, UserProfile } from './pages/community'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <Router basename={basename}>
      <PWAInstallPrompt />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route index element={<Navigate to="login" replace />} />
        </Route>

        {/* Standalone Auth Pages (no layout wrapper) */}
        <Route path="/auth/verify-email" element={<VerifyEmail />} />

        {/* App Routes (Protected) */}
        <Route path="/app" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="records" element={<Records />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Community Routes */}
        <Route path="/community/leaderboard" element={<Leaderboard />} />
        <Route path="/community/u/:username" element={<UserProfile />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
