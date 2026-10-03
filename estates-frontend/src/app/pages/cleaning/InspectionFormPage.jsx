import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createInspection, fetchAreas } from "../../api/cleaning";
import { getErrorMessage } from "../../api/errors";
import LocationPicker from "../requestSubmission/LocationPicker";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";

export default function InspectionFormPage() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [notes, setNotes] = useState("");
  const [deficiencies, setDeficiencies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchAreas()
      .then((data) => {
        if (!cancelled) setAreas(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load areas:", err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateDeficiency = (index, value) =>
    setDeficiencies((current) => current.map((item, i) => (i === index ? value : item)));

  const removeDeficiency = (index) =>
    setDeficiencies((current) => current.filter((_, i) => i !== index));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!locationId) {
      setError("Choose where you inspected.");
      return;
    }

    const found = deficiencies.map((text) => text.trim()).filter(Boolean);

    setSaving(true);
    setError(null);

    try {
      const data = await createInspection({
        location_id: locationId,
        notes: notes.trim() || null,
        deficiencies: found,
      });

      const notice =
        found.length === 0
          ? "Inspection logged. No deficiencies found."
          : `Inspection logged with ${found.length} ${found.length === 1 ? "deficiency" : "deficiencies"}.`;

      navigate(`/cleaning/${data.id}`, { state: { notice } });
    } catch (err) {
      setAreas([]);
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/cleaning" className="text-sm font-medium text-accent-strong hover:underline">
        ← Back to cleaning oversight
      </Link>

      <form onSubmit={handleSubmit} className={`${cardClass} space-y-6`}>
        <div>
          <h1 className="text-xl font-semibold text-ink">Log an inspection</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Record what you checked and any problems you found. The contractor is asked to correct
            each one.
          </p>
        </div>

        <div>
          <span className={labelClass}>Area inspected</span>
          <div className="mt-1">
            {areas === null && <p className="text-sm text-ink-muted">Loading your areas...</p>}
            {areas !== null && areas.length === 0 && (
              <p className="text-sm text-ink-muted">
                No areas are assigned to you yet. Ask an administrator to assign your areas.
              </p>
            )}
            {areas !== null && areas.length > 0 && (
              <LocationPicker onChange={setLocationId} rootIds={areas.map((area) => area.id)} />
            )}
          </div>
        </div>

        <label className="block">
          <span className={labelClass}>Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Overall impression, who you spoke to, anything the contractor should know"
            className={`${inputClass} mt-1`}
          />
        </label>

        <div>
          <span className={labelClass}>Deficiencies found</span>

          {deficiencies.length === 0 && (
            <p className="mt-1 text-sm text-ink-muted">
              None added. Leave it empty if everything was in order.
            </p>
          )}

          <ul className="mt-2 space-y-3">
            {deficiencies.map((text, index) => (
              <li key={index} className="flex items-start gap-2">
                <textarea
                  value={text}
                  onChange={(event) => updateDeficiency(index, event.target.value)}
                  rows={2}
                  aria-label={`Deficiency ${index + 1}`}
                  placeholder="Describe the problem"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeDeficiency(index)}
                  className={secondaryButtonClass}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setDeficiencies((current) => [...current, ""])}
            className={`${secondaryButtonClass} mt-3`}
          >
            Add a deficiency
          </button>
        </div>

        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || areas === null || areas.length === 0}
          className={primaryButtonClass}
        >
          {saving ? "Saving..." : "Save inspection"}
        </button>
      </form>
    </div>
  );
}