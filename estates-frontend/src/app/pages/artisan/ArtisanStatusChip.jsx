import { TONE_CLASS } from "../workbench/workbenchStatus";
import { resolveArtisanStatus } from "./artisanStatus";

export default function ArtisanStatusChip({ status, needsRework }) {
  const info = resolveArtisanStatus(status, needsRework);

  if (!info) return null;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[info.tone]}`}
    >
      {info.label}
    </span>
  );
}