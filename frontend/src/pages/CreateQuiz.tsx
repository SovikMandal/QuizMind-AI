import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Lock,
  KeyRound,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  GripVertical,
  Trash2,
  Check,
  Rocket,
  Lightbulb,
  ClipboardList,
  Clock,
  Infinity as InfinityIcon,
  CheckSquare,
  HelpCircle,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import type { QuestionInput } from "@/types";
import { Button, Card, Input, Label, cn } from "@/components/ui";
import { useAuth } from "@/stores/auth";

const difficultyToQuizLevel = {
  easy: "beginner",
  medium: "intermediate",
  hard: "advanced",
} as const;

type Difficulty = keyof typeof difficultyToQuizLevel;

const steps = ["Quiz Details", "Add Questions", "Review & Publish"];
const diffs = ["easy", "medium", "hard"] as const;
const diffBadge: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};
const qTypeLabel: Record<string, string> = {
  mcq: "MCQ",
  true_false: "True/False",
  short_answer: "Short Answer",
};

function Stepper({ step }: { step: number }) {
  return (
    <div className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-[1140px] items-center px-6 py-6">
        {steps.map((label, i) => {
          const n = i + 1;
          return (
            <Fragment key={label}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm font-semibold",
                    n <= step ? "bg-[#2b7fff] text-blue-50" : "border-2 border-zinc-300 bg-white text-[#71717b]"
                  )}
                >
                  {n < step ? <Check className="size-5" /> : n}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className={cn("text-sm font-semibold", n <= step ? "text-zinc-950" : "text-[#71717b]")}>{label}</span>
                  <span className="text-xs text-[#71717b]">Step {n} of 3</span>
                </div>
              </div>
              {n < 3 && <div className={cn("mx-4 h-0.5 flex-1", n < step ? "bg-[#2b7fff]" : "bg-zinc-200")} />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

const blankQuestion = (): QuestionInput => ({
  questionText: "",
  questionType: "mcq",
  options: ["a", "b", "c", "d"].map((id, i) => ({ id, text: "", isCorrect: i === 0 })),
  correctAnswer: "a",
  explanation: "",
  difficulty: "medium",
});

function QuestionEditor({
  q,
  index,
  onChange,
  onRemove,
}: {
  q: QuestionInput;
  index: number;
  onChange: (q: QuestionInput) => void;
  onRemove: () => void;
}) {
  const opts = q.options ?? [];
  const setType = (t: "mcq" | "true_false") => {
    if (t === "true_false") {
      onChange({
        ...q,
        questionType: t,
        options: [
          { id: "true", text: "True", isCorrect: true },
          { id: "false", text: "False", isCorrect: false },
        ],
        correctAnswer: "true",
      });
    } else {
      const base = opts.length >= 2 && opts[0].id === "a" ? opts : blankQuestion().options!;
      onChange({ ...q, questionType: "mcq", options: base, correctAnswer: base.find((o) => o.isCorrect)?.id ?? base[0].id });
    }
  };
  const markCorrect = (id: string) =>
    onChange({ ...q, options: opts.map((o) => ({ ...o, isCorrect: o.id === id })), correctAnswer: id });
  const setOpt = (id: string, text: string) =>
    onChange({ ...q, options: opts.map((o) => (o.id === id ? { ...o, text } : o)) });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="size-5 text-zinc-400" />
          <span className="text-sm font-bold">Question {index + 1}</span>
        </div>
        <button onClick={onRemove} aria-label="Delete question">
          <Trash2 className="size-4 text-zinc-400 hover:text-red-500" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label>Question Type</Label>
        <select
          className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
          value={q.questionType}
          onChange={(e) => setType(e.target.value as "mcq" | "true_false")}
        >
          <option value="mcq">Multiple Choice</option>
          <option value="true_false">True / False</option>
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label>Question Text</Label>
        <textarea
          rows={2}
          className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#2b7fff]"
          placeholder="Enter your question here..."
          value={q.questionText}
          onChange={(e) => onChange({ ...q, questionText: e.target.value })}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label>Answer Options</Label>
        <div className={cn("gap-3", q.questionType === "true_false" ? "flex flex-col" : "grid grid-cols-2")}>
          {opts.map((o) => (
            <div
              key={o.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2",
                o.isCorrect ? "border-[#2b7fff] bg-[#2b7fff]/5" : "border-zinc-200"
              )}
            >
              <button
                onClick={() => markCorrect(o.id)}
                aria-label="Mark correct"
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  o.isCorrect ? "bg-[#2b7fff] text-blue-50" : "border-2 border-zinc-300"
                )}
              >
                {o.isCorrect && <Check className="size-3" />}
              </button>
              {q.questionType === "true_false" ? (
                <span className="text-sm font-medium">{o.text}</span>
              ) : (
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder={`Option ${o.id.toUpperCase()}`}
                  value={o.text}
                  onChange={(e) => setOpt(o.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <span className="text-xs text-[#71717b]">Tap the circle to mark the correct answer</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label>Difficulty Level</Label>
        <div className="inline-flex w-fit items-center rounded-lg border border-zinc-200 p-1">
          {diffs.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ ...q, difficulty: d })}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium capitalize",
                q.difficulty === d ? "bg-[#2b7fff] text-blue-50" : "text-[#71717b]"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label>Explanation</Label>
        <textarea
          rows={2}
          className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#2b7fff]"
          placeholder="Explain why the correct answer is right..."
          value={q.explanation ?? ""}
          onChange={(e) => onChange({ ...q, explanation: e.target.value })}
        />
      </div>
    </Card>
  );
}

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 — details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [durationMins, setDurationMins] = useState(30);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [quizType, setQuizType] = useState<"public" | "private">("public");
  const [password, setPassword] = useState("");
  const [allowLateJoin, setAllowLateJoin] = useState(false);

  // Step 2 — questions
  const [topicPrompt, setTopicPrompt] = useState("");
  const [count, setCount] = useState(10);
  const { user } = useAuth();
  const maxAiQuestions = !user || user.tier === "free" ? 12 : 70;
  const [questions, setQuestions] = useState<QuestionInput[]>([]);

  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const step1Valid =
    !!title.trim() && !!subject && !!date && !!time && durationMins > 0 && (quizType === "public" || !!password);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/ai/generate-questions", {
        topic: topicPrompt,
        difficulty,
        count,
        questionType: "multiple_choice",
      });
      setQuestions((qs) => [...qs, ...res.data.questions]);
    } catch (err) {
      toast.error(apiError(err, "Generation failed"));
    } finally {
      setGenerating(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const res = await api.post("/quizzes", {
        title,
        description,
        subject,
        difficulty: difficultyToQuizLevel[difficulty],
        quizType,
        ...(quizType === "private" ? { password } : {}),
        allowLateJoin,
        scheduledAt: new Date(`${date}T${time}`).toISOString(),
        durationMins,
        questions,
      });
      await api.post(`/quizzes/${res.data.quiz.id}/publish`);
      const code = res.data.quiz.accessCode;
      toast.success(code ? `Published! Private access code: ${code}` : "Quiz published!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(apiError(err, "Publish failed"));
    } finally {
      setPublishing(false);
    }
  };

  const subtitle =
    step === 1
      ? "Fill in the details to set up your quiz."
      : step === 2
      ? "Use AI to generate questions or add them manually."
      : "Review your quiz details and questions before publishing.";

  return (
    <>
      <Stepper step={step} />
      <main className="mx-auto max-w-[1140px] px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {step === 1 ? "Create a New Quiz" : step === 2 ? "Add Questions" : "Review & Publish"}
          </h1>
          <p className="mt-1 text-[#71717b]">{subtitle}</p>
        </div>

        {/* ── Step 1: Quiz Details ── */}
        {step === 1 && (
          <Card className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 flex flex-col gap-2">
                <Label>Quiz Name</Label>
                <Input className="h-11" placeholder="e.g. Cell Biology Basics" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="col-span-2 flex flex-col gap-2">
                <Label>Description</Label>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/20"
                  placeholder="Describe what this quiz covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Subject / Category</Label>
                <select
                  className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="" disabled>Select a subject</option>
                  <option value="Science">Science</option>
                  <option value="Math">Math</option>
                  <option value="History">History</option>
                  <option value="Coding">Computer Science</option>
                  <option value="Medical">Medical</option>
                  <option value="General">General</option>
                  <option value="Literature">Literature</option>
                  <option value="Geography">Geography</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Difficulty</Label>
                <div className="flex h-11 items-center rounded-lg border border-zinc-200 bg-zinc-100 p-1">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "h-full flex-1 rounded-md text-sm capitalize",
                        difficulty === d ? "bg-white font-semibold text-zinc-950 shadow-sm" : "font-medium text-[#71717b]"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Total Duration</Label>
                  <div className="flex h-11 items-center rounded-lg border border-zinc-200 pr-3">
                    <Input
                      type="number"
                      min={1}
                      className="h-full border-0 shadow-none focus:ring-0"
                      placeholder="30"
                      value={durationMins}
                      onChange={(e) => setDurationMins(Number(e.target.value))}
                    />
                    <span className="text-sm text-[#71717b]">minutes</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Schedule Date</Label>
                  <Input type="date" className="h-11" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Start Time</Label>
                  <Input type="time" className="h-11" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>

              <div className="col-span-2 flex flex-col gap-3">
                <Label>Quiz Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setQuizType("public")}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border-2 p-4 text-left",
                      quizType === "public" ? "border-[#2b7fff] bg-[#2b7fff]/5" : "border-zinc-200 bg-white"
                    )}
                  >
                    <div className={cn("flex size-10 items-center justify-center rounded-lg", quizType === "public" ? "bg-[#2b7fff] text-blue-50" : "bg-zinc-100 text-[#71717b]")}>
                      <Globe className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Public</span>
                      <span className="text-xs text-[#71717b]">Anyone with the link can join this quiz.</span>
                    </div>
                    {quizType === "public" && <CheckCircle2 className="ml-auto size-5 text-[#2b7fff]" />}
                  </button>
                  <button
                    onClick={() => setQuizType("private")}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border-2 p-4 text-left",
                      quizType === "private" ? "border-[#2b7fff] bg-[#2b7fff]/5" : "border-zinc-200 bg-white"
                    )}
                  >
                    <div className={cn("flex size-10 items-center justify-center rounded-lg", quizType === "private" ? "bg-[#2b7fff] text-blue-50" : "bg-zinc-100 text-[#71717b]")}>
                      <Lock className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Private</span>
                      <span className="text-xs text-[#71717b]">Only people with a code and password can join.</span>
                    </div>
                    {quizType === "private" && <CheckCircle2 className="ml-auto size-5 text-[#2b7fff]" />}
                  </button>
                </div>
                {quizType === "private" && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-[#71717b]">Quiz Password</Label>
                    <div className="flex h-11 items-center rounded-lg border border-zinc-200 px-3">
                      <KeyRound className="mr-2 size-4 text-[#71717b]" />
                      <Input
                        type="password"
                        className="h-full border-0 shadow-none focus:ring-0"
                        placeholder="Set quiz password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <label className="col-span-2 flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-100 p-4">
                <input
                  type="checkbox"
                  checked={allowLateJoin}
                  onChange={(e) => setAllowLateJoin(e.target.checked)}
                  className="mt-0.5 size-4 accent-[#2b7fff]"
                />
                <span className="flex items-start gap-2">
                  <CalendarClock className="mt-0.5 size-5 text-[#2b7fff]" />
                  <span className="text-sm text-zinc-950">Allow students to join and attempt this quiz anytime, even after it ends.</span>
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <Button className="h-11 px-6" disabled={!step1Valid} onClick={() => setStep(2)}>
                Next: Add Questions <ArrowRight className="size-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 2: Add Questions ── */}
        {step === 2 && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]">
                  <Sparkles className="size-5" />
                </div>
                <div className="flex flex-col leading-tight">
                  <h2 className="text-base font-semibold">Generate with AI</h2>
                  <p className="text-sm text-[#71717b]">Let AI craft questions from your topic description</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Label>Describe your quiz topic</Label>
                <textarea
                  rows={4}
                  className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#2b7fff]"
                  placeholder="e.g. Generate questions about photosynthesis, cell structure, and mitosis for a high school biology quiz..."
                  value={topicPrompt}
                  onChange={(e) => setTopicPrompt(e.target.value)}
                />
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Label>Number of questions</Label>
                <Input type="number" min={1} max={maxAiQuestions} className="w-28" value={count} onChange={(e) => setCount(Math.min(maxAiQuestions, Math.max(1, Number(e.target.value))))} />
                <p className="text-xs text-[#71717b]">Up to {maxAiQuestions} questions on your {user?.tier ?? "free"} plan.</p>
              </div>
              <Button className="mt-4 w-full gap-2" onClick={generate} disabled={generating || !topicPrompt.trim()}>
                <Sparkles className="size-4" /> {generating ? "Generating..." : "Generate Questions"}
              </Button>
            </Card>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-[#71717b]">or add manually</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <Button
              variant="outline"
              className="mb-6 w-full gap-2 border-[#2b7fff] text-[#2b7fff]"
              onClick={() => setQuestions((qs) => [blankQuestion(), ...qs])}
            >
              <Plus className="size-4" /> Add Question Manually
            </Button>

            <div className="flex flex-col gap-6">
              {questions.map((q, i) => (
                <QuestionEditor
                  key={i}
                  q={q}
                  index={i}
                  onChange={(nq) => setQuestions((qs) => qs.map((x, idx) => (idx === i ? nq : x)))}
                  onRemove={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))}
                />
              ))}
              {questions.length === 0 && (
                <p className="rounded-lg border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-400">
                  No questions yet — generate with AI or add one manually.
                </p>
              )}
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-6">
              <Button variant="outline" className="h-11 px-6" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button className="h-11 px-6" disabled={questions.length === 0} onClick={() => setStep(3)}>
                Next: Review &amp; Publish <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Review & Publish ── */}
        {step === 3 && (
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex flex-col gap-4 lg:w-[65%]">
              {questions.map((q, i) => {
                const opts = q.options ?? [];
                return (
                  <Card key={i} className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 items-center rounded-md bg-[#2b7fff] px-2 text-xs font-bold text-blue-50">Q{i + 1}</span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-900">{qTypeLabel[q.questionType]}</span>
                      </div>
                      {q.difficulty && (
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", diffBadge[q.difficulty])}>{q.difficulty}</span>
                      )}
                    </div>
                    <p className="mt-4 text-base font-bold">{q.questionText}</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {opts.map((o) => {
                        const correct = o.isCorrect || o.id === q.correctAnswer;
                        return (
                          <div
                            key={o.id}
                            className={cn("flex items-center gap-2 rounded-lg border px-3 py-2", correct ? "border-green-200 bg-green-50" : "border-zinc-200")}
                          >
                            {correct ? (
                              <CheckCircle2 className="size-4 text-green-600" />
                            ) : (
                              <span className="size-4 rounded-full border border-[#71717b]/40" />
                            )}
                            <span className={cn("text-sm", correct && "font-medium text-green-800")}>{o.text}</span>
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="mt-2 flex items-start gap-2 rounded-lg bg-zinc-100 px-3 py-2">
                        <Lightbulb className="mt-0.5 size-4 text-[#71717b]" />
                        <p className="text-xs text-[#71717b]">Explanation: {q.explanation}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 lg:w-[35%]">
              <Card className="sticky top-8 p-6">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-[#2b7fff]" />
                  <span className="text-sm font-semibold uppercase tracking-wide text-[#71717b]">Quiz Summary</span>
                </div>
                <h2 className="mt-1 text-xl font-bold">{title || "Untitled quiz"}</h2>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {subject && <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-900">{subject}</span>}
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", diffBadge[difficulty])}>{difficulty}</span>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[#71717b]"><Clock className="size-4" /> Duration</span>
                    <span className="text-sm font-medium">{durationMins} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[#71717b]"><Lock className="size-4" /> Password</span>
                    <span className={cn("text-sm font-medium", quizType === "private" && "text-green-600")}>{quizType === "private" ? "Protected" : "None"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[#71717b]"><InfinityIcon className="size-4" /> Join mode</span>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      {allowLateJoin ? <><CheckSquare className="size-4 text-[#2b7fff]" /> Async</> : "Live"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[#71717b]"><HelpCircle className="size-4" /> Total questions</span>
                    <span className="text-sm font-medium">{questions.length}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#2b7fff]/10 px-3 py-2">
                  <Sparkles className="size-4 text-[#2b7fff]" />
                  <span className="text-xs font-medium text-[#2b7fff]">{questions.length} questions ready</span>
                </div>
              </Card>

              <button
                onClick={publish}
                disabled={publishing}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-4 text-base font-semibold text-white disabled:opacity-50"
              >
                <Rocket className="size-5" /> {publishing ? "Publishing..." : "Publish Quiz"}
              </button>
              <Button variant="outline" className="w-full py-3 text-[#71717b]" onClick={() => setStep(2)}>
                <ArrowLeft className="size-4" /> Back to Questions
              </Button>
              <p className="text-center text-xs text-[#71717b]">Once published, students can join using the quiz code.</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
