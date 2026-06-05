import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cardClass } from "./format";
import type { AnalyticsData } from "./types";

interface Props {
  participation: AnalyticsData["participation"];
  scoreDistribution: AnalyticsData["scoreDistribution"];
  passRate: number;
}

export function Charts({ participation, scoreDistribution, passRate }: Props) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className={`flex flex-col gap-4 p-6 lg:col-span-2 ${cardClass}`}>
        <div>
          <h2 className="text-lg font-semibold">Participation Over Time</h2>
          <p className="text-sm text-[#71717b]">Student attempts over the last 6 weeks</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={participation}>
            <defs>
              <linearGradient id="fillAttempts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2b7fff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2b7fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e4e4e7" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip />
            <Area
              dataKey="attempts"
              type="natural"
              fill="url(#fillAttempts)"
              stroke="#2b7fff"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={`flex flex-col gap-4 p-6 ${cardClass}`}>
        <div>
          <h2 className="text-lg font-semibold">Score Distribution</h2>
          <p className="text-sm text-[#71717b]">How students scored</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={scoreDistribution}>
            <CartesianGrid vertical={false} stroke="#e4e4e7" />
            <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip />
            <Bar dataKey="count" fill="#2b7fff" radius={6} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-4">
          <span className="text-sm text-[#71717b]">Pass rate (≥50%)</span>
          <span className="text-lg font-bold text-[#2b7fff]">{passRate}%</span>
        </div>
      </div>
    </div>
  );
}
