import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/stores/auth";
import { warmUpApi } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";
import { LoadingScreen } from "@/components/LoadingScreen";

const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CreateQuiz = lazy(() => import("@/pages/CreateQuiz"));
const Discover = lazy(() => import("@/pages/Discover"));
const MyQuizzes = lazy(() => import("@/pages/MyQuizzes"));
const QuizList = lazy(() => import("@/pages/QuizList"));
const JoinQuiz = lazy(() => import("@/pages/JoinQuiz"));
const PlayQuiz = lazy(() => import("@/pages/PlayQuiz"));
const TakeQuiz = lazy(() => import("@/pages/TakeQuiz"));
const Results = lazy(() => import("@/pages/Results"));
const ResultsRedirect = lazy(() => import("@/pages/ResultsRedirect"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Profile = lazy(() => import("@/pages/Profile"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));

function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-4 border-[#2b7fff] border-t-transparent" />
    </div>
  );
}

const protect = (el: React.ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  const { initializing, loadSession } = useAuth();

  useEffect(() => {
    // Nudge the API awake (Render free tier spins down after ~15 min idle)
    // so the cold start happens in parallel with our auth call instead of
    // stalling it.
    warmUpApi();
    loadSession();
  }, [loadSession]);

  if (initializing) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={protect(<Dashboard />)} />
          <Route path="/quiz/create" element={protect(<CreateQuiz />)} />
          <Route path="/discover" element={protect(<Discover />)} />
          <Route path="/discover/:type" element={protect(<QuizList />)} />
          <Route path="/my-quizzes" element={protect(<MyQuizzes />)} />
          <Route path="/join/:quizId" element={protect(<JoinQuiz />)} />
          <Route path="/results" element={protect(<ResultsRedirect />)} />
          <Route path="/play/:sessionId" element={protect(<PlayQuiz />)} />
          <Route path="/take/:sessionId" element={protect(<TakeQuiz />)} />
          <Route path="/results/:sessionId" element={protect(<Results />)} />
          <Route path="/analytics/:sessionId" element={protect(<Analytics />)} />
          <Route path="/profile" element={protect(<Profile />)} />
          <Route path="/notifications" element={protect(<Notifications />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
