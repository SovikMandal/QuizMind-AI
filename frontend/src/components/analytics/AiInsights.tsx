import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui";

interface Props {
  summary: string;
  onGenerate: () => void;
}

export function AiInsights({ summary, onGenerate }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#2b7fff]/20 bg-[#2b7fff]/5 p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#2b7fff] text-white">
          <Sparkles className="size-5" />
        </div>
        <h2 className="text-base font-semibold">AI Insights</h2>
      </div>
      <p className="text-sm text-[#71717b]">{summary}</p>
      <Button className="w-full gap-2" onClick={onGenerate}>
        <Wand2 className="size-4" /> Generate review
      </Button>
    </div>
  );
}
