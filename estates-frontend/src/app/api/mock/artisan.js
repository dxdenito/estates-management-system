import { ROLES, withAdmin } from "../../routing/roles";
import { demoUsers } from "./data";
import {
  currentUser,
  readRequests,
  writeRequests,
  locationPath,
  categoryName,
  requireRoles,
} from "./store";

const ARTISAN_ROLES = withAdmin(ROLES.ARTISAN);

const isAdmin = (user) => user.roles.includes(ROLES.SUPER_ADMIN);

const isAssignedTo = (request, user) => request.assignment?.artisan_id === user.id;

const needsRework = (request) => {
  const reports = request.completion_reports ?? [];
  const last = reports[reports.length - 1];
  return request.status === "in_progress" && last?.review?.outcome === "rejected";
};

const isActive = (request) =>
  request.status === "assigned_to_artisan" || request.status === "in_progress";

const FILTERS = {
  active: isActive,
  review: (request) => request.status === "completed",
  done: (request) => request.status === "closed",
};

export const artisanCounts = (user) => {
  const mine = user ? readRequests().filter((request) => isAssignedTo(request, user)) : [];

  return {
    artisan_assigned: mine.filter(isActive).length,
    artisan_rework: mine.filter(needsRework).length,
  };
};

const userName = (id) => demoUsers.find((user) => user.id === id)?.name ?? null;

const toListItem = (request) => ({
  id: request.id,
  tracking_number: request.tracking_number,
  description: request.description,
  location_path: locationPath(request.location_id),
  category_name: categoryName(request.category_id),
  status: request.status,
  needs_rework: needsRework(request),
  since: request.updated_at ?? request.assignment?.assigned_at,
});

const toDetail = (request) => ({
  id: request.id,
  tracking_number: request.tracking_number,
  status: request.status,
  needs_rework: needsRework(request),
  description: request.description,
  location_path: locationPath(request.location_id),
  category_name: categoryName(request.category_id),
  created_at: request.created_at,
  requester: { name: request.name, phone_extension: request.phone_extension },
  supervisor: request.supervisor_id ? { name: userName(request.supervisor_id) } : null,
  assessment: request.assessment
    ? {
        materials_available: request.assessment.materials_available,
        work_required: request.assessment.work_required,
        notes: request.assessment.notes,
      }
    : null,
  requisition: request.requisition
    ? { status: request.requisition.status, procurement_ref: request.requisition.procurement_ref }
    : null,
  assignment: request.assignment ?? null,
  completion_reports: request.completion_reports ?? [],
});

const idFromUrl = (url, fromEnd = 1) => Number(url.split("/").slice(-fromEnd)[0]);

const loadOwned = (config, fromEnd) => {
  const denied = requireRoles(ARTISAN_ROLES);
  if (denied) return { denied };

  const user = currentUser();
  const requests = readRequests();
  const request = requests.find((r) => r.id === idFromUrl(config.url, fromEnd));
  const allowed = request && (isAssignedTo(request, user) || isAdmin(user));

  return allowed
    ? { requests, request }
    : { denied: [404, { detail: "Task not found." }] };
};

export function registerArtisanMocks(mock) {
  mock.onGet("/artisan/tasks").reply((config) => {
    const denied = requireRoles(ARTISAN_ROLES);
    if (denied) return denied;

    const user = currentUser();
    const scope = FILTERS[config.params?.scope] ? config.params.scope : "active";

    const items = readRequests()
      .filter((request) => isAssignedTo(request, user) && FILTERS[scope](request))
      .map(toListItem)
      .sort((a, b) => new Date(a.since) - new Date(b.since));

    return [200, items];
  });

  mock.onGet(/\/artisan\/tasks\/\d+$/).reply((config) => {
    const ctx = loadOwned(config, 1);
    if (ctx.denied) return ctx.denied;

    return [200, toDetail(ctx.request)];
  });

  mock.onPost(/\/artisan\/tasks\/\d+\/start$/).reply((config) => {
    const ctx = loadOwned(config, 2);
    if (ctx.denied) return ctx.denied;

    if (ctx.request.status !== "assigned_to_artisan") {
      return [409, { detail: "This job has already been started." }];
    }

    ctx.request.status = "in_progress";
    ctx.request.updated_at = new Date().toISOString();
    writeRequests(ctx.requests);

    return [200, toDetail(ctx.request)];
  });

  mock.onPost(/\/artisan\/tasks\/\d+\/complete$/).reply((config) => {
    const ctx = loadOwned(config, 2);
    if (ctx.denied) return ctx.denied;

    const { description, materials_used } = JSON.parse(config.data);

    if (!description || !description.trim()) {
      return [422, { detail: "Describe the work you did." }];
    }

    if (ctx.request.status !== "in_progress") {
      return [409, { detail: "This job is not in progress." }];
    }

    const now = new Date().toISOString();
    const reports = ctx.request.completion_reports ?? [];

    ctx.request.completion_reports = [
      ...reports,
      {
        id: reports.length + 1,
        description: description.trim(),
        materials_used: materials_used?.trim() || null,
        completed_at: now,
        review: null,
      },
    ];
    ctx.request.status = "completed";
    ctx.request.updated_at = now;
    writeRequests(ctx.requests);

    return [200, toDetail(ctx.request)];
  });
}