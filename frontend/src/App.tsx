import { useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/stores/auth";
import { warmUpApi } from "@/lib/api";
import { lazyWithReload } from "@/lib/lazyWithReload";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";
import { LoadingScreen } from "@/components/LoadingScreen";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { DiscoverSkeleton } from "@/components/DiscoverSkeleton";
import { QuizListSkeleton } from "@/components/QuizListSkeleton";
import { MyQuizzesSkeleton } from "@/components/MyQuizzesSkeleton";
import { TakeQuizSkeleton } from "@/components/TakeQuizSkeleton";
import { NotificationsSkeleton } from "@/components/NotificationsSkeleton";

const Landing = lazyWithReload(() => import("@/pages/Landing"));
const Login = lazyWithReload(() => import("@/pages/Login"));
const Signup = lazyWithReload(() => import("@/pages/Signup"));
const Dashboard = lazyWithReload(() => import("@/pages/Dashboard"));
const CreateQuiz = lazyWithReload(() => import("@/pages/CreateQuiz"));
const Discover = lazyWithReload(() => import("@/pages/Discover"));
const MyQuizzes = lazyWithReload(() => import("@/pages/MyQuizzes"));
const QuizList = lazyWithReload(() => import("@/pages/QuizList"));
const JoinQuiz = lazyWithReload(() => import("@/pages/JoinQuiz"));
const PlayQuiz = lazyWithReload(() => import("@/pages/PlayQuiz"));
const TakeQuiz = lazyWithReload(() => import("@/pages/TakeQuiz"));
const Results = lazyWithReload(() => import("@/pages/Results"));
const ResultsRedirect = lazyWithReload(() => import("@/pages/ResultsRedirect"));
const Analytics = lazyWithReload(() => import("@/pages/Analytics"));
const Profile = lazyWithReload(() => import("@/pages/Profile"));
const Notifications = lazyWithReload(() => import("@/pages/Notifications"));
const Pricing = lazyWithReload(() => import("@/pages/Pricing"));
const ForgotPassword = lazyWithReload(() => import("@/pages/ForgotPassword"));
const OAuthCallback = lazyWithReload(() => import("@/pages/OAuthCallback"));

function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-4 border-[#2b7fff] border-t-transparent" />
    </div>
  );
}

const protect = (el: React.ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>;

function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const hideNavbar = pathname.startsWith("/take/") || pathname.startsWith("/play/");
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      {children}
    </>
  );
}

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
      <AppLayout>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={protect(<Suspense fallback={<DashboardSkeleton />}><Dashboard /></Suspense>)} />
          <Route path="/quiz/create" element={protect(<CreateQuiz />)} />
          <Route path="/discover" element={protect(<Suspense fallback={<DiscoverSkeleton />}><Discover /></Suspense>)} />
          <Route path="/discover/:type" element={protect(<Suspense fallback={<QuizListSkeleton />}><QuizList /></Suspense>)} />
          <Route path="/my-quizzes" element={protect(<Suspense fallback={<MyQuizzesSkeleton />}><MyQuizzes /></Suspense>)} />
          <Route path="/join/:quizId" element={protect(<JoinQuiz />)} />
          <Route path="/results" element={protect(<Suspense fallback={<DashboardSkeleton />}><ResultsRedirect /></Suspense>)} />
          <Route path="/play/:sessionId" element={protect(<PlayQuiz />)} />
          <Route path="/take/:sessionId" element={protect(<Suspense fallback={<TakeQuizSkeleton />}><TakeQuiz /></Suspense>)} />
          <Route path="/results/:sessionId" element={protect(<Results />)} />
          <Route path="/analytics/:sessionId" element={protect(<Suspense fallback={<DashboardSkeleton />}><Analytics /></Suspense>)} />
          <Route path="/profile" element={protect(<Profile />)} />
          <Route path="/notifications" element={protect(<Suspense fallback={<NotificationsSkeleton />}><Notifications /></Suspense>)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}
