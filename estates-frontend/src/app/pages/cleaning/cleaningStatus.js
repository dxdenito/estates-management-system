export const STATE_TONE_CLASS = {
  action: "bg-warning-soft text-warning-ink",
  waiting: "border border-line bg-surface-muted text-ink-muted",
  info: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success",
};

export const deficiencyState = (deficiency) => {
  if (deficiency.status === "resolved") {
    return { key: "resolved", label: "Resolved", tone: "success" };
  }

  const actions = deficiency.corrective_actions;
  const last = actions[actions.length - 1];

  if (!last) return { key: "open", label: "Awaiting contractor", tone: "waiting" };
  if (last.status === "completed") return { key: "to_verify", label: "Ready to verify", tone: "action" };

  return { key: "pending", label: "Contractor working", tone: "info" };
};