import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "./ui";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);

  const loadCount = useCallback(() => {
    api.get("/notifications/unread-count").then((r) => setUnread(r.data.count)).catch(() => {});
  }, []);

  useEffect(() => {
    loadCount();
    const id = setInterval(loadCount, 30000);
    return () => clearInterval(id);
  }, [loadCount]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        const r = await api.get("/notifications");
        setItems(r.data.notifications);
      } catch {
        /* ignore */
      }
    }
  };

  const onClick = async (n: Notif) => {
    if (!n.read) {
      api.patch(`/notifications/${n.id}/read`).catch(() => {});
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    api.patch("/notifications/read-all").catch(() => {});
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative">
      <button onClick={toggle} className="relative" aria-label="Notifications">
        <Bell className="size-5 text-[#71717b]" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e7000b] px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
              <span className="text-sm font-semibold">Notifications</span>
              <div className="flex items-center gap-3">
                {items.some((n) => !n.read) && (
                  <button onClick={markAll} className="flex items-center gap-1 text-xs font-medium text-[#71717b] hover:text-zinc-900">
                    <Check className="size-3" /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/notifications");
                  }}
                  className="text-xs font-medium text-[#2b7fff]"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-400">No notifications yet.</p>
              ) : (
                items.slice(0, 5).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onClick(n)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 border-b border-zinc-50 px-4 py-3 text-left hover:bg-zinc-50",
                      !n.read && "bg-[#2b7fff]/5"
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-[#2b7fff]" />}
                      {n.title}
                    </span>
                    {n.body && <span className="text-xs text-[#71717b]">{n.body}</span>}
                    <span className="text-[10px] text-zinc-400">
                      {new Date(n.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
