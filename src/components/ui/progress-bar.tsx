"use client";

import { cn } from "@/lib/utils";

type ProgressBarProps = {
  current: number;
  minRecommended: number;
  maxRecommended: number;
  hardMax?: number;
  className?: string;
};

export function ProgressBar({
  current,
  minRecommended,
  maxRecommended,
  hardMax = maxRecommended + 20,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((current / hardMax) * 100));

  let colorClass = "bg-zinc-200";
  let statusText = "Too short";

  if (current === 0) {
    colorClass = "bg-zinc-200";
    statusText = "Empty";
  } else if (current < minRecommended) {
    colorClass = "bg-amber-500";
    statusText = "Too short";
  } else if (current <= maxRecommended) {
    colorClass = "bg-emerald-500";
    statusText = "Good length";
  } else {
    colorClass = "bg-orange-500";
    statusText = "Too long";
  }

  return (
    <div className={cn("space-y-1 mt-1.5", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-150">
        <div
          className={cn("h-full transition-all duration-300 rounded-full", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <span>{statusText}</span>
        <span>
          {current} / {maxRecommended} chars
        </span>
      </div>
    </div>
  );
}
