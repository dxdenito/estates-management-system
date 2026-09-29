import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchDashboardSummary } from "../../api/dashboard";
import { ROLES } from "../../routing/roles";
import { DASHBOARD_SECTIONS } from "./dashboardConfig";
import { cardClass, errorClass, primaryButtonClass, secondaryButtonClass } from "../../components/ui/styles";

export default function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (location.state?.denied) {
      setDenied(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load dashboard figures.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isAdmin = user.roles?.includes(ROLES.SUPER_ADMIN);
  const sections = DASHBOARD_SECTIONS.filter(
    (section) => isAdmin || user.roles?.includes(section.role)
  );
  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Welcome, {firstName}</h1>
          <p className="mt-1 text-sm text-ink-muted">Here is where things stand today.</p>
        </div>
        <Link to="/request" className={secondaryButtonClass}>
          Report an issue
        </Link>
      </div>

      {denied && (
        <div className="flex items-start justify-between gap-4 rounded-control border border-amber-200 bg-warning-soft px-4 py-3 text-sm text-warning-ink">
          <p>You do not have access to that page. Here is your dashboard instead.</p>
          <button
            type="button"
            onClick={() => setDenied(false)}
            className="font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loadError && (
        <p role="alert" className={errorClass}>
          {loadError}
        </p>
      )}

      {sections.length === 0 && (
        <div className={cardClass}>
          <p className="text-sm text-ink-muted">
            No sections are set up for your account yet. Contact ICT if you expected access to
            something.
          </p>
        </div>
      )}

      {sections.map((section) => (
        <section key={section.role} className={cardClass}>
          <h2 className="text-lg font-semibold text-ink">{section.title}</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.stats.map((stat) => (
              <div key={stat.key} className="rounded-control bg-surface-muted p-4">
                <p className="text-3xl font-semibold text-primary">
                  {summary ? (summary[stat.key] ?? "-") : "..."}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {section.actions.map((action, index) => (
              <Link
                key={action.to}
                to={action.to}
                className={index === 0 ? primaryButtonClass : secondaryButtonClass}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}