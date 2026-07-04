import { Code2 } from "lucide-react";
import { cn } from "@/components/ui";
import type { Q } from "./types";

interface Props {
  questions: Q[];
  currentIdx: number;
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  onSelect: (i: number) => void;
}

export function QuestionSidebar({ questions, currentIdx, answers, flagged, onSelect }: Props) {
  const chipClass = (i: number) => {
    const id = questions[i].id;
    if (i === currentIdx) return "ring-2 ring-[#2b7fff] bg-[#2b7fff]/10 text-[#2b7fff] font-bold";
    if (flagged[id]) return "bg-amber-100 text-amber-700 border border-amber-300";
    if (answers[id]) return "bg-[#2b7fff] text-white";
    return "bg-zinc-100 text-zinc-500 hover:bg-zinc-200";
  };

  return (
    <aside
      className="hidden lg:flex w-[60px] shrink-0 flex-col items-center border-r border-zinc-200 bg-white overflow-y-auto py-3"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#d4d4d8 transparent" }}
    >
      {questions.map((qItem, i) => {
        const itemHasCode = qItem.questionText.includes("```") && !qItem.questionText.includes("```diagram");
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              "relative mb-2 flex size-10 items-center justify-center rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer",
              chipClass(i)
            )}
          >
            {i + 1}
            {itemHasCode && (
              <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-violet-500">
                <Code2 className="size-2 text-white" />
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}
