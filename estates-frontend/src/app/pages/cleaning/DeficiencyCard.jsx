import { useState } from "react";
import { sendBackDeficiency, verifyDeficiency } from "../../api/cleaning";
import { getErrorMessage } from "../../api/errors";
import { formatDateTime } from "../../utils/dates";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";
import DeficiencyChip from "./DeficiencyChip";
import { deficiencyState } from "./cleaningStatus";

export default function DeficiencyCard({ deficiency, onUpdated }) {
  const state = deficiencyState(deficiency);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const run = async (action) => {
    setSaving(true);
    setError(null);

    try {
      onUpdated(await action());
      setRejecting(false);
      setNote("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSendBack = (event) => {
    event.preventDefault();

    if (!note.trim()) {
      setError("Say what is still wrong.");
      return;
    }

    run(() => sendBackDeficiency(deficiency.id, note.trim()));
  };

  return (
    <article className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium text-ink">{deficiency.description}</p>
        <DeficiencyChip deficiency={deficiency} />
      </div>

      {deficiency.corrective_actions.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">The contractor has not reported any action yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {deficiency.corrective_actions.map((action) => (
            <li
              key={action.id}
              className="rounded-control border border-line bg-surface-muted p-3 text-sm"
            >
              <p className="text-ink">{action.action_taken}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {action.status === "completed"
                  ? `Completed ${formatDateTime(action.resolved_at)}`
                  : "Pending"}
              </p>
              {action.review_note && (
                <p className="mt-2 text-xs text-warning-ink">
                  <span className="font-medium">You sent this back: </span>
                  {action.review_note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className={`${errorClass} mt-4`}>
          {error}
        </p>
      )}

      {state.key === "to_verify" && !rejecting && (
        <div className="mt-5 border-t border-line pt-5">
          <p className="text-sm text-ink-muted">
            The contractor reports this is fixed. Check it on site, then close it or send it back.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => run(() => verifyDeficiency(deficiency.id))}
              className={primaryButtonClass}
            >
              {saving ? "Saving..." : "Verify and close"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setRejecting(true)}
              className={secondaryButtonClass}
            >
              Not fixed
            </button>
          </div>
        </div>
      )}

      {state.key === "to_verify" && rejecting && (
        <form onSubmit={handleSendBack} className="mt-5 space-y-4 border-t border-line pt-5">
          <label className="block">
            <span className={labelClass}>What is still wrong?</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              required
              placeholder="The contractor will see this when the action goes back to them."
              className={`${inputClass} mt-1`}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? "Saving..." : "Send back to contractor"}
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
    </article>
  );
}