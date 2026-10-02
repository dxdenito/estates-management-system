const ARTISAN_STATUS = {
  assigned_to_artisan: {
    label: "New",
    tone: "action",
    hint: "Read the work required, then start the job.",
  },
  in_progress: {
    label: "In progress",
    tone: "info",
    hint: "Report completion when the work is done.",
  },
  rework: {
    label: "Needs rework",
    tone: "action",
    hint: "The supervisor rejected your last report. Fix the issues and report again.",
  },
  completed: {
    label: "Awaiting review",
    tone: "waiting",
    hint: "Submitted. Waiting for the supervisor to review your work.",
  },
  closed: {
    label: "Closed",
    tone: "waiting",
    hint: "The supervisor approved this job.",
  },
};

export const resolveArtisanStatus = (status, needsRework) =>
  status === "in_progress" && needsRework ? ARTISAN_STATUS.rework : ARTISAN_STATUS[status];