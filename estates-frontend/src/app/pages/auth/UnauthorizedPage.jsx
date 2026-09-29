import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHomePath } from "../../routing/roleHome";
import { cardClass, primaryButtonClass } from "../../components/ui/styles";

export default function UnauthorizedPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className={`${cardClass} mx-auto max-w-md text-center`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft text-2xl text-warning-ink">
        !
      </div>
      <h1 className="mt-4 text-xl font-semibold text-ink">Access denied</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Your account does not have permission to view that page.
      </p>
      <Link to={user ? getHomePath(user) : "/login"} className={`${primaryButtonClass} mt-6`}>
        {user ? "Go to my dashboard" : "Sign in"}
      </Link>
    </div>
  );
}