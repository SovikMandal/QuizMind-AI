import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Crown,
  Ban,
  AlertTriangle,
  Clock,
  Info,
  Bell,
  CheckCheck,
  X,
  LucideIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button, Card, Badge, cn } from "@/components/ui";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

type Tab = "all" | "unread" | "quizzes" | "system";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "quizzes", label: "Quizzes" },
  { id: "system", label: "System" },
];

const META: Record<string, { Icon: LucideIcon; group: "quizzes" | "system" }> = {
  upcoming_quiz: { Icon: CalendarClock, group: "quizzes" },
  plan_purchased: { Icon: Crown, group: "system" },
  plan_cancelled: { Icon: Ban, group: "system" },
  quiz_limit_reached: { Icon: AlertTriangle, group: "system" },
  subscription_expiring: { Icon: Clock, group: "system" },
  system_update: { Icon: Info, group: "system" },
};
const metaFor = (t: string) => META[t] ?? { Icon: Info, group: "system" as const };

const rel = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 2880) return "Yesterday";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const dayGroup = (iso: string) => {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = new Date(iso).getTime();
  if (t >= startToday) return "Today";
  if (t >= startToday - 86400000) return "Yesterday";
  return "Older";
};

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notif[]>([]);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    api.get("/notifications").then((r) => setItems(r.data.notifications)).catch(() => {});
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markAll = () => {
    api.patch("/notifications/read-all").catch(() => {});
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
  };
  const dismiss = (id: string) => {
    api.delete(`/notifications/${id}`).catch(() => {});
    setItems((prev) => prev.filter((x) => x.id !== id));
  };
  const open = (n: Notif) => {
    if (!n.read) {
      api.patch(`/notifications/${n.id}/read`).catch(() => {});
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    if (n.link) navigate(n.link);
  };

  const fresh = items.filter((n) => Date.now() - new Date(n.createdAt).getTime() < 5 * 86400000);
  const filtered = fresh.filter((n) =>
    tab === "all" ? true : tab === "unread" ? !n.read : metaFor(n.type).group === tab
  );
  const groups = ["Today", "Yesterday", "Older"].map((g) => ({
    label: g,
    list: filtered.filter((n) => dayGroup(n.createdAt) === g),
  }));

  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            {unread > 0 && <Badge className="rounded-full bg-[#2b7fff] text-blue-50">{unread} new</Badge>}
          </div>
          <p className="text-sm text-[#71717b]">Stay updated on your quizzes, subscription, and system news.</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" className="gap-2" onClick={markAll}>
            <CheckCheck className="size-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="mb-6 inline-flex rounded-xl bg-zinc-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium",
              tab === t.id ? "bg-white text-zinc-950 shadow-sm" : "text-[#71717b]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-20 text-center">
          <Bell className="size-8 text-zinc-300" />
          <p className="text-sm text-zinc-400">No notifications here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ label, list }) =>
            list.length === 0 ? null : (
              <div key={label} className="flex flex-col gap-2">
                <span className="px-1 text-xs font-semibold uppercase tracking-wider text-[#71717b]">{label}</span>
                {list.map((n) => {
                  const { Icon } = metaFor(n.type);
                  return (
                    <Card
                      key={n.id}
                      onClick={() => open(n)}
                      className={cn(
                        "cursor-pointer p-4",
                        !n.read && "border-[#2b7fff]/20 bg-[#2b7fff]/5"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                            n.read ? "bg-zinc-100 text-zinc-900" : "bg-[#2b7fff] text-blue-50"
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">{n.title}</p>
                            <div className="flex shrink-0 items-center gap-1">
                              <span className="text-xs text-[#71717b]">{rel(n.createdAt)}</span>
                              {!n.read && <span className="size-2 rounded-full bg-[#2b7fff]" />}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismiss(n.id);
                                }}
                                className="flex size-7 items-center justify-center rounded-lg hover:bg-zinc-100"
                                aria-label="Dismiss"
                              >
                                <X className="size-4 text-[#71717b]" />
                              </button>
                            </div>
                          </div>
                          {n.body && <p className="text-sm text-[#71717b]">{n.body}</p>}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}
