import { Loader2 } from "lucide-react";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";
const bar = "animate-pulse rounded-full bg-zinc-100";

export function TakeQuizSkeleton() {
  return (
    <main className="mx-auto max-w-[1140px] px-6 py-8">
      {/* Title row */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-[#2b7fff]/20" />
          </div>
          <div className={`${bar} h-4 w-80 max-w-full`} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-28 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-12 w-36 animate-pulse rounded-lg bg-[#2b7fff]/20" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Question column */}
        <div className="flex flex-col gap-6">
          <div className={`flex flex-col gap-6 p-6 ${card}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 animate-pulse rounded-lg bg-[#2b7fff]/20" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-100" />
              </div>
              <div className={`${bar} h-4 w-28`} />
            </div>
            <div className="h-6 w-3/4 animate-pulse rounded-lg bg-zinc-100" />
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 ${i === 0 ? "border-[#2b7fff]/40 bg-[#2b7fff]/5" : "border-zinc-200"}`}
                >
                  <div className={`size-7 shrink-0 animate-pulse rounded-full ${i === 0 ? "bg-[#2b7fff]/20" : "bg-zinc-100"}`} />
                  <div
                    className={`h-4 animate-pulse rounded-full ${i === 0 ? "bg-[#2b7fff]/20" : "bg-zinc-100"}`}
                    style={{ width: `${40 + i * 8}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-zinc-200 pt-4">
              <div className="h-10 w-28 animate-pulse rounded-lg bg-zinc-100" />
              <div className="flex items-center gap-4">
                <div className="h-10 w-16 animate-pulse rounded-lg bg-zinc-100" />
                <div className="h-10 w-28 animate-pulse rounded-lg bg-[#2b7fff]/20" />
              </div>
            </div>
          </div>

          {/* Presence bar */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-100/50 p-4">
            <div className="flex items-center gap-4">
              <div className="size-5 animate-pulse rounded-sm bg-[#2b7fff]/20" />
              <div className={`${bar} h-4 w-72 max-w-full`} />
            </div>
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="size-8 animate-pulse rounded-full border-2 border-white bg-zinc-100" />
              ))}
            </div>
          </div>
        </div>

        {/* Progress sidebar */}
        <div className="flex flex-col gap-6">
          <div className={`flex flex-col gap-6 p-6 ${card}`}>
            <div className="flex items-center justify-between">
              <div className={`${bar} h-5 w-24`} />
              <div className="h-5 w-12 animate-pulse rounded-full bg-[#2b7fff]/20" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-zinc-100" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`aspect-square animate-pulse rounded-lg ${i < 3 ? "bg-[#2b7fff]/20" : "bg-zinc-100"}`} />
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`size-3 animate-pulse rounded-sm ${i === 0 ? "bg-[#2b7fff]/20" : "bg-zinc-100"}`} />
                    <div className={`${bar} h-3 w-20`} />
                  </div>
                  <div className={`${bar} h-3 w-6`} />
                </div>
              ))}
            </div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-[#2b7fff]/20" />
          </div>

          {/* Connection card */}
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4">
            <div className="size-10 animate-pulse rounded-lg bg-[#2b7fff]/20" />
            <div className="flex flex-col gap-2">
              <div className={`${bar} h-4 w-24`} />
              <div className={`${bar} h-3 w-40`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin text-[#2b7fff]" />
        <span className="text-sm text-[#71717b]">Loading your content…</span>
      </div>
    </main>
  );
}
