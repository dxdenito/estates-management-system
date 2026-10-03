import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchUsers } from "../../api/admin";
import { getErrorMessage } from "../../api/errors";
import { errorClass, inputClass, primaryButtonClass } from "../../components/ui/styles";
import { TONE_CLASS } from "../workbench/workbenchStatus";
import { ROLE_LABELS } from "./roleLabels";

const statusChips = (user) => {
  if (!user.active) return [{ label: "Deactivated", tone: "waiting" }];

  const chips = [];
  if (!user.email_confirmed) chips.push({ label: "Email not confirmed", tone: "action" });
  if (user.email_confirmed && user.must_change_password) {
    chips.push({ label: "Temporary password", tone: "info" });
  }
  return chips;
};

export default function UserManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location.state, location.pathname, location.search, navigate]);

  useEffect(() => {
    let cancelled = false;

    fetchUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load users:", err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (!users) return [];
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      if (!showDeactivated && !user.active) return false;
      if (!term) return true;
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.department ?? "").toLowerCase().includes(term)
      );
    });
  }, [users, search, showDeactivated]);

  const deactivatedCount = users ? users.filter((user) => !user.active).length : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Users and roles</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Create staff accounts, assign roles, and deactivate people who have left.
          </p>
        </div>
        <Link to="/admin/users/new" className={primaryButtonClass}>
          New user
        </Link>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-4 rounded-control border border-primary-border bg-success-soft px-4 py-3 text-sm text-success">
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email or department"
          aria-label="Search users"
          className={`${inputClass} max-w-sm`}
        />
        {deactivatedCount > 0 && (
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={showDeactivated}
              onChange={(event) => setShowDeactivated(event.target.checked)}
              className="h-4 w-4 accent-primary-strong"
            />
            Show deactivated ({deactivatedCount})
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}

      {!error && (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          {users === null && <p className="px-5 py-8 text-sm text-ink-muted">Loading...</p>}

          {users !== null && visible.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">No users match.</p>
          )}

          {users !== null && visible.length > 0 && (
            <ul className="divide-y divide-line">
              {visible.map((user) => (
                <li key={user.id}>
                  <Link
                    to={`/admin/users/${user.id}`}
                    className="block px-5 py-4 hover:bg-surface-muted"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink">{user.name}</span>
                      <span className="flex flex-wrap gap-1.5">
                        {statusChips(user).map((chip) => (
                          <span
                            key={chip.label}
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[chip.tone]}`}
                          >
                            {chip.label}
                          </span>
                        ))}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {user.email}
                      {user.department ? ` · ${user.department}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-strong"
                        >
                          {ROLE_LABELS[role] ?? role}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}