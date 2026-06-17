import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  TrendingUp,
  PlusCircle,
  FileText,
  Clock,
  GraduationCap,
  School,
  ShieldAlert
} from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import StatCard from '@/components/StatCard'
import { getStudentCount, getStudentById } from '@/services/studentService'
import { getAllClasses } from '@/services/classService'
import { getAttendanceStats } from '@/services/attendanceService'
import { getAllReports } from '@/services/reportService'
import { apiFetch } from '@/services/api'
import { getTodayString, formatDate } from '@/utils/dateUtils'
import useAuthStore from '@/store/useAuthStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    rateToday: 0,
    totalSchools: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const count = await getStudentCount()
      const classes = await getAllClasses()
      const today = getTodayString()
      const todayStats = await getAttendanceStats(today)

      // Calculate attendance rate (if no attendance is marked yet, set to 0)
      const hasAttendance = todayStats.total > 0
      const rate = hasAttendance ? Math.round(todayStats.percentage) : 0
      const present = todayStats.present

      let schoolCount = 0
      if (isAdmin) {
        try {
          const schoolsList = await apiFetch('/api/auth/schools')
          schoolCount = schoolsList.length
        } catch (e) {
          console.error('Failed to fetch school list for admin', e)
        }
      }

      setStats({
        totalClasses: classes.length,
        totalStudents: count,
        presentToday: present,
        absentToday: todayStats.absent,
        rateToday: rate,
        totalSchools: schoolCount,
      })

      // Fetch recent actions from backend (fetch all and slice since we don't have a /recent route)
      const allAttendance = await apiFetch('/api/attendance')
      const recentAttendance = allAttendance
        .sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))
        .slice(0, 5)

      const activities = await Promise.all(
        recentAttendance.map(async (record) => {
          let studentName = 'Unknown Student';
          try {
            const student = await getStudentById(record.studentId);
            studentName = student ? student.name : 'Unknown Student';
          } catch (e) {
            // Ignore if student was deleted
          }
          return {
            id: record.id,
            type: 'attendance',
            message: `Marked ${studentName} as ${record.status}`,
            time: new Date(record.markedAt),
          }
        })
      )

      // Add recent reports generated
      const allReports = await getAllReports()
      const recentReports = allReports
        .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
        .slice(0, 2)

      const reportActivities = recentReports.map((report) => ({
        id: `report-${report.id}`,
        type: 'report',
        message: `Generated report for date ${report.date}`,
        time: new Date(report.generatedAt),
      }))

      // Merge and sort
      const allActivities = [...activities, ...reportActivities]
        .sort((a, b) => b.time - a.time)
        .slice(0, 5)

      setRecentActivities(allActivities)
    } catch (error) {
      console.error('Failed to load dashboard statistics', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <PageWrapper className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-light dark:glass border dark:border-white/10 border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight dark:text-white text-gray-900">
            {isAdmin ? 'Welcome Back, Admin!' : `Welcome Back, ${user?.username}!`}
          </h1>
          <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
            Today is <strong>{formatDate(getTodayString())}</strong> — here's your {isAdmin ? 'global administration' : 'school attendance'} overview.
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-emerald-500/10 dark:bg-emerald-500/10 p-3 rounded-2xl border dark:border-emerald-500/20 border-emerald-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">System Connected</p>
        </div>
      </div>

      {/* Stats Cards Grid (Admin vs School) */}
      {isAdmin ? (
        // Admin Dashboard Stats Cards
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Schools"
            value={stats.totalSchools}
            icon={School}
            gradient="gradient-primary"
            delay={0.05}
            subtitle="Registered school accounts"
          />
          <StatCard
            title="Global Classes"
            value={stats.totalClasses}
            icon={GraduationCap}
            gradient="gradient-warning"
            delay={0.1}
            subtitle="Classes across all schools"
          />
          <StatCard
            title="Global Students"
            value={stats.totalStudents}
            icon={Users}
            gradient="gradient-info"
            delay={0.2}
            subtitle="Students enrolled globally"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={CheckCircle2}
            gradient="gradient-success"
            delay={0.3}
            subtitle="Active student attendance"
          />
          <StatCard
            title="System Rate"
            value={`${stats.rateToday}%`}
            icon={TrendingUp}
            gradient="gradient-secondary"
            delay={0.4}
            subtitle="Average attendance rate"
          />
        </div>
      ) : (
        // School Dashboard Stats Cards
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="My Classes"
            value={stats.totalClasses}
            icon={GraduationCap}
            gradient="gradient-warning"
            delay={0.05}
            subtitle="Classes in your roster"
          />
          <StatCard
            title="My Students"
            value={stats.totalStudents}
            icon={Users}
            gradient="gradient-primary"
            delay={0.1}
            subtitle="Students enrolled"
          />
          <StatCard
            title="Today's Rate"
            value={`${stats.rateToday}%`}
            icon={TrendingUp}
            gradient="gradient-info"
            delay={0.2}
            subtitle={stats.rateToday > 0 ? "Attendance marked" : "Not marked yet"}
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={CheckCircle2}
            gradient="gradient-success"
            delay={0.3}
            subtitle="Students marked present"
          />
          <StatCard
            title="Absent Today"
            value={stats.absentToday}
            icon={XCircle}
            gradient="gradient-danger"
            delay={0.4}
            subtitle="Students marked absent"
          />
        </div>
      )}

      {/* Main Grid: Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold dark:text-white text-gray-900 flex items-center gap-2">
            🚀 Action Center
          </h2>

          {/* Easy Access Onboarding Guide for New School Users */}
          {!isAdmin && (stats.totalClasses === 0 || stats.totalStudents === 0) && (
            <div className="p-5 rounded-2xl border dark:border-indigo-500/20 border-indigo-150 bg-indigo-500/5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">
                  💡
                </div>
                <div>
                  <h3 className="font-bold text-sm dark:text-white text-gray-900">
                    Welcome to your School Portal!
                  </h3>
                  <p className="text-xs dark:text-gray-400 text-gray-500 mt-0.5">
                    Follow these quick steps to set up your school account:
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                <div className={`p-3 rounded-xl border transition-colors ${stats.totalClasses === 0 ? 'dark:border-indigo-500/40 border-indigo-300 bg-indigo-500/10 font-semibold' : 'dark:border-white/5 border-gray-200 dark:bg-white/5 bg-gray-50/50 opacity-60'}`}>
                  <span className="font-extrabold text-indigo-500 block mb-0.5">Step 1: Add Class</span>
                  Create your grade levels and sections (e.g. 10-A, 11-B).
                </div>
                <div className={`p-3 rounded-xl border transition-colors ${stats.totalClasses > 0 && stats.totalStudents === 0 ? 'dark:border-indigo-500/40 border-indigo-300 bg-indigo-500/10 font-semibold' : 'dark:border-white/5 border-gray-200 dark:bg-white/5 bg-gray-50/50 opacity-60'}`}>
                  <span className="font-extrabold text-indigo-500 block mb-0.5">Step 2: Add Student</span>
                  Add students to your classes or import profiles in bulk.
                </div>
                <div className={`p-3 rounded-xl border transition-colors ${stats.totalClasses > 0 && stats.totalStudents > 0 ? 'dark:border-indigo-500/40 border-indigo-300 bg-indigo-500/10 font-semibold' : 'dark:border-white/5 border-gray-200 dark:bg-white/5 bg-gray-50/50 opacity-60'}`}>
                  <span className="font-extrabold text-indigo-500 block mb-0.5">Step 3: Take Attendance</span>
                  Start recording attendance for your students!
                </div>
              </div>
            </div>
          )}
          
          {isAdmin ? (
            // Admin Quick Actions
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/schools"
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 card hover:scale-[1.02] border hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5 dark:bg-white/5 bg-white border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  <School className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg dark:text-white text-gray-900 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  🏫 Manage School
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  Create, view, and delete school credentials and log accounts.
                </p>
              </Link>

              <Link
                to="/classes"
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 card hover:scale-[1.02] border hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 dark:bg-white/5 bg-white border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg dark:text-white text-gray-900 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                  📚 Classes
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  Define school grades and sections globally.
                </p>
              </Link>

              <Link
                to="/students"
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 card hover:scale-[1.02] border hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 dark:bg-white/5 bg-white border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg dark:text-white text-gray-900 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  👤 Students
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  Enroll student profiles into classes globally. Supports CSV imports.
                </p>
              </Link>

              <Link
                to="/reports"
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 card hover:scale-[1.02] border hover:border-pink-500/20 hover:shadow-xl hover:shadow-pink-500/5 dark:bg-white/5 bg-white border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg dark:text-white text-gray-900 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                  📄 Global Reports
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  Generate, inspect, and download reports for any school or class.
                </p>
              </Link>
            </div>
          ) : (
            // School/Teacher Quick Actions
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/classes"
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 card hover:scale-[1.02] border hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 dark:bg-white/5 bg-white border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg dark:text-white text-gray-900 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                  ➕ Add Class
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  Browse and manage your school's active grade lists and class sections.
                </p>
              </Link>

              <Link
                to="/students"
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 card hover:scale-[1.02] border hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 dark:bg-white/5 bg-white border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg dark:text-white text-gray-900 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  👤 Add Student
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  View and manage enrolled student profiles, enroll new students, or import from CSV.
                </p>
              </Link>

              <Link
                to="/attendance"
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 card hover:scale-[1.02] border hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5 dark:bg-white/5 bg-white border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg dark:text-white text-gray-900 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  ✅ Take Attendance
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  Mark student attendance logs for today's classes.
                </p>
              </Link>

              <Link
                to="/reports"
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 card hover:scale-[1.02] border hover:border-pink-500/20 hover:shadow-xl hover:shadow-pink-500/5 dark:bg-white/5 bg-white border-gray-100 dark:border-white/5"
              >
                <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg dark:text-white text-gray-900 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                  📄 View Reports
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                  Inspect compiled sheets and download attendance documents.
                </p>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity Panel */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold dark:text-white text-gray-900 flex items-center gap-2">
            📋 Activity Stream
          </h2>
          <div className="card p-6 border dark:border-white/5 border-gray-100 dark:bg-white/5 bg-white space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 rounded-md skeleton" />
                      <div className="h-2.5 w-1/3 rounded-md skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm dark:text-gray-400 text-gray-500">No activity logged yet</p>
                <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">Activities will appear once logs or reports are compiled.</p>
              </div>
            ) : (
              <div className="relative border-l dark:border-slate-800 border-slate-100 pl-4 space-y-6 ml-2">
                {recentActivities.map((act) => (
                  <div key={act.id} className="relative">
                    <span className={`absolute -left-[21px] top-1.5 flex h-3 w-3 rounded-full border-2 dark:border-slate-900 bg-white
                      ${act.type === 'report' ? 'border-pink-500' : 'border-indigo-500'}`}
                    />
                    <p className="text-xs font-semibold dark:text-slate-200 text-slate-800 leading-snug">
                      {act.message}
                    </p>
                    <p className="text-[10px] dark:text-slate-500 text-slate-400 mt-1">
                      {act.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
