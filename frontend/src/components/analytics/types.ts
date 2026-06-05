export interface LbEntry {
  rank: number;
  participantId: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  timeSecs: number;
  status: string;
}

export interface AnalyticsData {
  quiz: {
    id: string;
    title: string;
    subject: string | null;
    totalPoints: number;
    questionCount: number;
    status: string;
    createdAt: string;
  };
  metrics: {
    totalStudents: number;
    avgScorePct: number;
    completionRate: number;
    avgTimeSecs: number;
  };
  questions: { index: number; questionText: string; accuracy: number }[];
  participation: { label: string; attempts: number }[];
  scoreDistribution: { range: string; count: number }[];
  leaderboard: LbEntry[];
  summary: string;
}
