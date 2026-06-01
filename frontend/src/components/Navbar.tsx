import { Link, useNavigate, useLocation } from "react-router-dom";
import { Brain, LogOut } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { Button, cn } from "./ui";

function NavLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "text-sm font-medium hover:text-[#2b7fff]",
        active ? "text-[#2b7fff]" : "text-zinc-600"
      )}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Auth screens are full-page designs with their own branding.
  if (["/login", "/signup", "/forgot-password"].includes(pathname)) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-6">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#2b7fff]">
            <Brain className="size-5 text-white" />
          </span>
          <span className="text-lg font-bold">QuizMind AI</span>
        </Link>

        {user ? (
          <>
            <nav className="flex items-center gap-6">
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/discover" label="Quizzes" />
              <NavLink to="/results" label="Results" />
              <NavLink to="/quiz/create" label="Create" />
              <NavLink to="/pricing" label="Pricing" />
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-sm font-medium text-zinc-600 hover:text-[#2b7fff]">
                {user.displayName ?? user.username}
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="size-4" /> Logout
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink to="/pricing" label="Pricing" />
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button onClick={() => navigate("/signup")}>Get started</Button>
          </div>
        )}
      </div>
    </header>
  );
}
