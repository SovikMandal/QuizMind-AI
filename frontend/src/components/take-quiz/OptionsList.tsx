import { CheckCircle2 } from "lucide-react";
import { cn } from "@/components/ui";
import type { Q } from "./types";
import { cleanFormula } from "./utils";

interface Props {
  question: Q;
  answer: string | undefined;
  locked: boolean;
  theme: "blue" | "violet";
  mono?: boolean;
  onSelect: (optId: string) => void;
  onType: (val: string) => void;
}

export function OptionsList({ question, answer, locked, theme, mono, onSelect, onType }: Props) {
  const accent = theme === "violet" ? "#8b5cf6" : "#2b7fff";

  if (!question.options || !question.options.length) {
    return (
      <textarea
        value={answer ?? ""}
        disabled={locked}
        onChange={(e) => onType(e.target.value)}
        placeholder="Type your answer here..."
        rows={5}
        className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 resize-none"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {question.options.map((o, i) => {
        const selected = answer === o.id;
        const optText = o.text.includes("\\") ? cleanFormula(o.text) : o.text;
        return (
          <button
            key={o.id}
            disabled={locked}
            onClick={() => onSelect(o.id)}
            className={cn(
              "group flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-150 cursor-pointer",
              selected ? "shadow-sm" : "border-zinc-200 bg-white hover:bg-zinc-50"
            )}
            style={selected ? { borderColor: accent, backgroundColor: `${accent}0d` } : undefined}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                selected ? "text-white" : "border-zinc-300 text-zinc-500"
              )}
              style={selected ? { borderColor: accent, backgroundColor: accent } : undefined}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span
              className={cn("text-[15px]", mono ? "font-mono" : "font-medium", selected ? "" : "text-zinc-700")}
              style={selected ? { color: accent } : undefined}
            >
              {optText}
            </span>
            {selected && <CheckCircle2 className="ml-auto size-5 shrink-0" style={{ color: accent }} />}
          </button>
        );
      })}
    </div>
  );
}
