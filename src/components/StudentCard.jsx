import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { getInitials, getAvatarColor } from '@/utils/avatarUtils'
import useAuthStore from '@/store/useAuthStore'

export default function StudentCard({ student, onEdit, onDelete }) {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const canManage = user?.role === 'admin' || user?.role === 'school'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="card p-5 group"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg"
          style={{ background: getAvatarColor(student.name) }}
        >
          {getInitials(student.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold dark:text-white text-gray-900 truncate">
            {student.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs dark:text-gray-400 text-gray-500">
              Roll #{student.rollNumber}
            </span>
            <span className="w-1 h-1 rounded-full dark:bg-gray-600 bg-gray-300" />
            <span className="text-xs dark:text-gray-400 text-gray-500">
              {student.classSection}
            </span>
          </div>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex items-center gap-1 transition-opacity duration-200">
            <button
              onClick={() => onEdit(student)}
              className="p-2 rounded-lg transition-colors duration-200
                dark:hover:bg-white/10 hover:bg-gray-100
                dark:text-gray-400 text-gray-500 hover:text-indigo-500"
              aria-label="Edit student"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(student)}
              className="p-2 rounded-lg transition-colors duration-200
                dark:hover:bg-white/10 hover:bg-gray-100
                dark:text-gray-400 text-gray-500 hover:text-rose-500"
              aria-label="Delete student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
