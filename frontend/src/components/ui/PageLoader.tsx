import { Skeleton } from './Skeleton'

interface PageLoaderProps {
  type?: 'dashboard' | 'list' | 'detail' | 'simple'
}

export function PageLoader({ type = 'dashboard' }: PageLoaderProps) {
  if (type === 'simple') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="space-y-4 w-full max-w-md mx-auto text-center">
           <Skeleton className="h-12 w-12 rounded-full mx-auto" />
           <Skeleton className="h-4 w-3/4 mx-auto" />
           <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="w-full space-y-6 p-2 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="card p-4">
          <div className="space-y-4 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-secondary-100 last:border-0">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'detail') {
    return (
      <div className="w-full space-y-6 max-w-5xl mx-auto p-4 md:p-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // Dashboard type
  return (
    <div className="w-full space-y-6 p-2 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 hidden md:block" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-[250px] w-full" />
        </div>
        <div className="card p-6 space-y-4">
          <Skeleton className="h-6 w-36 mb-6" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
