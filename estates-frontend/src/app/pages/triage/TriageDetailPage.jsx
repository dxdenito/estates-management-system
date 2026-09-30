import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchCategories } from "../../api/categories";
import { categorizeRequest, fetchTriageRequest } from "../../api/triage";
import { getErrorMessage } from "../../api/errors";
import { formatDateTime } from "../../utils/dates";
import Detail from "../../components/ui/Detail";
import {
  cardClass,
  errorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";

export default function TriageDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading" });
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    Promise.all([fetchTriageRequest(requestId), fetchCategories()])
      .then(([request, categories]) => {
        if (cancelled) return;
        setState({ status: "ready", request, categories });
        setSelected(request.category_id);
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: err.response?.status === 404 ? "missing" : "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  if (state.status === "loading") {
    return <p className="text-sm text-ink-muted">Loading request...</p>;
  }

  if (state.status === "missing" || state.status === "error") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <h1 className="text-xl font-semibold text-ink">
          {state.status === "missing" ? "Request not found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {state.status === "missing"
            ? "This request does not exist or is not ready for triage."
            : "We could not load this request. Please try again."}
        </p>
        <Link to="/triage" className={`${primaryButtonClass} mt-6`}>
          Back to queue
        </Link>
      </div>
    );
  }

  const { request, categories } = state;
  const editable = request.status === "confirmed" || request.status === "received";
  const unchanged = selected === request.category_id;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      await categorizeRequest(requestId, selected);
      const stage = request.status === "received" ? "unclaimed" : "awaiting";
      navigate(`/triage?stage=${stage}`, { state: { triaged: request.tracking_number } });
    } catch (err) {
      setSaveError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/triage" className="text-sm font-medium text-accent-strong hover:underline">
        ← Back to queue
      </Link>

      <section className={cardClass}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-xl font-semibold text-ink">Triage request</h1>
          <span className="font-mono text-sm text-ink-muted">{request.tracking_number}</span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail label="Description" wide>
            {request.description}
          </Detail>
          <Detail label="Location" wide>
            {request.location_path}
          </Detail>
          <Detail label="Reported">{formatDateTime(request.created_at)}</Detail>
          <Detail label="Confirmed">{formatDateTime(request.confirmed_at)}</Detail>
        </dl>

        <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <Detail label="Requester">{request.requester.name}</Detail>
          <Detail label="PF number">{request.requester.pf_number}</Detail>
          <Detail label="Email">
            <a
              href={`mailto:${request.requester.email}`}
              className="text-accent-strong hover:underline"
            >
              {request.requester.email}
            </a>
          </Detail>
          <Detail label="Phone or extension">{request.requester.phone_extension}</Detail>
        </dl>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-ink">Category</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {editable
            ? "Pick the trade this repair belongs to. Field supervisors covering it will see it in their queue."
            : "A supervisor has picked up this request, so the category can no longer be changed."}
        </p>

        <fieldset disabled={!editable || saving} className="mt-4">
          <legend className="sr-only">Category</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {categories.map((category) => (
              <label key={category.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={selected === category.id}
                  onChange={() => setSelected(category.id)}
                  className="peer sr-only"
                />
                <span className="block rounded-control border border-line-strong bg-surface px-3 py-2 text-center text-sm font-medium text-ink peer-checked:border-primary-strong peer-checked:bg-primary-soft peer-checked:text-primary-strong peer-focus-visible:ring-2 peer-focus-visible:ring-primary-strong/40 peer-disabled:opacity-60">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {saveError && (
          <p role="alert" className={`${errorClass} mt-4`}>
            {saveError}
          </p>
        )}

        {editable && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!selected || unchanged || saving}
              className={primaryButtonClass}
            >
              {saving
                ? "Saving..."
                : request.status === "confirmed"
                  ? "Set category"
                  : "Update category"}
            </button>
            <Link to="/triage" className={secondaryButtonClass}>
              Cancel
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}