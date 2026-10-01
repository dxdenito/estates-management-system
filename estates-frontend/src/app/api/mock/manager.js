import { ROLES, withAdmin } from "../../routing/roles";
import { artisans, demoUsers, supervisorCategories } from "./data";
import {
  currentUser,
  readRequests,
  writeRequests,
  locationPath,
  categoryName,
  requireRoles,
} from "./store";

const MANAGER_ROLES = withAdmin(ROLES.MANAGER);

const isPendingApproval = (request) =>
  request.status === "awaiting_materials" && request.requisition?.status === "pending_approval";

const isReadyToAssign = (request) =>
  request.status === "assessed" || request.status === "materials_issued";

const isClaimed = (request) => request.status === "assigned_to_supervisor";

const userName = (id) => demoUsers.find((user) => user.id === id)?.name ?? null;

export const managerCounts = () => {
  const requests = readRequests();
  const now = new Date();

  const closedThisMonth = requests.filter((request) => {
    if (!request.closed_at) return false;
    const closed = new Date(request.closed_at);
    return closed.getFullYear() === now.getFullYear() && closed.getMonth() === now.getMonth();
  });

  return {
    manager_pending_approvals: requests.filter(isPendingApproval).length,
    manager_unassigned: requests.filter(isReadyToAssign).length,
    manager_closed_month: closedThisMonth.length,
  };
};

const toListItem = (request) => ({
  id: request.id,
  tracking_number: request.tracking_number,
  description: request.description,
  location_path: locationPath(request.location_id),
  category_name: categoryName(request.category_id),
  supervisor_name: userName(request.supervisor_id),
  status: request.status,
  since: request.updated_at ?? request.confirmed_at,
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
  supervisor: request.supervisor_id
    ? { id: request.supervisor_id, name: userName(request.supervisor_id) }
    : null,
  assessment: request.assessment ?? null,
  requisition: request.requisition ?? null,
  assignment: request.assignment ?? null,
  completion_reports: request.completion_reports ?? [],
});

const idFromUrl = (url, fromEnd = 1) => Number(url.split("/").slice(-fromEnd)[0]);

const loadRequest = (config, fromEnd) => {
  const denied = requireRoles(MANAGER_ROLES);
  if (denied) return { denied };

  const requests = readRequests();
  const request = requests.find((r) => r.id === idFromUrl(config.url, fromEnd));

  return request && request.status !== "submitted"
    ? { requests, request, user: currentUser() }
    : { denied: [404, { detail: "Request not found." }] };
};

export function registerManagerMocks(mock) {
  mock.onGet("/manager/requests").reply((config) => {
    const denied = requireRoles(MANAGER_ROLES);
    if (denied) return denied;

    const filters = { approvals: isPendingApproval, assign: isReadyToAssign, claimed: isClaimed };
    const scope = filters[config.params?.scope] ? config.params.scope : "approvals";

    const items = readRequests()
      .filter(filters[scope])
      .map(toListItem)
      .sort((a, b) => new Date(a.since) - new Date(b.since));

    return [200, items];
  });

  mock.onGet("/manager/artisans").reply(() => requireRoles(MANAGER_ROLES) ?? [200, artisans]);

  mock.onGet("/manager/supervisors").reply((config) => {
    const denied = requireRoles(MANAGER_ROLES);
    if (denied) return denied;

    const categoryId = Number(config.params?.category_id);

    const supervisors = demoUsers
      .filter((user) => (supervisorCategories[user.id] ?? []).includes(categoryId))
      .map(({ id, name }) => ({ id, name }));

    return [200, supervisors];
  });

  mock.onGet(/\/manager\/requests\/\d+$/).reply((config) => {
    const ctx = loadRequest(config, 1);
    if (ctx.denied) return ctx.denied;

    return [200, toDetail(ctx.request)];
  });

  mock.onPost(/\/manager\/requests\/\d+\/approve-requisition$/).reply((config) => {
    const ctx = loadRequest(config, 2);
    if (ctx.denied) return ctx.denied;

    if (!isPendingApproval(ctx.request)) {
      return [409, { detail: "This requisition is not waiting for approval." }];
    }

    ctx.request.requisition.status = "approved";
    ctx.request.requisition.approved_by_id = ctx.user.id;
    ctx.request.status = "approved";
    ctx.request.updated_at = new Date().toISOString();
    writeRequests(ctx.requests);

    return [200, toDetail(ctx.request)];
  });

  mock.onPost(/\/manager\/requests\/\d+\/assign$/).reply((config) => {
    const ctx = loadRequest(config, 2);
    if (ctx.denied) return ctx.denied;

    const { artisan_id } = JSON.parse(config.data);
    const artisan = artisans.find((a) => a.id === artisan_id);

    if (!artisan) {
      return [422, { detail: "Choose an artisan." }];
    }

    if (!isReadyToAssign(ctx.request)) {
      return [409, { detail: "This request is not ready for assignment." }];
    }

    const now = new Date().toISOString();

    ctx.request.assignment = {
      artisan_id: artisan.id,
      artisan_name: artisan.name,
      manager_id: ctx.user.id,
      assigned_at: now,
    };
    ctx.request.status = "assigned_to_artisan";
    ctx.request.updated_at = now;
    writeRequests(ctx.requests);

    return [200, toDetail(ctx.request)];
  });

  mock.onPost(/\/manager\/requests\/\d+\/release$/).reply((config) => {
    const ctx = loadRequest(config, 2);
    if (ctx.denied) return ctx.denied;

    if (!isClaimed(ctx.request)) {
      return [409, { detail: "Only requests that have not been assessed can be released." }];
    }

    ctx.request.supervisor_id = null;
    ctx.request.status = "received";
    ctx.request.updated_at = new Date().toISOString();
    writeRequests(ctx.requests);

    return [200, toDetail(ctx.request)];
  });

  mock.onPost(/\/manager\/requests\/\d+\/reassign$/).reply((config) => {
    const ctx = loadRequest(config, 2);
    if (ctx.denied) return ctx.denied;

    const { supervisor_id } = JSON.parse(config.data);

    if (!isClaimed(ctx.request)) {
      return [409, { detail: "Only requests that have not been assessed can be reassigned." }];
    }

    if (supervisor_id === ctx.request.supervisor_id) {
      return [422, { detail: "Choose a different supervisor." }];
    }

    if (!(supervisorCategories[supervisor_id] ?? []).includes(ctx.request.category_id)) {
      return [422, { detail: "That supervisor does not cover this category." }];
    }

    ctx.request.supervisor_id = supervisor_id;
    ctx.request.updated_at = new Date().toISOString();
    writeRequests(ctx.requests);

    return [200, toDetail(ctx.request)];
  });
}