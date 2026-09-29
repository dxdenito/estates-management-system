import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicLayout() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen ">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-y-2 px-4 py-4">
          <Link to="/request" className="text-lg font-semibold text-primary">
            Estates Services
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-ink-muted">
            <Link to="/request" className="hover:text-primary">
              Report an issue
            </Link>
            <Link to="/track" className="hover:text-primary">
              Track a request
            </Link>
            <Link
              to={user ? "/dashboard" : "/login"}
              className="rounded-control border border-line-strong px-3 py-1.5 hover:border-primary hover:text-primary"
            >
              {user ? "My dashboard" : "Staff login"}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}