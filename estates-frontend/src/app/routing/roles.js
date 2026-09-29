export const ROLES = {
  OFFICER: "estates_officer",
  FIELD_SUPERVISOR: "field_supervisor",
  CLEANING_SUPERVISOR: "cleaning_supervisor",
  MANAGER: "estates_manager",
  ARTISAN: "artisan",
  CONTRACTOR_SUPERVISOR: "contractor_supervisor",
  SUPER_ADMIN: "super_admin",
};

export const withAdmin = (...roles) => [...roles, ROLES.SUPER_ADMIN];