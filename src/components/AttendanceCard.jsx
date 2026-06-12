import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { getInitials, getAvatarColor } from '@/utils/avatarUtils'

export default function AttendanceCard({ student, status, onMark, index = 0 }) {
  const isPresent = status === 'present'
  const isAbsent = status === 'absent'

  const cardClass = isPresent
    ? 'attendance-present'
    : isAbsent
      ? 'attendance-absent'
      : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      layout
      className={`card p-4 flex items-center justify-between gap-4 ${cardClass}`}
    >
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
          style={{ background: getAvatarColor(student.name) }}
        >
          {getInitials(student.name)}
        </div>
        <div className="min-w-0">
          <p className="font-medium dark:text-white text-gray-900 truncate text-sm">
            {student.name}
          </p>
          <p className="text-xs dark:text-gray-400 text-gray-500">
            Roll #{student.rollNumber}
          </p>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Present Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onMark(student._id || student.id, 'present')}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isPresent
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'dark:bg-white/5 dark:hover:bg-emerald-500/20 bg-gray-100 hover:bg-emerald-50 dark:text-gray-400 text-gray-500 hover:text-emerald-600'
          }`}
          aria-label="Mark present"
        >
          <Check className="w-4 h-4" />
        </motion.button>

        {/* Absent Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onMark(student._id || student.id, 'absent')}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isAbsent
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'dark:bg-white/5 dark:hover:bg-rose-500/20 bg-gray-100 hover:bg-rose-50 dark:text-gray-400 text-gray-500 hover:text-rose-600'
          }`}
          aria-label="Mark absent"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}
