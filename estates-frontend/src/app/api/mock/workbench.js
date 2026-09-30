import { ROLES, withAdmin } from "../../routing/roles";
import { supervisorCategories } from "./data";
import {
  currentUser,
  readRequests,
  writeRequests,
  locationPath,
  categoryName,
  requireRoles,
} from "./store";

const ACTIVE_STATUSES = [
  "assigned_to_supervisor",
  "assessed",
  "awaiting_materials",
  "approved",
  "materials_issued",
  "assigned_to_artisan",
  "in_progress",
];

const SUPERVISOR_ROLES = withAdmin(ROLES.FIELD_SUPERVISOR);

const categoryIdsFor = (user) => supervisorCategories[user.id] ?? [];

const isAdmin = (user) => user.roles.includes(ROLES.SUPER_ADMIN);

const isAvailable = (request, user) =>
  request.status === "received" &&
  !request.supervisor_id &&
  categoryIdsFor(user).includes(request.category_id);

const isMine = (request, user) =>
  request.supervisor_id === user.id && ACTIVE_STATUSES.includes(request.status);

const isForReview = (request, user) =>
  request.supervisor_id === user.id && request.status === "completed";

export const workbenchCounts = (user) => {
  const requests = readRequests();

  return {
    workbench_unclaimed: user ? requests.filter((r) => isAvailable(r, user)).length : 0,
    workbench_active: user ? requests.filter((r) => isMine(r, user)).length : 0,
    workbench_reviews: user ? requests.filter((r) => isForReview(r, user)).length : 0,
  };
};

const toListItem = (request, scope) => ({
  id: request.id,
  tracking_number: request.tracking_number,
  description: request.description,
  location_path: locationPath(request.location_id),
  category_name: categoryName(request.category_id),
  requester_name: request.name,
  status: request.status,
  since: scope === "available" ? request.triaged_at : (request.updated_at ?? request.confirmed_at),
});

const toDetail = (request) => ({
  id: request.id,
  tracking_number: request.tracking_number,
  status: request.status,
  description: request.description,
  location_path: locationPath(request.location_id),
  category_id: request.category_id ?? null,
  category_name: categoryName(request.category_id),
  created_at: request.created_at,
  confirmed_at: request.confirmed_at,
  requester: {
    name: request.name,
    pf_number: request.pf_number,
    email: request.email,
    phone_extension: request.phone_extension,
  },
  assessment: request.assessment ?? null,
  requisition: request.requisition ?? null,
  assignment: request.assignment ?? null,
  completion_reports: request.completion_reports ?? [],
});

const idFromUrl = (url, fromEnd = 1) => Number(url.split("/").slice(-fromEnd)[0]);

const loadOwned = (config, fromEnd) => {
  const denied = requireRoles(SUPERVISOR_ROLES);
  if (denied) return { denied };

  const user = currentUser();
  const requests = readRequests();
  const request = requests.find((r) => r.id === idFromUrl(config.url, fromEnd));
  const owned = request && (request.supervisor_id === user.id || isAdmin(user));

  return owned
    ? { user, requests, request }
    : { denied: [404, { detail: "Request not found." }] };
};

export function registerWorkbenchMocks(mock) {
  mock.onGet("/workbench/requests").reply((config) => {
    const denied = requireRoles(SUPERVISOR_ROLES);
    if (denied) return denied;

    const user = currentUser();
    const filters = { available: isAvailable, mine: isMine, review: isForReview };
    const scope = filters[config.params?.scope] ? config.params.scope : "available";

    const items = readRequests()
      .filter((r) => filters[scope](r, user))
      .map((r) => toListItem(r, scope))
      .sort((a, b) => new Date(a.since) - new Date(b.since));

    return [200, items];
  });

  mock.onGet(/\/workbench\/requests\/\d+$/).reply((config) => {
    const ctx = loadOwned(config, 1);
    if (ctx.denied) return ctx.denied;

    return [200, toDetail(ctx.request)];
  });

  mock.onPost(/\/workbench\/requests\/\d+\/claim$/).reply((config) => {
    const denied = requireRoles(SUPERVISOR_ROLES);
    if (denied) return denied;

    const user = currentUser();
    const requests = readRequests();
    const request = requests.find((r) => r.id === idFromUrl(config.url, 2));

    if (!request || !categoryIdsFor(user).includes(request.category_id)) {
      return [404, { detail: "Request not found." }];
    }

    if (request.status !== "received" || request.supervisor_id) {
      return [409, { detail: "This request has already been claimed." }];
    }

    request.supervisor_id = user.id;
    request.status = "assigned_to_supervisor";
    request.updated_at = new Date().toISOString();
    writeRequests(requests);

    return [200, toDetail(request)];
  });

  mock.onPost(/\/workbench\/requests\/\d+\/assessment$/).reply((config) => {
    const ctx = loadOwned(config, 2);
    if (ctx.denied) return ctx.denied;

    const { materials_available, work_required, notes } = JSON.parse(config.data);

    if (typeof materials_available !== "boolean") {
      return [422, { detail: "Say whether the materials are available." }];
    }

    if (!work_required || !work_required.trim()) {
      return [422, { detail: "Describe the work required." }];
    }

    if (ctx.request.status !== "assigned_to_supervisor") {
      return [409, { detail: "This request has already been assessed." }];
    }

    const now = new Date().toISOString();

    ctx.request.assessment = {
      materials_available,
      work_required: work_required.trim(),
      notes: notes?.trim() || null,
      created_at: now,
    };

    if (materials_available) {
      ctx.request.status = "assessed";
    } else {
      ctx.request.status = "awaiting_materials";
      ctx.request.requisition = { status: "pending_approval", procurement_ref: null, created_at: now };
    }

    ctx.request.updated_at = now;
    writeRequests(ctx.requests);

    return [200, toDetail(ctx.request)];
  });

  mock.onPost(/\/workbench\/requests\/\d+\/review$/).reply((config) => {
    const ctx = loadOwned(config, 2);
    if (ctx.denied) return ctx.denied;

    const { outcome, suggested_fixes } = JSON.parse(config.data);

    if (!["approved", "rejected"].includes(outcome)) {
      return [422, { detail: "Choose approve or reject." }];
    }

    if (outcome === "rejected" && !(suggested_fixes && suggested_fixes.trim())) {
      return [422, { detail: "Say what needs to be fixed." }];
    }

    if (ctx.request.status !== "completed") {
      return [409, { detail: "This request is not waiting for review." }];
    }

    const pending = [...(ctx.request.completion_reports ?? [])].reverse().find((r) => !r.review);

    if (!pending) {
      return [409, { detail: "There is no completion report to review." }];
    }

    const now = new Date().toISOString();

    pending.review = {
      outcome,
      suggested_fixes: outcome === "rejected" ? suggested_fixes.trim() : null,
      reviewed_at: now,
    };

    if (outcome === "approved") {
      ctx.request.status = "closed";
      ctx.request.closed_at = now;
    } else {
      ctx.request.status = "in_progress";
    }

    ctx.request.updated_at = now;
    writeRequests(ctx.requests);

    return [200, toDetail(ctx.request)];
  });
}