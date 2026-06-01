import { useEffect, useRef, useState } from "react";
import { MailCheck, Clock, ShieldCheck, RotateCw, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { apiError } from "@/lib/api";
import { cn } from "@/components/ui";

const LEN = 6;
const SECONDS = 300;

export function EmailVerifyModal({
  email,
  onVerify,
  onResend,
  onBack,
}: {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend?: () => Promise<void> | void;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const [seconds, setSeconds] = useState(SECONDS);
  const [verifying, setVerifying] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const code = digits.join("");
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const setDigit = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, idx) => (idx === i ? ch : x)));
    if (ch && i < LEN - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const resend = async () => {
    setDigits(Array(LEN).fill(""));
    setSeconds(SECONDS);
    refs.current[0]?.focus();
    await onResend?.();
    toast.success("A new code has been sent");
  };

  const verify = async () => {
    setVerifying(true);
    try {
      await onVerify(code);
    } catch (err) {
      toast.error(apiError(err, "Invalid or expired code"));
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="h-1.5 w-full bg-[#2b7fff]" />
        <div className="flex flex-col items-center gap-2 px-8 pt-8 text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-[#2b7fff]/10">
            <MailCheck className="size-8 text-[#2b7fff]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Verify your email</h2>
          <p className="text-sm leading-relaxed text-[#71717b]">
            We sent a 6-digit verification code to
            <br />
            <span className="font-medium text-zinc-950">{email}</span>
          </p>
        </div>

        <div className="flex flex-col gap-6 px-8 py-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Enter verification code</label>
            <div className="flex items-center justify-between gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKey(i, e)}
                  className={cn(
                    "size-12 rounded-lg border text-center text-xl font-semibold outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/20",
                    d ? "border-[#2b7fff] bg-[#2b7fff]/5" : "border-zinc-200 bg-white"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-4">
            <Clock className="size-4 shrink-0 text-[#71717b]" />
            <p className="text-sm text-[#71717b]">Code expires in <span className="font-medium text-zinc-950">{mm}:{ss}</span></p>
          </div>

          <button
            onClick={verify}
            disabled={verifying || code.length !== LEN}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2b7fff] text-sm font-medium text-blue-50 disabled:opacity-50"
          >
            <ShieldCheck className="size-4" /> {verifying ? "Verifying..." : "Verify Email"}
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-8 pb-8">
          <div className="flex items-center gap-1 text-sm text-[#71717b]">
            <span>Didn't receive the code?</span>
            <button onClick={resend} className="flex items-center gap-1 font-medium text-[#2b7fff]"><RotateCw className="size-3.5" /> Resend</button>
          </div>
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-[#71717b]"><ChevronLeft className="size-4" /> Back to sign in</button>
        </div>
      </div>
    </div>
  );
}
