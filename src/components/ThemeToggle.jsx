import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import useThemeStore from '@/store/useThemeStore'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl transition-colors duration-300
        dark:bg-white/10 dark:hover:bg-white/20
        bg-gray-100 hover:bg-gray-200"
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-indigo-300" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  )
}
