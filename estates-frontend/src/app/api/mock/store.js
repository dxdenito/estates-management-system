import { demoUsers, categories, locations } from "./data";

const SESSION_KEY = "mock_session_user_id";
const REQUESTS_KEY = "mock_requests";

export const readRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY)) ?? [];
  } catch {
    return [];
  }
};

export const writeRequests = (requests) =>
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

export const currentUser = () => {
  const id = Number(sessionStorage.getItem(SESSION_KEY));
  return demoUsers.find((user) => user.id === id && user.active !== false) ?? null;
};

export const locationPath = (locationId) => {
  const names = [];
  let node = locations.find((n) => n.id === locationId);

  while (node) {
    names.unshift(node.name);
    node = locations.find((n) => n.id === node.parent_id);
  }

  return names.join(" › ");
};

export const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? null;

export const requireRoles = (roles) => {
  const user = currentUser();
  if (!user) return [401, { detail: "Not authenticated" }];

  const allowed = roles.some((role) => user.roles.includes(role));
  return allowed ? null : [403, { detail: "You do not have permission to do that." }];
};