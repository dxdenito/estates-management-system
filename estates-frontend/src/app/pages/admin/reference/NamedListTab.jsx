import { useState } from "react";
import {
  createReference,
  deleteReference,
  setReferenceActive,
  updateReference,
} from "../../../api/reference";
import { getErrorMessage } from "../../../api/errors";
import {
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../components/ui/styles";
import { TONE_CLASS } from "../../workbench/workbenchStatus";
import Notice from "./Notice";
import useReferenceList from "./useReferenceList";
import { usageText } from "./referenceUsage";

const linkButton = "text-sm font-medium text-accent-strong hover:underline disabled:opacity-60";
const dangerButton = "text-sm font-medium text-danger-strong hover:underline disabled:opacity-60";

function FieldsForm({ fields, initial, submitLabel, saving, onSubmit, onCancel }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, initial?.[field.key] ?? ""]))
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-control border border-line bg-surface-muted p-3"
    >
      {fields.map((field, index) => (
        <label key={field.key} className="block min-w-48 flex-1">
          <span className={labelClass}>
            {field.label}
            {field.required ? "" : " (optional)"}
          </span>
          <input
            value={values[field.key]}
            onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
            required={field.required}
            autoFocus={index === 0}
            className={`${inputClass} mt-1`}
          />
        </label>
      ))}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Saving..." : submitLabel}
        </button>
        <button type="button" disabled={saving} onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function NamedListTab({ kind, noun, fields, intro }) {
  const { items, error, reload } = useReferenceList(kind);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [message, setMessage] = useState(null);

  const run = async (action, doneMessage) => {
    setBusy(true);
    setActionError(null);
    setMessage(null);

    try {
      await action();
      setMessage(doneMessage);
      setAdding(false);
      setEditingId(null);
      setConfirmDelete(null);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const extraFields = fields.filter((field) => field.key !== "name");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-ink-muted">{intro}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setAdding(true);
            setEditingId(null);
          }}
          className={primaryButtonClass}
        >
          Add {noun}
        </button>
      </div>

      <Notice message={message} onDismiss={() => setMessage(null)} />

      {actionError && (
        <p role="alert" className={errorClass}>
          {actionError}
        </p>
      )}

      {adding && (
        <FieldsForm
          fields={fields}
          submitLabel="Add"
          saving={busy}
          onCancel={() => setAdding(false)}
          onSubmit={(values) => run(() => createReference(kind, values), `${values.name} added.`)}
        />
      )}

      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}

      {!error && (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          {items === null && <p className="px-5 py-8 text-sm text-ink-muted">Loading...</p>}
          {items !== null && items.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">Nothing here yet.</p>
          )}
          {items !== null && items.length > 0 && (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="px-5 py-3">
                  {editingId === item.id ? (
                    <FieldsForm
                      fields={fields}
                      initial={item}
                      submitLabel="Save"
                      saving={busy}
                      onCancel={() => setEditingId(null)}
                      onSubmit={(values) =>
                        run(() => updateReference(kind, item.id, values), `${values.name} updated.`)
                      }
                    />
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className={`text-sm font-medium ${item.active ? "text-ink" : "text-ink-faint"}`}>
                        {item.name}
                      </span>
                      {extraFields.map(
                        (field) =>
                          item[field.key] && (
                            <span key={field.key} className="text-xs text-ink-muted">
                              {field.label}: {item[field.key]}
                            </span>
                          )
                      )}
                      {!item.active && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASS.waiting}`}>
                          Deactivated
                        </span>
                      )}
                      <span className="text-xs text-ink-faint">{usageText(item.usage)}</span>

                      <span className="ml-auto flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setEditingId(item.id);
                            setAdding(false);
                          }}
                          className={linkButton}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => setReferenceActive(kind, item.id, !item.active),
                              item.active ? `${item.name} deactivated.` : `${item.name} reactivated.`
                            )
                          }
                          className={linkButton}
                        >
                          {item.active ? "Deactivate" : "Reactivate"}
                        </button>
                        {item.usage.total === 0 &&
                          (confirmDelete === item.id ? (
                            <span className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  run(() => deleteReference(kind, item.id), `${item.name} deleted.`)
                                }
                                className={dangerButton}
                              >
                                Confirm delete
                              </button>
                              <button type="button" onClick={() => setConfirmDelete(null)} className={linkButton}>
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(item.id)}
                              className={dangerButton}
                            >
                              Delete
                            </button>
                          ))}
                      </span>
                    </div>
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