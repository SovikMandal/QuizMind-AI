import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui";

/** "Results" nav target: jumps to the analytics board of your most recent quiz. */
export default function ResultsRedirect() {
  const navigate = useNavigate();
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    api
      .get("/users/me/history")
      .then((r) => {
        const recent = r.data.participated?.[0];
        if (recent?.sessionId) navigate(`/analytics/${recent.sessionId}`, { replace: true });
        else setEmpty(true);
      })
      .catch(() => setEmpty(true));
  }, [navigate]);

  if (empty) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">No results yet</h1>
        <p className="mt-2 text-zinc-600">Take or host a quiz to see its analytics here.</p>
        <Button className="mt-4" onClick={() => navigate("/discover")}>Find a quiz</Button>
      </main>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-4 border-[#2b7fff] border-t-transparent" />
    </div>
  );
}
