import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Brain,
  Sparkles,
  HelpCircle,
  BarChart3,
  Check,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/stores/auth";
import { apiError, startOAuth } from "@/lib/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";
import { LoadingScreen } from "@/components/LoadingScreen";

const inputBase =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/20";
const features = ["AI question generation", "Live & async quiz modes", "Real-time analytics"];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Surface OAuth failures (the backend redirects here with ?error=...).
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;
    const messages: Record<string, string> = {
      oauth_failed: "Sign-in with that provider failed. Please try again.",
      oauth_denied: "You cancelled the sign-in.",
      oauth_state_mismatch: "Sign-in session expired. Please try again.",
      oauth_missing_code: "Sign-in could not be completed. Please try again.",
      oauth_unknown_provider: "Unsupported sign-in provider.",
    };
    toast.error(messages[error] ?? "Sign-in failed. Please try again.");
    searchParams.delete("error");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiError(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="w-full bg-white text-zinc-950">
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
        <div className="flex w-full flex-col items-center justify-center px-6 py-10 lg:w-1/2 lg:items-start lg:pl-24 lg:pr-6">
          <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <Link to="/" className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-[#2b7fff]/10">
                <Brain className="size-6 text-[#2b7fff]" />
              </Link>
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-[#71717b]">Sign in to your account to continue</p>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                  <input
                    type="email"
                    className={`${inputBase} pl-9 pr-3`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-[#2b7fff]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
                  <input
                    type={showPw ? "text" : "password"}
                    className={`${inputBase} px-9`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717b]"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2">
                <LogIn className="size-4" /> Sign In
              </Button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-xs text-[#71717b]">or continue with</span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" className="gap-2" onClick={() => startOAuth("google")}>Google</Button>
                <Button type="button" variant="outline" className="gap-2" onClick={() => startOAuth("github")}>GitHub</Button>
              </div>
            </form>

            <div className="flex justify-center">
              <p className="text-sm text-[#71717b]">
                Don't have an account?{" "}
                <Link to="/signup" className="font-medium text-[#2b7fff]">Sign up</Link>
              </p>
            </div>
          </div>
          <p className="mt-8 w-full max-w-md text-center text-xs text-[#71717b]">
            © 2025 QuizMind. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}