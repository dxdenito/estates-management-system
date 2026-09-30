import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { fetchTriageQueue } from "../../api/triage";
import { daysSince, timeAgo } from "../../utils/dates";
import { errorClass } from "../../components/ui/styles";
import { getErrorMessage } from "../../api/errors";

const STALE_AFTER_DAYS = 2;

const TABS = [
  { key: "awaiting", label: "Awaiting triage", empty: "Nothing is waiting for triage." },
  {
    key: "unclaimed",
    label: "Triaged, unclaimed",
    empty: "No triaged requests are waiting for a supervisor.",
  },
];

export default function TriageQueuePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const requestedStage = searchParams.get("stage");
  const activeTab = TABS.find((tab) => tab.key === requestedStage) ?? TABS[0];

  useEffect(() => {
    if (location.state?.triaged) {
      setNotice(`${location.state.triaged} has been categorized.`);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location.state, location.pathname, location.search, navigate]);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);

    fetchTriageQueue(activeTab.key)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load triage queue:", err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab.key]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Triage queue</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Set a category so field supervisors can pick requests up.
        </p>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-4 rounded-control border border-primary-border bg-success-soft px-4 py-3 text-sm text-success">
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div
        role="tablist"
        className="inline-flex gap-1 rounded-control border border-line bg-surface p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab.key === tab.key}
            onClick={() => setSearchParams(tab.key === "awaiting" ? {} : { stage: tab.key })}
            className={`rounded-control px-3 py-1.5 text-sm font-medium ${
              activeTab.key === tab.key
                ? "bg-primary-soft text-primary-strong"
                : "text-ink-muted hover:bg-surface-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}

      {!error && (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          {items === null && <p className="px-5 py-8 text-sm text-ink-muted">Loading...</p>}

          {items !== null && items.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">{activeTab.empty}</p>
          )}

          {items !== null && items.length > 0 && (
            <ul className="divide-y divide-line">
              {items.map((item) => {
                const stale = daysSince(item.waiting_since) >= STALE_AFTER_DAYS;

                return (
                  <li key={item.id}>
                    <Link to={`/triage/${item.id}`} className="block px-5 py-4 hover:bg-surface-muted">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-sm font-medium text-ink">
                          {item.tracking_number}
                        </span>
                        <span
                          className={`text-xs ${
                            stale ? "font-semibold text-warning-ink" : "text-ink-faint"
                          }`}
                        >
                          {timeAgo(item.waiting_since)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-ink">{item.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                        <span>{item.location_path}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.requester_name}</span>
                        {item.category_name && (
                          <span className="rounded-full bg-primary-soft px-2 py-0.5 font-medium text-primary-strong">
                            {item.category_name}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}