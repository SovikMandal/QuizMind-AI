import { Trophy } from "lucide-react";
import { cardClass, fmtTime, pctOf } from "./format";
import type { AnalyticsData } from "./types";

interface Props {
  leaderboard: AnalyticsData["leaderboard"];
  totalPoints: number;
}

export function Leaderboard({ leaderboard, totalPoints }: Props) {
  return (
    <div className={`flex flex-col gap-4 p-6 lg:col-span-2 ${cardClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Student Leaderboard</h2>
          <p className="text-sm text-[#71717b]">Top performers ranked by score</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#71717b]">
            <th className="w-16 pb-2 font-medium">Rank</th>
            <th className="pb-2 font-medium">Student</th>
            <th className="pb-2 font-medium">Score</th>
            <th className="pb-2 font-medium">Time</th>
            <th className="pb-2 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-zinc-500">
                No participants yet.
              </td>
            </tr>
          )}
          {leaderboard.map((e) => (
            <tr key={e.participantId} className="border-t border-zinc-100">
              <td className="py-3">
                {e.rank === 1 ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-amber-100">
                    <Trophy className="size-4 text-amber-500" />
                  </span>
                ) : (
                  <span className="flex size-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                    {e.rank}
                  </span>
                )}
              </td>
              <td className="py-3">
                <span className="flex items-center gap-3">
                  {e.avatarUrl ? (
                    <img src={e.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#2b7fff]/10 text-xs font-semibold text-[#2b7fff]">
                      {e.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="font-medium">{e.username}</span>
                </span>
              </td>
              <td className="py-3 font-semibold text-[#2b7fff]">{pctOf(e.score, totalPoints)}%</td>
              <td className="py-3 text-[#71717b]">{fmtTime(e.timeSecs)}</td>
              <td className="py-3 text-right">
                {e.status === "completed" ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">
                    Completed
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                    In progress
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
