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
    label: "Submit requisition",
    tone: "action",
    hint: "The manager approved the requisition. Submit it to procurement and record the reference.",
  },
  approved_submitted: {
    label: "Materials on order",
    tone: "waiting",
    hint: "Submitted to procurement. Mark it issued when the materials arrive.",
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

export const resolveStatus = (status, requisitionStatus) =>
  status === "approved" && requisitionStatus === "submitted"
    ? WORKBENCH_STATUS.approved_submitted
    : WORKBENCH_STATUS[status];

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