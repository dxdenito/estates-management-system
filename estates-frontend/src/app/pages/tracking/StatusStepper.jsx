import { PUBLIC_STEPS } from "./statusMap";

const circleClass = {
  done: "bg-primary text-on-primary",
  current: "border-2 border-accent-strong bg-accent-soft text-accent-strong",
  upcoming: "border border-line-strong bg-surface text-ink-faint",
};

const stepState = (index, currentIndex) => {
  if (index < currentIndex) return "done";
  if (index === currentIndex) {
    return index === PUBLIC_STEPS.length - 1 ? "done" : "current";
  }
  return "upcoming";
};

export default function StatusStepper({ currentIndex }) {
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:gap-2">
      {PUBLIC_STEPS.map((step, index) => {
        const state = stepState(index, currentIndex);

        return (
          <li
            key={step.key}
            aria-current={state === "current" ? "step" : undefined}
            className="flex flex-1 items-center gap-3 sm:flex-col sm:text-center"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${circleClass[state]}`}
            >
              {state === "done" ? "✓" : index + 1}
            </span>
            <span
              className={`text-sm font-medium ${
                state === "upcoming" ? "text-ink-faint" : "text-ink"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}