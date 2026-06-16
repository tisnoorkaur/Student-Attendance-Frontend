import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Classes from './pages/Classes'
import Students from './pages/Students'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import SchoolManagement from './pages/SchoolManagement'
import Login from './pages/Login'
import useThemeStore from './store/useThemeStore'
import useAuthStore from './store/useAuthStore'

function App() {
  const { isDark } = useThemeStore()
  const { isAuthenticated, isChecking, checkAuth, user } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [isDark])

  if (isChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'dark bg-slate-950 text-white' : 'light bg-slate-50 text-gray-800'}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Initializing secure portal...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-slate-950' : 'light bg-slate-50'}`}>
        <Login />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#f1f5f9' : '#1e293b',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px',
              padding: '14px 18px',
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : 'light'}`}>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/students" element={<Students />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            {user?.role === 'admin' ? (
              <Route path="/schools" element={<SchoolManagement />} />
            ) : (
              <Route path="/schools" element={<Navigate to="/" replace />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#1e293b',
            border: isDark
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </div>
  )
}

export default App
