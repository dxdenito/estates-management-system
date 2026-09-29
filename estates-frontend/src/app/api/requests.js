import { apiClient } from "./client";

export const submitRequest = (payload) =>
  apiClient.post("/requests", payload).then((res) => res.data);

export const confirmRequest = (token) =>
  apiClient.post("/requests/confirm", { token }).then((res) => res.data);

export const trackRequest = (payload) =>
  apiClient.post("/requests/track", payload).then((res) => res.data);

export const reopenRequest = (payload) =>
  apiClient.post("/requests/reopen", payload).then((res) => res.data);