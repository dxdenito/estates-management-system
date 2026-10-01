import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchManagerRequest } from "../../api/manager";
import { formatDateTime } from "../../utils/dates";
import Detail from "../../components/ui/Detail";
import { cardClass, primaryButtonClass } from "../../components/ui/styles";
import JobSummary from "../workbench/JobSummary";
import ManagerStatusChip from "./ManagerStatusChip";
import { ApprovalPanel, AssignPanel, ClaimPanel } from "./ActionPanels.jsx";
import { managerHint } from "./managerStatus";

export default function ManagerRequestPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchManagerRequest(requestId)
      .then((request) => {
        if (!cancelled) setState({ status: "ready", request });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load manager request:", err);
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
            ? "This request does not exist."
            : "We could not load this request. Please try again."}
        </p>
        <Link to="/manager" className={`${primaryButtonClass} mt-6`}>
          Back to console
        </Link>
      </div>
    );
  }

  const { request } = state;

  const pendingApproval =
    request.status === "awaiting_materials" && request.requisition?.status === "pending_approval";
  const readyToAssign = request.status === "assessed" || request.status === "materials_issued";
  const claimed = request.status === "assigned_to_supervisor";

  const finish = (tab, notice) => navigate(`/manager?tab=${tab}`, { state: { notice } });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/manager" className="text-sm font-medium text-accent-strong hover:underline">
        ← Back to console
      </Link>

      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-mono text-lg font-semibold text-ink">{request.tracking_number}</h1>
          <ManagerStatusChip status={request.status} />
        </div>

        <p className="mt-2 text-sm text-ink-muted">{managerHint(request)}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail label="Description" wide>
            {request.description}
          </Detail>
          <Detail label="Location">{request.location_path}</Detail>
          <Detail label="Category">{request.category_name}</Detail>
          <Detail label="Reported">{formatDateTime(request.created_at)}</Detail>
          <Detail label="Supervisor">{request.supervisor?.name ?? "-"}</Detail>
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

      <JobSummary request={request} />

      {pendingApproval && (
        <ApprovalPanel
          request={request}
          onDone={() =>
            finish("approvals", `${request.tracking_number} approved. The supervisor can now submit it to procurement.`)
          }
        />
      )}

      {readyToAssign && (
        <AssignPanel
          request={request}
          onDone={(data) =>
            finish("assign", `${request.tracking_number} assigned to ${data.assignment.artisan_name}.`)
          }
        />
      )}

      {claimed && (
        <ClaimPanel
          request={request}
          onDone={(data) =>
            finish(
              "claimed",
              data.supervisor
                ? `${request.tracking_number} was reassigned to ${data.supervisor.name}.`
                : `${request.tracking_number} was released back to the queue.`
            )
          }
        />
      )}
    </div>
  );
}