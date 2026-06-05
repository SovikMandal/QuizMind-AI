import { Loader2 } from "lucide-react";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";
const bar = "animate-pulse rounded-full bg-zinc-100";

function NotifRow() {
  return (
    <div className={`flex items-start gap-4 p-4 ${card}`}>
      <div className="size-10 shrink-0 animate-pulse rounded-xl bg-zinc-100" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className={`${bar} h-4 w-1/2`} />
          <div className={`${bar} h-3 w-12`} />
        </div>
        <div className={`${bar} h-3 w-full`} />
        <div className={`${bar} h-3 w-3/4`} />
      </div>
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-56 animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-[#2b7fff]/20" />
          </div>
          <div className={`${bar} h-3 w-80 max-w-full`} />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-zinc-100" />
      </div>

      {/* Tabs */}
      <div className="mb-6 inline-flex gap-1 rounded-xl bg-zinc-100 p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-white/50" />
        ))}
      </div>

      {/* Day group label */}
      <div className={`${bar} mb-2 h-3 w-16`} />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotifRow key={i} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin text-[#2b7fff]" />
        <span className="text-sm text-[#71717b]">Loading notifications…</span>
      </div>
    </main>
  );
}
