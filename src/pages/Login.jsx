import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Lock, User, ShieldAlert, Key, Building } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { apiFetch } from '../services/api'
import { toast } from 'react-hot-toast'

export default function Login() {
  const { login } = useAuthStore()
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleToggle = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setUsername('')
    setPassword('')
    setSchoolName('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (isSignUp) {
      // Handle Sign Up
      if (!username.trim() || !password.trim() || !schoolName.trim()) {
        setError('Please fill in all fields')
        return
      }

      try {
        setLoading(true)
        await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: username.toLowerCase().trim(),
            password: password.trim(),
            schoolName: schoolName.trim(),
          }),
        })

        toast.success('Registration successful! Please sign in. 🎉')
        setIsSignUp(false)
        setPassword('')
      } catch (err) {
        setError(err.message || 'Registration failed. Try a different username.')
      } finally {
        setLoading(false)
      }
    } else {
      // Handle Sign In
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
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isSignUp ? 'School Registration' : 'Attendance Portal'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            {isSignUp ? 'Register your school and setup access' : 'Sign in to manage classes and logs'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 dark:bg-slate-800/80 rounded-xl mb-6 select-none border dark:border-white/5 border-gray-200">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError('');
              setUsername('');
              setPassword('');
              setSchoolName('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              !isSignUp
                ? 'bg-white text-gray-900 shadow-md dark:bg-slate-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError('');
              setUsername('');
              setPassword('');
              setSchoolName('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              isSignUp
                ? 'bg-white text-gray-900 shadow-md dark:bg-slate-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-medium dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
                School Name
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Greenwood High School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="input-field pl-11 text-sm"
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder={isSignUp ? "e.g. greenwood_high" : "e.g. admin or school1"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-11 text-sm"
                disabled={loading}
                required
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
                className="input-field pl-11 text-sm"
                disabled={loading}
                required
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
            ) : isSignUp ? (
              'Create School Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
