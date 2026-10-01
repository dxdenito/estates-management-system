import { TONE_CLASS } from "../workbench/workbenchStatus";
import { MANAGER_STATUS } from "./managerStatus";

export default function ManagerStatusChip({ status }) {
  const info = MANAGER_STATUS[status];

  if (!info) return null;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[info.tone]}`}
    >
      {info.label}
    </span>
  );
}