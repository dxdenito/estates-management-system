import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../client";
import { ROLES, withAdmin } from "../../routing/roles";
import { locations, categories, demoUsers, DEMO_PASSWORD, INSTITUTIONAL_DOMAINS } from "./data";
import { buildSeedRequests } from "./seed";
import { registerWorkbenchMocks, workbenchCounts } from "./workbench";
import { registerManagerMocks, managerCounts } from "./manager";
import { registerArtisanMocks, artisanCounts } from "./artisan";

const SESSION_KEY = "mock_session_user_id";
const REQUESTS_KEY = "mock_requests";

const readRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY)) ?? [];
  } catch {
    return [];
  }
};

const writeRequests = (requests) =>
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

const currentUser = () => {
  const id = Number(sessionStorage.getItem(SESSION_KEY));
  return demoUsers.find((user) => user.id === id) ?? null;
};

const trackingNumber = (id) => `REQ-${String(id).padStart(5, "0")}`;

const locationPath = (locationId) => {
  const names = [];
  let node = locations.find((n) => n.id === locationId);

  while (node) {
    names.unshift(node.name);
    node = locations.find((n) => n.id === node.parent_id);
  }

  return names.join(" › ");
};

const toTrackingView = (request) => {
  const reopens = request.reopens ?? [];

  return {
    tracking_number: request.tracking_number,
    status: request.status,
    description: request.description,
    location_path: locationPath(request.location_id),
    created_at: request.created_at,
    closed_at: request.closed_at ?? null,
    last_reopened_at: reopens.length > 0 ? reopens[reopens.length - 1].reopened_at : null,
    can_reopen: request.status === "closed",
  };
};

const findOwnedRequest = (requests, number, email) =>
  requests.find(
    (r) =>
      r.tracking_number.toLowerCase() === String(number).trim().toLowerCase() &&
      r.email.toLowerCase() === String(email).trim().toLowerCase()
  );

const notFound = () => [404, { detail: "No request found for that tracking number and email." }];

const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? null;

const toTriageListItem = (request) => ({
  id: request.id,
  tracking_number: request.tracking_number,
  description: request.description,
  location_path: locationPath(request.location_id),
  requester_name: request.name,
  category_id: request.category_id ?? null,
  category_name: categoryName(request.category_id),
  status: request.status,
  waiting_since: request.status === "received" ? request.triaged_at : request.confirmed_at,
});

const toTriageDetail = (request) => ({
  ...toTriageListItem(request),
  created_at: request.created_at,
  confirmed_at: request.confirmed_at,
  requester: {
    name: request.name,
    pf_number: request.pf_number,
    email: request.email,
    phone_extension: request.phone_extension,
  },
});

const guardOfficer = () => {
  const user = currentUser();
  if (!user) return [401, { detail: "Not authenticated" }];

  const allowed = withAdmin(ROLES.OFFICER).some((role) => user.roles.includes(role));
  return allowed ? null : [403, { detail: "You do not have permission to do that." }];
};

