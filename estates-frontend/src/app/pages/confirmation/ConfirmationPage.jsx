import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { confirmRequest } from "../../api/requests";
import {
  cardClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";

const LOADING = { status: "loading", trackingNumber: null };

function Panel({ icon, tone, title, children }) {
  return (
    <div className={`${cardClass} mx-auto max-w-md text-center`}>
      <div
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl ${tone}`}
      >
        {icon}
      </div>
      <h1 className="mt-4 text-xl font-semibold text-ink">{title}</h1>
      <div className="mt-2 space-y-4 text-sm text-ink-muted">{children}</div>
    </div>
  );
}

export default function ConfirmationPage() {
  const { token } = useParams();
  const [state, setState] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState(LOADING);

    confirmRequest(token)
      .then((data) => {
        if (!cancelled) {
          setState({ status: "success", trackingNumber: data.tracking_number });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const invalid = [404, 410].includes(err.response?.status);
        setState({ status: invalid ? "invalid" : "error", trackingNumber: null });
      });

    return () => {
      cancelled = true;
    };
  }, [token, attempt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (state.status === "loading") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-line border-t-primary" />
        <p className="mt-4 text-sm text-ink-muted">Confirming your request...</p>
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <Panel icon="!" tone="bg-warning-soft text-warning-ink" title="Link not valid">
        <p>This confirmation link is invalid or has expired.</p>
        <Link to="/request" className={primaryButtonClass}>
          Submit a new request
        </Link>
      </Panel>
    );
  }

  if (state.status === "error") {
    return (
      <Panel icon="!" tone="bg-danger-soft text-danger" title="Something went wrong">
        <p>We could not confirm your request. Please try again.</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className={primaryButtonClass}
        >
          Try again
        </button>
      </Panel>
    );
  }

  return (
    <Panel icon="✓" tone="bg-success-soft text-success" title="Request confirmed">
      <p>Your request has been received by Estates. Keep this number to track it.</p>
      <p className="rounded-control border border-dashed border-primary-border bg-primary-soft px-4 py-3 font-mono text-2xl font-semibold tracking-wider text-primary">
        {state.trackingNumber}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button type="button" onClick={handleCopy} className={secondaryButtonClass}>
          {copied ? "Copied" : "Copy tracking number"}
        </button>
        <Link
          to={`/track?number=${encodeURIComponent(state.trackingNumber)}`}
          className={primaryButtonClass}
        >
          Track this request
        </Link>
      </div>
    </Panel>
  );
}