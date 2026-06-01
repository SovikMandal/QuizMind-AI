import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Mail, Lock, KeyRound } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { Button, Card, Input, Label } from "@/components/ui";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const request = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setStage("reset");
      // No email provider wired up: the dev token is returned directly.
      if (res.data.devToken) {
        setToken(res.data.devToken);
        setInfo("Dev mode: reset token filled in below.");
      } else {
        setInfo("If that email exists, a reset token has been issued.");
      }
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login");
    } catch (err) {
      setError(apiError(err, "Reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#2b7fff]/10">
            <Brain className="size-6 text-[#2b7fff]" />
          </span>
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-sm text-zinc-600">
            {stage === "request" ? "Enter your email to get a reset token." : "Enter the token and a new password."}
          </p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {info && <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{info}</p>}

        {stage === "request" ? (
          <form onSubmit={request} className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input type="email" required className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? "Sending..." : "Send reset token"}
            </Button>
          </form>
        ) : (
          <form onSubmit={reset} className="space-y-4">
            <div>
              <Label>Reset token</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input required className="pl-9" value={token} onChange={(e) => setToken(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input type="password" required minLength={8} className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600">
          <Link to="/login" className="font-medium text-[#2b7fff]">Back to sign in</Link>
        </p>
      </Card>
    </div>
  );
}
