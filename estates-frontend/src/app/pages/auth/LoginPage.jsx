import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/ui/styles";

const DEMO_MODE = import.meta.env.VITE_USE_MOCKS === "true";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return null;

  if (user) {
    const destination = location.state?.from?.pathname ?? "/dashboard";
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Incorrect email or password."
          : "Could not sign in. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className={cardClass}>
        <h1 className="text-xl font-semibold text-ink">Staff sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">
          For Estates staff, contractors and ICT. Requesters do not need an account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              className={`${inputClass} mt-1`}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
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
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 border-t border-line pt-4 text-center text-sm text-ink-muted">
          Need something fixed?{" "}
          <Link to="/request" className="font-medium text-primary hover:underline">
            Report an issue
          </Link>
        </p>
      </div>

      {DEMO_MODE && (
        <div className="mt-4 rounded-control border border-amber-200 bg-warning-soft p-4 text-sm text-warning-ink">
          <p className="font-semibold">Demo mode</p>
          <p className="mt-1">
            Password for every account: <span className="font-mono">demo123</span>
          </p>
          <p className="mt-1 font-mono text-xs leading-relaxed">
            officer@estates.test, field@estates.test, cleaning@estates.test,
            manager@estates.test, artisan@estates.test, contractor@estates.test,
            admin@estates.test, multi@estates.test
          </p>
        </div>
      )}
    </div>
  );
}