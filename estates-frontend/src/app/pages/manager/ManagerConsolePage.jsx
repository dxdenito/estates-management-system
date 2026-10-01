import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { fetchManagerQueue } from "../../api/manager";
import { getErrorMessage } from "../../api/errors";
import { timeAgo } from "../../utils/dates";
import { errorClass } from "../../components/ui/styles";
import ManagerStatusChip from "./ManagerStatusChip";

const TABS = [
  {
    key: "approvals",
    label: "Approvals",
    empty: "No requisitions are waiting for approval.",
  },
  {
    key: "assign",
    label: "Ready to assign",
    empty: "Nothing is waiting for an artisan.",
  },
  {
    key: "claimed",
    label: "Claimed jobs",
    empty: "No claimed jobs are waiting for assessment.",
  },
];

export default function ManagerConsolePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const activeTab = TABS.find((tab) => tab.key === searchParams.get("tab")) ?? TABS[0];

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location.state, location.pathname, location.search, navigate]);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);

    fetchManagerQueue(activeTab.key)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load manager queue:", err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab.key]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Manager console</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Approve requisitions, assign artisans, and move requests that were claimed by mistake.
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
        className="inline-flex flex-wrap gap-1 rounded-control border border-line bg-surface p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab.key === tab.key}
            onClick={() => setSearchParams(tab.key === "approvals" ? {} : { tab: tab.key })}
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
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/manager/${item.id}`}
                    className="block px-5 py-4 hover:bg-surface-muted"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-sm font-medium text-ink">
                        {item.tracking_number}
                      </span>
                      <ManagerStatusChip status={item.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink">{item.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <span>{item.location_path}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category_name}</span>
                      {item.supervisor_name && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{item.supervisor_name}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>updated {timeAgo(item.since)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}