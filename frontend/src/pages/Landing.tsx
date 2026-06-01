import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Rocket,
  Play,
  TrendingUp,
  Wand2,
  Gauge,
  LineChart,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";

const featureItems = [
  { icon: Wand2, title: "AI Quiz Generation", desc: "Paste any topic or document and instantly get tailored quiz questions with detailed explanations." },
  { icon: Gauge, title: "Adaptive Difficulty", desc: "Questions adjust to your performance in real time, keeping you challenged but never overwhelmed." },
  { icon: LineChart, title: "Smart Analytics", desc: "Track progress, spot weak areas, and get AI-curated recommendations for what to study next." },
];

const steps = [
  { n: 1, title: "Choose your topic", desc: "Pick a subject or upload your own study material." },
  { n: 2, title: "Take the AI quiz", desc: "Answer adaptive questions tailored to your level." },
  { n: 3, title: "Review insights", desc: "Get instant feedback and a personalized study plan." },
];

const stats = [
  ["50K+", "Active learners"],
  ["1.2M", "Quizzes taken"],
  ["98%", "Satisfaction"],
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const start = () => navigate(user ? "/dashboard" : "/signup");

  return (
    <main className="mx-auto max-w-[1140px] px-8">
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-12 py-12 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-zinc-100 px-4 py-1.5">
            <Sparkles className="size-4 text-[#2b7fff]" />
            <span className="text-xs font-medium text-zinc-900">Powered by adaptive AI learning</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Learn smarter with quizzes that <span className="text-[#2b7fff]">think with you</span>
          </h1>
          <p className="text-lg leading-relaxed text-[#71717b]">
            QuizMind generates personalized quizzes, adapts to your skill level in real time, and turns
            every answer into actionable insight. Master any subject faster.
          </p>
          <div className="flex items-center gap-4">
            <Button className="h-11 px-6 text-base" onClick={start}>
              <Rocket className="mr-2 size-5" /> Start free quiz
            </Button>
            <Button variant="outline" className="h-11 px-6 text-base" onClick={start}>
              <Play className="mr-2 size-5" /> Watch demo
            </Button>
          </div>
          <div className="flex items-center gap-8 pt-2">
            {stats.map(([value, label]) => (
              <div key={label} className="flex flex-col">
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-sm text-[#71717b]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-[#2b7fff]/10 blur-2xl" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-zinc-200">
            <img
              src="https://images.unsplash.com/photo-1646756089735-487709743361?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwd2l0aCUyMHRlY2hub2xvZ3klMjBicmFpbnxlbnwxfDB8fHwxNzgwMjExNzU4fDA&ixlib=rb-4.1.0&q=80&w=800"
              alt="Student learning"
              className="h-full w-full object-cover"
            />
          </div>
          <div className={`absolute -left-6 -bottom-6 flex w-56 items-center gap-2 p-4 ${card} shadow-lg`}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2b7fff]">
              <TrendingUp className="size-5 text-blue-50" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Score improved</span>
              <span className="text-xs text-[#71717b]">+34% this week</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-[#2b7fff]">Features</span>
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to learn faster</h2>
          <p className="max-w-xl text-[#71717b]">
            Intelligent tools designed to make studying effortless and effective.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featureItems.map((f) => (
            <div key={f.title} className={`flex flex-col gap-4 p-6 ${card}`}>
              <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-100">
                <f.icon className="size-5 text-[#2b7fff]" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#71717b]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <div className="rounded-2xl bg-zinc-100 p-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
              {steps.map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2b7fff] text-sm font-semibold text-blue-50">
                    {s.n}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{s.title}</span>
                    <span className="text-sm text-[#71717b]">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-200">
              <img
                src="https://images.unsplash.com/photo-1521572139070-e9abc6eeb045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjB1c2luZyUyMGxhcHRvcCUyMHN0dWR5aW5nJTIwb25saW5lfGVufDF8Mnx8fDE3ODAyMTE3NTh8MA&ixlib=rb-4.1.0&q=80&w=800"
                alt="Person studying"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className={`flex flex-col items-center gap-6 p-12 text-center ${card}`}>
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#2b7fff]">
            <GraduationCap className="size-7 text-blue-50" />
          </div>
          <h2 className="max-w-lg text-3xl font-bold tracking-tight">Ready to make learning addictive?</h2>
          <p className="max-w-md text-[#71717b]">
            Join thousands of learners using QuizMind AI to study smarter, not harder. Start free, no
            credit card required.
          </p>
          <Button className="h-11 px-8 text-base" onClick={start}>
            Create your first quiz <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </section>
    </main>
  );
}
