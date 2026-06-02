import { Loader2 } from "lucide-react";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";
const bar = "animate-pulse rounded-full bg-zinc-100";

function CardSkel() {
  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <div className="size-9 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-5 w-12 animate-pulse rounded-full bg-[#2b7fff]/20" />
      </div>
      <div className="flex flex-col gap-2">
        <div className={`${bar} h-5 w-32`} />
        <div className={`${bar} h-4 w-24`} />
        <div className={`${bar} h-3 w-20`} />
      </div>
      <div className="h-9 w-full animate-pulse rounded-lg bg-[#2b7fff]/20" />
    </div>
  );
}

function SectionSkel() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-3 animate-pulse rounded-full bg-[#2b7fff]/20" />
          <div className={`${bar} h-6 w-32`} />
          <div className={`${bar} h-5 w-14`} />
        </div>
        <div className={`${bar} h-4 w-16`} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CardSkel />
        <CardSkel />
        <CardSkel />
      </div>
    </section>
  );
}

export function DiscoverSkeleton() {
  return (
    <main className="mx-auto max-w-[1140px] px-6 py-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-3">
          <div className={`${bar} h-6 w-40`} />
          <div className="h-9 w-72 animate-pulse rounded-lg bg-zinc-100" />
          <div className={`${bar} h-4 w-full max-w-md`} />
        </div>
        <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 sm:w-72" />
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <SectionSkel />
          <SectionSkel />
          <SectionSkel />
        </div>

        <aside className="flex flex-col gap-6">
          {/* Join private */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[#2b7fff]/20 bg-[#2b7fff]/5 p-6">
            <div className="size-11 animate-pulse rounded-xl bg-[#2b7fff]/20" />
            <div className="flex flex-col gap-2">
              <div className={`${bar} h-6 w-40`} />
              <div className={`${bar} h-3 w-full`} />
            </div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-[#2b7fff]/20" />
          </div>

          {/* Stats */}
          <div className={`flex flex-col gap-4 p-6 ${card}`}>
            <div className="flex flex-col gap-2">
              <div className={`${bar} h-5 w-24`} />
              <div className={`${bar} h-3 w-40`} />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className={`${bar} h-4 w-24`} />
                <div className={`${bar} h-4 w-8`} />
              </div>
            ))}
          </div>

          {/* Create */}
          <div className={`flex flex-col gap-3 p-6 ${card}`}>
            <div className="size-10 animate-pulse rounded-lg bg-zinc-100" />
            <div className={`${bar} h-5 w-32`} />
            <div className={`${bar} h-3 w-full`} />
            <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
          </div>
        </aside>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin text-[#2b7fff]" />
        <span className="text-sm text-[#71717b]">Loading your content…</span>
      </div>
    </main>
  );
}
