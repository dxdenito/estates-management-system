import { useState } from "react";
import {
  activateUser,
  deactivateUser,
  resendConfirmation,
  resetPassword,
} from "../../api/admin";
import { getErrorMessage } from "../../api/errors";
import { MIN_PASSWORD_LENGTH, generatePassword } from "../../utils/password";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";

export default function UserAccountPanel({ account, isSelf, onUpdated }) {
  const [mode, setMode] = useState(null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const run = async (action, doneMessage) => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      onUpdated(await action());
      setMessage(doneMessage);
      setMode(null);
      setPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = () => {
    if (account.open_work > 0) {
      setMode("deactivate");
      return;
    }
    run(() => deactivateUser(account.id), "Account deactivated.");
  };

  const handleReset = (event) => {
    event.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`The temporary password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    run(
      () => resetPassword(account.id, password),
      "Temporary password set. Share it with the user. They must change it when they next sign in."
    );
  };

  return (
    <section className={`${cardClass} space-y-6`}>
      <div>
        <h2 className="text-lg font-semibold text-ink">Account</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {account.active ? "This account is active." : "This account is deactivated and cannot sign in."}{" "}
          {account.email_confirmed ? "Email confirmed." : "Email not confirmed yet."}
        </p>
      </div>

      {message && (
        <p className="rounded-control border border-primary-border bg-success-soft px-3 py-2 text-sm text-success">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}

      {isSelf && (
        <p className="text-sm text-ink-muted">
          This is your own account. To change your password, use Change password in the header.
        </p>
      )}

      {!account.email_confirmed && (
        <div className="border-t border-line pt-5">
          <p className="text-sm text-ink-muted">
            They cannot sign in until they confirm their email address.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => run(() => resendConfirmation(account.id), "Confirmation email sent again.")}
            className={`${secondaryButtonClass} mt-3`}
          >
            Resend confirmation email
          </button>
        </div>
      )}

      {!isSelf && (
        <div className="border-t border-line pt-5">
          {mode === "reset" ? (
            <form onSubmit={handleReset} className="space-y-3">
              <label className="block">
                <span className={labelClass}>New temporary password</span>
                <div className="mt-1 flex gap-2">
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="off"
                    className={`${inputClass} font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setPassword(generatePassword())}
                    className={secondaryButtonClass}
                  >
                    Generate
                  </button>
                </div>
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className={primaryButtonClass}>
                  {saving ? "Saving..." : "Set temporary password"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setMode(null);
                    setError(null);
                  }}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-sm text-ink-muted">
                Locked out? Set a new temporary password. They must change it at next sign-in.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setMode("reset");
                  setMessage(null);
                  setError(null);
                }}
                className={`${secondaryButtonClass} mt-3`}
              >
                Reset password
              </button>
            </div>
          )}
        </div>
      )}

      {!isSelf && (
        <div className="border-t border-line pt-5">
          {account.active && mode === "deactivate" ? (
            <div className="space-y-3">
              <p className="rounded-control border border-warning-border bg-warning-soft px-3 py-2 text-sm text-warning-ink">
                This person still has {account.open_work} open{" "}
                {account.open_work === 1 ? "job" : "jobs"}. Deactivating them does not move that
                work, so reassign it first or it will sit unattended.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => run(() => deactivateUser(account.id), "Account deactivated.")}
                  className={primaryButtonClass}
                >
                  {saving ? "Saving..." : "Deactivate anyway"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setMode(null)}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : account.active ? (
            <div>
              <p className="text-sm text-ink-muted">
                Deactivate rather than delete. Their history stays, and they can no longer sign in.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={handleDeactivate}
                className={`${secondaryButtonClass} mt-3`}
              >
                Deactivate account
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-ink-muted">Reactivating lets them sign in again.</p>
              <button
                type="button"
                disabled={saving}
                onClick={() => run(() => activateUser(account.id), "Account reactivated.")}
                className={`${primaryButtonClass} mt-3`}
              >
                {saving ? "Saving..." : "Reactivate account"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}