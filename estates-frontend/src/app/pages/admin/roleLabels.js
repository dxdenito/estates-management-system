import { ROLES } from "../../routing/roles";

export const ROLE_LABELS = {
  [ROLES.OFFICER]: "Officer",
  [ROLES.FIELD_SUPERVISOR]: "Field supervisor",
  [ROLES.MANAGER]: "Manager",
  [ROLES.ARTISAN]: "Artisan",
  [ROLES.CLEANING_SUPERVISOR]: "Cleaning supervisor",
  [ROLES.SUPER_ADMIN]: "Super admin",
  [ROLES.CONTRACTOR_SUPERVISOR]: "Contractor supervisor",
};

export const ROLE_OPTIONS = [
  { value: ROLES.OFFICER, label: "Officer", hint: "Triages incoming requests." },
  {
    value: ROLES.FIELD_SUPERVISOR,
    label: "Field supervisor",
    hint: "Claims and assesses requests in assigned categories.",
  },
  {
    value: ROLES.MANAGER,
    label: "Manager",
    hint: "Approves requisitions and assigns artisans.",
  },
  { value: ROLES.ARTISAN, label: "Artisan", hint: "Carries out assigned jobs." },
  {
    value: ROLES.CLEANING_SUPERVISOR,
    label: "Cleaning supervisor",
    hint: "Inspects cleaning in assigned areas.",
  },
  {
    value: ROLES.SUPER_ADMIN,
    label: "Super admin",
    hint: "Manages users, roles and reference data.",
  },
];

export const STAFF_ROLE_VALUES = ROLE_OPTIONS.map((option) => option.value);