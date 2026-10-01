export const MANAGER_STATUS = {
  received: { label: "Unclaimed", tone: "waiting" },
  assigned_to_supervisor: { label: "With supervisor", tone: "waiting" },
  awaiting_materials: { label: "Approval needed", tone: "action" },
  approved: { label: "Materials on order", tone: "waiting" },
  assessed: { label: "Ready to assign", tone: "action" },
  materials_issued: { label: "Ready to assign", tone: "action" },
  assigned_to_artisan: { label: "Assigned", tone: "info" },
  in_progress: { label: "In progress", tone: "info" },
  completed: { label: "Awaiting review", tone: "waiting" },
  closed: { label: "Closed", tone: "waiting" },
};

const artisanName = (request) => request.assignment?.artisan_name ?? "an artisan";

const HINTS = {
  received: () => "No supervisor has claimed this request yet.",
  assigned_to_supervisor: (request) =>
    `${request.supervisor?.name ?? "A supervisor"} claimed this request and has not assessed it yet.`,
  awaiting_materials: () => "The supervisor needs materials. Review the requisition and approve it.",
  approved: () => "The requisition is approved. The supervisor is arranging procurement.",
  assessed: () => "Materials are available. Assign an artisan.",
  materials_issued: () => "Materials have been issued. Assign an artisan.",
  assigned_to_artisan: (request) => `Assigned to ${artisanName(request)}. Work has not started.`,
  in_progress: (request) => `${artisanName(request)} is carrying out the work.`,
  completed: () => "Waiting for the supervisor to review the completed work.",
  closed: () => "This request is closed.",
};

export const managerHint = (request) => HINTS[request.status]?.(request) ?? "";