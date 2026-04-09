"use client";

export function LoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      {/* Header row */}
      <div className="grid gap-4 px-4 py-3 border-b border-border" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3 bg-secondary rounded-md w-3/4" />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4 px-4 py-3 border-b border-border/50 last:border-0" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-3 bg-secondary/50 rounded-md" style={{ width: `${50 + Math.random() * 40}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary" />
            <div className="w-12 h-3 bg-secondary rounded" />
          </div>
          <div className="w-20 h-6 bg-secondary rounded mb-1" />
          <div className="w-16 h-3 bg-secondary/50 rounded" />
        </div>
      ))}
    </div>
  );
}
