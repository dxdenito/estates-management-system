import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createUser, fetchUser, updateUser } from "../../api/admin";
import { fetchCategories } from "../../api/categories";
import { fetchLocationChildren } from "../../api/locations";
import { getErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../routing/roles";
import { MIN_PASSWORD_LENGTH, generatePassword } from "../../utils/password";
import {
  cardClass,
  choicePillClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";
import UserAccountPanel from "./UserAccountPanel";
import { ROLE_LABELS, ROLE_OPTIONS, STAFF_ROLE_VALUES } from "./roleLabels";

const toggle = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

function PillGroup({ legend, hint, options, selected, onToggle }) {
  return (
    <fieldset>
      <legend className={labelClass}>{legend}</legend>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <label key={option.id} className="cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => onToggle(option.id)}
              className="peer sr-only"
            />
            <span className={choicePillClass}>{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function UserFormPage() {
  const { userId } = useParams();
  const isEdit = Boolean(userId);
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [loadState, setLoadState] = useState({ status: "loading" });
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [account, setAccount] = useState(null);
  const [fields, setFields] = useState({
    name: "",
    email: "",
    department: "",
    temporary_password: "",
  });
  const [roles, setRoles] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [areaIds, setAreaIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState({ status: "loading" });

    Promise.all([
      fetchCategories(),
      fetchLocationChildren(null),
      isEdit ? fetchUser(userId) : Promise.resolve(null),
    ])
      .then(([categoryList, areaList, detail]) => {
        if (cancelled) return;

        setCategories(categoryList);
        setAreas(areaList);

        if (detail) {
          setAccount(detail);
          setFields({
            name: detail.name,
            email: detail.email,
            department: detail.department ?? "",
            temporary_password: "",
          });
          setRoles(detail.roles.filter((role) => STAFF_ROLE_VALUES.includes(role)));
          setCategoryIds(detail.supervisor_category_ids);
          setAreaIds(detail.cleaning_area_ids);
        }

        setLoadState({ status: "ready" });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load the user form:", err);
        setLoadState({ status: err.response?.status === 404 ? "missing" : "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [userId, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  };

  const isSupervisor = roles.includes(ROLES.FIELD_SUPERVISOR);
  const isCleaning = roles.includes(ROLES.CLEANING_SUPERVISOR);
  const isSelf = isEdit && account && me && account.id === me.id;
  const preservedRoles = account
    ? account.roles.filter((role) => !STAFF_ROLE_VALUES.includes(role))
    : [];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fields.name.trim()) return setError("Enter the person's name.");
    if (roles.length === 0) return setError("Choose at least one role.");
    if (isSupervisor && categoryIds.length === 0) {
      return setError("Choose at least one category for a field supervisor.");
    }
    if (isCleaning && areaIds.length === 0) {
      return setError("Choose at least one area for a cleaning supervisor.");
    }
    if (!isEdit && fields.temporary_password.length < MIN_PASSWORD_LENGTH) {
      return setError(`The temporary password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    const shared = {
      name: fields.name.trim(),
      department: fields.department.trim(),
      roles,
      supervisor_category_ids: isSupervisor ? categoryIds : [],
      cleaning_area_ids: isCleaning ? areaIds : [],
    };

    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        await updateUser(userId, shared);
        navigate("/admin/users", { state: { notice: `${shared.name} was updated.` } });
      } else {
        await createUser({
          ...shared,
          email: fields.email.trim(),
          temporary_password: fields.temporary_password,
        });
        navigate("/admin/users", {
          state: {
            notice: `${shared.name} was created. A confirmation email was sent to ${fields.email.trim()}.`,
          },
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loadState.status === "loading") {
    return <p className="text-sm text-ink-muted">Loading...</p>;
  }

  if (loadState.status !== "ready") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <h1 className="text-xl font-semibold text-ink">
          {loadState.status === "missing" ? "User not found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {loadState.status === "missing"
            ? "This user does not exist."
            : "We could not load this page. Please try again."}
        </p>
        <Link to="/admin/users" className={`${primaryButtonClass} mt-6`}>
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/admin/users" className="text-sm font-medium text-accent-strong hover:underline">
        ← Back to users
      </Link>

      <form onSubmit={handleSubmit} className={`${cardClass} space-y-6`}>
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {isEdit ? fields.name || "Edit user" : "New user"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {isEdit
              ? "Update their details, roles and assignments."
              : "They will get an email to confirm their address, then sign in with the temporary password you set."}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Full name</span>
            <input
              name="name"
              value={fields.name}
              onChange={handleChange}
              required
              className={`${inputClass} mt-1`}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              type="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              disabled={isEdit}
              required
              className={`${inputClass} mt-1 disabled:bg-surface-muted disabled:text-ink-muted`}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>Department (optional)</span>
            <input
              name="department"
              value={fields.department}
              onChange={handleChange}
              className={`${inputClass} mt-1`}
            />
          </label>
        </div>

        <fieldset>
          <legend className={labelClass}>Roles</legend>
          <div className="mt-2 space-y-2">
            {ROLE_OPTIONS.map((option) => {
              const lockedAdmin = isSelf && option.value === ROLES.SUPER_ADMIN;

              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-control border border-line p-3 hover:bg-surface-muted"
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(option.value)}
                    disabled={lockedAdmin}
                    onChange={() => setRoles((current) => toggle(current, option.value))}
                    className="mt-1 h-4 w-4 accent-primary-strong"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">{option.label}</span>
                    <span className="block text-xs text-ink-muted">
                      {lockedAdmin ? "You cannot remove your own administrator role." : option.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {preservedRoles.length > 0 && (
            <p className="mt-2 text-xs text-ink-muted">
              Also holds: {preservedRoles.map((role) => ROLE_LABELS[role] ?? role).join(", ")}{" "}
              (managed in the Contractor Portal).
            </p>
          )}
        </fieldset>

        {isSupervisor && (
          <PillGroup
            legend="Categories this supervisor covers"
            hint="They will see requests in these categories in their Available queue."
            options={categories}
            selected={categoryIds}
            onToggle={(id) => setCategoryIds((current) => toggle(current, id))}
          />
        )}

        {isCleaning && (
          <PillGroup
            legend="Areas this supervisor oversees"
            hint="They can log inspections anywhere inside these areas."
            options={areas}
            selected={areaIds}
            onToggle={(id) => setAreaIds((current) => toggle(current, id))}
          />
        )}

        {!isEdit && (
          <label className="block">
            <span className={labelClass}>Temporary password</span>
            <div className="mt-1 flex gap-2">
              <input
                name="temporary_password"
                value={fields.temporary_password}
                onChange={handleChange}
                autoComplete="off"
                required
                className={`${inputClass} font-mono`}
              />
              <button
                type="button"
                onClick={() => setFields((c) => ({ ...c, temporary_password: generatePassword() }))}
                className={secondaryButtonClass}
              >
                Generate
              </button>
            </div>
            <span className="mt-1 block text-xs text-ink-muted">
              At least {MIN_PASSWORD_LENGTH} characters. Share it with them yourself. They must change
              it the first time they sign in.
            </span>
          </label>
        )}

        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create user"}
          </button>
          <Link to="/admin/users" className={secondaryButtonClass}>
            Cancel
          </Link>
        </div>
      </form>

      {isEdit && account && (
        <UserAccountPanel account={account} isSelf={Boolean(isSelf)} onUpdated={setAccount} />
      )}
    </div>
  );
}