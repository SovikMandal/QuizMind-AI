import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { QuizCard, QuizItem, QuizVariant } from "./QuizCard";

interface Props {
  icon: ReactNode;
  title: string;
  badge: ReactNode;
  items: QuizItem[];
  variant: QuizVariant;
  note?: string;
  reminded: Set<string>;
  onJoin: (q: QuizItem) => void;
  onRemind: (q: QuizItem) => void;
}

export function Section({ icon, title, badge, items, variant, note, reminded, onJoin, onRemind }: Props) {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
          {badge}
        </div>
        <span
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-[#71717b] hover:text-[#2b7fff]"
          onClick={() => navigate(`/discover/${variant}`)}
        >
          View all <ArrowRight className="size-4" />
        </span>
      </div>
      {note && <p className="-mt-2 text-xs text-[#71717b]">{note}</p>}
      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">Nothing here right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.slice(0, 3).map((q) => (
            <QuizCard
              key={q.id}
              q={q}
              variant={variant}
              reminded={reminded.has(q.id)}
              onJoin={onJoin}
              onRemind={onRemind}
            />
          ))}
        </div>
      )}
    </section>
  );
}
