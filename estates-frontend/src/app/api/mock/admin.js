import { ROLES } from "../../routing/roles";
import { categories, demoUsers, locations, supervisorCategories } from "./data";
import { cleaningAreas } from "./cleaningData";
import { currentUser, readRequests, requireRoles } from "./store";
import { STAFF_ROLES, persistUsers } from "./users";

const ADMIN_ROLES = [ROLES.SUPER_ADMIN];
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUPERVISOR_OPEN = [
  "assigned_to_supervisor",
  "assessed",
  "awaiting_materials",
  "approved",
  "materials_issued",
  "assigned_to_artisan",
  "in_progress",
  "completed",
];
const ARTISAN_OPEN = ["assigned_to_artisan", "in_progress", "completed"];

export const adminCounts = () => ({
  admin_active_users: demoUsers.filter((user) => user.active !== false).length,
});

const openWork = (user) =>
  readRequests().filter(
    (request) =>
      (request.supervisor_id === user.id && SUPERVISOR_OPEN.includes(request.status)) ||
      (request.assignment?.artisan_id === user.id && ARTISAN_OPEN.includes(request.status))
  ).length;

const toListItem = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  department: user.department ?? null,
  roles: user.roles,
  active: user.active !== false,
  email_confirmed: Boolean(user.email_confirmed),
  must_change_password: Boolean(user.must_change_password),
});

const toDetail = (user) => ({
  ...toListItem(user),
  supervisor_category_ids: supervisorCategories[user.id] ?? [],
  cleaning_area_ids: cleaningAreas[user.id] ?? [],
  open_work: openWork(user),
});

const idFromUrl = (url, fromEnd = 1) => Number(url.split("/").slice(-fromEnd)[0]);

const validateRoles = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0 || !roles.every((r) => STAFF_ROLES.includes(r))) {
    return "Choose at least one role.";
  }
  return null;
};

const validateAssignments = (roles, categoryIds, areaIds) => {
  if (roles.includes(ROLES.FIELD_SUPERVISOR)) {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return "Choose at least one category for a field supervisor.";
    }
    if (!categoryIds.every((id) => categories.some((c) => c.id === id))) {
      return "One of the categories does not exist.";
    }
  }

  if (roles.includes(ROLES.CLEANING_SUPERVISOR)) {
    if (!Array.isArray(areaIds) || areaIds.length === 0) {
      return "Choose at least one area for a cleaning supervisor.";
    }
    const topLevel = locations.filter((l) => l.parent_id === null).map((l) => l.id);
    if (!areaIds.every((id) => topLevel.includes(id))) {
      return "One of the areas does not exist.";
    }
  }

  return null;
};

const applyAssignments = (user, roles, categoryIds, areaIds) => {
  if (roles.includes(ROLES.FIELD_SUPERVISOR)) {
    supervisorCategories[user.id] = [...categoryIds];
  } else {
    delete supervisorCategories[user.id];
  }

  if (roles.includes(ROLES.CLEANING_SUPERVISOR)) {
    cleaningAreas[user.id] = [...areaIds];
  } else {
    delete cleaningAreas[user.id];
  }
};

const findUser = (config, fromEnd) => {
  const denied = requireRoles(ADMIN_ROLES);
  if (denied) return { denied };

  const user = demoUsers.find((u) => u.id === idFromUrl(config.url, fromEnd));

  return user
    ? { user, me: currentUser() }
    : { denied: [404, { detail: "User not found." }] };
};

const logConfirmLink = (user) =>
  console.info(`[mock] email confirmation link: ${window.location.origin}/confirm-email/${user.confirm_token}`);

