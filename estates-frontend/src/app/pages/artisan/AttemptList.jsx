import { formatDateTime } from "../../utils/dates";
import { cardClass } from "../../components/ui/styles";

const outcome = (review) => {
  if (!review) return { label: "Awaiting review", className: "text-ink-muted" };
  if (review.outcome === "approved") return { label: "Approved", className: "text-success" };
  return { label: "Rejected", className: "text-danger-strong" };
};

export default function AttemptList({ reports }) {
  if (reports.length === 0) return null;

  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-ink">Your reports</h2>

      <ul className="mt-4 space-y-3">
        {reports.map((report, index) => {
          const result = outcome(report.review);

          return (
            <li
              key={report.id}
              className="rounded-control border border-line bg-surface-muted p-4 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-ink">
                  Attempt {index + 1} · {formatDateTime(report.completed_at)}
                </span>
                <span className={`font-medium ${result.className}`}>{result.label}</span>
              </div>
              <p className="mt-2 text-ink">{report.description}</p>
              <p className="mt-1 text-ink-muted">
                Materials used: {report.materials_used ?? "none recorded"}
              </p>
              {report.review?.suggested_fixes && (
                <p className="mt-2 text-ink">
                  <span className="font-medium">Supervisor asked for: </span>
                  {report.review.suggested_fixes}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}