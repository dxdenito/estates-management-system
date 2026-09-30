import { useState } from "react";
import { submitAssessment } from "../../api/workbench";
import { getErrorMessage } from "../../api/errors";
import {
  cardClass,
  choicePillClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/ui/styles";

const OPTIONS = [
  { value: true, label: "Yes, materials are available" },
  { value: false, label: "No, materials are needed" },
];

export default function AssessmentForm({ requestId, onSaved }) {
  const [materialsAvailable, setMaterialsAvailable] = useState(null);
  const [workRequired, setWorkRequired] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (materialsAvailable === null) {
      setError("Say whether the materials are available.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = await submitAssessment(requestId, {
        materials_available: materialsAvailable,
        work_required: workRequired.trim(),
        notes: notes.trim() || null,
      });
      onSaved(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-5`}>
      <div>
        <h2 className="text-lg font-semibold text-ink">Site assessment</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Record what you found on site and whether you can start straight away.
        </p>
      </div>

      <fieldset disabled={saving}>
        <legend className={labelClass}>Are the materials available?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <label key={option.label} className="cursor-pointer">
              <input
                type="radio"
                name="materials_available"
                checked={materialsAvailable === option.value}
                onChange={() => setMaterialsAvailable(option.value)}
                className="peer sr-only"
              />
              <span className={choicePillClass}>{option.label}</span>
            </label>
          ))}
        </div>

        {materialsAvailable === true && (
          <p className="mt-3 text-sm text-ink-muted">
            The request goes straight to the manager, who will assign an artisan.
          </p>
        )}
        {materialsAvailable === false && (
          <p className="mt-3 text-sm text-ink-muted">
            A requisition will be raised for the manager to approve. List the materials needed
            below.
          </p>
        )}
      </fieldset>

      <label className="block">
        <span className={labelClass}>Work required</span>
        <textarea
          value={workRequired}
          onChange={(event) => setWorkRequired(event.target.value)}
          rows={5}
          required
          placeholder="Describe the job. If materials are needed, list them here."
          className={`${inputClass} mt-1`}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Access details, safety concerns, anything the artisan should know"
          className={`${inputClass} mt-1`}
        />
      </label>

      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}

      <button type="submit" disabled={saving} className={primaryButtonClass}>
        {saving ? "Saving..." : "Save assessment"}
      </button>
    </form>
  );
}