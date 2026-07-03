import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-secondary-200/60 dark:bg-secondary-700/50 ${className || ''}`}
      {...props}
    />
  )
}
