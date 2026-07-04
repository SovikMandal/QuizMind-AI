import { ChevronLeft, ChevronRight, Flag, Send, Code2, Calculator } from "lucide-react";
import { Button, Card, Badge, cn } from "@/components/ui";
import type { Q, ParsedQuestion } from "./types";
import { typeLabel, difficultyBadge } from "./utils";
import { CodeBlock } from "./CodeBlock";
import { OptionsList } from "./OptionsList";

interface Props {
  question: Q;
  parsed: ParsedQuestion;
  idx: number;
  total: number;
  subject?: string | null;
  answer: string | undefined;
  isFlagged: boolean;
  locked: boolean;
  submitting: boolean;
  answeredCount: number;
  onSelectOption: (optId: string) => void;
  onTypeAnswer: (val: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  onSubmit: () => void;
}

export function QuestionPanel({
  question,
  parsed,
  idx,
  total,
  subject,
  answer,
  isFlagged,
  locked,
  submitting,
  answeredCount,
  onSelectOption,
  onTypeAnswer,
  onPrev,
  onNext,
  onToggleFlag,
  onSubmit,
}: Props) {
  const hasCode = !!parsed.code;

  const MetaRow = (
    <div className="flex items-center flex-wrap gap-2">
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-lg text-xs font-bold text-white",
          hasCode ? "bg-violet-600" : "bg-[#2b7fff]"
        )}
      >
        {idx + 1}
      </span>
      {hasCode ? (
        <Badge className="bg-violet-100 border border-violet-200 text-violet-700">
          <Code2 className="size-3" /> CODE
        </Badge>
      ) : (
        <Badge className="bg-blue-100 border border-blue-200 text-blue-700">
          <Calculator className="size-3" /> {typeLabel[question.questionType] ?? question.questionType}
        </Badge>
      )}
      {question.difficulty && <Badge className={cn("border", difficultyBadge(question.difficulty))}>{question.difficulty}</Badge>}
      {subject && (
        <Badge className={hasCode ? "bg-zinc-100 border border-zinc-200 text-zinc-600" : "bg-violet-50 border border-violet-200 text-violet-600"}>
          {subject}
        </Badge>
      )}
      <span className="ml-auto text-xs font-medium text-zinc-400">
        {idx + 1} / {total}
      </span>
    </div>
  );

  const Formula = parsed.formula ? (
    <div className="rounded-xl bg-blue-50 border border-blue-100 px-6 py-5 text-center">
      <p className="font-mono text-xl md:text-2xl text-blue-800 tracking-wide leading-relaxed">{parsed.formula}</p>
    </div>
  ) : null;

  const Diagram = parsed.diagram ? (
    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
      <pre className="text-sm font-mono leading-relaxed text-blue-900 whitespace-pre overflow-x-auto">{parsed.diagram}</pre>
    </div>
  ) : null;

  return (
    <main className="flex-1 overflow-hidden flex flex-col">
      <Card className="border-0 shadow-none rounded-none flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 grid lg:grid-cols-2 min-h-0 overflow-y-auto scrollbar-hide divide-x divide-zinc-200">
          {/* Left: question + code/formula/diagram */}
          <div className="p-5 flex flex-col gap-4 min-w-0">
            {MetaRow}
            <div className="rounded-xl border border-zinc-200 px-5 py-4">
              <p className="text-[15px] leading-relaxed text-zinc-800">{parsed.text}</p>
            </div>
            {Formula}
            {Diagram}
            {hasCode && <CodeBlock code={parsed.code} language={parsed.codeLang} />}
            {!hasCode && question.imageUrl && (
              <div className="rounded-lg border border-zinc-200 overflow-hidden bg-white">
                <img src={question.imageUrl} alt="Question" className="w-full h-auto max-h-[300px] object-contain" />
              </div>
            )}
          </div>

          {/* Right: options */}
          <div className={cn("p-5 min-w-0", hasCode && "bg-slate-50/60")}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Select your answer</h3>
            <OptionsList
              question={question}
              answer={answer}
              locked={locked}
              theme={hasCode ? "violet" : "blue"}
              mono={hasCode}
              onSelect={onSelectOption}
              onType={onTypeAnswer}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="shrink-0 flex items-center justify-between border-t border-zinc-200 px-6 py-3 bg-white">
          <Button variant="outline" disabled={idx === 0} onClick={onPrev} className="rounded-lg">
            <ChevronLeft className="size-4" /> Previous
          </Button>

          <Button
            variant="ghost"
            className={cn("rounded-lg", isFlagged && "bg-amber-50 text-amber-600 hover:bg-amber-100")}
            onClick={onToggleFlag}
          >
            <Flag className={cn("size-4", isFlagged && "fill-amber-500")} />
            {isFlagged ? "Flagged" : "Flag for Review"}
          </Button>

          {idx < total - 1 ? (
            <Button onClick={onNext} className="rounded-lg">
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={locked || submitting || answeredCount === 0}
              className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="size-4" /> Submit
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}
