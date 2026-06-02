import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Brain,
  LayoutGrid,
  HelpCircle,
  BarChart3,
  Plus,
  Tag,
  ChevronDown,
  Settings,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/stores/auth";
import { Button, cn } from "./ui";
import { NotificationBell } from "./NotificationBell";

const NAV_ITEMS: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { to: "/quiz/create", label: "Create", Icon: Plus },
  { to: "/discover", label: "Quizzes", Icon: HelpCircle },
  { to: "/results", label: "Results", Icon: BarChart3 },
  { to: "/pricing", label: "Pricing", Icon: Tag },
];

function NavLink({ to, label, Icon }: { to: string; label: string; Icon: LucideIcon }) {
  const active = useLocation().pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        active
          ? "border-b-2 border-[#2b7fff] font-semibold text-[#2b7fff]"
          : "text-[#71717b] hover:text-[#2b7fff]"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Auth screens are full-page designs with their own branding.
  if (["/login", "/signup", "/forgot-password"].includes(pathname)) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = (user?.displayName ?? user?.username ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-zinc-200 bg-white px-8">
      <div className="flex flex-1 items-center">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#2b7fff]">
            <Brain className="size-5 text-blue-50" />
          </span>
          <span className="text-lg font-bold tracking-tight">QuizMind AI</span>
        </Link>
      </div>

      {user && (
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>
      )}

      {user ? (
        <div className="flex flex-1 items-center justify-end gap-10">
          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center cursor-pointer gap-2"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700">
                  {initials}
                </span>
              )}
              <div className="leading-tight">
                <p className="text-sm font-semibold">{user.displayName ?? user.username}</p>
                <p className="text-xs capitalize text-[#71717b]">{user.tier} member</p>
              </div>
              <ChevronDown className="size-4 text-[#71717b]" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    <Settings className="size-4" /> Profile Settings
                  </Link>
                  <Link
                    to="/quiz/create"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    <Plus className="size-4" /> Create
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-zinc-50"
                  >
                    <LogOut className="size-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Sign in
          </Button>
          <Button onClick={() => navigate("/signup")}>Get started</Button>
        </div>
      )}
    </header>
  );
}