export function registerAdminMocks(mock) {
  mock.onGet("/admin/users").reply(() => {
    const denied = requireRoles(ADMIN_ROLES);
    if (denied) return denied;

    const items = demoUsers
      .map(toListItem)
      .sort((a, b) => a.name.localeCompare(b.name));

    return [200, items];
  });

  mock.onGet(/\/admin\/users\/\d+$/).reply((config) => {
    const ctx = findUser(config, 1);
    if (ctx.denied) return ctx.denied;

    return [200, toDetail(ctx.user)];
  });

  mock.onPost("/admin/users").reply((config) => {
    const denied = requireRoles(ADMIN_ROLES);
    if (denied) return denied;

    const body = JSON.parse(config.data);
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!name) return [422, { detail: "Enter the person's name." }];
    if (!EMAIL_PATTERN.test(email)) return [422, { detail: "Enter a valid email address." }];

    if (demoUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return [409, { detail: "A user with that email already exists." }];
    }

    const roleError = validateRoles(body.roles);
    if (roleError) return [422, { detail: roleError }];

    if (!body.temporary_password || body.temporary_password.length < MIN_PASSWORD_LENGTH) {
      return [422, { detail: `The temporary password must be at least ${MIN_PASSWORD_LENGTH} characters.` }];
    }

    const assignmentError = validateAssignments(
      body.roles,
      body.supervisor_category_ids,
      body.cleaning_area_ids
    );
    if (assignmentError) return [422, { detail: assignmentError }];

    const user = {
      id: Math.max(0, ...demoUsers.map((u) => u.id)) + 1,
      name,
      email,
      department: String(body.department ?? "").trim() || null,
      roles: [...body.roles],
      password: body.temporary_password,
      active: true,
      email_confirmed: false,
      must_change_password: true,
      confirm_token: crypto.randomUUID(),
    };

    demoUsers.push(user);
    applyAssignments(user, user.roles, body.supervisor_category_ids, body.cleaning_area_ids);
    persistUsers();
    logConfirmLink(user);

    return [201, toDetail(user)];
  });

  mock.onPatch(/\/admin\/users\/\d+$/).reply((config) => {
    const ctx = findUser(config, 1);
    if (ctx.denied) return ctx.denied;

    const body = JSON.parse(config.data);
    const name = String(body.name ?? "").trim();

    if (!name) return [422, { detail: "Enter the person's name." }];

    const roleError = validateRoles(body.roles);
    if (roleError) return [422, { detail: roleError }];

    if (ctx.user.id === ctx.me.id && !body.roles.includes(ROLES.SUPER_ADMIN)) {
      return [422, { detail: "You cannot remove your own administrator role." }];
    }

    const assignmentError = validateAssignments(
      body.roles,
      body.supervisor_category_ids,
      body.cleaning_area_ids
    );
    if (assignmentError) return [422, { detail: assignmentError }];

    const preserved = ctx.user.roles.filter((role) => !STAFF_ROLES.includes(role));

    ctx.user.name = name;
    ctx.user.department = String(body.department ?? "").trim() || null;
    ctx.user.roles = [...body.roles, ...preserved];
    applyAssignments(ctx.user, ctx.user.roles, body.supervisor_category_ids, body.cleaning_area_ids);
    persistUsers();

    return [200, toDetail(ctx.user)];
  });

  mock.onPost(/\/admin\/users\/\d+\/deactivate$/).reply((config) => {
    const ctx = findUser(config, 2);
    if (ctx.denied) return ctx.denied;

    if (ctx.user.id === ctx.me.id) {
      return [422, { detail: "You cannot deactivate your own account." }];
    }

    if (ctx.user.active === false) {
      return [409, { detail: "This account is already deactivated." }];
    }

    ctx.user.active = false;
    persistUsers();

    return [200, toDetail(ctx.user)];
  });

  mock.onPost(/\/admin\/users\/\d+\/activate$/).reply((config) => {
    const ctx = findUser(config, 2);
    if (ctx.denied) return ctx.denied;

    if (ctx.user.active !== false) {
      return [409, { detail: "This account is already active." }];
    }

    ctx.user.active = true;
    persistUsers();

    return [200, toDetail(ctx.user)];
  });

  mock.onPost(/\/admin\/users\/\d+\/reset-password$/).reply((config) => {
    const ctx = findUser(config, 2);
    if (ctx.denied) return ctx.denied;

    const { temporary_password } = JSON.parse(config.data);

    if (ctx.user.id === ctx.me.id) {
      return [422, { detail: "Use Change password for your own account." }];
    }

    if (!temporary_password || temporary_password.length < MIN_PASSWORD_LENGTH) {
      return [422, { detail: `The temporary password must be at least ${MIN_PASSWORD_LENGTH} characters.` }];
    }

    ctx.user.password = temporary_password;
    ctx.user.must_change_password = true;
    persistUsers();

    return [200, toDetail(ctx.user)];
  });

  mock.onPost(/\/admin\/users\/\d+\/resend-confirmation$/).reply((config) => {
    const ctx = findUser(config, 2);
    if (ctx.denied) return ctx.denied;

    if (ctx.user.email_confirmed) {
      return [409, { detail: "This email address is already confirmed." }];
    }

    if (!ctx.user.confirm_token) {
      ctx.user.confirm_token = crypto.randomUUID();
      persistUsers();
    }

    logConfirmLink(ctx.user);

    return [200, toDetail(ctx.user)];
  });
}