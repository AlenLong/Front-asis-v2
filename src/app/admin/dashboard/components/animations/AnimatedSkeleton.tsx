'use client';

import { motion } from 'framer-motion';

interface AnimatedSkeletonProps {
  rows?: number;
  cols?: number;
}

export function AnimatedSkeleton({ rows = 5, cols = 4 }: AnimatedSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex gap-4 mb-3 px-4 py-3 bg-gray-100 rounded-t-lg">
        {Array.from({ length: cols }).map((_, i) => (
          <motion.div
            key={`header-${i}`}
            className="h-4 bg-gray-300 rounded flex-1"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Body skeleton rows */}
      <div className="space-y-2 px-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4 py-3 border-b border-gray-100">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <motion.div
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4 bg-gray-200 rounded flex-1"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: (rowIndex + colIndex) * 0.05,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Single skeleton line
export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`h-4 bg-gray-200 rounded ${className}`}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
  );
}
