import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  Users,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Trash2,
  Save,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import EmptyState from '@/components/EmptyState';
import useAttendanceStore from '@/store/useAttendanceStore';
import useClassStore from '@/store/useClassStore';
import { getTodayString, formatDate } from '@/utils/dateUtils';
import { getAvatarColor, getInitials } from '@/utils/avatarUtils';

import toast from 'react-hot-toast';

export default function Attendance() {
  const [sessionDate, setSessionDate] = useState(getTodayString());
  const [selectedClass, setSelectedClass] = useState('');
  const [isMarkedListOpen, setIsMarkedListOpen] = useState(true);

  const { classes, fetchClasses } = useClassStore();
  const {
    activeQueue,
    markedList,
    undoStack,
    stats,
    isLoading,
    isSaving,
    initializeSession,
    markStudent,
    undoLastAction,
    markAll,
    updateMarking,
    unmarkStudent,
    saveSession,
  } = useAttendanceStore();

  useEffect(() => {
    fetchClasses();
  }, []);

  // Sync state whenever date or class selection changes
  useEffect(() => {
    if (selectedClass) {
      initializeSession(sessionDate, selectedClass);
    }
  }, [sessionDate, selectedClass]);

  // Handle default class selection
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      const firstClass = `${classes[0].name}-${classes[0].section}`;
      setSelectedClass(firstClass);
    }
  }, [classes]);

  // Keyboard Navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeQueue.length === 0) return;
      const currentStudent = activeQueue[0];

      if (e.key === 'ArrowRight' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        markStudent(currentStudent.id, 'present');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        markStudent(currentStudent.id, 'absent');
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undoLastAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQueue]);

  const handleSave = async () => {
    try {
      await saveSession();
      toast.success('Attendance records saved successfully!');

    } catch (err) {
      toast.error('Failed to save attendance registry');
    }
  };

  // Drag Motion Values for Swipe Card
  const dragX = useMotionValue(0);
  const cardRotate = useTransform(dragX, [-200, 200], [-20, 20]);
  const cardOpacity = useTransform(dragX, [-200, -150, 0, 150, 200], [0.6, 1, 1, 1, 0.6]);
  const bgTransform = useTransform(dragX, [-150, 150], ['rgba(239,68,68,0.25)', 'rgba(16,185,129,0.25)']);

  const handleDragEnd = (event, info) => {
    if (activeQueue.length === 0) return;
    const student = activeQueue[0];

    if (info.offset.x > 130) {
      // Swipe Right -> Present
      markStudent(student.id, 'present');
      toast.success(`${student.name} marked Present`, { id: `mark-${student.id}`, duration: 1000 });
    } else if (info.offset.x < -130) {
      // Swipe Left -> Absent
      markStudent(student.id, 'absent');
      toast.success(`${student.name} marked Absent`, { id: `mark-${student.id}`, duration: 1000 });
    }
    dragX.set(0); // Snap back values
  };

  const currentStudent = activeQueue[0];

  return (
    <PageWrapper className="space-y-6 max-w-5xl mx-auto">
      {/* Date & Class Select Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-light dark:glass border dark:border-white/10 border-gray-100 shadow-md">
        {/* Date input */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl dark:bg-indigo-500/10 dark:text-indigo-400 bg-indigo-50 text-indigo-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider dark:text-gray-400 text-gray-500">
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="bg-transparent dark:text-white text-gray-900 border-none p-0 focus:ring-0 text-sm font-semibold cursor-pointer outline-none"
            />
          </div>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl dark:bg-indigo-500/10 dark:text-indigo-400 bg-indigo-50 text-indigo-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider dark:text-gray-400 text-gray-500">
              Active Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent dark:text-white text-gray-900 border-none p-0 focus:ring-0 text-sm font-semibold cursor-pointer outline-none w-full"
            >
              <option value="" disabled className="dark:bg-slate-900">-- Select Class Section --</option>
              {classes.map((c) => {
                const label = `${c.name}-${c.section}`;
                return (
                  <option key={c.id} value={label} className="dark:bg-slate-900 dark:text-white text-gray-800">
                    Class {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="card p-16 text-center border dark:border-white/5 border-gray-100 dark:bg-white/5 bg-white shadow-md">
          <EmptyState
            title="Create a Class First"
            description="Before taking attendance, you need to create at least one class. Go to 'Add Class' in the sidebar to get started."
            icon={BookOpen}
          />
        </div>
      ) : !selectedClass ? (
        <div className="flex justify-center items-center py-20 text-gray-500 text-sm">
          Please select a class to begin attendance.
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm dark:text-gray-400 text-gray-500">Initializing attendance roster...</p>
        </div>
      ) : stats.total === 0 ? (
        <div className="card p-16 text-center border dark:border-white/5 border-gray-100 dark:bg-white/5 bg-white shadow-md">
          <EmptyState
            title="No Students in This Class"
            description={`Class "${selectedClass}" has no students yet. Go to 'Add Student' in the sidebar to add students to this class first.`}
            icon={Users}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Taking Interface */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats Roster Summary */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl dark:bg-white/5 bg-gray-50 border dark:border-white/5 border-gray-150">
              <div className="text-center py-1 border-r dark:border-white/5 border-gray-200">
                <p className="text-[10px] dark:text-gray-400 text-gray-500 font-bold uppercase tracking-wider">Total</p>
                <p className="text-lg font-black dark:text-white text-gray-900 mt-0.5">{stats.total}</p>
              </div>
              <div className="text-center py-1 border-r dark:border-white/5 border-gray-200">
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Present</p>
                <p className="text-lg font-black text-emerald-500 mt-0.5">{stats.present}</p>
              </div>
              <div className="text-center py-1 border-r dark:border-white/5 border-gray-200">
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Absent</p>
                <p className="text-lg font-black text-rose-500 mt-0.5">{stats.absent}</p>
              </div>
              <div className="text-center py-1">
                <p className="text-[10px] dark:text-gray-400 text-gray-500 font-bold uppercase tracking-wider">Queue</p>
                <p className="text-lg font-black dark:text-white text-gray-900 mt-0.5">{stats.unmarked}</p>
              </div>
            </div>

            {/* Active Queue Card stack */}
            <div className="relative flex flex-col items-center justify-center min-h-[360px] p-6 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-gray-150">
              {currentStudent ? (
                <div className="w-full max-w-sm flex flex-col items-center gap-6">
                  {/* Swipe tips */}
                  <span className="hidden sm:block text-[10px] uppercase font-bold tracking-wider dark:text-gray-400 text-gray-500 select-none animate-pulse">
                    👈 Drag Left = Absent | Drag Right = Present 👉
                  </span>

                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentStudent.id}
                      style={{ x: dragX, rotate: cardRotate, opacity: cardOpacity }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={handleDragEnd}
                      whileDrag={{ scale: 1.05 }}
                      className="w-full card p-8 border border-gray-150 dark:border-white/10 dark:bg-slate-900 bg-white shadow-xl rounded-3xl cursor-grab active:cursor-grabbing text-center space-y-6 select-none relative overflow-hidden"
                    >
                      {/* Avatar icon */}
                      <div
                        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg"
                        style={{ background: getAvatarColor(currentStudent.name) }}
                      >
                        {getInitials(currentStudent.name)}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-extrabold text-xl dark:text-white text-gray-900">
                          {currentStudent.name}
                        </h3>
                        <p className="text-xs dark:text-indigo-400 text-indigo-600 font-bold uppercase tracking-wide">
                          Roll #{currentStudent.rollNumber}
                        </p>
                      </div>

                      <div className="inline-flex py-1 px-3.5 rounded-full text-xs font-semibold dark:bg-white/5 bg-gray-100 dark:text-gray-400 text-gray-500 border dark:border-white/5 border-gray-200">
                        Class {currentStudent.classSection}
                      </div>

                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                        Tip: You can also use keyboard — press [←] for Absent, [→] for Present
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Physical marking click buttons */}
                  <div className="flex items-center justify-center gap-6 w-full mt-6">

                    {/* Absent button */}
                    <button
                      onClick={() => markStudent(currentStudent.id, 'absent')}
                      className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md"
                      title="Mark Absent [Left Arrow]"
                    >
                      <X className="w-6 h-6 stroke-[3px]" />
                    </button>

                    {/* Present button */}
                    <button
                      onClick={() => markStudent(currentStudent.id, 'present')}
                      className="px-16 py-5 rounded-full bg-emerald-500 text-white flex items-center gap-4 text-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                      title="Mark Present [Right Arrow]"
                    >
                      <Check className="w-8 h-8 stroke-[3px]" />
                      Present
                    </button>

                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-8">
                  <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                  <h3 className="font-extrabold text-lg dark:text-white text-gray-800">All Done! ✨</h3>
                  <p className="text-xs dark:text-gray-400 text-gray-500 max-w-xs mx-auto">
                    You've marked all students in Class {selectedClass}. Click the button below to save.
                  </p>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary inline-flex items-center gap-2 py-2.5 px-6 font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Attendance Now
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions / Reset / Undo controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={undoLastAction}
                  disabled={undoStack.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border dark:border-white/5 border-gray-250 dark:bg-white/5 bg-white dark:text-white text-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Undo
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => markAll('present')}
                  disabled={activeQueue.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/10"
                >
                  ✅ All Present
                </button>
                <button
                  onClick={() => markAll('absent')}
                  disabled={activeQueue.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-md shadow-rose-500/10"
                >
                  ❌ All Absent
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Edit drawer list of Marked Students */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card border dark:border-white/5 border-gray-150 dark:bg-slate-900 bg-white shadow-lg overflow-hidden">
              <button
                onClick={() => setIsMarkedListOpen(!isMarkedListOpen)}
                className="w-full flex items-center justify-between p-4 font-extrabold text-sm dark:text-white text-gray-800 border-b dark:border-white/5 border-gray-100 dark:bg-white/5 bg-gray-50 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Marked Students ({markedList.length})
                </span>
                {isMarkedListOpen ? <ChevronDown className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence initial={false}>
                {isMarkedListOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-[380px] overflow-y-auto divide-y dark:divide-white/5 divide-gray-100">
                      {markedList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
                          No students marked yet. Drag the card or click the ✓ / ✗ buttons.
                        </div>
                      ) : (
                        markedList.map(({ student, status }) => {
                          const isPresent = status === 'present';
                          return (
                            <div
                              key={student.id}
                              className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                  style={{ background: getAvatarColor(student.name) }}
                                >
                                  {getInitials(student.name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold dark:text-white text-gray-900 truncate max-w-[120px]">
                                    {student.name}
                                  </p>
                                  <p className="text-[10px] dark:text-gray-400 text-gray-500">
                                    Roll #{student.rollNumber}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Toggle badge */}
                                <button
                                  onClick={() => updateMarking(student.id, isPresent ? 'absent' : 'present')}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border active:scale-95
                                    ${isPresent
                                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                    }`}
                                >
                                  {status}
                                </button>
                                {/* Unmark/trash button */}
                                <button
                                  onClick={() => unmarkStudent(student.id)}
                                  className="p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                  title="Remove marking"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Permanent Save button */}
            {markedList.length > 0 && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-600/15"
              >
                {isSaving ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                Save Attendance
              </button>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
