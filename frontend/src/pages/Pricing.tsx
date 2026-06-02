import { useNavigate } from "react-router-dom";
import { Gift, Zap, Crown, Check, X, Sparkles } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Button, Card, Badge, cn } from "@/components/ui";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const plans = [
  {
    id: "free",
    name: "Free",
    icon: Gift,
    price: "₹0",
    tagline: "For individuals getting started",
    featured: false,
    features: [
      ["Unlimited join quizzes", true],
      ["Create up to 10 quizzes", true],
      ["MCQ & True/False types", true],
      ["AI question generation", false],
      ["Advanced analytics", false],
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    price: "₹250",
    tagline: "For active educators & teams",
    featured: true,
    features: [
      ["Everything in Free", true],
      ["Create up to 30 quizzes/mo", true],
      ["AI question generation", true],
      ["Detailed result analytics", true],
      ["Password-protected quizzes", true],
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    price: "₹900",
    tagline: "For power users & institutions",
    featured: false,
    features: [
      ["Everything in Pro", true],
      ["120 quizzes/mo", true],
      ["Advanced AI & bulk import", true],
      ["Custom branding", true],
      ["Priority 24/7 support", true],
    ],
  },
] as const;

export default function Pricing() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const upgrade = async (planId: "free" | "pro" | "premium") => {
    if (!user) return navigate("/signup");
    if (planId === "free") return navigate("/dashboard");
    try {
      const { data: order } = await api.post("/payments/order", { plan: planId });
      if (!(await loadRazorpay())) return toast.error("Could not load Razorpay checkout");

      const Rzp = (window as unknown as { Razorpay: new (o: object) => { open: () => void } }).Razorpay;
      new Rzp({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "QuizMind AI",
        description: `${planId} subscription`,
        order_id: order.orderId,
        prefill: { email: user.email, name: user.displayName ?? user.username },
        theme: { color: "#2b7fff" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verify = await api.post("/payments/verify", {
              plan: planId,
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            setUser(verify.data.user);
            toast.success(`You're now on the ${planId} plan! 🎉`);
          } catch (err) {
            toast.error(apiError(err, "Payment verification failed"));
          }
        },
      }).open();
    } catch (err) {
      toast.error(apiError(err, "Could not start checkout"));
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <Badge className="bg-[#2b7fff]/10 text-[#2b7fff]">
          <Sparkles className="size-3" /> Pricing Plans
        </Badge>
        <h1 className="mt-4 text-3xl font-bold">Choose the plan that fits you</h1>
        <p className="mt-2 text-zinc-600">Start for free and upgrade as your quizzes grow.</p>
      </div>

      <div className="mt-10 grid items-start gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={cn("relative p-6", p.featured && "border-2 border-[#2b7fff] shadow-md")}
          >
            {p.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2b7fff] px-3 py-0.5 text-xs font-semibold text-white">
                ★ Most Popular
              </span>
            )}
            <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]">
              <p.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-xl font-bold">{p.name}</h3>
            <p className="text-sm text-zinc-500">{p.tagline}</p>
            <p className="mt-4 text-3xl font-bold">
              {p.price}
              <span className="text-base font-normal text-zinc-500">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {p.features.map(([label, included]) => (
                <li key={label as string} className="flex items-center gap-2">
                  {included ? (
                    <Check className="size-4 text-[#2b7fff]" />
                  ) : (
                    <X className="size-4 text-zinc-400" />
                  )}
                  <span className={included ? "" : "text-zinc-400"}>{label}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={p.featured ? "primary" : "outline"}
              className="mt-6 w-full"
              disabled={user?.tier === p.id}
              onClick={() => upgrade(p.id)}
            >
              {user?.tier === p.id ? "Current plan" : p.id === "free" ? "Get started" : `Upgrade to ${p.name}`}
            </Button>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-zinc-500">
        All prices in INR. Cancel anytime. Prices exclude applicable taxes.
      </p>
    </main>
  );
}
