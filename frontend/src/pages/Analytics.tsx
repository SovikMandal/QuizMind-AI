import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, apiError } from "@/lib/api";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import {
  AnalyticsHeader,
  MetricCards,
  Charts,
  Leaderboard,
  HardestQuestions,
  AiInsights,
  ExportSuccessModal,
  AnalyticsFooter,
  AnalyticsReport,
  buildReportData,
  useAnalyticsExport,
  type AnalyticsData,
} from "@/components/analytics";

export default function Analytics() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/sessions/${sessionId}/analytics`)
      .then((r) => setD(r.data))
      .catch((e) => setError(apiError(e)));
  }, [sessionId]);

  const { reportRef, exporting, exported, exportPdf, dismiss } = useAnalyticsExport(d?.quiz.title ?? "");

  // Pass rate from the score distribution: count of buckets whose lower bound is >= 50%.
  const passRate = useMemo(() => {
    if (!d) return 0;
    const distTotal = d.scoreDistribution.reduce((s, b) => s + b.count, 0) || 1;
    const passCount = d.scoreDistribution
      .filter((b) => parseInt(b.range) >= 50)
      .reduce((s, b) => s + b.count, 0);
    return Math.round((passCount / distTotal) * 100);
  }, [d]);

  const reportData = useMemo(
    () => (d ? buildReportData(d, sessionId, passRate) : null),
    [d, sessionId, passRate]
  );

  if (error) {
    return <main className="mx-auto max-w-xl px-6 py-20 text-center text-red-600">{error}</main>;
  }
  if (!d || !reportData) return <DashboardSkeleton />;

  const handleShare = () => {
    navigator.clipboard?.writeText(`${location.origin}/join/${d.quiz.id}`);
    toast.success("Quiz link copied");
  };

  return (
    <>
      <main className="mx-auto max-w-[1140px] px-6 py-8">
        <AnalyticsHeader
          quiz={d.quiz}
          exporting={exporting}
          onExport={exportPdf}
          onShare={handleShare}
        />

        <MetricCards metrics={d.metrics} />

        <Charts
          participation={d.participation}
          scoreDistribution={d.scoreDistribution}
          passRate={passRate}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Leaderboard leaderboard={d.leaderboard} totalPoints={d.quiz.totalPoints || 1} />

          <div className="flex flex-col gap-6">
            <HardestQuestions questions={d.questions} />
            <AiInsights summary={d.summary} onGenerate={() => navigate("/quiz/create")} />
          </div>
        </div>
      </main>

      <AnalyticsFooter />

      {/* Off-screen report used as the html2canvas source. Kept in the DOM so it
          actually paints, positioned off-screen and out of the accessibility tree. */}
      <div
        aria-hidden
        style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}
      >
        <AnalyticsReport ref={reportRef} data={reportData} />
      </div>

      {exported && (
        <ExportSuccessModal exported={exported} quizTitle={d.quiz.title} onDismiss={dismiss} />
      )}
    </>
  );
}
