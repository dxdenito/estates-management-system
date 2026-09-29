import { useState } from "react";
import { reopenRequest } from "../../api/requests";
import { getErrorMessage } from "../../api/errors";
import StatusStepper from "./StatusStepper";
import { PUBLIC_STEPS, toPublicStep } from "./statusMap";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

function Detail({ label, children, wide }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{children}</dd>
    </div>
  );
}

export default function RequestStatus({ result, credentials, onUpdate, onReset }) {
  const [showReopen, setShowReopen] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const stepKey = toPublicStep(result.status);
  const currentIndex = PUBLIC_STEPS.findIndex((step) => step.key === stepKey);
  const currentStep = PUBLIC_STEPS[currentIndex];

  const handleReopen = async (event) => {
    event.preventDefault();

    if (!comment.trim()) {
      setError("Tell us why you are reopening this request.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = await reopenRequest({ ...credentials, comment: comment.trim() });
      onUpdate(data);
      setShowReopen(false);
      setComment("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={cardClass}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-xl font-semibold text-ink">Request status</h1>
          <span className="font-mono text-sm text-ink-muted">{result.tracking_number}</span>
        </div>

        <div className="mt-6">
          <StatusStepper currentIndex={currentIndex} />
        </div>

        <p className="mt-6 text-sm text-ink-muted">{currentStep.description}</p>

        {result.last_reopened_at && (
          <p className="mt-4 rounded-control border border-accent-border bg-accent-soft px-3 py-2 text-sm text-accent-strong">
            This request was reopened on {formatDate(result.last_reopened_at)} and is being
            handled again.
          </p>
        )}

        <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <Detail label="Location">{result.location_path}</Detail>
          <Detail label="Reported">{formatDate(result.created_at)}</Detail>
          <Detail label="Description" wide>
            {result.description}
          </Detail>
        </dl>
      </div>

      {result.can_reopen && (
        <div className={cardClass}>
          {!showReopen ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-muted">
                Not happy with the outcome? You can reopen this request.
              </p>
              <button
                type="button"
                onClick={() => setShowReopen(true)}
                className={secondaryButtonClass}
              >
                Reopen request
              </button>
            </div>
          ) : (
            <form onSubmit={handleReopen} className="space-y-4">
              <label className="block">
                <span className={labelClass}>Why are you reopening this request?</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  required
                  className={`${inputClass} mt-1`}
                />
              </label>

              {error && (
                <p role="alert" className={errorClass}>
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={submitting} className={primaryButtonClass}>
                  {submitting ? "Submitting..." : "Reopen request"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReopen(false);
                    setError(null);
                  }}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <button type="button" onClick={onReset} className={secondaryButtonClass}>
        Track another request
      </button>
    </div>
  );
}