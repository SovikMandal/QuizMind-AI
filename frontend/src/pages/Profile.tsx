import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Crown,
  Mail,
  MapPin,
  CalendarDays,
  LogOut,
  Pencil,
  Check,
  ArrowUpCircle,
  CreditCard,
  Lock,
  CalendarClock,
  RefreshCw,
  Hourglass,
  ShieldCheck,
  Bell,
  AlertTriangle,
  X,
  Info,
  Target,
  PencilRuler,
  Users,
  Flame,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/stores/auth";
import { OtpModal } from "@/components/OtpModal";
import type { UserStats } from "@/types";
import { Button, Card, Input, Label, Badge, cn } from "@/components/ui";

const EDITABLE = ["displayName", "username", "email", "phone", "location", "bio"] as const;
type Field = (typeof EDITABLE)[number];

type GoalType = "createdQuizzes" | "joinedQuizzes" | "dayStreak";
interface UserGoal {
  type: GoalType;
  label: string;
  target: number;
}
const DEFAULT_GOALS: UserGoal[] = [
  { type: "createdQuizzes", label: "Create 12 quizzes", target: 12 },
  { type: "joinedQuizzes", label: "Join 30 quizzes", target: 30 },
  { type: "dayStreak", label: "20-day streak", target: 20 },
];
const GOAL_META: Record<
  GoalType,
  { title: string; helper: string; Icon: typeof Target; suffix: string }
> = {
  createdQuizzes: {
    title: "Quizzes Created",
    helper: "Number of quizzes you create this month",
    Icon: PencilRuler,
    suffix: "quizzes",
  },
  joinedQuizzes: {
    title: "Quizzes Joined",
    helper: "Number of quizzes you join this month",
    Icon: Users,
    suffix: "quizzes",
  },
  dayStreak: {
    title: "Day Streak",
    helper: "Consecutive days with quiz activity",
    Icon: Flame,
    suffix: "days",
  },
};

const plans = {
  free: { label: "Free Plan", price: "₹0", desc: "Up to 10 quizzes with core question types.", limit: 10, features: [] as string[] },
  pro: { label: "Pro Plan", price: "₹250", desc: "Create up to 30 quizzes/month with AI generation.", limit: 30, features: ["AI quiz generation", "Up to 30 quizzes / month", "Priority support"] },
  premium: { label: "Premium Plan", price: "₹900", desc: "120 quizzes/month & advanced AI generation.", limit: 120, features: ["Advanced AI generation", "120 quizzes / month", "Priority 24/7 support"] },
};

