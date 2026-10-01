import { TONE_CLASS, resolveStatus } from "./workbenchStatus";

export default function StatusChip({ status, requisitionStatus }) {
  const info = resolveStatus(status, requisitionStatus);

  if (!info) return null;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[info.tone]}`}
    >
      {info.label}
    </span>
  );
}