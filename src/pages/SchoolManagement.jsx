import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, School, User, Lock, Building } from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import { apiFetch } from '@/services/api'
import { toast } from 'react-hot-toast'

export default function SchoolManagement() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    schoolName: '',
  })

  const loadSchools = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/auth/schools')
      setSchools(res)
    } catch (err) {
      toast.error('Failed to load school accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchools()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { username, password, schoolName } = formData
    if (!username.trim() || !password.trim() || !schoolName.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setSubmitting(true)
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          password: password.trim(),
          schoolName: schoolName.trim(),
          role: 'school',
        }),
      })
      toast.success('School registered successfully! 🎉')
      setFormData({ username: '', password: '', schoolName: '' })
      loadSchools()
    } catch (err) {
      toast.error(err.message || 'Failed to register school')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (username) => {
    if (!confirm(`Are you sure you want to delete school account "${username}"?`)) return

    try {
      await apiFetch(`/api/auth/schools/${username}`, { method: 'DELETE' })
      toast.success('School account deleted')
      loadSchools()
    } catch (err) {
      toast.error(err.message || 'Failed to delete school')
    }
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900 tracking-tight flex items-center gap-2">
            🏫 School Management
          </h1>
          <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
            Register and manage accounts for schools using the attendance system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 bg-white dark:bg-slate-900/50">
              <h2 className="font-bold text-lg dark:text-white text-gray-900 flex items-center gap-2 pb-3 border-b dark:border-white/5 border-gray-100 mb-4">
                <Plus className="w-5 h-5 text-indigo-500" />
                Register New School
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300 text-gray-700">
                    School Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Oakridge High School"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="input-field pl-10"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300 text-gray-700">
                    Account Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. oakridge_high"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="input-field pl-10"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300 text-gray-700">
                    Access Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field pl-10"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-3 rounded-xl font-bold mt-2"
                >
                  {submitting ? 'Registering...' : 'Register School Account'}
                </button>
              </form>
            </div>
          </div>

          {/* Active Schools List Card */}
          <div className="lg:col-span-2">
            <div className="card p-6 bg-white dark:bg-slate-900/50">
              <h2 className="font-bold text-lg dark:text-white text-gray-900 flex items-center gap-2 pb-3 border-b dark:border-white/5 border-gray-100 mb-4">
                <School className="w-5 h-5 text-indigo-500" />
                Active School Accounts
              </h2>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 skeleton" />
                  ))}
                </div>
              ) : schools.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <School className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No school accounts registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b dark:border-white/5 border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="pb-3 pl-2">School Name</th>
                        <th className="pb-3">Username</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-white/5 divide-gray-50">
                      {schools.map((school) => (
                        <tr key={school.username} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                          <td className="py-4 pl-2">
                            <span className="font-semibold text-gray-900 dark:text-slate-100">
                              {school.schoolName}
                            </span>
                          </td>
                          <td className="py-4 text-sm font-mono text-gray-500 dark:text-gray-400">
                            {school.username}
                          </td>
                          <td className="py-4 text-right pr-2">
                            <button
                              onClick={() => handleDelete(school.username)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
