import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Lock, User, ShieldAlert, Key } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { toast } from 'react-hot-toast'

export default function Login() {
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const res = await login(username.trim(), password.trim())
      if (res.success) {
        toast.success('Logged in successfully! ✨')
      } else {
        setError(res.message || 'Invalid username or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 transition-colors duration-300">
      {/* Container card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md card p-8 backdrop-blur-md"
      >
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Attendance Portal
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sign in to manage classes and logs
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2.5 p-3.5 mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-medium dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. school1 or admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-11"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-11"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-5 border-2 border-white border-t-transparent rounded-full animate-spin h-5" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </motion.div>

      {/* Demo Credentials Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-md mt-6 p-5 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-sm dark:bg-slate-900/60 dark:border-white/5"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-white flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-indigo-500" />
          Demo Access Credentials
        </h3>
        <div className="grid grid-cols-1 gap-2.5 text-xs text-gray-600 dark:text-gray-400">
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex justify-between items-center dark:bg-white/5 dark:border-transparent">
            <div>
              <p className="font-semibold text-gray-800 dark:text-slate-200">Admin Account</p>
              <p className="text-[10px] text-gray-500">Full control & management access</p>
            </div>
            <div className="text-right">
              <p>User: <code className="bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-mono dark:bg-indigo-500/10 dark:text-indigo-400">admin</code></p>
              <p className="mt-0.5">Pass: <code className="bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-mono dark:bg-indigo-500/10 dark:text-indigo-400">adminpassword</code></p>
            </div>
          </div>
          
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex justify-between items-center dark:bg-white/5 dark:border-transparent">
            <div>
              <p className="font-semibold text-gray-800 dark:text-slate-200">School Account (Greenwood)</p>
              <p className="text-[10px] text-gray-500">Take attendance & view reports only</p>
            </div>
            <div className="text-right">
              <p>User: <code className="bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-mono dark:bg-indigo-500/10 dark:text-indigo-400">school1</code></p>
              <p className="mt-0.5">Pass: <code className="bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-mono dark:bg-indigo-500/10 dark:text-indigo-400">schoolpassword</code></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
