import { Users, Target, CircleCheck, Clock, type LucideIcon } from "lucide-react";
import { cardClass, fmtTime } from "./format";
import type { AnalyticsData } from "./types";

interface Card {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

export function MetricCards({ metrics }: { metrics: AnalyticsData["metrics"] }) {
  const cards: Card[] = [
    { icon: Users, value: metrics.totalStudents, label: "Students Joined" },
    { icon: Target, value: `${metrics.avgScorePct}%`, label: "Avg. Score" },
    { icon: CircleCheck, value: `${metrics.completionRate}%`, label: "Completion Rate" },
    { icon: Clock, value: fmtTime(metrics.avgTimeSecs), label: "Avg. Time Taken" },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className={`flex flex-col gap-4 p-6 ${cardClass}`}>
          <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]">
            <c.icon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold">{c.value}</span>
            <span className="text-sm text-[#71717b]">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
