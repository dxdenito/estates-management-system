import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchInspection } from "../../api/cleaning";
import { formatDateTime } from "../../utils/dates";
import Detail from "../../components/ui/Detail";
import { cardClass, primaryButtonClass } from "../../components/ui/styles";
import DeficiencyCard from "./DeficiencyCard";

export default function CleaningInspectionPage() {
  const { inspectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading" });
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location.state, location.pathname, location.search, navigate]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchInspection(inspectionId)
      .then((inspection) => {
        if (!cancelled) setState({ status: "ready", inspection });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load inspection:", err);
        setState({ status: err.response?.status === 404 ? "missing" : "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [inspectionId]);

  if (state.status === "loading") {
    return <p className="text-sm text-ink-muted">Loading inspection...</p>;
  }

  if (state.status === "missing" || state.status === "error") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <h1 className="text-xl font-semibold text-ink">
          {state.status === "missing" ? "Inspection not found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {state.status === "missing"
            ? "This inspection does not exist or is outside your areas."
            : "We could not load this inspection. Please try again."}
        </p>
        <Link to="/cleaning" className={`${primaryButtonClass} mt-6`}>
          Back to cleaning oversight
        </Link>
      </div>
    );
  }

  const { inspection } = state;
  const openCount = inspection.deficiencies.filter((d) => d.status === "open").length;

  const handleUpdated = (data) => setState({ status: "ready", inspection: data });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/cleaning" className="text-sm font-medium text-accent-strong hover:underline">
        ← Back to cleaning oversight
      </Link>

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

      <section className={cardClass}>
        <h1 className="text-xl font-semibold text-ink">{inspection.location_path}</h1>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail label="Inspected">{formatDateTime(inspection.inspected_at)}</Detail>
          <Detail label="Inspector">{inspection.inspector_name}</Detail>
          <Detail label="Responsible contractor">
            {inspection.contractor.name}, {inspection.contractor.company}
          </Detail>
          <Detail label="Contractor phone">{inspection.contractor.phone}</Detail>
          {inspection.notes && (
            <Detail label="Notes" wide>
              {inspection.notes}
            </Detail>
          )}
        </dl>
      </section>

      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-ink">Deficiencies</h2>
        <span className="text-sm text-ink-muted">
          {inspection.deficiencies.length} found, {openCount} open
        </span>
      </div>

      {inspection.deficiencies.length === 0 && (
        <div className={cardClass}>
          <p className="text-sm text-ink-muted">No deficiencies were found in this inspection.</p>
        </div>
      )}

      {inspection.deficiencies.map((deficiency) => (
        <DeficiencyCard key={deficiency.id} deficiency={deficiency} onUpdated={handleUpdated} />
      ))}
    </div>
  );
}