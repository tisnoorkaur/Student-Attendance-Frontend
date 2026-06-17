import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarCheck,
  UserPlus,
  FileSpreadsheet,
  BarChart3,
  GraduationCap,
  Menu,
  X,
  LogOut,
  Shield,
  School
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import useOnlineStatus from '@/hooks/useOnlineStatus'
import useAuthStore from '@/store/useAuthStore'

export default function Layout({ children }) {
  const location = useLocation()
  const { isOnline } = useOnlineStatus()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()

  // Dynamically configure navItems based on role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/', label: 'Home', icon: LayoutDashboard, hint: 'Overview & quick actions' },
        { path: '/schools', label: 'Manage School', icon: School, hint: 'Manage school accounts' },
        { path: '/classes', label: 'Classes', icon: GraduationCap, hint: 'View & configure classes' },
        { path: '/students', label: 'Students', icon: UserPlus, hint: 'View & configure students' },
        { path: '/reports', label: 'Global Reports', icon: FileSpreadsheet, hint: 'Generate & export reports' },
        { path: '/analytics', label: 'Analytics', icon: BarChart3, hint: 'Trends & insights' }
      ]
    } else {
      return [
        { path: '/', label: 'Home', icon: LayoutDashboard, hint: 'Overview & quick actions' },
        { path: '/classes', label: 'Add Class', icon: GraduationCap, hint: 'Create & manage classes' },
        { path: '/students', label: 'Add Student', icon: UserPlus, hint: 'Enroll & manage students' },
        { path: '/attendance', label: 'Take Attendance', icon: CalendarCheck, hint: 'Mark daily attendance' },
        { path: '/reports', label: 'View Reports', icon: FileSpreadsheet, hint: 'Generate & export reports' },
        { path: '/analytics', label: 'Analytics', icon: BarChart3, hint: 'Trends & insights' }
      ]
    }
  }

  const navItems = getNavItems()

  const getPageTitle = () => {
    const pageTitles = {
      '/': 'Dashboard',
      '/attendance': 'Take Attendance',
      '/classes': user?.role === 'admin' ? 'Manage Classes' : 'Enrolled Classes',
      '/students': user?.role === 'admin' ? 'Manage Students' : 'Enrolled Students',
      '/reports': 'Reports',
      '/analytics': 'Analytics',
      '/schools': 'School Management'
    }
    return pageTitles[location.pathname] || 'Attendance Portal'
  }

  return (
    <div className="flex min-h-screen transition-colors duration-300 w-full">
      {/* ========================================
         Desktop Sidebar (Hidden on Mobile)
         ======================================== */}
      <aside className="hidden md:flex flex-col w-64 border-r transition-colors duration-300
        dark:bg-slate-900/60 dark:border-white/10
        bg-white/80 border-gray-200 backdrop-blur-md sticky top-0 h-screen z-20">

        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b dark:border-white/10 border-gray-100">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${user?.role === 'admin'
              ? 'bg-gradient-to-tr from-rose-600 to-pink-500 shadow-rose-500/35'
              : 'bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-indigo-500/35'
            }`}>
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            {user?.role === 'admin' ? (
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 tracking-tight text-lg leading-tight">
                Admin Console
              </h1>
            ) : (
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 tracking-tight text-lg leading-tight">
                Attendance
              </h1>
            )}
            <p className="text-[10px] uppercase font-bold tracking-wider dark:text-slate-400 text-slate-500 -mt-0.5">
              Portal v1.5
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.hint}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200`} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">{item.label}</span>
                  <span className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-white/70' : 'dark:text-gray-500 text-gray-400'}`}>{item.hint}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t dark:border-white/10 border-gray-100 flex flex-col gap-2">
          {/* User Profile Info */}
          {user && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1 dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center gap-1.5">
                {user.role === 'admin' ? (
                  <Shield className="w-4 h-4 text-rose-500" />
                ) : (
                  <School className="w-4 h-4 text-indigo-500" />
                )}
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate max-w-[150px]">
                  {user.schoolName}
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold pl-5">
                {user.role}
              </p>
            </div>
          )}

          {/* Connection Status & Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl dark:bg-white/5 bg-gray-50 border border-transparent dark:border-white/5 border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className={`relative flex h-2 w-2`}>
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isOnline ? 'Live' : 'Offline'}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================
         Main Content Area
         ======================================== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <header className="h-20 border-b flex items-center justify-between px-6 sticky top-0 transition-colors duration-300 z-10
          dark:bg-slate-900/60 dark:border-white/10 dark:text-white
          bg-white/80 border-gray-200 text-slate-800 backdrop-blur-md">

          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl transition-colors duration-200 md:hidden
                dark:hover:bg-white/10 hover:bg-gray-100 dark:text-gray-400 text-gray-500"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{getPageTitle()}</h2>
              {user?.role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Admin Access
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold select-none
              ${isOnline
                ? 'dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
              <span>{isOnline ? 'Synced & Online' : 'Working Offline'}</span>
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full pb-28 md:pb-8">
          {children}
        </main>
      </div>

      {/* ========================================
         Mobile Navigation Drawer
         ======================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50 flex flex-col p-6 shadow-2xl md:hidden
                dark:bg-slate-900 bg-white"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${user?.role === 'admin'
                      ? 'bg-gradient-to-tr from-rose-600 to-pink-500'
                      : 'bg-gradient-to-tr from-indigo-600 to-violet-500'
                    }`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  {user?.role === 'admin' ? (
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-red-500">
                      Admin Console
                    </span>
                  ) : (
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                      Attendance Portal
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl dark:hover:bg-white/10 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight">{item.label}</span>
                        <span className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-white/70' : 'dark:text-gray-500 text-gray-400'}`}>{item.hint}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto pt-4 border-t dark:border-white/10 border-gray-100 flex flex-col gap-3">
                {user && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {user.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-rose-500" />
                      ) : (
                        <School className="w-4 h-4 text-indigo-500" />
                      )}
                      <span className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
                        {user.schoolName}
                      </span>
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold pl-5">
                      {user.role}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 rounded-xl dark:bg-white/5 bg-gray-50">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout()
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t md:hidden flex items-center justify-around px-2 z-30 transition-colors duration-300
        dark:bg-slate-900/95 dark:border-white/10 bg-white/95 border-gray-200 backdrop-blur-md">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight truncate max-w-[60px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
