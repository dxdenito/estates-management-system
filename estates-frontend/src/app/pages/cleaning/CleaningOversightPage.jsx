import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { fetchDeficiencies, fetchInspections } from "../../api/cleaning";
import { getErrorMessage } from "../../api/errors";
import { formatDate, timeAgo } from "../../utils/dates";
import { errorClass, primaryButtonClass } from "../../components/ui/styles";
import DeficiencyChip from "./DeficiencyChip";

const TABS = [
  {
    key: "verify",
    label: "Ready to verify",
    empty: "No corrective actions are waiting for your verification.",
  },
  {
    key: "open",
    label: "Open",
    empty: "No open deficiencies. Everything has been verified.",
  },
  {
    key: "inspections",
    label: "Inspections",
    empty: "No inspections logged yet.",
  },
];

const load = (tab) =>
  tab === "inspections" ? fetchInspections() : fetchDeficiencies(tab);

function DeficiencyRow({ item }) {
  const last = item.corrective_actions[item.corrective_actions.length - 1];

  return (
    <Link to={`/cleaning/${item.inspection_id}`} className="block px-5 py-4 hover:bg-surface-muted">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink">{item.location_path}</span>
        <DeficiencyChip deficiency={item} />
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-ink">{item.description}</p>
      {last && (
        <p className="mt-2 line-clamp-1 text-xs text-ink-muted">Contractor: {last.action_taken}</p>
      )}
      <p className="mt-1 text-xs text-ink-faint">Inspected {timeAgo(item.inspected_at)}</p>
    </Link>
  );
}

function InspectionRow({ item }) {
  return (
    <Link to={`/cleaning/${item.id}`} className="block px-5 py-4 hover:bg-surface-muted">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink">{item.location_path}</span>
        <span className="text-xs text-ink-faint">{formatDate(item.inspected_at)}</span>
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        {item.inspector_name} · {item.deficiency_count}{" "}
        {item.deficiency_count === 1 ? "deficiency" : "deficiencies"}
        {item.open_count > 0 ? `, ${item.open_count} open` : ""}
      </p>
    </Link>
  );
}

export default function CleaningOversightPage() {
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

    load(activeTab.key)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load cleaning oversight data:", err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab.key]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Cleaning oversight</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Log inspections, follow the contractor&apos;s corrective actions, and verify them before
            closing.
          </p>
        </div>
        <Link to="/cleaning/new" className={primaryButtonClass}>
          Log inspection
        </Link>
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
            onClick={() => setSearchParams(tab.key === "verify" ? {} : { tab: tab.key })}
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
                  {activeTab.key === "inspections" ? (
                    <InspectionRow item={item} />
                  ) : (
                    <DeficiencyRow item={item} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}