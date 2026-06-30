import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/stores/auth";
import { trySilentRefresh } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";

/**
 * Landing route for the OAuth flow. The backend has already set the httpOnly
 * refresh cookie and redirected here, so we exchange that cookie for an access
 * token (silent refresh) and load the user, then send them to the dashboard.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const ok = await trySilentRefresh();
      if (cancelled) return;

      if (!ok) {
        navigate("/login?error=oauth_failed", { replace: true });
        return;
      }

      await useAuth.getState().loadSession();
      if (cancelled) return;

      const { user } = useAuth.getState();
      navigate(user ? "/dashboard" : "/login?error=oauth_failed", { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <LoadingScreen />;
}