export function installMocks() {
  const mock = new MockAdapter(apiClient, { delayResponse: 300 });

  if (readRequests().length === 0) {
    writeRequests(buildSeedRequests());
  }

  mock.onGet("/auth/me").reply(() => {
    const user = currentUser();
    return user ? [200, user] : [401, { detail: "Not authenticated" }];
  });

  mock.onPost("/auth/login").reply((config) => {
    const { email, password } = JSON.parse(config.data);
    const user = demoUsers.find((u) => u.email === email);
    if (!user || password !== DEMO_PASSWORD) {
      return [401, { detail: "Invalid email or password" }];
    }
    sessionStorage.setItem(SESSION_KEY, String(user.id));
    return [200, { user }];
  });

  mock.onPost("/auth/logout").reply(() => {
    sessionStorage.removeItem(SESSION_KEY);
    return [204];
  });

  mock.onGet("/locations").reply((config) => {
    const parentId = config.params?.parent_id ? Number(config.params.parent_id) : null;
    const children = locations
      .filter((node) => node.parent_id === parentId)
      .map(({ id, name, type }) => ({ id, name, type }));
    return [200, children];
  });

  mock.onPost("/requests").reply((config) => {
    const body = JSON.parse(config.data);
    const domain = body.email.split("@")[1]?.toLowerCase();

    if (!INSTITUTIONAL_DOMAINS.includes(domain)) {
      return [422, { detail: "Please use your institutional email address." }];
    }
    if (!locations.some((node) => node.id === body.location_id)) {
      return [422, { detail: "Unknown location." }];
    }

    const requests = readRequests();
    const id = requests.length + 1;
    const token = crypto.randomUUID();

    requests.push({
      id,
      tracking_number: trackingNumber(id),
      confirm_token: token,
      status: "submitted",
      created_at: new Date().toISOString(),
      confirmed_at: null,
      category_id: null,
      supervisor_id: null,
      triaged_at: null,
      ...body,
    });
    writeRequests(requests);

    console.info(`[mock] confirmation link: ${window.location.origin}/confirm/${token}`);
    return [201, { id, status: "submitted" }];
  });

  mock.onPost("/requests/confirm").reply((config) => {
    const { token } = JSON.parse(config.data);
    const requests = readRequests();
    const request = requests.find((r) => r.confirm_token === token);

    if (!request) {
      return [404, { detail: "This confirmation link is not valid." }];
    }

    if (!request.confirmed_at) {
      request.confirmed_at = new Date().toISOString();
      request.status = "confirmed";
      writeRequests(requests);
    }

    return [200, { tracking_number: request.tracking_number, status: request.status }];
  });

  mock.onPost("/requests/track").reply((config) => {
    const { tracking_number, email } = JSON.parse(config.data);
    const request = findOwnedRequest(readRequests(), tracking_number, email);
    return request ? [200, toTrackingView(request)] : notFound();
  });

  mock.onPost("/requests/reopen").reply((config) => {
    const { tracking_number, email, comment } = JSON.parse(config.data);
    const requests = readRequests();
    const request = findOwnedRequest(requests, tracking_number, email);

    if (!request) return notFound();

    if (request.status !== "closed") {
      return [409, { detail: "Only closed requests can be reopened." }];
    }

    if (!comment || !comment.trim()) {
      return [422, { detail: "A reason is required to reopen a request." }];
    }

    request.reopens = [
      ...(request.reopens ?? []),
      { comment: comment.trim(), reopened_at: new Date().toISOString() },
    ];
    request.status = "reopened";
    writeRequests(requests);

    return [200, toTrackingView(request)];
  });

  mock.onGet("/dashboard/summary").reply(() => {
    if (!currentUser()) return [401, { detail: "Not authenticated" }];

    const awaiting = readRequests().filter((r) => r.status === "confirmed").length;

    return [
      200,
      {
        triage_awaiting: awaiting,
        ...workbenchCounts(currentUser()),
        manager_pending_approvals: 5,
        manager_unassigned: 6,
        manager_closed_month: 27,
        ...artisanCounts(currentUser()),
        cleaning_open_deficiencies: 7,
        cleaning_inspections_week: 12,
        contractor_officers: 18,
        contractor_pending_actions: 4,
        admin_active_users: 24,
      },
    ];
  });

  mock.onGet("/categories").reply(() =>
    currentUser() ? [200, categories] : [401, { detail: "Not authenticated" }]
  );

  mock.onGet("/triage/requests").reply((config) => {
    const denied = guardOfficer();
    if (denied) return denied;

    const stage = config.params?.stage === "unclaimed" ? "unclaimed" : "awaiting";
    const wantedStatus = stage === "unclaimed" ? "received" : "confirmed";

    const items = readRequests()
      .filter((r) => r.status === wantedStatus && !r.supervisor_id)
      .map(toTriageListItem)
      .sort((a, b) => new Date(a.waiting_since) - new Date(b.waiting_since));

    return [200, items];
  });

  mock.onGet(/\/triage\/requests\/\d+$/).reply((config) => {
    const denied = guardOfficer();
    if (denied) return denied;

    const id = Number(config.url.split("/").pop());
    const request = readRequests().find((r) => r.id === id);

    return request && request.status !== "submitted"
      ? [200, toTriageDetail(request)]
      : [404, { detail: "Request not found." }];
  });

  mock.onPost(/\/triage\/requests\/\d+\/categorize$/).reply((config) => {
    const denied = guardOfficer();
    if (denied) return denied;

    const id = Number(config.url.split("/").slice(-2)[0]);
    const { category_id } = JSON.parse(config.data);
    const requests = readRequests();
    const request = requests.find((r) => r.id === id);

    if (!request || request.status === "submitted") {
      return [404, { detail: "Request not found." }];
    }

    if (!categories.some((c) => c.id === category_id)) {
      return [422, { detail: "Unknown category." }];
    }

    const editable =
      request.status === "confirmed" ||
      (request.status === "received" && !request.supervisor_id);

    if (!editable) {
      return [409, { detail: "A supervisor has already picked up this request." }];
    }

    request.category_id = category_id;

    if (request.status === "confirmed") {
      request.status = "received";
      request.triaged_at = new Date().toISOString();
    }

    writeRequests(requests);
    return [200, toTriageDetail(request)];
  });

  registerWorkbenchMocks(mock);
  registerManagerMocks(mock);
  registerArtisanMocks(mock);

  window.mockSetStatus = (number, status) => {
    const requests = readRequests();
    const request = requests.find((r) => r.tracking_number === number);

    if (!request) return "Request not found";

    request.status = status;
    if (status === "closed") request.closed_at = new Date().toISOString();
    writeRequests(requests);

    return `${number} is now ${status}`;
  };
}