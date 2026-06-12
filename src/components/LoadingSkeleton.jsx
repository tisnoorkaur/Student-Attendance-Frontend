export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-6 dark:bg-white/5 bg-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="skeleton h-3 w-20 mb-3" />
                <div className="skeleton h-8 w-16 mb-2" />
                <div className="skeleton h-2 w-24" />
              </div>
              <div className="skeleton h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="rounded-2xl overflow-hidden dark:bg-white/5 bg-white border dark:border-white/10 border-gray-100">
        {/* Header */}
        <div className="flex gap-4 p-4 border-b dark:border-white/10 border-gray-100">
          {[60, 120, 100, 80, 70].map((w, i) => (
            <div key={i} className="skeleton h-4" style={{ width: w }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b dark:border-white/5 border-gray-50">
            <div className="skeleton h-4 w-8" />
            <div className="skeleton h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-20" />
            </div>
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  // Default: card type
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="skeleton h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
          <div className="skeleton h-3 w-full mb-2" />
          <div className="skeleton h-3 w-2/3" />
        </div>
      ))}
    </div>
  )
}
