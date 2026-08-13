export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 rounded bg-zinc-200" />
      <div className="h-40 rounded-lg bg-zinc-200" />
      <div className="h-40 rounded-lg bg-zinc-200" />
    </div>
  );
}
