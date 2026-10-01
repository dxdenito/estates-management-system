import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchWorkbenchRequest } from "../../api/workbench";
import { formatDateTime } from "../../utils/dates";
import Detail from "../../components/ui/Detail";
import { cardClass, primaryButtonClass } from "../../components/ui/styles";
import StatusChip from "./StatusChip";
import AssessmentForm from "./AssessmentForm";
import ReviewPanel from "./ReviewPanel";
import JobSummary from "./JobSummary";
import RequisitionPanel from "./RequisitionPanel";
import { resolveStatus } from "./workbenchStatus";

export default function WorkbenchDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchWorkbenchRequest(requestId)
      .then((request) => {
        if (!cancelled) setState({ status: "ready", request });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load workbench request:", err);
        setState({ status: err.response?.status === 404 ? "missing" : "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  if (state.status === "loading") {
    return <p className="text-sm text-ink-muted">Loading request...</p>;
  }

  if (state.status === "missing" || state.status === "error") {
    return (
      <div className={`${cardClass} mx-auto max-w-md text-center`}>
        <h1 className="text-xl font-semibold text-ink">
          {state.status === "missing" ? "Request not found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {state.status === "missing"
            ? "This request does not exist or is not assigned to you."
            : "We could not load this request. Please try again."}
        </p>
        <Link to="/workbench" className={`${primaryButtonClass} mt-6`}>
          Back to workbench
        </Link>
      </div>
    );
  }

  const { request } = state;
  const info = resolveStatus(request.status, request.requisition?.status);

  const handleUpdated = (data) => setState({ status: "ready", request: data });

  const handleReviewed = (outcome) => {
    const notice =
      outcome === "approved"
        ? `${request.tracking_number} was approved and closed.`
        : `${request.tracking_number} was sent back to the artisan.`;

    navigate("/workbench?tab=review", { state: { notice } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/workbench?tab=mine" className="text-sm font-medium text-accent-strong hover:underline">
        ← Back to workbench
      </Link>

      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-mono text-lg font-semibold text-ink">{request.tracking_number}</h1>
          <StatusChip status={request.status} requisitionStatus={request.requisition?.status} />
        </div>

        {info && <p className="mt-2 text-sm text-ink-muted">{info.hint}</p>}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail label="Description" wide>
            {request.description}
          </Detail>
          <Detail label="Location">{request.location_path}</Detail>
          <Detail label="Category">{request.category_name}</Detail>
          <Detail label="Reported">{formatDateTime(request.created_at)}</Detail>
        </dl>

        <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <Detail label="Requester">{request.requester.name}</Detail>
          <Detail label="Phone or extension">{request.requester.phone_extension}</Detail>
          <Detail label="Email">
            <a
              href={`mailto:${request.requester.email}`}
              className="text-accent-strong hover:underline"
            >
              {request.requester.email}
            </a>
          </Detail>
          <Detail label="PF number">{request.requester.pf_number}</Detail>
        </dl>
      </section>

      {request.status === "assigned_to_supervisor" && (
        <AssessmentForm requestId={request.id} onSaved={handleUpdated} />
      )}

      {request.status === "completed" && (
        <ReviewPanel request={request} onReviewed={handleReviewed} />
      )}

      {request.status === "approved" && request.requisition && (
        <RequisitionPanel request={request} onUpdated={handleUpdated} />
      )}

      <JobSummary request={request} />
    </div>
  );
}