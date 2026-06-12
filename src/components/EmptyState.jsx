import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-5 rounded-2xl mb-5
            dark:bg-white/5 bg-gray-100"
        >
          <Icon className="w-12 h-12 dark:text-gray-500 text-gray-400" />
        </motion.div>
      )}

      <h3 className="text-lg font-semibold mb-2 dark:text-gray-200 text-gray-800">
        {title}
      </h3>

      <p className="text-sm dark:text-gray-400 text-gray-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="btn-primary"
        >
          {action}
        </motion.button>
      )}
    </motion.div>
  )
}
