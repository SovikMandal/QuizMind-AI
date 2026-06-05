import { Loader2 } from "lucide-react";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";
const bar = "animate-pulse rounded-full bg-zinc-100";

function CardSkel() {
  return (
    <div className={`flex h-full flex-col gap-3 p-5 ${card}`}>
      <div className="flex items-center justify-between">
        <div className="size-10 animate-pulse rounded-lg bg-zinc-100" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-[#2b7fff]/20" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className={`${bar} h-5 w-3/4`} />
          <div className={`${bar} h-3 w-1/2`} />
        </div>
        <div className="flex items-center gap-2">
          <div className="size-5 animate-pulse rounded-full bg-zinc-100" />
          <div className={`${bar} h-3 w-32`} />
        </div>
        <div className="flex items-center gap-4">
          <div className={`${bar} h-3 w-24`} />
          <div className={`${bar} h-3 w-20`} />
        </div>
        <div className="h-9 w-full animate-pulse rounded-lg bg-zinc-100" />
      </div>

      <div className="mt-auto flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-[#2b7fff]/20" />
        <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-100" />
      </div>
    </div>
  );
}

export function QuizListSkeleton() {
  return (
    <main className="mx-auto max-w-5xl px-8 py-10">
      {/* Back link */}
      <div className={`${bar} mb-6 h-4 w-32`} />

      {/* Title row */}
      <div className="mb-2 flex items-center gap-3">
        <div className="size-7 animate-pulse rounded-full bg-[#2b7fff]/20" />
        <div className="h-7 w-56 animate-pulse rounded-lg bg-zinc-100" />
        <div className={`${bar} h-5 w-8`} />
      </div>
      <div className={`${bar} mb-6 h-3 w-96 max-w-full`} />

      {/* Search + filter */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-11 flex-1 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-11 w-52 animate-pulse rounded-lg bg-zinc-100" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkel key={i} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin text-[#2b7fff]" />
        <span className="text-sm text-[#71717b]">Loading quizzes…</span>
      </div>
    </main>
  );
}
