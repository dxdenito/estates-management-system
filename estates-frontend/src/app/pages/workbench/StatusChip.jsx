import { TONE_CLASS, WORKBENCH_STATUS } from "./workbenchStatus";

export default function StatusChip({ status }) {
  const info = WORKBENCH_STATUS[status];

  if (!info) return null;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[info.tone]}`}
    >
      {info.label}
    </span>
  );
}