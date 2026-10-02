import { ROLES } from "../../routing/roles";

export const DASHBOARD_SECTIONS = [
  {
    role: ROLES.OFFICER,
    title: "Triage",
    stats: [{ key: "triage_awaiting", label: "Awaiting triage" }],
    actions: [{ to: "/triage", label: "Open triage queue" }],
  },
  {
    role: ROLES.FIELD_SUPERVISOR,
    title: "Field supervision",
    stats: [
      { key: "workbench_unclaimed", label: "Unclaimed in my categories" },
      { key: "workbench_active", label: "My active jobs" },
      { key: "workbench_reviews", label: "Awaiting my review" },
    ],
    actions: [{ to: "/workbench", label: "Open workbench" }],
  },
  {
    role: ROLES.MANAGER,
    title: "Management",
    stats: [
      { key: "manager_pending_approvals", label: "Pending approvals" },
      { key: "manager_unassigned", label: "Awaiting artisan assignment" },
      { key: "manager_closed_month", label: "Closed this month" },
    ],
    actions: [
      { to: "/manager", label: "Open manager console" },
      { to: "/reports", label: "View reports" },
      { to: "/admin/reference-data", label: "Reference data" },
    ],
  },
  {
    role: ROLES.ARTISAN,
    title: "My work",
    stats: [
      { key: "artisan_assigned", label: "Assigned to me" },
      { key: "artisan_rework", label: "Rejected, needs rework" },
    ],
    actions: [{ to: "/tasks", label: "Open my tasks" }],
  },
    {
    role: ROLES.CLEANING_SUPERVISOR,
    title: "Cleaning oversight",
    stats: [
      { key: "cleaning_to_verify", label: "Ready to verify" },
      { key: "cleaning_open_deficiencies", label: "Open deficiencies" },
      { key: "cleaning_inspections_week", label: "Inspections this week" },
    ],
    actions: [
      { to: "/cleaning", label: "Open cleaning oversight" },
      { to: "/cleaning/new", label: "Log inspection" },
    ],
  },
  {
    role: ROLES.CONTRACTOR_SUPERVISOR,
    title: "Contractor portal",
    stats: [
      { key: "contractor_officers", label: "Officers on roster" },
      { key: "contractor_pending_actions", label: "Pending corrective actions" },
    ],
    actions: [{ to: "/contractor", label: "Open contractor portal" }],
  },
  {
    role: ROLES.SUPER_ADMIN,
    title: "Administration",
    stats: [{ key: "admin_active_users", label: "Active staff users" }],
    actions: [
      { to: "/admin/users", label: "Manage users and roles" },
      { to: "/admin/reference-data", label: "Reference data" },
    ],
  },
];