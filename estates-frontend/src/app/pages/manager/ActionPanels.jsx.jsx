import { useEffect, useState } from "react";
import {
  approveRequisition,
  assignArtisan,
  fetchArtisans,
  fetchSupervisors,
  reassignRequest,
  releaseRequest,
} from "../../api/manager";
import { getErrorMessage } from "../../api/errors";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/styles";

const useAction = (onDone) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const run = async (action) => {
    setSaving(true);
    setError(null);

    try {
      onDone(await action());
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return { saving, error, setError, run };
};

export function ApprovalPanel({ request, onDone }) {
  const { saving, error, run } = useAction(onDone);

  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-ink">Approve requisition</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Check the work required below, including the materials listed, then approve. The supervisor
        will submit it to procurement.
      </p>

      {error && (
        <p role="alert" className={`${errorClass} mt-4`}>
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={() => run(() => approveRequisition(request.id))}
        className={`${primaryButtonClass} mt-5`}
      >
        {saving ? "Approving..." : "Approve requisition"}
      </button>
    </section>
  );
}

export function AssignPanel({ request, onDone }) {
  const { saving, error, setError, run } = useAction(onDone);
  const [artisans, setArtisans] = useState(null);
  const [artisanId, setArtisanId] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchArtisans()
      .then((data) => {
        if (!cancelled) setArtisans(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load artisans:", err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [setError]);

  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-ink">Assign an artisan</h2>
      <p className="mt-1 text-sm text-ink-muted">
        The artisan will see this job in their task list.
      </p>

      <label className="mt-4 block">
        <span className={labelClass}>Artisan</span>
        <select
          value={artisanId}
          onChange={(event) => setArtisanId(event.target.value)}
          disabled={artisans === null || saving}
          className={`${inputClass} mt-1`}
        >
          <option value="">{artisans === null ? "Loading..." : "Select an artisan"}</option>
          {(artisans ?? []).map((artisan) => (
            <option key={artisan.id} value={artisan.id}>
              {artisan.name}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p role="alert" className={`${errorClass} mt-4`}>
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!artisanId || saving}
        onClick={() => run(() => assignArtisan(request.id, Number(artisanId)))}
        className={`${primaryButtonClass} mt-5`}
      >
        {saving ? "Assigning..." : "Assign artisan"}
      </button>
    </section>
  );
}

export function ClaimPanel({ request, onDone }) {
  const { saving, error, setError, run } = useAction(onDone);
  const [supervisors, setSupervisors] = useState(null);
  const [supervisorId, setSupervisorId] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchSupervisors(request.category_id)
      .then((data) => {
        if (!cancelled) setSupervisors(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load supervisors:", err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [request.category_id, setError]);

  const others = (supervisors ?? []).filter((supervisor) => supervisor.id !== request.supervisor?.id);

  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-ink">
        Claimed by {request.supervisor?.name ?? "a supervisor"}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Use this when a request was claimed by mistake or the supervisor is unavailable. Only
        requests that have not been assessed can be moved.
      </p>

      {error && (
        <p role="alert" className={`${errorClass} mt-4`}>
          {error}
        </p>
      )}

      <div className="mt-5 space-y-5">
        <div>
          <label className="block">
            <span className={labelClass}>Reassign to another supervisor</span>
            <select
              value={supervisorId}
              onChange={(event) => setSupervisorId(event.target.value)}
              disabled={supervisors === null || saving}
              className={`${inputClass} mt-1`}
            >
              <option value="">
                {supervisors === null
                  ? "Loading..."
                  : others.length === 0
                    ? "No other supervisor covers this category"
                    : "Select a supervisor"}
              </option>
              {others.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.id}>
                  {supervisor.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!supervisorId || saving}
            onClick={() => run(() => reassignRequest(request.id, Number(supervisorId)))}
            className={`${primaryButtonClass} mt-3`}
          >
            Reassign
          </button>
        </div>

        <div className="border-t border-line pt-5">
          <p className="text-sm text-ink-muted">
            Or put it back in the pool so any supervisor covering this category can claim it.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => run(() => releaseRequest(request.id))}
            className={`${secondaryButtonClass} mt-3`}
          >
            Release to queue
          </button>
        </div>
      </div>
    </section>
  );
}