import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { trackRequest } from "../../api/requests";
import { getErrorMessage } from "../../api/errors";
import RequestStatus from "./RequestStatus";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/ui/styles";

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("number") ?? "");
  const [email, setEmail] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = { tracking_number: trackingNumber.trim(), email: email.trim() };

    setSubmitting(true);
    setError(null);

    try {
      const data = await trackRequest(payload);
      setCredentials(payload);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCredentials(null);
    setEmail("");
    setError(null);
  };

  if (result) {
    return (
      <RequestStatus
        result={result}
        credentials={credentials}
        onUpdate={setResult}
        onReset={handleReset}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Track a request</h1>
      <p className="mt-2 text-ink-muted">
        Enter your tracking number and the email address you used to submit the request.
      </p>

      <form onSubmit={handleSubmit} className={`${cardClass} mt-6 space-y-5`}>
        <label className="block">
          <span className={labelClass}>Tracking number</span>
          <input
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="REQ-00001"
            autoCapitalize="characters"
            required
            className={`${inputClass} mt-1 font-mono`}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@institution.ac.ke"
            required
            className={`${inputClass} mt-1`}
          />
        </label>

        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
          {submitting ? "Looking up..." : "Track request"}
        </button>
      </form>
    </div>
  );
}