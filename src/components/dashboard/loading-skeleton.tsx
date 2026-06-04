"use client";

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="neu-card-static p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded-lg skeleton" />
              <div className="h-3 w-1/2 rounded-lg skeleton" />
            </div>
            <div className="h-8 w-20 rounded-full skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="neu-card-static p-5 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="h-5 w-12 rounded-full skeleton" />
          </div>
          <div className="h-7 w-20 rounded-lg skeleton mb-1" />
          <div className="h-3 w-16 rounded-lg skeleton" />
        </div>
      ))}
    </div>
  );
}
