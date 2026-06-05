import { Loader2 } from "lucide-react";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";
const bar = "animate-pulse rounded-full bg-zinc-100";

function CreatedCardSkel() {
  return (
    <div className={`flex flex-col gap-4 p-6 ${card}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
      </div>
      <div className={`${bar} h-5 w-3/4`} />
      <div className={`${bar} h-3 w-1/2`} />
      <div className="flex items-center gap-4">
        <div className={`${bar} h-3 w-16`} />
        <div className={`${bar} h-3 w-16`} />
      </div>
      <div className="h-16 w-full animate-pulse rounded-lg bg-zinc-100" />
      <div className="mt-auto flex gap-2">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-[#2b7fff]/20" />
        <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-100" />
      </div>
    </div>
  );
}

function JoinedCardSkel() {
  return (
    <div className={`flex flex-col gap-3 p-6 ${card}`}>
      <div className="flex items-center justify-between">
        <div className="size-10 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
      </div>
      <div className={`${bar} h-5 w-3/4`} />
      <div className={`${bar} h-3 w-1/3`} />
      <div className="flex items-center gap-4">
        <div className={`${bar} h-3 w-20`} />
        <div className={`${bar} h-3 w-16`} />
      </div>
      <div className="mt-auto h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
    </div>
  );
}

export function MyQuizzesSkeleton() {
  return (
    <main className="mx-auto max-w-[1140px] px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-9 w-56 animate-pulse rounded-lg bg-zinc-100" />
          <div className={`${bar} h-3 w-80 max-w-full`} />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-[#2b7fff]/20" />
      </div>

      {/* Created by you */}
      <div className={`${bar} mb-4 h-6 w-40`} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CreatedCardSkel key={i} />
        ))}
      </div>

      {/* Joined quizzes */}
      <div className={`${bar} mb-4 mt-10 h-6 w-40`} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <JoinedCardSkel key={i} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin text-[#2b7fff]" />
        <span className="text-sm text-[#71717b]">Loading your quizzes…</span>
      </div>
    </main>
  );
}
