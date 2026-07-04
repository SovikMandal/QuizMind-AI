import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { connectQuizSocket } from "@/lib/socket";
import { TakeQuizSkeleton } from "@/components/TakeQuizSkeleton";

import type { TakeState } from "@/components/take-quiz/types";
import { isFullscreen, exitFullscreen, parseQuestion } from "@/components/take-quiz/utils";
import { FullscreenGate } from "@/components/take-quiz/FullscreenGate";
import { FullscreenExitOverlay } from "@/components/take-quiz/FullscreenExitOverlay";
import { QuizHeader } from "@/components/take-quiz/QuizHeader";
import { StatsBar } from "@/components/take-quiz/StatsBar";
import { QuestionSidebar } from "@/components/take-quiz/QuestionSidebar";
import { QuestionPanel } from "@/components/take-quiz/QuestionPanel";
import { SubmitConfirmModal } from "@/components/take-quiz/SubmitConfirmModal";

export default function TakeQuiz() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const state = (useLocation().state ?? null) as TakeState | null;

  // Hide navbar and scrollbar while this page is mounted
  useEffect(() => {
    const navbar = document.querySelector("nav");
    if (navbar) (navbar as HTMLElement).style.display = "none";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");
    return () => {
      if (navbar) (navbar as HTMLElement).style.display = "";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.classList.remove("hide-scrollbar");
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  /* Fullscreen state */
  const [fullscreenGranted, setFullscreenGranted] = useState(false);
  const [fullscreenExited, setFullscreenExited] = useState(false);
  const [violations, setViolations] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>(() => state?.savedAnswers ?? {});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const questions = useMemo(() => state?.questions ?? [], [state]);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittedRef = useRef(false);
  const timeRef = useRef<Record<string, number>>({});
  const tickRef = useRef(Date.now());
  const idxRef = useRef(0);

  const deadline = useMemo(() => {
    const dur = (state?.durationMins ?? 30) * 60000;
    if (state?.scheduledAt) {
      const end = new Date(state.scheduledAt).getTime() + dur;
      if (end > Date.now()) return end;
    }
    return Date.now() + dur;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.round((deadline - Date.now()) / 1000)));

  // Accrue elapsed time to each question as the user navigates
  useEffect(() => {
    const prevId = questions[idxRef.current]?.id;
    if (prevId) timeRef.current[prevId] = (timeRef.current[prevId] ?? 0) + (Date.now() - tickRef.current) / 1000;
    tickRef.current = Date.now();
    idxRef.current = idx;
  }, [idx, questions]);

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const curId = questions[idxRef.current]?.id;
    if (curId) timeRef.current[curId] = (timeRef.current[curId] ?? 0) + (Date.now() - tickRef.current) / 1000;
    try {
      if (isFullscreen()) exitFullscreen();
      await api.post(`/sessions/${sessionId}/submit`, {
        answers: questions.map((q) => ({
          questionId: q.id,
          answer: answersRef.current[q.id] ?? "",
          timeTaken: Math.round(timeRef.current[q.id] ?? 0),
        })),
      });
      navigate(`/results/${sessionId}`);
    } catch (err) {
      toast.error(apiError(err, "Could not submit your answers"));
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [questions, sessionId, navigate]);

  // Countdown; auto-submit at zero
  useEffect(() => {
    if (state?.completed) return;
    if (!fullscreenGranted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          void submit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreenGranted]);

  // Fullscreen exit detection → pause + count violations
  useEffect(() => {
    if (!fullscreenGranted) return;
    const handleChange = () => {
      if (!isFullscreen() && !submittedRef.current) {
        setFullscreenExited(true);
        setViolations((v) => {
          const next = v + 1;
          if (next >= 3) {
            toast.error("Maximum violations reached. Auto-submitting...");
            void submit();
          }
          return next;
        });
      }
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, [fullscreenGranted, submit]);

  // Live presence
  useEffect(() => {
    const socket = connectQuizSocket();
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("presence_join", { sessionId });
    });
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  // Redirect if no state
  if (!state) {
    navigate("/discover", { replace: true });
    return null;
  }

  if (questions.length === 0) return <TakeQuizSkeleton />;

  // Fullscreen gate before quiz starts
  if (!fullscreenGranted && !state.completed) {
    return (
      <FullscreenGate
        quizTitle={state.quizTitle}
        subject={state.subject}
        difficulty={state.difficulty}
        totalQuestions={questions.length}
        durationMins={state.durationMins ?? 30}
        onGranted={() => setFullscreenGranted(true)}
        onDenied={() => navigate(-1)}
      />
    );
  }

  // Overlay if user exited fullscreen
  if (fullscreenExited && !submittedRef.current) {
    return <FullscreenExitOverlay violations={violations} onReenter={() => setFullscreenExited(false)} />;
  }

  const q = questions[idx];
  const total = questions.length;
  const locked = !!state.completed;
  const parsed = parseQuestion(q.questionText);
  const answeredCount = questions.filter((x) => answers[x.id]).length;
  const flaggedCount = questions.filter((x) => flagged[x.id]).length;
  const isLive =
    !!state.scheduledAt && new Date(state.scheduledAt).getTime() + (state.durationMins ?? 30) * 60000 > Date.now();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8f9fb] overflow-hidden scrollbar-hide">
      <QuizHeader
        quizTitle={state.quizTitle}
        subject={state.subject}
        difficulty={state.difficulty}
        timeLeft={timeLeft}
        connected={connected}
        isLive={isLive}
        violations={violations}
        submitting={submitting}
        canSubmit={!submitting && answeredCount > 0 && !locked}
        onSubmit={() => setConfirmSubmit(true)}
      />

      <StatsBar answeredCount={answeredCount} flaggedCount={flaggedCount} total={total} />

      {locked && (
        <div className="shrink-0 border-b border-blue-100 bg-blue-50 px-6 py-2.5 text-center">
          <p className="text-sm font-medium text-blue-700">
            ✓ You've already completed this quiz — viewing submitted answers (read-only)
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar
          questions={questions}
          currentIdx={idx}
          answers={answers}
          flagged={flagged}
          onSelect={setIdx}
        />

        <QuestionPanel
          question={q}
          parsed={parsed}
          idx={idx}
          total={total}
          subject={state.subject}
          answer={answers[q.id]}
          isFlagged={!!flagged[q.id]}
          locked={locked}
          submitting={submitting}
          answeredCount={answeredCount}
          onSelectOption={(optId) => setAnswers((a) => ({ ...a, [q.id]: optId }))}
          onTypeAnswer={(val) => setAnswers((a) => ({ ...a, [q.id]: val }))}
          onPrev={() => setIdx((i) => i - 1)}
          onNext={() => setIdx((i) => i + 1)}
          onToggleFlag={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
          onSubmit={() => setConfirmSubmit(true)}
        />
      </div>

      {confirmSubmit && (
        <SubmitConfirmModal
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
          total={total}
          submitting={submitting}
          onCancel={() => setConfirmSubmit(false)}
          onConfirm={() => {
            setConfirmSubmit(false);
            void submit();
          }}
        />
      )}
    </div>
  );
}