const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-[#2b7fff]" : "bg-zinc-300")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-all", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<Field, string>>({
    displayName: "", username: "", email: "", phone: "", location: "", bio: "",
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [cancelStep, setCancelStep] = useState<"confirm" | "otp" | null>(null);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "deleting" | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>(DEFAULT_GOALS);
  const [goalsBaseline, setGoalsBaseline] = useState<UserGoal[]>(DEFAULT_GOALS);
  const [savingGoals, setSavingGoals] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName ?? "",
        username: user.username,
        email: user.email,
        phone: user.phone ?? "",
        location: user.location ?? "",
        bio: user.bio ?? "",
      });
    }
    api.get("/users/me/stats").then((r) => setStats(r.data.stats)).catch(() => {});
    // Load the user's customised goals so the editor reflects whatever's
    // currently driving the dashboard. Falls back to defaults silently.
    api
      .get<{ goals: UserGoal[] }>("/users/me/goals")
      .then((r) => {
        const merged = mergeWithDefaults(r.data.goals);
        setGoals(merged);
        setGoalsBaseline(merged);
      })
      .catch(() => {});
  }, [user]);

  /** Reorder + fill missing types so the UI always renders the three rows
   *  in a consistent order regardless of what the API returns. */
  function mergeWithDefaults(input: UserGoal[]): UserGoal[] {
    const byType = new Map(input.map((g) => [g.type, g]));
    return DEFAULT_GOALS.map((d) => byType.get(d.type) ?? d);
  }

  /** Auto-generate a goal's display label from its type + target so labels
   *  stay coherent after a target edit (e.g. target 20 → "Create 20 quizzes"). */
  function makeLabel(type: GoalType, target: number): string {
    switch (type) {
      case "createdQuizzes":
        return `Create ${target} quizzes`;
      case "joinedQuizzes":
        return `Join ${target} quizzes`;
      case "dayStreak":
        return `${target}-day streak`;
    }
  }

  const goalsDirty = goals.some((g, i) => g.target !== goalsBaseline[i].target);

  const updateGoal = (i: number, patch: Partial<UserGoal>) => {
    setGoals((current) => current.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  };

  const saveGoals = async () => {
    // Client-side validation that mirrors the Zod schema on the server.
    for (const g of goals) {
      if (!Number.isInteger(g.target) || g.target < 1 || g.target > 9999) {
        return toast.error("Goal targets must be between 1 and 9999");
      }
    }
    // Regenerate labels from targets so the dashboard widget stays coherent
    // (target changes are reflected in the displayed text automatically).
    const payload = goals.map((g) => ({ ...g, label: makeLabel(g.type, g.target) }));
    setSavingGoals(true);
    try {
      const res = await api.put<{ goals: UserGoal[] }>("/users/me/goals", { goals: payload });
      const merged = mergeWithDefaults(res.data.goals);
      setGoals(merged);
      setGoalsBaseline(merged);
      toast.success("Goals updated");
    } catch (err) {
      toast.error(apiError(err, "Could not save goals"));
    } finally {
      setSavingGoals(false);
    }
  };

  const resetGoals = () => {
    setGoals(DEFAULT_GOALS.map((g) => ({ ...g })));
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await api.post("/users/me/avatar", fd);
      setUser(res.data.user);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(apiError(err, "Avatar upload failed"));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(EDITABLE.filter((f) => form[f] !== "").map((f) => [f, form[f]]));
      const res = await api.put("/users/me", payload);
      setUser(res.data.user);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(apiError(err, "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const requestOtp = async () => {
    await api.post("/payments/cancel/request-otp");
  };

  const startOtp = async () => {
    try {
      await requestOtp();
      setCancelStep("otp");
      toast.success("We've emailed you a verification code");
    } catch (err) {
      toast.error(apiError(err, "Could not send code"));
    }
  };

  const confirmCancel = async (code: string) => {
    const res = await api.post("/payments/cancel", { otp: code });
    setUser(res.data.user);
    setCancelStep(null);
    toast.success("Plan cancelled — you're on the Free plan");
  };

  const confirmDelete = async () => {
    if (deleteStep === "deleting") return;
    setDeleteStep("deleting");
    try {
      // Backend wipes participants, sessions, quizzes, notifications,
      // reminders, and refresh tokens before deleting the user row.
      await api.delete("/users/me");
      // logout() clears the access token + user state in its finally block,
      // so the protected routes won't try to re-render with a stale user
      // object before we navigate. The /auth/logout call inside is a no-op
      // (refresh cookie was already cleared by the delete response).
      try {
        await logout();
      } catch {
        /* clearing local state is what matters; ignore network errors */
      }
      toast.success("Account deleted");
      navigate("/signup", { replace: true });
    } catch (err) {
      setDeleteStep("confirm");
      toast.error(apiError(err, "Could not delete account"));
    }
  };

  if (!user) return null;
  const plan = plans[user.tier];

  // Monthly billing cycle derived from the account/plan start date (createdAt).
  const start = new Date(user.createdAt);
  const now = new Date();
  const renews = new Date(now.getFullYear(), now.getMonth(), start.getDate());
  if (renews <= now) renews.setMonth(renews.getMonth() + 1);
  const daysLeft = Math.max(0, Math.ceil((renews.getTime() - now.getTime()) / 86400000));
  const used = stats?.quizzesCreated ?? 0;
  const usagePct = plan.limit === Infinity ? 0 : Math.min(100, Math.round((used / plan.limit) * 100));
  const usageColor = usagePct > 75 ? "bg-[#e7000b]" : usagePct >= 50 ? "bg-amber-500" : "bg-[#2b7fff]";

  const statItems = [
    ["Quizzes Created", stats?.quizzesCreated],
    ["Total Attempts", stats?.totalAttempts],
    ["Avg. Score", stats ? `${stats.avgScore}%` : undefined],
    ["Students Reached", stats?.studentsReached],
  ] as const;
  const fields: [Field, string][] = [
    ["displayName", "Full Name"],
    ["username", "Username"],
    ["email", "Email Address"],
    ["phone", "Phone Number"],
  ];

  return (
    <main className="mx-auto max-w-[1140px] px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-1 text-sm text-[#71717b]">Manage your account information and subscription.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col items-center gap-4 p-6">
            <div className="relative">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="size-28 rounded-full object-cover" />
              ) : (
                <span className="flex size-28 items-center justify-center rounded-full bg-[#2b7fff] text-4xl font-bold text-white">
                  {(user.displayName ?? user.username).charAt(0).toUpperCase()}
                </span>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#2b7fff] text-blue-50"
                aria-label="Change avatar"
              >
                <Camera className="size-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-xl font-bold">{user.displayName ?? user.username}</h2>
              <p className="text-sm text-[#71717b]">@{user.username}</p>
            </div>
            <Badge className="gap-1 rounded-full bg-[#2b7fff] px-3 py-1 text-blue-50">
              <Crown className="size-3.5" /> <span className="capitalize">{user.tier} Member</span>
            </Badge>

            <div className="flex w-full flex-col gap-2 border-t border-zinc-200 pt-4 text-sm">
              <div className="flex items-center gap-2"><Mail className="size-4 text-[#71717b]" /> {user.email}</div>
              {user.location && <div className="flex items-center gap-2"><MapPin className="size-4 text-[#71717b]" /> {user.location}</div>}
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-[#71717b]" /> Joined {start.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <Button variant="outline" className="mt-2 w-full border-[#e7000b]/30 text-[#e7000b]" onClick={onLogout}>
                <LogOut className="size-4" /> Log out
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold">Quick Stats</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {statItems.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1 rounded-lg bg-zinc-100 p-4">
                  <span className="text-2xl font-bold">{value ?? "—"}</span>
                  <span className="text-xs text-[#71717b]">{label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Target className="size-4 text-[#2b7fff]" /> Customize Goals
                </h3>
                <p className="text-sm text-[#71717b]">
                  Set personal targets for the goals that appear on your dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={resetGoals}
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#71717b] hover:bg-zinc-100"
                title="Reset to default targets"
              >
                <RotateCcw className="size-3.5" /> Reset
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {goals.map((g, i) => {
                const meta = GOAL_META[g.type];
                const Icon = meta.Icon;
                return (
                  <div
                    key={g.type}
                    className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-[#2b7fff]/10">
                        <Icon className="size-4 text-[#2b7fff]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{meta.title}</span>
                        <span className="text-xs text-[#71717b]">{meta.helper}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-[#71717b]">Target ({meta.suffix})</Label>
                      <Input
                        className="h-9"
                        type="number"
                        min={1}
                        max={9999}
                        step={1}
                        value={Number.isNaN(g.target) ? "" : g.target}
                        onChange={(e) =>
                          updateGoal(i, {
                            target: e.target.value === "" ? NaN : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setGoals(goalsBaseline.map((g) => ({ ...g })))}
                disabled={!goalsDirty || savingGoals}
              >
                Cancel
              </Button>
              <Button onClick={saveGoals} disabled={!goalsDirty || savingGoals}>
                <Check className="size-4" /> {savingGoals ? "Saving…" : "Save goals"}
              </Button>
            </div>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Personal info */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold">Personal Information</h3>
                <p className="text-sm text-[#71717b]">Update your personal details here.</p>
              </div>
              {editing ? (
                <Button onClick={save} disabled={saving}><Check className="size-4" /> {saving ? "Saving..." : "Save"}</Button>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="size-4" /> Edit</Button>
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.map(([f, label]) => (
                <div key={f} className="flex flex-col gap-2">
                  <Label>{label}</Label>
                  <Input
                    className={cn("h-10", !editing && "bg-zinc-50")}
                    disabled={!editing}
                    value={form[f]}
                    onChange={(e) => setForm((s) => ({ ...s, [f]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Bio</Label>
                <textarea
                  disabled={!editing}
                  value={form.bio}
                  onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
                  className={cn("min-h-20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm", !editing && "bg-zinc-50")}
                />
              </div>
            </div>
          </Card>

          {/* Subscription */}
          <Card className="p-6">
            <div className="flex items-center justify-between rounded-xl bg-[#2b7fff] p-6 text-blue-50">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50/15"><Crown className="size-6" /></div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold">{plan.label}</span>
                  <span className="text-sm text-blue-50/80">{plan.desc}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal">/month</span></span>
                <Badge className="mt-1 bg-blue-50/20 text-blue-50">Active</Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center gap-2 text-[#71717b]"><CalendarClock className="size-4" /><span className="text-xs">Started On</span></div>
                <span className="text-sm font-semibold">{fmtDate(start)}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center gap-2 text-[#71717b]"><RefreshCw className="size-4" /><span className="text-xs">Renews On</span></div>
                <span className="text-sm font-semibold">{fmtDate(renews)}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center gap-2 text-[#71717b]"><Hourglass className="size-4" /><span className="text-xs">Days Remaining</span></div>
                <span className="text-sm font-semibold">{daysLeft} days left</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#71717b]">Quizzes used this month</span>
                <span className="font-medium">{used} / {plan.limit === Infinity ? "∞" : plan.limit}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100">
                <div className={cn("h-2 rounded-full", usageColor)} style={{ width: `${usagePct}%` }} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {user.tier !== "premium" && (
                <Button className="h-11" onClick={() => navigate("/pricing")}><ArrowUpCircle className="size-4" /> Upgrade plan</Button>
              )}
              <Button variant="outline" className="h-11" onClick={() => navigate("/pricing")}><CreditCard className="size-4" /> Manage Billing</Button>
              {user.tier !== "free" && (
                <Button variant="ghost" className="h-11 px-4 !text-[#e7000b]" onClick={() => setCancelStep("confirm")}>
                  Cancel Plan
                </Button>
              )}
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold">Security</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100"><Lock className="size-4 text-[#71717b]" /></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Password</span>
                    <span className="text-xs text-[#71717b]">Reset your password via email</span>
                  </div>
                </div>
                <Button variant="outline" className="h-9" onClick={() => navigate("/forgot-password")}>Change</Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100"><ShieldCheck className="size-4 text-[#71717b]" /></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Two-Factor Authentication</span>
                    <span className="text-xs text-[#71717b]">Add an extra layer of security</span>
                  </div>
                </div>
                <Switch checked={twoFA} onChange={setTwoFA} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100"><Bell className="size-4 text-[#71717b]" /></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Email Notifications</span>
                    <span className="text-xs text-[#71717b]">Receive updates about quiz activity</span>
                  </div>
                </div>
                <Switch checked={emailNotif} onChange={setEmailNotif} />
              </div>

              <div className="mt-2 flex items-center justify-between rounded-lg border border-[#e7000b]/30 bg-[#e7000b]/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#e7000b]/10"><LogOut className="size-4 text-[#e7000b]" /></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Log out</span>
                    <span className="text-xs text-[#71717b]">Sign out of your account on this device</span>
                  </div>
                </div>
                <Button variant="outline" className="h-9 border-[#e7000b]/30 text-[#e7000b]" onClick={onLogout}><LogOut className="size-4" /> Log out</Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[#e7000b]/30 bg-[#e7000b]/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#e7000b]/10">
                    <Trash2 className="size-4 text-[#e7000b]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Delete account</span>
                    <span className="text-xs text-[#71717b]">
                      Permanently remove your account and every quiz, session,
                      and answer associated with it. This cannot be undone.
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="h-9 border-[#e7000b]/30 text-[#e7000b]"
                  onClick={() => setDeleteStep("confirm")}
                  disabled={deleteStep !== null}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {cancelStep === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4">
          <Card className="w-[480px] max-w-full overflow-hidden p-0">
            <div className="flex flex-col items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-8 pb-6 pt-8">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#e7000b]/10">
                <AlertTriangle className="size-7 text-[#e7000b]" />
              </div>
              <h2 className="text-xl font-bold">Cancel Your Plan?</h2>
            </div>
            <div className="flex flex-col gap-4 p-8">
              <p className="text-center text-sm text-[#71717b]">
                Are you sure you want to cancel your {plan.label}? You will lose access to all {plan.label} features on {fmtDate(renews)}.
              </p>
              <div className="flex flex-col gap-2 rounded-lg bg-[#e7000b]/10 p-4">
                <span className="text-sm font-semibold text-[#e7000b]">You will lose access to:</span>
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm"><X className="size-4 text-[#e7000b]" /> {f}</div>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#2b7fff] bg-[#2b7fff]/5 p-3">
                <Info className="size-4 shrink-0 text-[#2b7fff]" />
                <span className="text-sm">Your plan will remain active until {fmtDate(renews)}.</span>
              </div>
              <div className="flex gap-4 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setCancelStep(null)}>Keep My Plan</Button>
                <button onClick={startOtp} className="flex-1 rounded-lg bg-[#e7000b] py-2 text-sm font-medium text-white">
                  Yes, Cancel Plan
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {cancelStep === "otp" && (
        <OtpModal email={user.email} onBack={() => setCancelStep("confirm")} onResend={requestOtp} onSubmit={confirmCancel} />
      )}

      {deleteStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4">
          <Card className="w-[480px] max-w-full overflow-hidden p-0">
            <div className="flex flex-col items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-8 pb-6 pt-8">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#e7000b]/10">
                <Trash2 className="size-7 text-[#e7000b]" />
              </div>
              <h2 className="text-xl font-bold">Delete your account?</h2>
            </div>
            <div className="flex flex-col gap-4 p-8">
              <p className="text-center text-sm text-[#71717b]">
                This permanently deletes your QuizMind AI account. There is no undo.
              </p>
              <div className="flex flex-col gap-2 rounded-lg bg-[#e7000b]/10 p-4">
                <span className="text-sm font-semibold text-[#e7000b]">
                  The following will be removed:
                </span>
                {[
                  "Every quiz you've created and its questions",
                  "All sessions you've hosted or joined",
                  "Your answers, scores, and rankings",
                  "Notifications and quiz reminders",
                ].map((line) => (
                  <div key={line} className="flex items-center gap-2 text-sm">
                    <X className="size-4 text-[#e7000b]" /> {line}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <Info className="size-4 shrink-0 text-[#71717b]" />
                <span className="text-sm text-[#71717b]">
                  After deletion you'll be redirected to the sign-up page and your active
                  sessions on other devices will be revoked.
                </span>
              </div>
              <div className="flex gap-4 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteStep(null)}
                  disabled={deleteStep === "deleting"}
                >
                  Cancel
                </Button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteStep === "deleting"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#e7000b] py-2 text-sm font-medium text-white disabled:opacity-70"
                >
                  <Trash2 className="size-4" /> Yes, delete my account
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
