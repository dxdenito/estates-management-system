import { useState } from "react";
import { completeTask } from "../../api/artisan";
import { getErrorMessage } from "../../api/errors";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/ui/styles";

export default function CompletionForm({ request, onSubmitted }) {
  const [description, setDescription] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const reports = request.completion_reports;
  const lastReport = reports[reports.length - 1];
  const fixes = request.needs_rework ? lastReport?.review?.suggested_fixes : null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!description.trim()) {
      setError("Describe the work you did.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = await completeTask(request.id, {
        description: description.trim(),
        materials_used: materialsUsed.trim() || null,
      });
      onSubmitted(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-5`}>
      <div>
        <h2 className="text-lg font-semibold text-ink">Report completion</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Tell the supervisor what you did. They will check the work and close the job or send it
          back.
        </p>
      </div>

      {fixes && (
        <div className="rounded-control border border-warning-border bg-warning-soft px-4 py-3 text-sm text-warning-ink">
          <p className="font-semibold">Fixes requested by the supervisor</p>
          <p className="mt-1">{fixes}</p>
        </div>
      )}

      <label className="block">
        <span className={labelClass}>What did you do?</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          required
          className={`${inputClass} mt-1`}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Materials used (optional)</span>
        <textarea
          value={materialsUsed}
          onChange={(event) => setMaterialsUsed(event.target.value)}
          rows={3}
          placeholder="For example: 2 x 20A breakers, 5 m of cable"
          className={`${inputClass} mt-1`}
        />
      </label>

      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}

      <button type="submit" disabled={saving} className={primaryButtonClass}>
        {saving ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}