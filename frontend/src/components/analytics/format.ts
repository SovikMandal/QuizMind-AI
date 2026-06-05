/** Formats elapsed seconds as "Xm SSs". */
export const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;

/** Color ramp for accuracy bars: red < 40%, amber < 60%, green otherwise. */
export const accColor = (a: number) =>
  a < 40 ? "#e7000b" : a < 60 ? "#ca8a04" : "#16a34a";

/** Convenience: percent of total points. Returns whole numbers. */
export const pctOf = (score: number, totalPoints: number) =>
  Math.round((score / Math.max(1, totalPoints)) * 100);

/** Shared card classes used across the page. */
export const cardClass = "rounded-2xl border border-zinc-200 bg-white shadow-sm";
