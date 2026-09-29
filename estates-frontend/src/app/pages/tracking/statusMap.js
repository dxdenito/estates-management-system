export const PUBLIC_STEPS = [
  {
    key: "received",
    label: "Received",
    description: "Estates has your request and will route it to the right team.",
  },
  {
    key: "assessing",
    label: "Assessing",
    description: "A supervisor is assessing the work and any materials needed.",
  },
  {
    key: "in_progress",
    label: "In progress",
    description: "An artisan is carrying out the repair.",
  },
  {
    key: "completed",
    label: "Completed",
    description: "The work is done.",
  },
];

const STATUS_TO_STEP = {
  submitted: "received",
  confirmed: "received",
  received: "received",
  reopened: "received",
  assigned_to_supervisor: "assessing",
  assessed: "assessing",
  awaiting_materials: "assessing",
  materials_issued: "assessing",
  approved: "assessing",
  assigned_to_artisan: "in_progress",
  in_progress: "in_progress",
  completed: "completed",
  closed: "completed",
};

export const toPublicStep = (status) => STATUS_TO_STEP[status] ?? "received";