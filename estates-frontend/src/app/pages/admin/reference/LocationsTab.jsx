import { useMemo, useState } from "react";
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
import { LOCATION_TYPES, formatType, usageText } from "./referenceUsage";

const linkButton = "text-sm font-medium text-accent-strong hover:underline disabled:opacity-60";
const dangerButton = "text-sm font-medium text-danger-strong hover:underline disabled:opacity-60";

function LocationForm({ initial, submitLabel, saving, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "building");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name: name.trim(), type });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-control border border-line bg-surface-muted p-3"
    >
      <label className="block min-w-48 flex-1">
        <span className={labelClass}>Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoFocus
          className={`${inputClass} mt-1`}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Type</span>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className={`${inputClass} mt-1`}
        >
          {LOCATION_TYPES.map((option) => (
            <option key={option} value={option}>
              {formatType(option)}
            </option>
          ))}
        </select>
      </label>
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

export default function LocationsTab() {
  const { items, error, reload } = useReferenceList("locations");
  const [editor, setEditor] = useState(null);
  const [open, setOpen] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { children, byId } = useMemo(() => {
    const kids = new Map();
    const lookup = new Map();

    (items ?? []).forEach((node) => {
      lookup.set(node.id, node);
      const key = node.parent_id ?? "root";
      kids.set(key, [...(kids.get(key) ?? []), node]);
    });

    return { children: kids, byId: lookup };
  }, [items]);

  const term = search.trim().toLowerCase();

  const { visible, forcedOpen } = useMemo(() => {
    if (!term) return { visible: null, forcedOpen: new Set() };

    const show = new Set();
    const expand = new Set();

    (items ?? []).forEach((node) => {
      if (!node.name.toLowerCase().includes(term)) return;

      show.add(node.id);
      let parent = byId.get(node.parent_id);
      while (parent) {
        show.add(parent.id);
        expand.add(parent.id);
        parent = byId.get(parent.parent_id);
      }
    });

    return { visible: show, forcedOpen: expand };
  }, [items, term, byId]);

  const run = async (action, doneMessage) => {
    setBusy(true);
    setActionError(null);
    setMessage(null);

    try {
      await action();
      setMessage(doneMessage);
      setEditor(null);
      setConfirmDelete(null);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleOpen = (id) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNodes = (parentId) =>
    (children.get(parentId ?? "root") ?? [])
      .filter((node) => !visible || visible.has(node.id))
      .map((node) => {
        const kids = children.get(node.id) ?? [];
        const isOpen = open.has(node.id) || forcedOpen.has(node.id);
        const editing = editor?.mode === "edit" && editor.node.id === node.id;
        const adding = editor?.mode === "add" && editor.parent?.id === node.id;
        const unused = node.usage.total === 0;

        return (
          <li key={node.id}>
            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 pr-4 hover:bg-surface-muted"
              style={{ paddingLeft: `${0.75 + node.level * 1.5}rem` }}
            >
              {kids.length > 0 ? (
                <button
                  type="button"
                  onClick={() => toggleOpen(node.id)}
                  aria-label={isOpen ? `Collapse ${node.name}` : `Expand ${node.name}`}
                  aria-expanded={isOpen}
                  className="w-5 text-ink-muted"
                >
                  {isOpen ? "▾" : "▸"}
                </button>
              ) : (
                <span className="w-5" aria-hidden="true" />
              )}

              <span className={`text-sm font-medium ${node.active ? "text-ink" : "text-ink-faint"}`}>
                {node.name}
              </span>
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-strong">
                {formatType(node.type)}
              </span>
              {!node.active && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASS.waiting}`}>
                  Deactivated
                </span>
              )}
              <span className="text-xs text-ink-faint">{usageText(node.usage)}</span>

              <span className="ml-auto flex flex-wrap items-center gap-3">
                {node.active && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditor({ mode: "add", parent: node });
                      setOpen((current) => new Set(current).add(node.id));
                    }}
                    className={linkButton}
                  >
                    Add inside
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditor({ mode: "edit", node })}
                  className={linkButton}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => setReferenceActive("locations", node.id, !node.active),
                      node.active ? `${node.name} deactivated.` : `${node.name} reactivated.`
                    )
                  }
                  className={linkButton}
                >
                  {node.active ? "Deactivate" : "Reactivate"}
                </button>
                {unused &&
                  (confirmDelete === node.id ? (
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(() => deleteReference("locations", node.id), `${node.name} deleted.`)
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
                    <button type="button" onClick={() => setConfirmDelete(node.id)} className={dangerButton}>
                      Delete
                    </button>
                  ))}
              </span>
            </div>

            {editing && (
              <div style={{ paddingLeft: `${2.25 + node.level * 1.5}rem` }} className="py-2 pr-4">
                <LocationForm
                  initial={node}
                  submitLabel="Save"
                  saving={busy}
                  onCancel={() => setEditor(null)}
                  onSubmit={(values) =>
                    run(() => updateReference("locations", node.id, values), `${values.name} updated.`)
                  }
                />
              </div>
            )}

            {adding && (
              <div style={{ paddingLeft: `${2.25 + node.level * 1.5}rem` }} className="py-2 pr-4">
                <LocationForm
                  submitLabel="Add"
                  saving={busy}
                  onCancel={() => setEditor(null)}
                  onSubmit={(values) =>
                    run(
                      () => createReference("locations", { ...values, parent_id: node.id }),
                      `${values.name} added inside ${node.name}.`
                    )
                  }
                />
              </div>
            )}

            {isOpen && kids.length > 0 && <ul>{renderNodes(node.id)}</ul>}
          </li>
        );
      });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search locations"
          aria-label="Search locations"
          className={`${inputClass} max-w-xs`}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditor({ mode: "add", parent: null })}
          className={primaryButtonClass}
        >
          Add top-level location
        </button>
      </div>

      <p className="text-sm text-ink-muted">
        Deactivating a location hides it, and everything inside it, from the request form. Existing
        requests keep their location. Only locations nothing refers to can be deleted.
      </p>

      <Notice message={message} onDismiss={() => setMessage(null)} />

      {actionError && (
        <p role="alert" className={errorClass}>
          {actionError}
        </p>
      )}

      {editor?.mode === "add" && editor.parent === null && (
        <LocationForm
          submitLabel="Add"
          saving={busy}
          onCancel={() => setEditor(null)}
          onSubmit={(values) =>
            run(() => createReference("locations", { ...values, parent_id: null }), `${values.name} added.`)
          }
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
          {items !== null && visible && visible.size === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">No locations match.</p>
          )}
          {items !== null && (!visible || visible.size > 0) && (
            <ul className="divide-y divide-line">{renderNodes(null)}</ul>
          )}
        </div>
      )}
    </div>
  );
}