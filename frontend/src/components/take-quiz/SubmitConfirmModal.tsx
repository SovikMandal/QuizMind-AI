import { Send } from "lucide-react";
import { Button, Card } from "@/components/ui";

interface Props {
  answeredCount: number;
  flaggedCount: number;
  total: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmModal({ answeredCount, flaggedCount, total, submitting, onCancel, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-sm border-0 p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-50">
            <Send className="size-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Submit Quiz?</h3>
          <p className="mt-2 text-sm text-zinc-600">
            You've answered <span className="font-bold text-[#2b7fff]">{answeredCount}</span> out of{" "}
            <span className="font-bold">{total}</span> questions.
            {total - answeredCount > 0 && <span className="text-amber-600"> {total - answeredCount} unanswered.</span>}
          </p>
          {flaggedCount > 0 && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠️ {flaggedCount} flagged {flaggedCount === 1 ? "question" : "questions"} pending review
            </p>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-lg py-3" onClick={onCancel}>
            Review
          </Button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Submitting..." : "Confirm Submit"}
          </button>
        </div>
      </Card>
    </div>
  );
}
