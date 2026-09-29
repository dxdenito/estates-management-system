import { useState } from "react";
import LocationPicker from "./LocationPicker";
import { submitRequest } from "../../api/requests";
import { errorClass, inputClass, labelClass, primaryButtonClass } from "../../components/ui/styles";

const EMPTY_FIELDS = {
  pf_number: "",
  name: "",
  email: "",
  phone_extension: "",
  description: "",
};

const extractMessage = (err) => {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) return detail[0].msg;
  return "Something went wrong. Please try again.";
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function RequestForm({ onSubmitted }) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [locationId, setLocationId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!locationId) {
      setError("Select the location of the problem.");
      return;
    }

    const payload = {
      pf_number: fields.pf_number.trim(),
      name: fields.name.trim(),
      email: fields.email.trim(),
      phone_extension: fields.phone_extension.trim(),
      description: fields.description.trim(),
      location_id: locationId,
    };

    setSubmitting(true);
    setError(null);

    try {
      await submitRequest(payload);
      onSubmitted(payload.email);
    } catch (err) {
      setError(extractMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="PF number">
          <input
            name="pf_number"
            value={fields.pf_number}
            onChange={handleChange}
            placeholder="e.g. 12345"
            required
            className={inputClass}
          />
        </Field>

        <Field label="Phone or extension">
          <input
            name="phone_extension"
            value={fields.phone_extension}
            onChange={handleChange}
            placeholder="Extension or mobile number"
            required
            className={inputClass}
          />
        </Field>

        <Field label="Full name">
          <input
            name="name"
            value={fields.name}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Institutional email">
          <input
            type="email"
            name="email"
            value={fields.email}
            onChange={handleChange}
            placeholder="name@institution.ac.ke"
            required
            className={inputClass}
          />
        </Field>
      </div>

      <div>
        <span className={labelClass}>Location of the problem</span>
        <div className="mt-1">
          <LocationPicker onChange={setLocationId} />
        </div>
      </div>

      <Field label="What needs fixing?">
        <textarea
          name="description"
          value={fields.description}
          onChange={handleChange}
          rows={5}
          placeholder="Describe the problem and anything that helps us find it"
          required
          className={inputClass}
        />
      </Field>

      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
        {submitting ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}