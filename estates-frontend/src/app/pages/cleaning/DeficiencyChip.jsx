import { STATE_TONE_CLASS, deficiencyState } from "./cleaningStatus";

export default function DeficiencyChip({ deficiency }) {
  const state = deficiencyState(deficiency);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATE_TONE_CLASS[state.tone]}`}
    >
      {state.label}
    </span>
  );
}