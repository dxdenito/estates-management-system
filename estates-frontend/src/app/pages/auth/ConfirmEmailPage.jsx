import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { confirmEmail } from "../../api/auth";
import { cardClass, primaryButtonClass } from "../../components/ui/styles";

const LOADING = { status: "loading" };

export default function ConfirmEmailPage() {
  const { token } = useParams();
  const [state, setState] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState(LOADING);

    confirmEmail(token)
      .then((data) => {
        if (!cancelled) setState({ status: "success", email: data.email });
      })
      .catch((err) => {
        if (cancelled) return;
        const invalid = [404, 410].includes(err.response?.status);
        setState({ status: invalid ? "invalid" : "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [token, attempt]);

  if (state.status === "loading") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-line border-t-primary-strong" />
        <p className="mt-4 text-sm text-ink-muted">Confirming your email address...</p>
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <h1 className="text-xl font-semibold text-ink">Link not valid</h1>
        <p className="mt-2 text-sm text-ink-muted">
          This confirmation link is invalid. Ask your administrator to send a new one.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-muted">We could not confirm your email. Please try again.</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className={`${primaryButtonClass} mt-6`}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`${cardClass} mx-auto max-w-md text-center`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-2xl text-success">
        ✓
      </div>
      <h1 className="mt-4 text-xl font-semibold text-ink">Email confirmed</h1>
      <p className="mt-2 text-sm text-ink-muted">
        {state.email} is confirmed. Sign in with the temporary password your administrator gave you.
        You will be asked to choose your own.
      </p>
      <Link to="/login" className={`${primaryButtonClass} mt-6`}>
        Go to sign in
      </Link>
    </div>
  );
}