import { formatDateTime } from "../../utils/dates";
import Detail from "../../components/ui/Detail";
import { cardClass } from "../../components/ui/styles";
import { REQUISITION_STATUS_LABEL } from "./workbenchStatus";

export default function JobSummary({ request }) {
  const { assessment, requisition, assignment, completion_reports: reports } = request;
  const hasReviewed = reports.some((report) => report.review);

  if (!assessment && !requisition && !assignment && !hasReviewed) return null;

  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-ink">Job record</h2>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {assessment && (
          <>
            <Detail label="Materials available">{assessment.materials_available ? "Yes" : "No"}</Detail>
            <Detail label="Assessed">{formatDateTime(assessment.created_at)}</Detail>
            <Detail label="Work required" wide>
              {assessment.work_required}
            </Detail>
            {assessment.notes && (
              <Detail label="Notes" wide>
                {assessment.notes}
              </Detail>
            )}
          </>
        )}

        {requisition && (
          <>
            <Detail label="Requisition">
              {REQUISITION_STATUS_LABEL[requisition.status] ?? requisition.status}
            </Detail>
            <Detail label="Procurement reference">{requisition.procurement_ref ?? "-"}</Detail>
          </>
        )}

        {assignment && (
          <>
            <Detail label="Artisan">{assignment.artisan_name}</Detail>
            <Detail label="Assigned">{formatDateTime(assignment.assigned_at)}</Detail>
          </>
        )}
      </dl>

      {hasReviewed && (
        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-sm font-semibold text-ink">Previous attempts</h3>
          <ul className="mt-3 space-y-3">
            {reports.map((report, index) =>
              report.review ? (
                <li
                  key={report.id}
                  className="rounded-control border border-line bg-surface-muted p-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-ink">Attempt {index + 1}</span>
                    <span
                      className={
                        report.review.outcome === "approved" ? "text-success" : "text-danger-strong"
                      }
                    >
                      {report.review.outcome === "approved" ? "Approved" : "Rejected"} on{" "}
                      {formatDateTime(report.review.reviewed_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-ink-muted">{report.description}</p>
                  {report.review.suggested_fixes && (
                    <p className="mt-2 text-ink">
                      <span className="font-medium">Fixes requested: </span>
                      {report.review.suggested_fixes}
                    </p>
                  )}
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}
    </section>
  );
}