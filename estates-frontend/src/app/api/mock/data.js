import { ROLES } from "../../routing/roles";

export const INSTITUTIONAL_DOMAINS = ["jkuat.ac.ke"];
export const DEMO_PASSWORD = "1234";

export const demoUsers = [
  { id: 1, name: "Olivia Officer", email: "officer@estates.test", roles: [ROLES.OFFICER] },
  { id: 2, name: "Felix Field", email: "field@estates.test", roles: [ROLES.FIELD_SUPERVISOR] },
  { id: 3, name: "Clara Cleaning", email: "cleaning@estates.test", roles: [ROLES.CLEANING_SUPERVISOR] },
  { id: 4, name: "Mark Manager", email: "manager@estates.test", roles: [ROLES.MANAGER] },
  { id: 5, name: "Arthur Artisan", email: "artisan@estates.test", roles: [ROLES.ARTISAN] },
  { id: 6, name: "Connie Contractor", email: "contractor@estates.test", roles: [ROLES.CONTRACTOR_SUPERVISOR] },
  { id: 7, name: "Sam Admin", email: "admin@estates.test", roles: [ROLES.SUPER_ADMIN] },
  {
    id: 8,
    name: "Molly Multi",
    email: "multi@estates.test",
    roles: [ROLES.FIELD_SUPERVISOR, ROLES.CLEANING_SUPERVISOR],
  },
  { id: 9, name: "Fiona Field", email: "field2@estates.test", roles: [ROLES.FIELD_SUPERVISOR] },
  { id: 10, name: "Beatrice Banda", email: "artisan2@estates.test", roles: [ROLES.ARTISAN] },
  { id: 11, name: "Charles Cheruiyot", email: "artisan3@estates.test", roles: [ROLES.ARTISAN] },
];

export const artisans = demoUsers
  .filter((user) => user.roles.includes(ROLES.ARTISAN))
  .map(({ id, name }) => ({ id, name }));

export const supervisorCategories = {
  2: [1, 2, 3, 4],
  8: [5, 6, 7, 8],
  9: [1, 2, 5, 6],
};

export const locations = [
  { id: 1, parent_id: null, name: "Main Library", type: "building", level: 0 },
  { id: 2, parent_id: 1, name: "Ground Floor", type: "floor", level: 1 },
  { id: 3, parent_id: 1, name: "First Floor", type: "floor", level: 1 },
  { id: 4, parent_id: 2, name: "Reading Hall", type: "room", level: 2 },
  { id: 5, parent_id: 2, name: "Reference Section", type: "room", level: 2 },
  { id: 6, parent_id: null, name: "Science Complex", type: "building", level: 0 },
  { id: 7, parent_id: 6, name: "Ground Floor", type: "floor", level: 1 },
  { id: 8, parent_id: 6, name: "First Floor", type: "floor", level: 1 },
  { id: 9, parent_id: 7, name: "Lab 1", type: "room", level: 2 },
  { id: 10, parent_id: 7, name: "Lab 2", type: "room", level: 2 },
  { id: 11, parent_id: null, name: "Administration Block", type: "building", level: 0 },
  { id: 12, parent_id: 11, name: "Ground Floor", type: "floor", level: 1 },
  { id: 13, parent_id: 11, name: "First Floor", type: "floor", level: 1 },
  { id: 14, parent_id: null, name: "Main Gate Road", type: "road", level: 0 },
  { id: 15, parent_id: null, name: "Central Park", type: "park", level: 0 },
  { id: 16, parent_id: null, name: "Student Hostels", type: "compound", level: 0 },
  { id: 17, parent_id: 16, name: "Block A", type: "building", level: 1 },
  { id: 18, parent_id: 16, name: "Block B", type: "building", level: 1 },
];

export const categories = [
  { id: 1, name: "Electrical" },
  { id: 2, name: "Plumbing" },
  { id: 3, name: "Masonry" },
  { id: 4, name: "Carpentry" },
  { id: 5, name: "Painting" },
  { id: 6, name: "Roofing" },
  { id: 7, name: "Glazing" },
  { id: 8, name: "Locks and Security" },
];