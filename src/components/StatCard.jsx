import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function StatCard({ title, value, icon: Icon, gradient = 'gradient-primary', delay = 0, subtitle }) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0
    if (numericValue === 0) {
      setDisplayValue(0)
      return
    }

    const duration = 1200
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(eased * numericValue))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  const formattedValue = typeof value === 'string' && value.includes('%')
    ? `${displayValue}%`
    : displayValue

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`stat-card ${gradient} text-white`}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{formattedValue}</p>
          {subtitle && (
            <p className="text-xs text-white/60 mt-1.5">{subtitle}</p>
          )}
        </div>
        <div className="flex-shrink-0 p-3 rounded-xl bg-white/15 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}
