"use client";

import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, className, children }: ChartCardProps) {
  return (
    <div className={cn("neu-card p-6", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-bold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
