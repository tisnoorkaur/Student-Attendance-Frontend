import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Award,
  AlertTriangle,
  Loader2,
  Calendar,
  PieChartIcon,
  Percent,
  CalendarDays,
  Target
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { getWeeklyTrend, getMonthlyTrend } from '@/services/attendanceService';
import { getAllStudents } from '@/services/studentService';
import { formatDateShort } from '@/utils/dateUtils';
import { getInitials, getAvatarColor } from '@/utils/avatarUtils';
import { apiFetch } from '@/services/api';

export default function Analytics() {
  const [range, setRange] = useState('weekly'); // 'weekly' | 'monthly'
  const [trendData, setTrendData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [topPresent, setTopPresent] = useState([]);
  const [topAbsent, setTopAbsent] = useState([]);
  const [statsSummary, setStatsSummary] = useState({
    avgRate: 0,
    totalLogsCount: 0,
    bestClass: 'N/A'
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch trend data
      const rawTrend = range === 'weekly' ? await getWeeklyTrend() : await getMonthlyTrend();
      const formattedTrend = rawTrend.map((d) => ({
        ...d,
        formattedDate: formatDateShort(d.date),
        rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
      }));
      setTrendData(formattedTrend);

      // 2. Fetch all students & attendance
      const students = await getAllStudents();
      const allAttendance = await apiFetch('/api/attendance');

      // Calculate total present/absent counts for Pie Chart
      let totalPresent = 0;
      let totalAbsent = 0;
      const studentStats = {};

      for (const record of allAttendance) {
        if (!studentStats[record.studentId]) {
          studentStats[record.studentId] = { present: 0, absent: 0, total: 0 };
        }
        studentStats[record.studentId].total++;
        if (record.status === 'present') {
          studentStats[record.studentId].present++;
          totalPresent++;
        } else {
          studentStats[record.studentId].absent++;
          totalAbsent++;
        }
      }

      setPieData([
        { name: 'Present', value: totalPresent, color: '#10b981' }, // emerald-500
        { name: 'Absent', value: totalAbsent, color: '#ef4444' }    // rose-500
      ]);

      // Map statistics back to student profiles
      const enrichedStudents = students.map((s) => {
        const stat = studentStats[s.id] || { present: 0, absent: 0, total: 0 };
        const percentage = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
        return {
          ...s,
          ...stat,
          percentage,
        };
      });

      // Presentees and Absentees lists
      const markedStudents = enrichedStudents.filter((s) => s.total > 0);
      const presentLeaders = [...markedStudents]
        .sort((a, b) => b.percentage - a.percentage || b.present - a.present)
        .slice(0, 5);

      const absentLeaders = [...markedStudents]
        .filter((s) => s.percentage < 85) // Chronicles are < 85%
        .sort((a, b) => a.percentage - b.percentage || b.absent - a.absent)
        .slice(0, 5);

      setTopPresent(presentLeaders);
      setTopAbsent(absentLeaders);

      // Calculate class-wise attendance rates
      const classMap = {};
      for (const student of enrichedStudents) {
        if (!student.classSection) continue;
        if (!classMap[student.classSection]) {
          classMap[student.classSection] = { present: 0, total: 0 };
        }
        classMap[student.classSection].present += student.present;
        classMap[student.classSection].total += student.total;
      }

      const formattedClasses = Object.entries(classMap).map(([className, stat]) => ({
        name: className,
        rate: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0,
      })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      setClassData(formattedClasses);

      // Compute statistics cards metrics
      const overallAvg = allAttendance.length > 0 ? Math.round((totalPresent / allAttendance.length) * 100) : 0;
      
      let bestClass = 'N/A';
      if (formattedClasses.length > 0) {
        const sortedByRate = [...formattedClasses].sort((a, b) => b.rate - a.rate);
        bestClass = sortedByRate[0].name;
      }

      setStatsSummary({
        avgRate: overallAvg,
        totalLogsCount: allAttendance.length,
        bestClass
      });

    } catch (err) {
      console.error('Failed to compile analytics metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  return (
    <PageWrapper className="space-y-8">
      {/* Header and Toggle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900 tracking-tight">
            Attendance Insights & Trends
          </h1>
          <p className="text-sm dark:text-gray-400 text-gray-500 mt-0.5">
            Identify long-term attendance trends, class-wise rates, and students requiring attention.
          </p>
        </div>

        {/* Range Selector Pill */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl border dark:border-white/5 border-gray-150 self-start sm:self-auto select-none">
          <button
            onClick={() => setRange('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 relative`}
          >
            {range === 'weekly' && (
              <motion.div
                layoutId="active-range"
                className="absolute inset-0 bg-indigo-650 rounded-xl shadow-md z-0"
              />
            )}
            <span className={`relative z-10 ${range === 'weekly' ? 'text-white' : 'dark:text-slate-400 text-slate-550 hover:text-slate-800 dark:hover:text-slate-250'}`}>
              Last 7 Days
            </span>
          </button>
          <button
            onClick={() => setRange('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 relative`}
          >
            {range === 'monthly' && (
              <motion.div
                layoutId="active-range"
                className="absolute inset-0 bg-indigo-650 rounded-xl shadow-md z-0"
              />
            )}
            <span className={`relative z-10 ${range === 'monthly' ? 'text-white' : 'dark:text-slate-400 text-slate-550 hover:text-slate-800 dark:hover:text-slate-250'}`}>
              Last 30 Days
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-36 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm dark:text-gray-400 text-gray-500">Compiling analytical databases...</p>
        </div>
      ) : (
        <>
          {/* Stats summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card p-5 border border-gray-150 dark:border-white/5 bg-white dark:bg-slate-900/50 flex items-center gap-4">
              <div className="p-3.5 rounded-2xl dark:bg-indigo-500/10 dark:text-indigo-400 bg-indigo-50 text-indigo-700">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Overall Avg Rate</p>
                <p className="text-xl font-black dark:text-white text-gray-900 mt-0.5">{statsSummary.avgRate}%</p>
              </div>
            </div>

            <div className="card p-5 border border-gray-150 dark:border-white/5 bg-white dark:bg-slate-900/50 flex items-center gap-4">
              <div className="p-3.5 rounded-2xl dark:bg-emerald-500/10 dark:text-emerald-400 bg-emerald-50 text-emerald-700">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Total Marks Logged</p>
                <p className="text-xl font-black dark:text-white text-gray-900 mt-0.5">{statsSummary.totalLogsCount}</p>
              </div>
            </div>

            <div className="card p-5 border border-gray-150 dark:border-white/5 bg-white dark:bg-slate-900/50 flex items-center gap-4">
              <div className="p-3.5 rounded-2xl dark:bg-amber-500/10 dark:text-amber-400 bg-amber-50 text-amber-700">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Highest Attendance Class</p>
                <p className="text-xl font-black dark:text-white text-gray-900 mt-0.5">Class {statsSummary.bestClass}</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart 1: Attendance Trend Over Time (Area Chart) */}
            <div className="lg:col-span-2 card p-6 border dark:border-white/5 border-gray-100 dark:bg-slate-900 bg-white space-y-4 shadow-md">
              <h2 className="font-bold text-base dark:text-white text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
                Attendance Percentage Trend
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                      formatter={(value) => [`${value}%`, 'Attendance']}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRate)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Attendance Rate by Class (Bar Chart) */}
            <div className="lg:col-span-1 card p-6 border dark:border-white/5 border-gray-100 dark:bg-slate-900 bg-white space-y-4 shadow-md">
              <h2 className="font-bold text-base dark:text-white text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4.5 h-4.5 text-indigo-500" />
                Class-wise Performance
              </h2>
              <div className="h-[300px] w-full">
                {classData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 text-xs py-10">
                    <Calendar className="w-8 h-8 mb-2 stroke-gray-500" />
                    No class metrics available. Check back after marking attendance.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#ffffff',
                        }}
                        formatter={(value) => [`${value}%`, 'Attendance Rate']}
                      />
                      <Bar
                        dataKey="rate"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Pie Chart & Leaders Board Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart 3: Present vs Absent (Pie Chart) */}
            <div className="lg:col-span-1 card p-6 border dark:border-white/5 border-gray-100 dark:bg-slate-900 bg-white space-y-4 shadow-md">
              <h2 className="font-bold text-base dark:text-white text-gray-900 flex items-center gap-2">
                <PieChartIcon className="w-4.5 h-4.5 text-indigo-500" />
                Overall Present vs Absent ratio
              </h2>
              <div className="h-[260px] w-full flex items-center justify-center">
                {statsSummary.totalLogsCount === 0 ? (
                  <div className="text-xs text-gray-400 font-semibold">No attendance logged yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#ffffff',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Presentees list */}
            <div className="lg:col-span-1 card p-6 border dark:border-white/5 border-gray-100 dark:bg-slate-900 bg-white space-y-4 shadow-md">
              <h2 className="font-bold text-base text-emerald-500 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Exemplary Attendance (Top performers)
              </h2>
              {topPresent.length === 0 ? (
                <p className="text-sm text-gray-400 font-semibold text-center py-10">No data records computed yet.</p>
              ) : (
                <div className="divide-y dark:divide-white/5 divide-gray-100">
                  {topPresent.map((student) => (
                    <div key={student.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                          style={{ background: getAvatarColor(student.name) }}
                        >
                          {getInitials(student.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold dark:text-white text-gray-900 truncate max-w-[120px]">{student.name}</p>
                          <p className="text-[9px] dark:text-gray-400 text-gray-500 font-bold uppercase tracking-wide">Class {student.classSection} • Roll #{student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-500">{student.percentage}%</p>
                        <p className="text-[8px] dark:text-gray-500 text-gray-400 font-semibold">{student.present} / {student.total} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chronically Absent lists */}
            <div className="lg:col-span-1 card p-6 border dark:border-white/5 border-gray-100 dark:bg-slate-900 bg-white space-y-4 shadow-md">
              <h2 className="font-bold text-base text-rose-500 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Chronic Absenteeism (Needs Attention)
              </h2>
              {topAbsent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 text-xs h-full min-h-[160px]">
                  <Award className="w-8 h-8 text-emerald-500 mb-2" />
                  No student attendance rates are currently below 85%!
                </div>
              ) : (
                <div className="divide-y dark:divide-white/5 divide-gray-100">
                  {topAbsent.map((student) => (
                    <div key={student.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                          style={{ background: getAvatarColor(student.name) }}
                        >
                          {getInitials(student.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold dark:text-white text-gray-900 truncate max-w-[120px]">{student.name}</p>
                          <p className="text-[9px] dark:text-gray-400 text-gray-500 font-bold uppercase tracking-wide">Class {student.classSection} • Roll #{student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-rose-500">{student.percentage}%</p>
                        <p className="text-[8px] dark:text-gray-500 text-gray-400 font-semibold">{student.absent} / {student.total} days absent</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </PageWrapper>
  );
}
