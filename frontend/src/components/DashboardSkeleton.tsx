import { Loader2 } from "lucide-react";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";
const bar = "animate-pulse rounded-full bg-zinc-100";

export function DashboardSkeleton() {
  return (
    <main className="mx-auto flex max-w-[1140px] flex-col gap-12 px-6 py-12">
      {/* Welcome */}
      <section className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-3">
          <div className={`${bar} h-6 w-36`} />
          <div className="h-9 w-80 max-w-full animate-pulse rounded-lg bg-zinc-100" />
          <div className={`${bar} h-3 w-96 max-w-full`} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-10 w-36 animate-pulse rounded-lg bg-[#2b7fff]/20" />
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex flex-col gap-4 p-6 ${card}`}>
            <div className="flex items-center justify-between">
              <div className="size-10 animate-pulse rounded-lg bg-zinc-100" />
              <div className={`${bar} h-5 w-12`} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-100" />
              <div className={`${bar} h-3 w-20`} />
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`flex flex-col gap-4 p-6 lg:col-span-2 ${card}`}>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className={`${bar} h-4 w-40`} />
              <div className={`${bar} h-2 w-56`} />
            </div>
            <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-100" />
          </div>
          <div className="flex h-64 items-end gap-3">
            {[40, 70, 55, 85, 50, 75, 60].map((h, i) => (
              <div
                key={i}
                className={`flex-1 animate-pulse rounded-t-lg ${i % 3 === 2 ? "bg-[#2b7fff]/20" : "bg-zinc-100"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className={`flex flex-col gap-4 p-6 ${card}`}>
          <div className="flex flex-col gap-2">
            <div className={`${bar} h-4 w-32`} />
            <div className={`${bar} h-2 w-24`} />
          </div>
          <div className="flex justify-center py-4">
            <div className="size-32 animate-pulse rounded-full border-8 border-zinc-100" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${bar} h-2 w-full`} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent + side */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`flex flex-col gap-4 p-6 lg:col-span-2 ${card}`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className={`${bar} h-4 w-40`} />
              <div className={`${bar} h-2 w-48`} />
            </div>
            <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-100" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-10 animate-pulse rounded-full bg-zinc-100" />
              <div className="flex flex-1 flex-col gap-2">
                <div className={`${bar} h-3 w-3/4`} />
                <div className={`${bar} h-2 w-1/2`} />
              </div>
            </div>
          ))}
        </div>
        <div className={`flex flex-col gap-4 p-6 ${card}`}>
          <div className="flex flex-col gap-2">
            <div className={`${bar} h-4 w-32`} />
            <div className={`${bar} h-2 w-24`} />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className={`${bar} h-3 w-full`} />
              <div className={`${bar} h-2 w-full`} />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 py-2">
        <Loader2 className="size-4 animate-spin text-[#2b7fff]" />
        <span className="text-sm text-[#71717b]">Loading your content…</span>
      </div>
    </main>
  );
}
