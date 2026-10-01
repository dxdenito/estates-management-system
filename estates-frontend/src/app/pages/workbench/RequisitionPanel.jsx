import { useState } from "react";
import { issueRequisition, submitRequisition } from "../../api/workbench";
import { getErrorMessage } from "../../api/errors";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/ui/styles";

export default function RequisitionPanel({ request, onUpdated }) {
  const { requisition } = request;
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const run = async (action) => {
    setSaving(true);
    setError(null);

    try {
      onUpdated(await action());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!reference.trim()) {
      setError("Enter the procurement reference.");
      return;
    }

    run(() => submitRequisition(request.id, reference.trim()));
  };

  if (requisition.status === "approved") {
    return (
      <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
        <div>
          <h2 className="text-lg font-semibold text-ink">Submit requisition</h2>
          <p className="mt-1 text-sm text-ink-muted">
            The manager approved this requisition. Submit it to procurement and record the
            reference you were given.
          </p>
        </div>

        <label className="block">
          <span className={labelClass}>Procurement reference</span>
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            required
            className={`${inputClass} mt-1 font-mono`}
          />
        </label>

        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Saving..." : "Mark as submitted"}
        </button>
      </form>
    );
  }

  if (requisition.status === "submitted") {
    return (
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-ink">Awaiting materials</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Submitted to procurement as{" "}
          <span className="font-mono text-ink">{requisition.procurement_ref}</span>. Mark it issued
          when the materials arrive, and the manager can then assign an artisan.
        </p>

        {error && (
          <p role="alert" className={`${errorClass} mt-4`}>
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={() => run(() => issueRequisition(request.id))}
          className={`${primaryButtonClass} mt-5`}
        >
          {saving ? "Saving..." : "Materials issued"}
        </button>
      </section>
    );
  }

  return null;
}