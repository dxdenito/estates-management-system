import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/auth";
import { getErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { MIN_PASSWORD_LENGTH } from "../../utils/password";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../components/ui/styles";

export default function ChangePasswordPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const forced = Boolean(user?.must_change_password);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (next.length < MIN_PASSWORD_LENGTH) {
      setError(`The new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (next !== confirm) {
      setError("The two new passwords do not match.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = await changePassword({ current_password: current, new_password: next });
      setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className={`${cardClass} space-y-5`}>
        <div>
          <h1 className="text-xl font-semibold text-ink">Change password</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {forced
              ? "You are using a temporary password. Choose your own to continue."
              : "Choose a new password for your account."}
          </p>
        </div>

        <label className="block">
          <span className={labelClass}>{forced ? "Temporary password" : "Current password"}</span>
          <input
            type="password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            autoComplete="current-password"
            required
            className={`${inputClass} mt-1`}
          />
        </label>

        <label className="block">
          <span className={labelClass}>New password</span>
          <input
            type="password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            autoComplete="new-password"
            required
            className={`${inputClass} mt-1`}
          />
          <span className="mt-1 block text-xs text-ink-muted">
            At least {MIN_PASSWORD_LENGTH} characters.
          </span>
        </label>

        <label className="block">
          <span className={labelClass}>Confirm new password</span>
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            required
            className={`${inputClass} mt-1`}
          />
        </label>

        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className={`${primaryButtonClass} w-full`}>
          {saving ? "Saving..." : "Change password"}
        </button>
      </form>
    </div>
  );
}