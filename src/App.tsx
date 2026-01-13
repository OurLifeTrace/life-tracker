import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import { AppLayout, AuthLayout } from './components/layout'

// Components
import PWAInstallPrompt from './components/common/PWAInstallPrompt'

// Pages
import Home from './pages/Home'
import { Login, Register, ForgotPassword, ResetPassword } from './pages/auth'
import { Dashboard, Calendar, Records, Stats, Settings } from './pages/app'
import { Leaderboard, UserProfile } from './pages/community'

function App() {
  return (
    <Router>
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
