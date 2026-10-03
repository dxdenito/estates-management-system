import { ROLES } from "../../routing/roles";
import { artisans, demoUsers, supervisorCategories, DEMO_PASSWORD } from "./data";
import { cleaningAreas } from "./cleaningData";

const USERS_KEY = "mock_users";

export const STAFF_ROLES = [
  ROLES.OFFICER,
  ROLES.FIELD_SUPERVISOR,
  ROLES.MANAGER,
  ROLES.ARTISAN,
  ROLES.CLEANING_SUPERVISOR,
  ROLES.SUPER_ADMIN,
];

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: user.roles,
  department: user.department ?? null,
  must_change_password: Boolean(user.must_change_password),
});

const replaceContents = (target, source) => {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, source ?? {});
};

export const refreshArtisans = () => {
  const next = demoUsers
    .filter((user) => user.active !== false && user.roles.includes(ROLES.ARTISAN))
    .map(({ id, name }) => ({ id, name }));

  artisans.splice(0, artisans.length, ...next);
};

export const persistUsers = () => {
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify({ users: demoUsers, supervisorCategories, cleaningAreas })
  );
  refreshArtisans();
};

export const hydrateUsers = () => {
  let stored = null;

  try {
    stored = JSON.parse(localStorage.getItem(USERS_KEY));
  } catch {
    stored = null;
  }

  if (stored?.users) {
    demoUsers.splice(0, demoUsers.length, ...stored.users);
    replaceContents(supervisorCategories, stored.supervisorCategories);
    replaceContents(cleaningAreas, stored.cleaningAreas);
  } else {
    demoUsers.forEach((user) => {
      Object.assign(user, {
        password: DEMO_PASSWORD,
        active: true,
        email_confirmed: true,
        must_change_password: false,
        department: user.department ?? null,
      });
    });
  }

  refreshArtisans();
};