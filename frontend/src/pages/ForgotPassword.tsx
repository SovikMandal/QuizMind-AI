import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Brain, Mail, Lock, Send, Info, ChevronLeft, ShieldCheck, Eye, EyeOff, KeyRound, CheckCircle2, Circle } from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Button, Input, cn } from "@/components/ui";

const inputBase =
  "h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 text-sm outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/20";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) {
      setToken(t);
      setStage("reset");
    }
  }, [searchParams]);

  const has8 = password.length >= 8;
  const hasNum = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const matches = password.length > 0 && password === confirm;
  const score = [has8, hasNum, hasSpecial, matches].filter(Boolean).length;
  const strength = score <= 1 ? { label: "Weak", color: "text-red-500", bar: "bg-red-500" } : score === 2 ? { label: "Fair", color: "text-amber-500", bar: "bg-amber-500" } : score === 3 ? { label: "Good", color: "text-blue-500", bar: "bg-blue-500" } : { label: "Strong", color: "text-emerald-500", bar: "bg-emerald-500" };
  const canReset = has8 && hasNum && hasSpecial && matches;

  const request = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.devToken) {
        setToken(res.data.devToken);
        setStage("reset");
        toast.success("Dev mode: reset link opened below.");
      } else {
        toast.success("If that email exists, a reset link has been sent.");
      }
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password updated. You can now sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(apiError(err, "Reset failed"));
    } finally {
      setLoading(false);
    }
  };

  const req = (ok: boolean, label: string) => (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500" /> : <Circle className="size-4 shrink-0 text-[#71717b]/40" />}
      <span className="text-xs text-[#71717b]">{label}</span>
    </div>
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white text-zinc-950">
      <div className="pointer-events-none absolute left-1/2 -top-32 size-[40rem] -translate-x-1/2 rounded-full bg-[#2b7fff]/10 blur-3xl" />

      <header className="relative z-10 border-b border-zinc-200">
        <div className="flex items-center gap-2 px-8 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#2b7fff] text-blue-50">
            <Brain className="size-5" />
          </div>
          <span className="text-lg font-bold">QuizMind AI</span>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 shadow-xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-600" />

          {stage === "request" ? (
            <div className="flex flex-col gap-6 p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-blue-50"><Brain className="size-8 text-[#2b7fff]" /></div>
                <div className="flex flex-col items-center gap-2">
                  <h1 className="text-2xl font-bold">Reset your password</h1>
                  <p className="max-w-xs text-center text-sm text-zinc-500">Enter your email address and we'll send you a link to reset your password.</p>
                </div>
              </div>
              <form onSubmit={request} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-700">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input type="email" required className={inputBase} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="h-11 w-full gap-2"><Send className="size-4" /> {loading ? "Sending..." : "Send Reset Link"}</Button>
                <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-blue-700" />
                  <p className="text-xs text-blue-700">Check your spam folder if you don't receive the email within a few minutes.</p>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-[#2b7fff]/10"><ShieldCheck className="size-8 text-[#2b7fff]" /></div>
                <div className="flex flex-col items-center gap-2">
                  <h1 className="text-2xl font-bold">Set new password</h1>
                  <p className="max-w-sm text-center text-sm text-[#71717b]">Your new password must be at least 8 characters and include a number and a special character.</p>
                </div>
              </div>
              <form onSubmit={reset} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                    <input type={showPw ? "text" : "password"} required placeholder="••••••••" className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-10 text-sm outline-none focus:border-[#2b7fff]" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717b]">{showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex flex-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={cn("h-1.5 w-full rounded-full", i < score ? strength.bar : "bg-zinc-100")} />
                      ))}
                    </div>
                    {password && <span className={cn("text-xs font-medium", strength.color)}>{strength.label}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                    <input type={showPw ? "text" : "password"} required placeholder="••••••••" className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-10 text-sm outline-none focus:border-[#2b7fff]" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {req(has8, "At least 8 characters")}
                  {req(hasNum, "Contains a number")}
                  {req(hasSpecial, "Contains a special character")}
                  {req(matches, "Passwords match")}
                </div>
                <Button type="submit" disabled={loading || !canReset} className="h-11 w-full gap-2"><KeyRound className="size-4" /> {loading ? "Resetting..." : "Reset Password"}</Button>
              </form>
            </div>
          )}

          <div className="px-8 pb-8">
            <Link to="/login" className="flex items-center justify-center gap-1 text-sm font-medium text-[#2b7fff]"><ChevronLeft className="size-4" /> Back to sign in</Link>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-[#71717b]">© 2025 QuizMind. All rights reserved.</p>
      </main>
    </div>
  );
}
