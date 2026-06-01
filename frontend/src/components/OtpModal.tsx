import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Clock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { apiError } from "@/lib/api";
import { Button, cn } from "@/components/ui";

const OTP_LENGTH = 6;
const OTP_SECONDS = 300;

export function OtpModal({
  email,
  onBack,
  onSubmit,
  onResend,
}: {
  email: string;
  onBack: () => void;
  onSubmit: (code: string) => Promise<void>;
  onResend?: () => Promise<void> | void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(OTP_SECONDS);
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
    if (ch && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const resend = async () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setSeconds(OTP_SECONDS);
    refs.current[0]?.focus();
    await onResend?.();
    toast.success("A new code has been sent");
  };

  const confirm = async () => {
    setVerifying(true);
    try {
      await onSubmit(code);
    } catch (err) {
      toast.error(apiError(err, "Invalid or expired code"));
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
      <div className="w-[480px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1.5 w-full bg-[#2b7fff]" />
        <div className="flex flex-col items-center gap-6 p-8">
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-[#2b7fff]/20 bg-[#2b7fff]/10">
            <ShieldCheck className="size-8 text-[#2b7fff]" />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-xl font-bold">Verify Your Identity</h2>
            <p className="text-sm leading-relaxed text-[#71717b]">
              We've sent a 6-digit OTP to your registered email{" "}
              <span className="font-medium text-zinc-950">{email}</span>. Please enter it below to confirm plan cancellation.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
                  "size-12 rounded-lg border text-center text-lg font-bold outline-none focus:border-[#2b7fff] focus:ring-[3px] focus:ring-[#2b7fff]/15",
                  d ? "border-[#2b7fff] bg-[#2b7fff]/5" : "border-zinc-200 bg-white"
                )}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-[#71717b]">
              Didn't receive the code?{" "}
              <button onClick={resend} className="font-medium text-[#2b7fff]">Resend OTP</button>
            </p>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-[#2b7fff]" />
              <span className="text-sm font-medium text-[#2b7fff]">{mm}:{ss} remaining</span>
            </div>
          </div>

          <div className="flex w-full items-center gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onBack}>
              <ArrowLeft className="size-4" /> Go Back
            </Button>
            <Button className="flex-1" disabled={code.length !== OTP_LENGTH || verifying} onClick={confirm}>
              <ShieldCheck className="size-4" /> {verifying ? "Verifying..." : "Confirm Cancellation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
