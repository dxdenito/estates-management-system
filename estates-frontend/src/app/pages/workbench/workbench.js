export const WORKBENCH_STATUS = {
  assigned_to_supervisor: {
    label: "Assessment needed",
    tone: "action",
    hint: "Visit the site and record your assessment.",
  },
  assessed: {
    label: "Awaiting assignment",
    tone: "waiting",
    hint: "Materials are available. Waiting for the manager to assign an artisan.",
  },
  awaiting_materials: {
    label: "Requisition pending",
    tone: "waiting",
    hint: "The requisition is waiting for manager approval.",
  },
  approved: {
    label: "Materials on order",
    tone: "waiting",
    hint: "The requisition is approved and procurement is under way.",
  },
  materials_issued: {
    label: "Awaiting assignment",
    tone: "waiting",
    hint: "Materials have been issued. Waiting for the manager to assign an artisan.",
  },
  assigned_to_artisan: {
    label: "Assigned to artisan",
    tone: "info",
    hint: "An artisan has been assigned and has not started yet.",
  },
  in_progress: {
    label: "In progress",
    tone: "info",
    hint: "An artisan is carrying out the work.",
  },
  completed: {
    label: "Review needed",
    tone: "action",
    hint: "The artisan reports the work is done. Review it, then close or reject it.",
  },
  closed: {
    label: "Closed",
    tone: "waiting",
    hint: "This request is closed.",
  },
};

export const REQUISITION_STATUS_LABEL = {
  pending_approval: "Pending manager approval",
  approved: "Approved",
  submitted: "Submitted to procurement",
  issued: "Materials issued",
};

export const TONE_CLASS = {
  action: "bg-warning-soft text-warning-ink",
  waiting: "border border-line bg-surface-muted text-ink-muted",
  info: "bg-accent-soft text-accent-strong",
};