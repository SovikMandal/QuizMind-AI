interface Props {
  answeredCount: number;
  flaggedCount: number;
  total: number;
}

export function StatsBar({ answeredCount, flaggedCount, total }: Props) {
  const progressPercent = total ? (answeredCount / total) * 100 : 0;

  return (
    <div className="shrink-0 border-b border-zinc-200 bg-white px-6 py-2.5">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#2b7fff]" />
            <span className="text-xs font-medium text-zinc-600">
              Answered: <span className="font-bold text-zinc-900">{answeredCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-zinc-600">
              Flagged: <span className="font-bold text-zinc-900">{flaggedCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-zinc-300" />
            <span className="text-xs font-medium text-zinc-600">
              Unanswered: <span className="font-bold text-zinc-900">{total - answeredCount}</span>
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 justify-end">
          <div className="w-48 h-1.5 rounded-full bg-zinc-100">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#2b7fff]">
            {answeredCount}/{total} completed
          </span>
        </div>
      </div>
    </div>
  );
}
