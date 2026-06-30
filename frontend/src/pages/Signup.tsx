import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  Sparkles,
  HelpCircle,
  BarChart3,
  Check,
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/stores/auth";
import { api, apiError, tokenStore, startOAuth } from "@/lib/api";
import { EmailVerifyModal } from "@/components/EmailVerifyModal";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";

const inputBase =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/20";
const features = ["AI question generation", "Live & async quiz modes", "Real-time analytics"];

export default function Signup() {
  const { signup, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: "", username: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verify, setVerify] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (!agree) return toast.error("Please accept the Terms of Service");
    setLoading(true);
    try {
      await signup({
        displayName: form.displayName,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setVerify(true);
    } catch (err) {
      toast.error(apiError(err, "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white text-zinc-950">
      {verify && (
        <EmailVerifyModal
          email={form.email}
          onResend={async () => {
            await api.post("/auth/resend-verification", { email: form.email });
          }}
          onBack={() => navigate("/login")}
          onVerify={async (code) => {
            const res = await api.post("/auth/verify-email", { email: form.email, code });
            tokenStore.set(res.data.accessToken);
            setUser(res.data.user);
            toast.success("Email verified — welcome!");
            navigate("/dashboard");
          }}
        />
      )}
      <div className="flex min-h-screen w-full">
        {/* Left branding panel */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,oklch(0.623_0.214_259.815)_0%,oklch(0.546_0.215_262.881)_100%)] p-12 text-blue-50 lg:flex">
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-white/10" />
          <div className="absolute -left-10 -bottom-24 size-80 rounded-full bg-white/5" />
          <div className="absolute right-20 top-44 size-40 rounded-full bg-white/5" />

          <Link to="/" className="relative z-10 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/15">
              <Brain className="size-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">QuizMind AI</span>
          </Link>

          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="relative flex size-44 items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-white/10 blur-xl" />
              <div className="relative flex size-32 items-center justify-center rounded-3xl border border-white/25 bg-white/15 shadow-2xl backdrop-blur-sm">
                <Brain className="size-16 text-white" />
              </div>
              <div className="absolute -top-1 left-1/2 flex size-11 -translate-x-1/2 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm">
                <Sparkles className="size-5 text-white" />
              </div>
              <div className="absolute -left-2 bottom-2 flex size-11 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm">
                <HelpCircle className="size-5 text-white" />
              </div>
              <div className="absolute -right-2 bottom-2 flex size-11 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm">
                <BarChart3 className="size-5 text-white" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="max-w-md text-4xl font-bold tracking-tight">Smarter quizzes, powered by AI</h1>
              <p className="max-w-sm text-base text-blue-50/80">
                Join 12,000+ educators creating engaging assessments in seconds.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Check className="size-4 text-white" />
                  </div>
                  <span className="text-sm text-blue-50/90">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-xs text-blue-50/70">Trusted by 12,000+ educators worldwide</div>
        </div>

        {/* Right form panel */}
        <div className="flex w-full flex-col items-center justify-center px-6 py-6 lg:w-1/2 lg:items-start lg:pl-24 lg:pr-6">
          <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <Link to="/" className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-[#2b7fff]/10">
                <Brain className="size-6 text-[#2b7fff]" />
              </Link>
              <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
              <p className="text-sm text-[#71717b]">Join thousands of educators using QuizMind AI</p>
            </div>


            <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                    <input className={`${inputBase} pl-9 pr-3`} placeholder="Alex Morgan" value={form.displayName} onChange={set("displayName")} required />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                    <input className={`${inputBase} pl-9 pr-3`} placeholder="alexmorgan" value={form.username} onChange={set("username")} required />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                  <input type="email" className={`${inputBase} pl-9 pr-3`} placeholder="you@example.com" value={form.email} onChange={set("email")} required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                  <input type={showPw ? "text" : "password"} className={`${inputBase} px-9`} placeholder="••••••••" value={form.password} onChange={set("password")} required minLength={8} />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717b]">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                  <input type="password" className={`${inputBase} pl-9 pr-3`} placeholder="••••••••" value={form.confirm} onChange={set("confirm")} required />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input id="terms" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-[#2b7fff]" />
                <label htmlFor="terms" className="text-sm leading-snug text-[#71717b]">
                  I agree to the <span className="font-medium text-[#2b7fff]">Terms of Service</span> and{" "}
                  <span className="font-medium text-[#2b7fff]">Privacy Policy</span>
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2">
                <UserPlus className="size-4" /> {loading ? "Creating..." : "Create Account"}
              </Button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-xs text-[#71717b]">or sign up with</span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" className="gap-2" onClick={() => startOAuth("google")}>Google</Button>
                <Button type="button" variant="outline" className="gap-2" onClick={() => startOAuth("github")}>GitHub</Button>
              </div>
            </form>

            <div className="flex justify-center">
              <p className="text-sm text-[#71717b]">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-[#2b7fff]">Sign in</Link>
              </p>
            </div>
          </div>
          <p className="mt-4 w-full max-w-md text-center text-xs text-[#71717b]">
            © 2025 QuizMind. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
