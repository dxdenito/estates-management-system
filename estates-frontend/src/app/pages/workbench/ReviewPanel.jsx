import { useState } from "react";
import { submitReview } from "../../api/workbench";
import { getErrorMessage } from "../../api/errors";
import { formatDateTime } from "../../utils/dates";
import Detail from "../../components/ui/Detail";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";

export default function ReviewPanel({ request, onReviewed }) {
  const [rejecting, setRejecting] = useState(false);
  const [fixes, setFixes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const pendingIndex = request.completion_reports.findLastIndex((report) => !report.review);

  if (pendingIndex === -1) return null;

  const report = request.completion_reports[pendingIndex];

  const send = async (payload) => {
    setSaving(true);
    setError(null);

    try {
      await submitReview(request.id, payload);
      onReviewed(payload.outcome);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const handleReject = (event) => {
    event.preventDefault();

    if (!fixes.trim()) {
      setError("Say what needs to be fixed.");
      return;
    }

    send({ outcome: "rejected", suggested_fixes: fixes.trim() });
  };

  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-ink">Review completed work</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Attempt {pendingIndex + 1}, reported {formatDateTime(report.completed_at)}.
      </p>

      <dl className="mt-4 grid gap-4">
        <Detail label="What the artisan did">{report.description}</Detail>
        <Detail label="Materials used">{report.materials_used ?? "-"}</Detail>
      </dl>

      {error && (
        <p role="alert" className={`${errorClass} mt-4`}>
          {error}
        </p>
      )}

      {!rejecting ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => send({ outcome: "approved" })}
            className={primaryButtonClass}
          >
            {saving ? "Saving..." : "Approve and close"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => setRejecting(true)}
            className={secondaryButtonClass}
          >
            Reject
          </button>
        </div>
      ) : (
        <form onSubmit={handleReject} className="mt-6 space-y-4">
          <label className="block">
            <span className={labelClass}>What needs to be fixed?</span>
            <textarea
              value={fixes}
              onChange={(event) => setFixes(event.target.value)}
              rows={4}
              required
              placeholder="The artisan will see this when the job comes back to them."
              className={`${inputClass} mt-1`}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? "Saving..." : "Send back to artisan"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setRejecting(false);
                setError(null);
              }}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}