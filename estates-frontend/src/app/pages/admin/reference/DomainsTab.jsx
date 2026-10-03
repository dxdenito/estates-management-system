import { useCallback, useEffect, useState } from "react";
import { addDomain, fetchDomains, removeDomain } from "../../../api/reference";
import { getErrorMessage } from "../../../api/errors";
import {
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../../../components/ui/styles";
import Notice from "./Notice";

const dangerButton = "text-sm font-medium text-danger-strong hover:underline disabled:opacity-60";
const linkButton = "text-sm font-medium text-accent-strong hover:underline";

export default function DomainsTab() {
  const [domains, setDomains] = useState(null);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);
  const [value, setValue] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchDomains()
      .then((data) => {
        if (!cancelled) {
          setDomains(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load domains:", err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  const run = async (action, doneMessage) => {
    setBusy(true);
    setActionError(null);
    setMessage(null);

    try {
      await action();
      setMessage(doneMessage);
      setConfirmRemove(null);
      reload();
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    const ok = await run(() => addDomain(value.trim()), `${value.trim()} added.`);
    if (ok) setValue("");
  };

  return (
    <div className="space-y-4">
      <p className="max-w-xl text-sm text-ink-muted">
        Requesters must use an email address on one of these domains to submit a request. Removing a
        domain does not affect requests that were already submitted.
      </p>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <label className="block min-w-64">
          <span className={labelClass}>Add a domain</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="example.ac.ke"
            required
            className={`${inputClass} mt-1`}
          />
        </label>
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          Add domain
        </button>
      </form>

      <Notice message={message} onDismiss={() => setMessage(null)} />

      {actionError && (
        <p role="alert" className={errorClass}>
          {actionError}
        </p>
      )}

      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}

      {!error && (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          {domains === null && <p className="px-5 py-8 text-sm text-ink-muted">Loading...</p>}
          {domains !== null && (
            <ul className="divide-y divide-line">
              {domains.map((item) => (
                <li key={item.domain} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <span className="font-mono text-sm text-ink">@{item.domain}</span>
                  {confirmRemove === item.domain ? (
                    <span className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(() => removeDomain(item.domain), `${item.domain} removed.`)}
                        className={dangerButton}
                      >
                        Confirm remove
                      </button>
                      <button type="button" onClick={() => setConfirmRemove(null)} className={linkButton}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmRemove(item.domain)} className={dangerButton}>
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}