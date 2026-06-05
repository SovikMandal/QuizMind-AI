import { accColor, cardClass } from "./format";
import type { AnalyticsData } from "./types";

export function HardestQuestions({ questions }: { questions: AnalyticsData["questions"] }) {
  const hardest = [...questions].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  return (
    <div className={`flex flex-col gap-4 p-6 ${cardClass}`}>
      <div>
        <h2 className="text-lg font-semibold">Hardest Questions</h2>
        <p className="text-sm text-[#71717b]">Lowest correct answer rates</p>
      </div>
      <div className="flex flex-col gap-4">
        {hardest.length === 0 && <p className="text-sm text-zinc-400">No data yet</p>}
        {hardest.map((q) => (
          <div key={q.index} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium">
                Q{q.index} · {q.questionText}
              </span>
              <span style={{ color: accColor(q.accuracy) }}>{q.accuracy}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full"
                style={{ width: `${q.accuracy}%`, background: accColor(q.accuracy) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
