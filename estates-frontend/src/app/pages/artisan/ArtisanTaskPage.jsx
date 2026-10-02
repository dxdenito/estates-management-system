import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchTask, startTask } from "../../api/artisan";
import { getErrorMessage } from "../../api/errors";
import { formatDateTime } from "../../utils/dates";
import Detail from "../../components/ui/Detail";
import {
  cardClass,
  errorClass,
  primaryButtonClass,
} from "../../components/ui/styles";
import ArtisanStatusChip from "./ArtisanStatusChip";
import CompletionForm from "./CompletionForm";
import AttemptList from "./AttemptList";
import { resolveArtisanStatus } from "./artisanStatus";

const materialsText = (request) => {
  if (request.requisition?.status === "issued") {
    return `Issued (${request.requisition.procurement_ref})`;
  }
  return request.assessment?.materials_available ? "Available" : "-";
};

export default function ArtisanTaskPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading" });
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchTask(requestId)
      .then((request) => {
        if (!cancelled) setState({ status: "ready", request });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load task:", err);
        setState({ status: err.response?.status === 404 ? "missing" : "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  if (state.status === "loading") {
    return <p className="text-sm text-ink-muted">Loading job...</p>;
  }

  if (state.status === "missing" || state.status === "error") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <h1 className="text-xl font-semibold text-ink">
          {state.status === "missing" ? "Job not found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {state.status === "missing"
            ? "This job does not exist or is not assigned to you."
            : "We could not load this job. Please try again."}
        </p>
        <Link to="/tasks" className={`${primaryButtonClass} mt-6`}>
          Back to my tasks
        </Link>
      </div>
    );
  }

  const { request } = state;
  const info = resolveArtisanStatus(request.status, request.needs_rework);

  const handleStart = async () => {
    setStarting(true);
    setStartError(null);

    try {
      const data = await startTask(requestId);
      setState({ status: "ready", request: data });
    } catch (err) {
      setStartError(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitted = () =>
    navigate("/tasks?tab=review", {
      state: { notice: `${request.tracking_number} was submitted for review.` },
    });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/tasks" className="text-sm font-medium text-accent-strong hover:underline">
        ← Back to my tasks
      </Link>

      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-mono text-lg font-semibold text-ink">{request.tracking_number}</h1>
          <ArtisanStatusChip status={request.status} needsRework={request.needs_rework} />
        </div>

        {info && <p className="mt-2 text-sm text-ink-muted">{info.hint}</p>}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail label="Location" wide>
            {request.location_path}
          </Detail>
          <Detail label="Problem reported" wide>
            {request.description}
          </Detail>
          <Detail label="Category">{request.category_name}</Detail>
          <Detail label="Supervisor">{request.supervisor?.name ?? "-"}</Detail>
          <Detail label="Contact on site">{request.requester.name}</Detail>
          <Detail label="Phone or extension">{request.requester.phone_extension}</Detail>
        </dl>
      </section>

      {request.assessment && (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-ink">Work to do</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label="Work required" wide>
              {request.assessment.work_required}
            </Detail>
            {request.assessment.notes && (
              <Detail label="Notes from the supervisor" wide>
                {request.assessment.notes}
              </Detail>
            )}
            <Detail label="Materials">{materialsText(request)}</Detail>
            <Detail label="Assigned">{formatDateTime(request.assignment?.assigned_at)}</Detail>
          </dl>
        </section>
      )}

      {request.status === "assigned_to_artisan" && (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-ink">Ready to start?</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Starting the job lets the supervisor and manager see that work has begun.
          </p>

          {startError && (
            <p role="alert" className={`${errorClass} mt-4`}>
              {startError}
            </p>
          )}

          <button
            type="button"
            disabled={starting}
            onClick={handleStart}
            className={`${primaryButtonClass} mt-5`}
          >
            {starting ? "Starting..." : "Start job"}
          </button>
        </section>
      )}

      {request.status === "in_progress" && (
        <CompletionForm request={request} onSubmitted={handleSubmitted} />
      )}

      <AttemptList reports={request.completion_reports} />
    </div>
  );
}