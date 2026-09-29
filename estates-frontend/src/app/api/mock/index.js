import MockAdapter from "axios-mock-adapter";
import { apiClient } from "../client";
import { locations, demoUsers, DEMO_PASSWORD, INSTITUTIONAL_DOMAINS } from "./data";

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

export function installMocks() {
  const mock = new MockAdapter(apiClient, { delayResponse: 300 });

  mock.onGet("/auth/me").reply(() => {
    const user = currentUser();
    return user ? [200, user] : [401, { detail: "Not authenticated" }];
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

    mock.onGet("/dashboard/summary").reply(() => {
    if (!currentUser()) return [401, { detail: "Not authenticated" }];

    const awaiting = readRequests().filter((r) => r.status === "confirmed").length;

    return [
      200,
      {
        triage_awaiting: awaiting,
        workbench_unclaimed: 4,
        workbench_active: 3,
        workbench_reviews: 2,
        manager_pending_approvals: 5,
        manager_unassigned: 6,
        manager_closed_month: 27,
        artisan_assigned: 3,
        artisan_rework: 1,
        cleaning_open_deficiencies: 7,
        cleaning_inspections_week: 12,
        contractor_officers: 18,
        contractor_pending_actions: 4,
        admin_active_users: 24,
      },
    ];
  });
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

const findOwnedRequest = (requests, trackingNumber, email) =>
  requests.find(
    (r) =>
      r.tracking_number.toLowerCase() === String(trackingNumber).trim().toLowerCase() &&
      r.email.toLowerCase() === String(email).trim().toLowerCase()
  );

const notFound = () => [404, { detail: "No request found for that tracking number and email." }];

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

  window.mockSetStatus = (trackingNumber, status) => {
    const requests = readRequests();
    const request = requests.find((r) => r.tracking_number === trackingNumber);

    if (!request) return "Request not found";

    request.status = status;
    if (status === "closed") request.closed_at = new Date().toISOString();
    writeRequests(requests);

    return `${trackingNumber} is now ${status}`;
  };

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
      ...body,
    });
    writeRequests(requests);

    console.info(`[mock] confirmation link: ${window.location.origin}/confirm/${token}`);
    return [201, { id, status: "submitted" }];
  });
}