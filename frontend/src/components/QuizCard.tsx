import {
  Calendar,
  Clock,
  Target,
  Users,
  Lock,
  Globe,
  Zap,
  Play,
  Bell,
  Atom,
  Landmark,
  Code2,
  Microscope,
  Sigma,
  FlaskConical,
  Stethoscope,
} from "lucide-react";
import { Button, cn } from "./ui";

export interface QuizItem {
  id: string;
  title: string;
  subject: string | null;
  difficulty: string;
  status: string;
  quizType: "public" | "private";
  scheduledAt: string | null;
  creatorId: string;
  participants?: number;
  accuracy?: number;
  durationMins?: number;
  _count?: { questions: number };
}

export type QuizVariant = "live" | "async" | "upcoming";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";

function subjectIcon(subject: string | null) {
  const s = (subject ?? "").toLowerCase();
  if (s.includes("hist")) return Landmark;
  if (s.includes("math") || s.includes("algebra") || s.includes("calc")) return Sigma;
  if (s.includes("cod") || s.includes("program") || s.includes("java") || s.includes("python")) return Code2;
  if (s.includes("chem")) return FlaskConical;
  if (s.includes("bio") || s.includes("cell")) return Microscope;
  if (s.includes("medic") || s.includes("health")) return Stethoscope;
  return Atom;
}

function endsIn(scheduledAt: string | null, durationMins?: number) {
  if (!scheduledAt) return "—";
  const end = new Date(scheduledAt).getTime() + (durationMins ?? 60) * 60000;
  const m = Math.max(0, Math.round((end - Date.now()) / 60000));
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

interface Props {
  q: QuizItem;
  variant: QuizVariant;
  reminded: boolean;
  onJoin: (q: QuizItem) => void;
  onRemind: (q: QuizItem) => void;
}

export function QuizCard({ q, variant, reminded, onJoin, onRemind }: Props) {
  const Icon = subjectIcon(q.subject);
  return (
    <div className={`flex flex-col gap-4 p-5 ${card}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
            <Icon className="size-5 text-[#2b7fff]" />
          </div>
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              q.quizType === "private" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            )}
          >
            {q.quizType === "private" ? <Lock className="size-3" /> : <Globe className="size-3" />}
            {q.quizType === "private" ? "Private" : "Public"}
          </span>
        </div>
        {variant === "live" && (
          <span className="flex items-center gap-1 rounded-full bg-[#e7000b]/10 px-2 py-0.5 text-xs text-[#e7000b]">
            <span className="size-1.5 rounded-full bg-[#e7000b]" /> Live
          </span>
        )}
        {variant === "async" && (
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-[#71717b]">Open</span>
        )}
        {variant === "upcoming" && (
          <span className="rounded-full bg-[#2b7fff]/10 px-2 py-0.5 text-xs text-[#2b7fff]">Soon</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-semibold">{q.title}</h3>
        <p className="text-xs text-[#71717b]">{q.subject ?? "General"} · {q._count?.questions ?? 0} questions</p>
        <div className="flex items-center gap-4 pt-1 text-xs text-[#71717b]">
          {variant === "upcoming" ? (
            q.scheduledAt && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" /> {new Date(q.scheduledAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            )
          ) : (
            <>
              <span className="flex items-center gap-1">
                <Users className="size-3.5" /> {q.participants ?? 0}
              </span>
              {variant === "async" ? (
                <span className="flex items-center gap-1">
                  <Target className="size-3.5" /> {q.accuracy ?? 0}%
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" /> Ends in {endsIn(q.scheduledAt, q.durationMins)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {variant === "live" && (
        <Button className="w-full gap-2" onClick={() => onJoin(q)}><Zap className="size-4" /> Join now</Button>
      )}
      {variant === "async" && (
        <Button variant="outline" className="w-full gap-2" onClick={() => onJoin(q)}><Play className="size-4" /> Take quiz</Button>
      )}
      {variant === "upcoming" && (
        reminded ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2b7fff]/30 bg-[#2b7fff]/5 px-3 py-2 text-sm font-medium text-[#2b7fff]">
            <Bell className="size-4" /> Reminder set
          </div>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => onRemind(q)}><Bell className="size-4" /> Remind me</Button>
        )
      )}
    </div>
  );
}
