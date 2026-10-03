export default function Notice({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="flex items-start justify-between gap-4 rounded-control border border-primary-border bg-success-soft px-4 py-3 text-sm text-success">
      <p>{message}</p>
      <button type="button" onClick={onDismiss} className="font-medium hover:underline">
        Dismiss
      </button>
    </div>
  );
}